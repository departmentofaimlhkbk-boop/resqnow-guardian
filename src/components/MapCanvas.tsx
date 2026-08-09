import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type MarkerKind = "helper" | "victim" | "hospital" | "police" | "me";

const COLORS: Record<MarkerKind, string> = {
  helper: "#1677FF",
  victim: "#FF3B30",
  hospital: "#16C784",
  police: "#FF9800",
  me: "#2196F3",
};

export type Marker = {
  id: string;
  kind: MarkerKind;
  x: number; // 0-100 %
  y: number;
  label?: string;
  pulse?: boolean;
};

const ROADS = [
  { d: "M -5 62 C 20 58, 38 74, 62 66 S 92 44, 108 50", w: 9, name: "MG Road" },
  { d: "M 18 -5 C 24 24, 14 46, 30 70 S 44 96, 40 108", w: 7, name: "Brigade Rd" },
  { d: "M -5 26 C 24 30, 54 16, 78 28 S 98 40, 108 34", w: 6, name: "Cubbon Rd" },
  { d: "M 74 -5 C 70 22, 84 44, 76 66 S 62 92, 68 108", w: 6, name: "Residency Rd" },
  { d: "M -5 88 C 26 84, 52 92, 76 84 S 98 78, 108 82", w: 5, name: "Richmond Rd" },
];

const BLOCKS = [
  [6, 6, 20, 14],
  [34, 8, 26, 10],
  [66, 40, 22, 16],
  [8, 70, 18, 14],
  [44, 74, 22, 12],
  [82, 62, 14, 22],
  [30, 34, 18, 16],
];

export function MapCanvas({
  markers = [],
  route,
  className,
  overlay,
  labels = true,
}: {
  markers?: Marker[];
  route?: { from: [number, number]; to: [number, number]; via?: [number, number] };
  className?: string;
  overlay?: ReactNode;
  labels?: boolean;
}) {
  const routeD = route
    ? `M ${route.from[0]} ${route.from[1]} Q ${route.via ? route.via[0] : (route.from[0] + route.to[0]) / 2 + 12} ${
        route.via ? route.via[1] : (route.from[1] + route.to[1]) / 2 - 14
      } ${route.to[0]} ${route.to[1]}`
    : null;

  return (
    <div className={cn("relative overflow-hidden bg-[#08101c]", className)}>
      <div className="grid-map absolute inset-0" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {BLOCKS.map((b, i) => (
          <rect
            key={i}
            x={b[0]}
            y={b[1]}
            width={b[2]}
            height={b[3]}
            rx={1.5}
            fill="rgba(255,255,255,0.028)"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={0.2}
          />
        ))}
        {ROADS.map((r, i) => (
          <g key={i}>
            <path d={r.d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={r.w / 10} strokeLinecap="round" />
            <path d={r.d} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth={r.w / 22} strokeLinecap="round" />
          </g>
        ))}
        {routeD && (
          <>
            <path d={routeD} fill="none" stroke="#1677FF" strokeWidth={1.5} strokeLinecap="round" opacity={0.28} />
            <path
              d={routeD}
              fill="none"
              stroke="#2196F3"
              strokeWidth={0.9}
              strokeLinecap="round"
              className="route-dash"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>

      {labels && (
        <>
          <span className="pointer-events-none absolute left-[8%] top-[58%] -rotate-[6deg] text-[9px] font-medium tracking-wide text-white/30">
            MG Road
          </span>
          <span className="pointer-events-none absolute left-[52%] top-[22%] text-[9px] font-medium tracking-wide text-white/25">
            Cubbon Road
          </span>
          <span className="pointer-events-none absolute left-[76%] top-[70%] rotate-90 text-[9px] font-medium tracking-wide text-white/25">
            Residency Rd
          </span>
        </>
      )}

      {markers.map((m) => (
        <MapMarker key={m.id} marker={m} />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,11,20,0.75)_100%)]" />
      {overlay}
    </div>
  );
}

export function MapMarker({ marker }: { marker: Marker }) {
  const color = COLORS[marker.kind];
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${marker.x}%`, top: `${marker.y}%`, transition: "left 1.2s linear, top 1.2s linear" }}
    >
      {marker.pulse && (
        <span
          className="pulse-ring absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: `2px solid ${color}` }}
        />
      )}
      <span
        className="relative grid size-5 place-items-center rounded-full border-2 border-white/80"
        style={{ background: color, boxShadow: `0 0 18px ${color}` }}
      />
      {marker.label && (
        <span
          className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-lg border px-2 py-0.5 text-[10px] font-semibold backdrop-blur"
          style={{ borderColor: `${color}55`, background: "rgba(5,11,20,0.8)", color }}
        >
          {marker.label}
        </span>
      )}
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="absolute left-4 top-4 flex flex-col gap-1.5 rounded-2xl border border-border bg-background/70 px-3 py-2.5 backdrop-blur">
      {(
        [
          ["victim", "Emergency"],
          ["helper", "Helpers"],
          ["hospital", "Hospitals"],
          ["police", "Police"],
        ] as [MarkerKind, string][]
      ).map(([k, l]) => (
        <div key={k} className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: COLORS[k], boxShadow: `0 0 8px ${COLORS[k]}` }} />
          {l}
        </div>
      ))}
    </div>
  );
}
