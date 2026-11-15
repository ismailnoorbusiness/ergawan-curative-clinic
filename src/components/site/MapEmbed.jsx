import { cn } from "@/lib/utils";

/** Keyless OpenStreetMap embed — draggable and zoomable, no API key required. */
export default function MapEmbed({ latitude = 34.5553, longitude = 69.2075, label = "Location", className }) {
  const delta = 0.012;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <iframe
      title={label}
      src={src}
      loading="lazy"
      className={cn("border-0", className)}
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}