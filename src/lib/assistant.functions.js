import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LANGUAGE_NAME = { en: "English", fa: "Dari (Afghan Persian)", ps: "Pashto" };

const schema = z.object({
  message: z.string().min(1).max(800),
  language: z.enum(["en", "fa", "ps"]).default("en"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(800),
      }),
    )
    .max(6)
    .optional()
    .default([]),
});

export const askErgawan = createServerFn({ method: "POST" })
  .validator(schema)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();

    const [servicePage, settingsList] = await Promise.all([
      base44.entities.Service.filter({ active: true }, { limit: 50 }),
      base44.entities.ClinicSettings.list("-created_date", 1),
    ]);
    const settings = Array.isArray(settingsList) ? settingsList[0] : settingsList?.items?.[0];
    const services = (servicePage.items || [])
      .map((service) => `- ${service.name}: ${service.summary} (${service.duration_minutes} minutes)`)
      .join("\n");

    const clinicFacts = [
      settings?.name ? `Name: ${settings.name}` : "",
      settings?.address ? `Address: ${settings.address}` : "",
      settings?.phone ? `Phone: ${settings.phone}` : "",
      settings?.email ? `Email: ${settings.email}` : "",
      settings?.hours ? `Opening hours: ${settings.hours}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `You are ERGAWAN AI, the information assistant on the website of Ergawan Curative Clinic.

NON-NEGOTIABLE RULES
1. You are not a doctor and never claim to be. Never diagnose a condition, never name a likely disease as a conclusion, and never prescribe or dose medication, including over-the-counter drugs.
2. Never ask for or repeat sensitive medical details (national ID, full medical history, test results, medication lists). If someone starts sharing them, tell them to keep it inside the patient portal where clinic staff can see it securely.
3. If the message suggests an emergency — chest pain, difficulty breathing, heavy bleeding, fainting, signs of stroke, severe abdominal pain, a fever in a newborn, a child who cannot drink, thoughts of self-harm — set urgent to true and tell them to contact local emergency services or go to the nearest emergency department immediately, before anything else.
4. Answer only in ${LANGUAGE_NAME[data.language]}.
5. Only describe services that appear in the list below. Never invent services, doctors, prices, qualifications or opening hours that are not listed.
6. General health education must stay conservative and consistent with WHO / CDC style public guidance. Do not invent statistics or citations.
7. Keep the reply under 140 words. Plain language, warm but neutral. Where clinical judgement is needed, say that a clinician should assess it.
8. End health-education answers with one short sentence that this is general information and not a medical diagnosis.

CLINIC FACTS
${clinicFacts || "Contact details are not published yet."}

PUBLISHED SERVICES
${services || "No services are published yet."}

CONVERSATION SO FAR
${(data.history || []).map((turn) => `${turn.role === "user" ? "Visitor" : "ERGAWAN AI"}: ${turn.content}`).join("\n") || "(new conversation)"}

VISITOR MESSAGE
${data.message}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          reply: { type: "string" },
          urgent: { type: "boolean" },
        },
        required: ["reply", "urgent"],
      },
    });

    const reply = typeof result === "string" ? result : result?.reply || "";
    return { reply, urgent: Boolean(result?.urgent) };
  });