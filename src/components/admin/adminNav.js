import {
  BookOpen,
  CalendarDays,
  History,
  Inbox,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

export const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/admin/patients", label: "Patients", icon: Users },
  { to: "/admin/services", label: "Services", icon: Stethoscope },
  { to: "/admin/content", label: "Health library", icon: BookOpen },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
  { to: "/admin/staff", label: "Staff & roles", icon: ShieldCheck },
  { to: "/admin/settings", label: "Clinic settings", icon: Settings },
  { to: "/admin/activity", label: "Activity log", icon: History },
];