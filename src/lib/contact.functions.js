import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { logActivity, notifyClinic } from "@/lib/notify.server";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(40).optional().default(""),
  subject: z.string().max(160).optional().default(""),
  body: z.string().min(5).max(2000),
  language: z.enum(["en", "fa", "ps"]).default("en"),
});

/** Public: contact form, categorised automatically for the clinic inbox. */
export const submitContactMessage = createServerFn({ method: "POST" })
  .validator(contactSchema)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();

    let category = "general";
    let priority = "normal";
    let ai_summary = "";

    try {
      const classification = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Classify this message sent to a medical clinic's website contact form. Do not answer it, do not give medical advice.

Message:
"""${data.body.slice(0, 1500)}"""

Choose category: appointment (booking, rescheduling, cancellation), general (information), feedback (compliment or complaint), urgent (someone describes a medical emergency or asks for urgent medical help), other.
Set priority high only for urgent or a serious complaint.
Write summary as one neutral sentence, maximum 20 words.`,
        response_json_schema: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["appointment", "general", "feedback", "urgent", "other"] },
            priority: { type: "string", enum: ["normal", "high"] },
            summary: { type: "string" },
          },
          required: ["category", "priority", "summary"],
        },
      });
      if (classification?.category) category = classification.category;
      if (classification?.priority) priority = classification.priority;
      ai_summary = classification?.summary || "";
    } catch {
      /* classification is an optimisation — the message is still stored */
    }

    const record = await base44.entities.ContactMessage.create({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      subject: data.subject.trim(),
      body: data.body.trim(),
      category,
      priority,
      ai_summary,
      language: data.language,
      status: "new",
    });

    const settingsList = await base44.entities.ClinicSettings.list("-created_date", 1);
    const settings = Array.isArray(settingsList) ? settingsList[0] : settingsList?.items?.[0];
    if (settings?.notification_email) {
      await notifyClinic(base44, {
        to: settings.notification_email,
        subject: `${priority === "high" ? "Priority" : "New"} website message · ${category}`,
        body: `${data.name} (${data.email}${data.phone ? `, ${data.phone}` : ""}) wrote:\n\n${data.body}\n\nOpen the administration centre to reply.`,
      });
    }

    await logActivity(base44, {
      actor_email: data.email,
      actor_name: data.name,
      action: "Contact message received",
      target: category,
      detail: ai_summary,
    });

    return { id: record.id, category, priority };
  });

/** Public: patient feedback, held unpublished until staff approve it. */
export const submitFeedback = createServerFn({ method: "POST" })
  .validator(
    z.object({
      patient_name: z.string().max(80).optional().default(""),
      rating: z.number().min(1).max(5),
      comment: z.string().min(5).max(600),
      service_name: z.string().max(120).optional().default(""),
    }),
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const record = await base44.entities.Feedback.create({
      patient_name: data.patient_name.trim(),
      rating: data.rating,
      comment: data.comment.trim(),
      service_name: data.service_name,
      published: false,
    });
    return { id: record.id };
  });