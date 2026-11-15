import MapEmbed from "@/components/site/MapEmbed";

export default function ContactSection({ clinic }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-secondary/40">
      <MapEmbed
        latitude={clinic?.latitude}
        longitude={clinic?.longitude}
        label={`${clinic?.name || "Clinic"} location`}
        className="h-72 w-full md:h-full md:min-h-[420px]"
      />
    </div>
  );
}