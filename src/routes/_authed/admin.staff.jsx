import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { adminNav } from "@/components/admin/adminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { setUserRole } from "@/lib/admin.functions";
import { useAuth } from "@/lib/AuthContext";

export const Route = createFileRoute("/_authed/admin/staff")({
  component: AdminStaff,
});

function AdminStaff() {
  const { user, refresh } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviteMessage, setInviteMessage] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const records = await base44.entities.User.list("-created_date");
    setUsers(records || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (target, role) => {
    setBusy(target.email);
    try {
      await setUserRole({ data: { email: target.email, role } });
      await load();
      if (target.email === user?.email) await refresh();
    } catch {
      setInviteMessage("That role change was refused.");
    } finally {
      setBusy("");
    }
  };

  const invite = async (event) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    setBusy("invite");
    setInviteMessage("");
    try {
      await base44.users.inviteUser(inviteEmail.trim().toLowerCase(), inviteRole);
      setInviteMessage(`Invitation sent to ${inviteEmail}.`);
      setInviteEmail("");
      await load();
    } catch {
      setInviteMessage("The invitation could not be sent. Check the address and try again.");
    } finally {
      setBusy("");
    }
  };

  return (
    <AppShell nav={adminNav} eyebrow="Administration centre" title="Staff and permissions">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-start font-medium">Account</th>
                <th className="px-5 py-3 text-start font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={2} className="px-5 py-8 text-center text-muted-foreground">
                    Loading accounts…
                  </td>
                </tr>
              )}
              {users.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{item.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{item.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={item.role || "user"}
                      disabled={item.email === user?.email || busy === item.email}
                      onChange={(event) => changeRole(item, event.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-50"
                    >
                      <option value="user">Patient</option>
                      <option value="admin">Staff administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={invite} className="h-fit rounded-3xl border border-border bg-background p-6">
          <h2 className="font-heading text-lg text-primary">Invite a team member</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Invited people receive an email to set a password. Staff administrators can manage appointments, content and messages.
          </p>
          <Input
            type="email"
            dir="ltr"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="colleague@clinic.com"
            className="mt-4 h-11"
          />
          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value)}
            className="mt-3 h-11 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="user">Patient</option>
            <option value="admin">Staff administrator</option>
          </select>
          <Button type="submit" className="mt-4 w-full rounded-full" disabled={busy === "invite"}>
            {busy === "invite" && <Loader2 className="h-4 w-4 animate-spin" />}
            Send invitation
          </Button>
          {inviteMessage && <p className="mt-3 text-xs text-muted-foreground">{inviteMessage}</p>}
          <p className="mt-5 border-t border-border pt-4 text-[0.68rem] leading-relaxed text-muted-foreground">
            You cannot change your own role. Only staff administrators can open this centre.
          </p>
        </form>
      </div>
    </AppShell>
  );
}