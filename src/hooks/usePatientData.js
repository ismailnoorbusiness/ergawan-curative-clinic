import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export function useMyAppointments() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const page = await base44.entities.Appointment.filter(
      { $or: [{ created_by_id: user.id }, { patient_email: user.email }] },
      { sort: "-preferred_date", limit: 100 },
    );
    setItems(page.items || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load };
}

export function useMyMessages() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const page = await base44.entities.Message.filter({ thread_user_id: user.id }, { sort: "created_date", limit: 200 });
    setItems(page.items || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load };
}