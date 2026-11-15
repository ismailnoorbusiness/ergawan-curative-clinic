import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/app/AppShell";
import { adminNav } from "@/components/admin/adminNav";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/lib/clinic";

export const Route = createFileRoute("/_authed/admin/patients")({
  component: AdminPatients,
});

function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    base44.entities.PatientProfile.filter({}, { sort: "-created_date", limit: 200 })
      .then((page) => {
        if (active) setPatients(page.items || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = patients.filter((item) =>
    `${item.full_name} ${item.phone}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppShell nav={adminNav} eyebrow="Administration centre" title="Patient accounts">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or phone"
        className="h-11 max-w-sm"
      />

      {loading ? (
        <div className="mt-6 h-32 animate-pulse rounded-2xl bg-muted" />
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-start text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-start font-medium">Patient</th>
                <th className="px-5 py-3 text-start font-medium">Phone</th>
                <th className="px-5 py-3 text-start font-medium">Language</th>
                <th className="px-5 py-3 text-start font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    No patient profiles yet — they are created when a patient opens the portal.
                  </td>
                </tr>
              )}
              {visible.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{item.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{item.address || "No address recorded"}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground" dir="ltr">
                    {item.phone || "—"}
                  </td>
                  <td className="px-5 py-3 uppercase text-muted-foreground">{item.preferred_language || "en"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(item.created_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Medical records and test results are deliberately not collected here — this platform holds appointments and messages only.
      </p>
    </AppShell>
  );
}