import { useState } from "react";
import {
  MapPin,
  Layers,
  Crosshair,
  Plus,
  Minus,
  Users,
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
  Check,
} from "lucide-react";
import { Avatar, Button, Card, IconButton, Label, Pill, Screen, SectionTitle } from "@/components/kit";
import { MapCanvas, MapLegend } from "@/components/MapCanvas";
import { useResQ } from "@/hooks/useResQ";
import { cn } from "@/lib/utils";

/* ---------- 20. Map ---------- */

export function MapScreen() {
  const { profile, hospitals, nearbyHelpers, incident } = useResQ();
  return (
    <div className="relative h-full">
      <MapCanvas
        className="absolute inset-0 size-full"
        markers={[
          { id: "me", kind: "me", x: 46, y: 52, pulse: true, label: "You" },
          ...nearbyHelpers.slice(0, 3).map((h, i) => ({
            id: h.user_id,
            kind: "helper" as const,
            x: [28, 66, 72][i] ?? 50,
            y: [33, 30, 62][i] ?? 50,
          })),
          ...hospitals.slice(0, 2).map((h, i) => ({
            id: h.id,
            kind: "hospital" as const,
            x: [82, 18][i] ?? 50,
            y: [78, 74][i] ?? 50,
            label: h.name,
          })),
          ...(incident ? [{ id: "e1", kind: "victim" as const, x: 58, y: 68, pulse: true, label: "Active" }] : []),
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
              <p className="truncate text-[15px] font-semibold">{profile?.location ?? "Location not set"}</p>
            </div>
            <Pill tone={incident ? "red" : "green"}>{incident ? "1 active" : "All clear"}</Pill>
          </div>
          <div className="mt-3 grid grid-cols-2 divide-x divide-border text-center">
            <div>
              <p className="text-[18px] font-bold">{nearbyHelpers.length}</p>
              <p className="text-[10px] text-muted-foreground">Helpers</p>
            </div>
            <div>
              <p className="text-[18px] font-bold text-success">{hospitals.length}</p>
              <p className="text-[10px] text-muted-foreground">Hospitals</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- 21. History ---------- */

const STATUS_LABEL: Record<string, string> = {
  incident_completed: "Completed",
  cancelled: "Cancelled",
};

export function HistoryScreen() {
  const { incidents, hospitals } = useResQ();
  const [filter, setFilter] = useState("All");
  const tabs = ["All", "Completed", "Cancelled", "Active"];

  const label = (stage: string) => STATUS_LABEL[stage] ?? "Active";
  const rows = incidents.filter((h) => filter === "All" || label(h.stage) === filter);

  return (
    <Screen className="px-5 pb-32 pt-14">
      <h1 className="text-[24px] font-bold tracking-tight">Incident History</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Every alert raised from this account.</p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "h-9 shrink-0 rounded-xl border px-4 text-[13px] font-semibold transition-colors",
              filter === t
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border bg-white/[0.03] text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {rows.length === 0 && (
          <Card>
            <p className="text-[13.5px] text-muted-foreground">No incidents recorded yet.</p>
          </Card>
        )}
        {rows.map((h) => {
          const created = new Date(h.created_at);
          const status = label(h.stage);
          return (
            <Card key={h.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold">{h.address ?? "Location not recorded"}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {created.toLocaleDateString()} · {created.toLocaleTimeString()} · {h.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <Pill tone={status === "Completed" ? "green" : status === "Cancelled" ? "muted" : "red"}>{status}</Pill>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-[12px]">
                <div>
                  <Label>Severity</Label>
                  <p className="mt-0.5 font-semibold capitalize">{h.severity}</p>
                </div>
                <div>
                  <Label>Detection</Label>
                  <p className="mt-0.5 truncate font-semibold">
                    {h.detection_source === "manual_sos" ? "Manual SOS" : "Sensors"}
                  </p>
                </div>
                <div>
                  <Label>Hospital</Label>
                  <p className="mt-0.5 truncate font-semibold">
                    {hospitals.find((x) => x.id === h.hospital_id)?.name ?? "—"}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}

/* ---------- Notifications ---------- */

export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useResQ();

  return (
    <Screen className="px-5 pb-32 pt-14">
      <div className="mb-5 flex items-center gap-3">
        <IconButton onClick={onBack}>
          <ChevronRight className="size-4.5 rotate-180" />
        </IconButton>
        <h1 className="text-[22px] font-bold tracking-tight">Notifications</h1>
        <button
          onClick={() => void markAllNotificationsRead()}
          className="ml-auto text-[12.5px] font-semibold text-blue-bright"
        >
          Mark all read
        </button>
      </div>

      <div className="space-y-2.5">
        {notifications.length === 0 && (
          <Card>
            <p className="text-[13.5px] text-muted-foreground">Nothing yet. Alerts appear here in real time.</p>
          </Card>
        )}
        {notifications.map((n) => (
          <button key={n.id} onClick={() => void markNotificationRead(n.id)} className="w-full text-left">
            <Card className={n.is_read ? "" : "border-blue/35 bg-blue/[0.06]"}>
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-white/[0.04]">
                  <Bell className="size-4 text-blue-bright" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold">{n.title}</p>
                  {n.body && <p className="text-[12.5px] text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </Screen>
  );
}

/* ---------- 22. Community ---------- */

export function CommunityScreen({ onHelperMode }: { onHelperMode: () => void }) {
  const { helper, setHelperAvailability, nearbyHelpers, incidents } = useResQ();
  const [busy, setBusy] = useState(false);
  const volunteer = helper?.is_available ?? false;

  const toggle = async () => {
    setBusy(true);
    try {
      await setHelperAvailability(!volunteer);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen className="px-5 pb-32 pt-14">
      <h1 className="text-[24px] font-bold tracking-tight">Community</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Your local ResQNow response network</p>

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
            onClick={toggle}
            disabled={busy}
            aria-label="Toggle volunteer status"
            className={cn(
              "h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors",
              volunteer ? "bg-success" : "bg-white/15",
            )}
          >
            <span
              className={cn("block size-6 rounded-full bg-white transition-transform", volunteer && "translate-x-5")}
            />
          </button>
        </div>
      </Card>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {[
          [String(nearbyHelpers.length), "Helpers online"],
          [String(helper?.helps_count ?? 0), "Your helps"],
          [String(incidents.length), "Your incidents"],
        ].map(([v, l]) => (
          <Card key={l} className="p-3 text-center">
            <p className="text-[18px] font-bold leading-none">{v}</p>
            <p className="mt-1.5 text-[10.5px] text-muted-foreground">{l}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <SectionTitle>Helpers on duty</SectionTitle>
        <div className="space-y-2.5">
          {nearbyHelpers.length === 0 && (
            <Card>
              <p className="text-[13.5px] text-muted-foreground">No helpers are on duty right now.</p>
            </Card>
          )}
          {nearbyHelpers.map((v) => (
            <Card key={v.user_id} className="flex items-center gap-3 py-3">
              <Avatar name="Helper" color="#1677FF" size={42} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold">
                  {v.is_verified ? "Verified helper" : "ResQNow helper"}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  ⭐ {v.rating} · {v.helps_count} helps
                </p>
              </div>
              <Pill tone={v.current_incident_id ? "orange" : "green"}>
                {v.current_incident_id ? "Busy" : "Available"}
              </Pill>
            </Card>
          ))}
        </div>
      </div>

      <Button variant="primary" className="mt-6" onClick={onHelperMode}>
        Open helper mode
      </Button>
    </Screen>
  );
}

/* ---------- 23/24. Profile + Settings ---------- */

export function ProfileScreen({
  onSettings,
  onHistory,
  onContacts,
  onLogout,
}: {
  onSettings: () => void;
  onHistory: () => void;
  onContacts: () => void;
  onLogout: () => void;
}) {
  const { profile, medical, contacts, incidents, hospitals, saveProfile, saveMedical } = useResQ();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    blood_group: medical?.blood_group ?? "",
    allergies: medical?.allergies ?? "",
    conditions: medical?.conditions ?? "",
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await saveProfile({ full_name: form.full_name, phone: form.phone, location: form.location });
      await saveMedical({
        blood_group: form.blood_group,
        allergies: form.allergies,
        conditions: form.conditions,
      });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const selected = contacts.filter((c) => c.is_selected).length;

  return (
    <Screen className="px-5 pb-32 pt-14">
      <div className="flex items-center gap-4">
        <Avatar name={profile?.full_name ?? "ResQNow"} color={profile?.avatar_color ?? "#FF3B30"} size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[20px] font-bold tracking-tight">{profile?.full_name ?? "Your profile"}</p>
          <p className="truncate text-[12.5px] text-muted-foreground">{profile?.phone ?? "Add a phone number"}</p>
          <p className="truncate text-[12.5px] text-muted-foreground">{profile?.location ?? "Add your location"}</p>
        </div>
        <IconButton onClick={() => setEditing((e) => !e)} aria-label="Edit profile">
          {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
        </IconButton>
      </div>

      {editing && (
        <Card className="mt-4 space-y-2">
          {(
            [
              ["full_name", "Full name"],
              ["phone", "Phone number"],
              ["location", "Location"],
              ["blood_group", "Blood group"],
              ["allergies", "Allergies"],
              ["conditions", "Medical conditions"],
            ] as const
          ).map(([key, labelText]) => (
            <label key={key} className="block">
              <span className="label-xs text-muted-foreground">{labelText}</span>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="mt-1 h-11 w-full rounded-xl border border-border bg-white/[0.03] px-3 text-[14px] outline-none focus:border-blue/60"
              />
            </label>
          ))}
          <Button variant="primary" size="sm" onClick={save} disabled={busy}>
            Save changes
          </Button>
        </Card>
      )}

      <Card className="mt-5">
        <Label tone="green">Medical profile</Label>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ["Blood", medical?.blood_group || "—"],
            ["Allergies", medical?.allergies || "None"],
            ["Conditions", medical?.conditions || "None"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-border bg-white/[0.03] p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
              <p className="mt-1 truncate text-[13px] font-bold">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 space-y-2.5">
        {(
          [
            [Phone, "Emergency contacts", `${selected} selected`, onContacts],
            [Clock, "Incident history", `${incidents.length} incidents`, onHistory],
            [
              Building2,
              "Preferred hospital",
              hospitals.find((h) => h.id === profile?.preferred_hospital_id)?.name ?? "Nearest available",
              undefined,
            ],
            [Stethoscope, "Medical details", "Update anytime", () => setEditing(true)],
            [SettingsIcon, "Settings", "Notifications, privacy, language", onSettings],
          ] as const
        ).map(([Icon, t, s, onClick]) => (
          <button
            key={t}
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-[20px] border border-border bg-card/80 p-3.5 text-left active:scale-[0.99]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-white/[0.04]">
              <Icon className="size-4.5 text-blue-bright" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-semibold">{t}</p>
              <p className="truncate text-[12px] text-muted-foreground">{s}</p>
            </div>
            <ChevronRight className="size-4.5 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>

      <Button variant="danger-soft" className="mt-5" onClick={onLogout}>
        <LogOut className="size-4.5" /> Logout
      </Button>
    </Screen>
  );
}

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, saveSettings } = useResQ();

  const rows: [typeof Bell, string, string, keyof NonNullable<typeof settings> | null][] = [
    [Bell, "Notifications", "Critical alarms always on", "notifications_enabled"],
    [MapPin, "Location", "Precise while using ResQNow", "location_enabled"],
    [LifeBuoy, "Auto SOS on impact", "Trigger alarms automatically", "auto_sos_enabled"],
    [Lock, "Share medical profile", "With hospitals during emergency", "share_medical"],
    [Moon, "Dark mode", "Recommended for night driving", "dark_mode"],
    [Globe, "Language", settings?.language ?? "English (India)", null],
    [Users, "Emergency preferences", "Alarms, contacts, escalation", null],
    [LifeBuoy, "Help & Support", "Chat with the ResQNow team", null],
    [Info, "About ResQNow", "Version 1.0.0", null],
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
        {rows.map(([Icon, t, s, key]) => {
          const on = key ? Boolean(settings?.[key]) : false;
          return (
            <Card key={t} className="flex items-center gap-3 py-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-white/[0.04]">
                <Icon className="size-4.5 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold">{t}</p>
                <p className="truncate text-[12px] text-muted-foreground">{s}</p>
              </div>
              {key ? (
                <button
                  aria-label={`Toggle ${t}`}
                  onClick={() => void saveSettings({ [key]: !on } as Record<string, boolean>)}
                  className={cn(
                    "h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors",
                    on ? "bg-success" : "bg-white/15",
                  )}
                >
                  <span className={cn("block size-6 rounded-full bg-white transition-transform", on && "translate-x-5")} />
                </button>
              ) : (
                <ChevronRight className="size-4.5 shrink-0 text-muted-foreground" />
              )}
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}
