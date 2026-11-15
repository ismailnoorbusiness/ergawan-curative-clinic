import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { logActivity, notifyClinic } from "@/lib/notify.server";

const requestSchema = z.object({
  patient_name: z.string().min(2).max(120),
  patient_email: z.string().email().max(160),
  patient_phone: z.string().min(6).max(40),
  service_slug: z.string().min(1).max(120),
  preferred_date: z.string().min(4).max(20),
  preferred_time: z.string().min(2).max(10),
  notes: z.string().max(1200).optional().default(""),
  language: z.enum(["en", "fa", "ps"]).default("en"),
});

const codeSchema = z.object({
  code: z.string().min(4).max(12),
  email: z.string().email().max(160),
});

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

/** Public: a visitor (signed in or not) requests an appointment. */
export const createAppointmentRequest = createServerFn({ method: "POST" })
  .validator(requestSchema)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const me = await base44.auth.me().catch(() => null);

    const servicePage = await base44.entities.Service.filter({ slug: data.service_slug, active: true }, { limit: 1 });
    const service = servicePage.items?.[0];
    if (!service) throw Object.assign(new Error("Unknown service"), { status: 400 });

    const tracking_code = generateCode();
    const appointment = await base44.entities.Appointment.create({
      tracking_code,
      patient_name: data.patient_name.trim(),
      patient_email: data.patient_email.trim().toLowerCase(),
      patient_phone: data.patient_phone.trim(),
      patient_user_id: me?.id || "",
      service_slug: service.slug,
      service_name: service.name,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      notes: data.notes || "",
      language: data.language,
      status: "requested",
      source: me ? "portal" : "website",
    });

    const settingsList = await base44.entities.ClinicSettings.list("-created_date", 1);
    const settings = Array.isArray(settingsList) ? settingsList[0] : settingsList?.items?.[0];
    if (settings?.notify_new_requests !== false && settings?.notification_email) {
      await notifyClinic(base44, {
        to: settings.notification_email,
        subject: `New appointment request · ${service.name}`,
        body: `${data.patient_name} (${data.patient_email}, ${data.patient_phone}) requested ${service.name} on ${data.preferred_date} at ${data.preferred_time}.\n\nTracking code: ${tracking_code}\n\nOpen the administration centre to confirm or decline.`,
      });
    }

    await logActivity(base44, {
      actor_email: me?.email,
      actor_name: data.patient_name,
      action: "Appointment requested",
      target: `${service.name} · ${tracking_code}`,
      detail: `${data.preferred_date} ${data.preferred_time}`,
    });

    return { tracking_code, id: appointment.id };
  });

/** Public: follow a request with the code + the email it was made with. */
export const trackAppointment = createServerFn({ method: "POST" })
  .validator(codeSchema)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const page = await base44.asServiceRole.entities.Appointment.filter(
      { tracking_code: data.code.trim().toUpperCase() },
      { limit: 1 },
    );
    const appointment = page.items?.[0];
    const emailMatches = appointment && appointment.patient_email === data.email.trim().toLowerCase();
    if (!appointment || !emailMatches) return { found: false };
    return {
      found: true,
      appointment: {
        tracking_code: appointment.tracking_code,
        patient_name: appointment.patient_name,
        service_name: appointment.service_name,
        preferred_date: appointment.preferred_date,
        preferred_time: appointment.preferred_time,
        status: appointment.status,
        staff_note: appointment.staff_note || "",
        created_date: appointment.created_date,
      },
    };
  });

/** Public: cancel with the code + email. Staff are notified immediately. */
export const cancelAppointmentByCode = createServerFn({ method: "POST" })
  .validator(codeSchema)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const page = await base44.asServiceRole.entities.Appointment.filter(
      { tracking_code: data.code.trim().toUpperCase() },
      { limit: 1 },
    );
    const appointment = page.items?.[0];
    if (!appointment || appointment.patient_email !== data.email.trim().toLowerCase()) {
      throw Object.assign(new Error("No matching request"), { status: 404 });
    }
    if (["cancelled", "completed", "declined"].includes(appointment.status)) {
      throw Object.assign(new Error("This appointment can no longer be cancelled"), { status: 400 });
    }

    const stamp = new Date().toISOString().slice(0, 10);
    await base44.asServiceRole.entities.Appointment.update(appointment.id, {
      status: "cancelled",
      staff_note: `${appointment.staff_note || ""}\nCancelled by patient on ${stamp}.`.trim(),
    });

    await logActivity(base44, {
      actor_email: appointment.patient_email,
      actor_name: appointment.patient_name,
      action: "Appointment cancelled by patient",
      target: `${appointment.service_name} · ${appointment.tracking_code}`,
    });

    return { cancelled: true };
  });