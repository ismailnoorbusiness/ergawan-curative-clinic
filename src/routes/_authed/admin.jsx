import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/admin")({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== "admin") throw redirect({ to: "/portal" });
  },
  component: () => <Outlet />,
});