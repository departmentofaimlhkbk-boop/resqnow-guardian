import { useState } from "react";
import {
  MapPin,
  Layers,
  Crosshair,
  Plus,
  Minus,
  Users,
  Award,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  ChevronRight,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Globe,
  Lock,
  Moon,
  LifeBuoy,
  Info,
  Stethoscope,
  Phone,
  Building2,
  Clock,
  Pencil,
} from "lucide-react";
import { Avatar, Button, Card, IconButton, Label, Pill, Screen, SectionTitle } from "@/components/kit";
import { MapCanvas, MapLegend } from "@/components/MapCanvas";
import { HISTORY, HOSPITALS, USER, VOLUNTEERS } from "@/lib/mock";
import { cn } from "@/lib/utils";

/* ---------- 20. Map ---------- */

export function MapScreen() {
  return (
    <div className="relative h-full">
      <MapCanvas
        className="absolute inset-0 size-full"
        markers={[
          { id: "me", kind: "me", x: 46, y: 52, pulse: true, label: "You" },
          { id: "v1", kind: "helper", x: 28, y: 33 },
          { id: "v2", kind: "helper", x: 66, y: 30 },
          { id: "v3", kind: "helper", x: 72, y: 62 },
          { id: "h1", kind: "hospital", x: 82, y: 78, label: "City Care" },
          { id: "h2", kind: "hospital", x: 18, y: 74 },
          { id: "p1", kind: "police", x: 38, y: 18, label: "MG Rd PS" },
          { id: "e1", kind: "victim", x: 58, y: 68, pulse: true, label: "Active" },
        ]}
      />
      <MapLegend />
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <IconButton className="bg-background/80 backdrop-blur">
          <Layers className="size-4.5" />
        </IconButton>
        <IconButton className="bg-background/80 backdrop-blur">
          <Plus className="size-4.5" />
        </IconButton>
        <IconButton className="bg-background/80 backdrop-blur">
          <Minus className="size-4.5" />
        </IconButton>
        <IconButton className="bg-background/80 text-blue-bright backdrop-blur">
          <Crosshair className="size-4.5" />
        </IconButton>
      </div>
      <div className="absolute inset-x-4 bottom-28">
        <Card className="bg-background/90">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue/30 bg-blue/12">
              <MapPin className="size-4.5 text-blue-bright" />
            </span>
            <div className="min-w-0 flex-1">
              <Label tone="blue">Live area</Label>
              <p className="truncate text-[15px] font-semibold">{USER.location}</p>
            </div>
            <Pill tone="red">1 active</Pill>
          </div>
          <div className="mt-3 grid grid-cols-3 divide-x divide-border text-center">
            <div>
              <p className="text-[18px] font-bold">24</p>
              <p className="text-[10px] text-muted-foreground">Helpers</p>
            </div>
            <div>
              <p className="text-[18px] font-bold text-success">8</p>
              <p className="text-[10px] text-muted-foreground">Hospitals</p>
            </div>
            <div>
              <p className="text-[18px] font-bold text-warning">3</p>
              <p className="text-[10px] text-muted-foreground">Police</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- 21. History ---------- */

export function HistoryScreen() {
  const [filter, setFilter] = useState("All");
  const tabs = ["All", "Completed", "Cancelled", "Emergency"];
  const rows = HISTORY.filter((h) => filter === "All" || h.status === filter);

  return (
    <Screen className="px-5 pb-32 pt-14">
      <h1 className="text-[24px] font-bold tracking-tight">Incident History</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Every alert raised from this device.</p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "h-9 shrink-0 rounded-xl border px-4 text-[13px] font-semibold transition-colors",
              filter === t ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-white/[0.03] text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((h) => (
          <Card key={h.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold">{h.location}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {h.date} · {h.time} · {h.id}
                </p>
              </div>
              <Pill tone={h.status === "Completed" ? "green" : h.status === "Cancelled" ? "muted" : "red"}>
                {h.status}
              </Pill>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-[12px]">
              <div>
                <Label>Severity</Label>
                <p className="mt-0.5 font-semibold">{h.severity}</p>
              </div>
              <div>
                <Label>Helper</Label>
                <p className="mt-0.5 truncate font-semibold">{h.helper}</p>
              </div>
              <div>
                <Label>Hospital</Label>
                <p className="mt-0.5 truncate font-semibold">{h.hospital}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Screen>
  );
}

/* ---------- 22. Community ---------- */

export function CommunityScreen({ onHelperMode }: { onHelperMode: () => void }) {
  const [volunteer, setVolunteer] = useState(true);
  return (
    <Screen className="px-5 pb-32 pt-14">
      <h1 className="text-[24px] font-bold tracking-tight">Community</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Bangalore · MG Road response zone</p>

      <Card className="mt-4 border-blue/25 bg-blue/[0.06]">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-blue/40 bg-blue/15">
            <HeartHandshake className="size-5 text-blue-bright" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold">Volunteer status</p>
            <p className="text-[12.5px] text-muted-foreground">
              {volunteer ? "You're receiving nearby requests" : "You're off duty"}
            </p>
          </div>
          <button
            onClick={() => setVolunteer((v) => !v)}
            className={cn(
              "h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors",
              volunteer ? "bg-success" : "bg-white/15",
            )}
          >
            <span
              className={cn(
                "block size-6 rounded-full bg-white transition-transform",
                volunteer && "translate-x-5",
              )}
            />
          </button>
        </div>
      </Card>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {[
          ["1,284", "Helpers"],
          ["312", "Lives helped"],
          ["6.4 min", "Avg response"],
        ].map(([v, l]) => (
          <Card key={l} className="p-3 text-center">
            <p className="text-[18px] font-bold leading-none">{v}</p>
            <p className="mt-1.5 text-[10.5px] text-muted-foreground">{l}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <SectionTitle action={<span className="text-[12px] text-blue-bright">See all</span>}>
          Nearby ResQNow helpers
        </SectionTitle>
        <div className="space-y-2.5">
          {VOLUNTEERS.map((v) => (
            <Card key={v.id} className="flex items-center gap-3 py-3">
              <Avatar name={v.name} color="#1677FF" size={42} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold">{v.name}</p>
                <p className="text-[12px] text-muted-foreground">
                  {v.distance} · ⭐ {v.rating} · {v.helps} helps
                </p>
              </div>
              <Pill tone={v.status === "Available" ? "green" : "orange"}>{v.status}</Pill>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <SectionTitle>Safety resources</SectionTitle>
        <div className="space-y-2.5">
          {[
            [BookOpen, "First aid basics", "6 short lessons"],
            [GraduationCap, "Helper training", "Certified in 45 min"],
            [Award, "Become a verified helper", "Badge + priority alerts"],
          ].map(([Icon, t, s]) => {
            const I = Icon as typeof BookOpen;
            return (
              <button
                key={t as string}
                onClick={onHelperMode}
                className="flex w-full items-center gap-3 rounded-[20px] border border-border bg-card/80 p-3.5 text-left active:scale-[0.99]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-white/[0.04]">
                  <I className="size-4.5 text-success" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold">{t as string}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{s as string}</p>
                </div>
                <ChevronRight className="size-4.5 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}

/* ---------- 23/24. Profile + Settings ---------- */

export function ProfileScreen({
  onSettings,
  onHistory,
  onLogout,
}: {
  onSettings: () => void;
  onHistory: () => void;
  onLogout: () => void;
}) {
  return (
    <Screen className="px-5 pb-32 pt-14">
      <div className="flex items-center gap-4">
        <Avatar name={USER.fullName} color="#FF3B30" size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[20px] font-bold tracking-tight">{USER.fullName}</p>
          <p className="truncate text-[12.5px] text-muted-foreground">{USER.phone}</p>
          <p className="truncate text-[12.5px] text-muted-foreground">{USER.location}</p>
        </div>
        <IconButton>
          <Pencil className="size-4" />
        </IconButton>
      </div>

      <Card className="mt-5">
        <Label tone="green">Medical profile</Label>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ["Blood", USER.blood],
            ["Allergies", USER.allergies],
            ["Conditions", USER.conditions],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-border bg-white/[0.03] p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
              <p className="mt-1 truncate text-[13px] font-bold">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 space-y-2.5">
        {[
          [Phone, "Emergency contacts", "5 selected"],
          [Clock, "Incident history", `${HISTORY.length} incidents`],
          [Building2, "Preferred hospital", HOSPITALS[0]!.name],
          [Stethoscope, "Medical details", "Update anytime"],
          [SettingsIcon, "Settings", "Notifications, privacy, language"],
        ].map(([Icon, t, s]) => {
          const I = Icon as typeof Phone;
          const onClick = t === "Settings" ? onSettings : t === "Incident history" ? onHistory : undefined;
          return (
            <button
              key={t as string}
              onClick={onClick}
              className="flex w-full items-center gap-3 rounded-[20px] border border-border bg-card/80 p-3.5 text-left active:scale-[0.99]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-white/[0.04]">
                <I className="size-4.5 text-blue-bright" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold">{t as string}</p>
                <p className="truncate text-[12px] text-muted-foreground">{s as string}</p>
              </div>
              <ChevronRight className="size-4.5 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      <Button variant="danger-soft" className="mt-5" onClick={onLogout}>
        <LogOut className="size-4.5" /> Logout
      </Button>
    </Screen>
  );
}

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    Notifications: true,
    Location: true,
    "Auto SOS on impact": true,
    "Share medical profile": true,
    "Dark mode": true,
  });

  const rows: [typeof Bell, string, string, boolean][] = [
    [Bell, "Notifications", "Critical alarms always on", true],
    [MapPin, "Location", "Precise while using ResQNow", true],
    [LifeBuoy, "Auto SOS on impact", "Trigger alarms automatically", true],
    [Lock, "Share medical profile", "With hospitals during emergency", true],
    [Moon, "Dark mode", "Recommended for night driving", true],
    [Globe, "Language", "English (India)", false],
    [Users, "Emergency preferences", "Alarms, contacts, escalation", false],
    [LifeBuoy, "Help & Support", "Chat with the ResQNow team", false],
    [Info, "About ResQNow", "Version 1.0.0 · Demo build", false],
  ];

  return (
    <Screen className="px-5 pb-32 pt-14">
      <div className="mb-5 flex items-center gap-3">
        <IconButton onClick={onBack}>
          <ChevronRight className="size-4.5 rotate-180" />
        </IconButton>
        <h1 className="text-[22px] font-bold tracking-tight">Settings</h1>
      </div>

      <div className="space-y-2.5">
        {rows.map(([Icon, t, s, isToggle]) => (
          <Card key={t} className="flex items-center gap-3 py-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-white/[0.04]">
              <Icon className="size-4.5 text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-semibold">{t}</p>
              <p className="truncate text-[12px] text-muted-foreground">{s}</p>
            </div>
            {isToggle ? (
              <button
                onClick={() => setToggles((x) => ({ ...x, [t]: !x[t] }))}
                className={cn(
                  "h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors",
                  toggles[t] ? "bg-success" : "bg-white/15",
                )}
              >
                <span
                  className={cn("block size-6 rounded-full bg-white transition-transform", toggles[t] && "translate-x-5")}
                />
              </button>
            ) : (
              <ChevronRight className="size-4.5 shrink-0 text-muted-foreground" />
            )}
          </Card>
        ))}
      </div>
    </Screen>
  );
}
