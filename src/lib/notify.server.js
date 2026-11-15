/**
 * Best-effort clinic notification. Email to a non-registered address can be
 * refused by the platform, so a failed send never breaks the patient's action.
 */
export async function notifyClinic(base44, { to, subject, body }) {
  const recipient = (to || "").trim();
  if (!recipient) return false;
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({ to: recipient, subject, body });
    return true;
  } catch {
    return false;
  }
}

export async function logActivity(base44, { actor_email, actor_name, action, target, detail }) {
  try {
    await base44.asServiceRole.entities.ActivityLog.create({
      actor_email: actor_email || "",
      actor_name: actor_name || "",
      action,
      target: target || "",
      detail: detail || "",
    });
  } catch {
    /* logging must never fail the operation it describes */
  }
}