import { Outlet, createFileRoute } from "@tanstack/react-router";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import AssistantDock from "@/components/assistant/AssistantDock";
import { getClinicSettings } from "@/lib/public.functions";
import { SAMPLE_CLINIC } from "@/lib/sampleContent";

export const Route = createFileRoute("/_site")({
  loader: () => getClinicSettings(),
  component: SiteLayout,
});

function SiteLayout() {
  const settings = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter clinic={settings || SAMPLE_CLINIC} />
      <AssistantDock />
    </div>
  );
}