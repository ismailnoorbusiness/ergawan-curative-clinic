import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { logActivity, notifyClinic } from "@/lib/notify.server";

function assertAdmin(user) {
  if (!user || user.role !== "admin") {
    throw Object.assign(new Error("Administrators only"), { status: 403 });
  }
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    assertAdmin(context.user);
    const base44 = context.getBase44();
    const today = new Date().toISOString().slice(0, 10);
    const monthPrefix = today.slice(0, 7);

    const [
      requested,
      confirmed,
      completed,
      cancelled,
      newMessages,
      patients,
      articles,
      recentAppointments,
      recentActivity,
      recentMessages,
    ] = await Promise.all([
      base44.entities.Appointment.count({ status: "requested" }),
      base44.entities.Appointment.count({ status: "confirmed" }),
      base44.entities.Appointment.count({ status: "completed" }),
      base44.entities.Appointment.count({ status: "cancelled" }),
      base44.entities.ContactMessage.count({ status: "new" }),
      base44.entities.PatientProfile.count({}),
      base44.entities.Article.count({}),
      base44.entities.Appointment.filter({}, { sort: "-created_date", limit: 6 }),
      base44.entities.ActivityLog.filter({}, { sort: "-created_date", limit: 8 }),
      base44.entities.ContactMessage.filter({ status: "new" }, { sort: "-created_date", limit: 4 }),
    ]);

    const todayCount = await base44.entities.Appointment.count({ preferred_date: today });
    const monthPage = await base44.entities.Appointment.filter({}, { sort: "-created_date", limit: 200 });
    const monthCount = (monthPage.items || []).filter((item) => (item.created_date || "").startsWith(monthPrefix)).length;

    return {
      counts: { requested, confirmed, completed, cancelled, newMessages, patients, articles, todayCount, monthCount },
      recentAppointments: recentAppointments.items || [],
      recentActivity: recentActivity.items || [],
      newMessagesList: recentMessages.items || [],
    };
  });

export const updateAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().min(1).max(80),
      status: z.enum(["requested", "confirmed", "completed", "cancelled", "declined"]),
      staff_note: z.string().max(1000).optional().default(""),
    }),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const base44 = context.getBase44();
    const appointment = await base44.asServiceRole.entities.Appointment.get(data.id);

    const updated = await base44.asServiceRole.entities.Appointment.update(data.id, {
      status: data.status,
      staff_note: data.staff_note || appointment.staff_note || "",
    });

    if (appointment.patient_email) {
      await notifyClinic(base44, {
        to: appointment.patient_email,
        subject: `Your appointment at Ergawan Curative Clinic is ${data.status}`,
        body: `Hello ${appointment.patient_name},\n\nYour appointment for ${appointment.service_name} on ${appointment.preferred_date} at ${appointment.preferred_time} is now marked: ${data.status}.\n\nTracking code: ${appointment.tracking_code}\n\n${data.staff_note ? `Note from the clinic: ${data.staff_note}` : ""}`,
      });
    }

    await logActivity(base44, {
      actor_email: context.user.email,
      actor_name: context.user.full_name,
      action: `Appointment ${data.status}`,
      target: `${appointment.service_name} · ${appointment.tracking_code}`,
      detail: data.staff_note,
    });

    return { ok: true, status: updated.status };
  });

export const replyToContactMessage = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1).max(80), reply: z.string().min(1).max(2000) }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const base44 = context.getBase44();
    const record = await base44.asServiceRole.entities.ContactMessage.update(data.id, {
      reply: data.reply,
      status: "replied",
    });
    if (record.email) {
      await notifyClinic(base44, {
        to: record.email,
        subject: "Reply from Ergawan Curative Clinic",
        body: `${data.reply}\n\n— ${context.user.full_name || "Ergawan Curative Clinic staff"}`,
      });
    }
    await logActivity(base44, {
      actor_email: context.user.email,
      actor_name: context.user.full_name,
      action: "Contact message answered",
      target: record.email,
    });
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ email: z.string().email().max(160), role: z.enum(["admin", "user"]) }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    if (data.email.toLowerCase() === context.user.email?.toLowerCase()) {
      throw Object.assign(new Error("You cannot change your own role"), { status: 400 });
    }
    const base44 = context.getBase44();
    const users = await base44.asServiceRole.entities.User.filter({ email: data.email.toLowerCase() });
    const target = users?.[0];
    if (!target) throw Object.assign(new Error("No user with that email"), { status: 404 });

    await base44.asServiceRole.entities.User.update(target.id, { role: data.role });
    await logActivity(base44, {
      actor_email: context.user.email,
      actor_name: context.user.full_name,
      action: `Role changed to ${data.role}`,
      target: data.email.toLowerCase(),
    });
    return { ok: true };
  });

export const setFeedbackPublished = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1).max(80), published: z.boolean() }))
  .handler(async ({ data, context }) => {
    assertAdmin(context.user);
    const base44 = context.getBase44();
    await base44.asServiceRole.entities.Feedback.update(data.id, { published: data.published });
    return { ok: true };
  });