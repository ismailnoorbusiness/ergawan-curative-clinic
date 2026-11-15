import { CalendarDays, LayoutDashboard, MessageSquare, UserRound } from "lucide-react";

export const portalNav = (t) => [
  { to: "/portal", label: t("nav.home"), icon: LayoutDashboard, exact: true },
  { to: "/portal/appointments", label: t("nav.book"), icon: CalendarDays },
  { to: "/portal/messages", label: "Messages", icon: MessageSquare },
  { to: "/portal/profile", label: "My profile", icon: UserRound },
];