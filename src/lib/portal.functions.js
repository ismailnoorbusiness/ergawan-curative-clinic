import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { logActivity, notifyClinic } from "@/lib/notify.server";

/** Returns the signed-in patient's profile, creating a bare one on first visit. */
export const ensureMyProfile = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const page = await base44.asServiceRole.entities.PatientProfile.filter({ user_id: context.user.id }, { limit: 1 });
    const existing = page.items?.[0];
    if (existing) return existing;
    return base44.asServiceRole.entities.PatientProfile.create({
      user_id: context.user.id,
      full_name: context.user.full_name || "",
      phone: "",
      preferred_language: "en",
    });
  });

const messageSchema = z.object({
  body: z.string().min(1).max(2000),
  appointment_id: z.string().max(80).optional().default(""),
});

export const sendPatientMessage = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(messageSchema)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const message = await base44.asServiceRole.entities.Message.create({
      thread_user_id: context.user.id,
      thread_email: context.user.email,
      sender_role: "patient",
      sender_name: context.user.full_name || context.user.email,
      body: data.body.trim(),
      appointment_id: data.appointment_id,
      read_by_patient: true,
      read_by_staff: false,
    });

    const settingsList = await base44.entities.ClinicSettings.list("-created_date", 1);
    const settings = Array.isArray(settingsList) ? settingsList[0] : settingsList?.items?.[0];
    if (settings?.notify_new_messages !== false && settings?.notification_email) {
      await notifyClinic(base44, {
        to: settings.notification_email,
        subject: "New portal message from a patient",
        body: `${context.user.full_name || context.user.email} sent a message:\n\n${data.body}\n\nReply from the administration centre.`,
      });
    }

    await logActivity(base44, {
      actor_email: context.user.email,
      actor_name: context.user.full_name,
      action: "Patient message sent",
      target: "Portal",
    });

    return { id: message.id };
  });

export const markThreadRead = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    await base44.asServiceRole.entities.Message.updateMany(
      { thread_user_id: context.user.id, read_by_patient: false },
      { $set: { read_by_patient: true } },
    );
    return { ok: true };
  });

export const cancelMyAppointment = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const appointment = await base44.asServiceRole.entities.Appointment.get(data.id);
    const owns =
      appointment?.created_by_id === context.user.id ||
      appointment?.patient_email === context.user.email ||
      appointment?.patient_user_id === context.user.id;
    if (!owns) throw Object.assign(new Error("Not your appointment"), { status: 403 });
    if (["cancelled", "completed", "declined"].includes(appointment.status)) {
      throw Object.assign(new Error("This appointment can no longer be cancelled"), { status: 400 });
    }

    const stamp = new Date().toISOString().slice(0, 10);
    await base44.asServiceRole.entities.Appointment.update(appointment.id, {
      status: "cancelled",
      staff_note: `${appointment.staff_note || ""}\nCancelled by patient on ${stamp}.`.trim(),
    });

    await logActivity(base44, {
      actor_email: context.user.email,
      actor_name: context.user.full_name,
      action: "Appointment cancelled by patient",
      target: `${appointment.service_name} · ${appointment.tracking_code}`,
    });

    return { cancelled: true };
  });