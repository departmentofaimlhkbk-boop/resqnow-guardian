import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Navigation,
  Phone,
  MessageSquare,
  CheckCircle2,
  Building2,
  Shield,
  ArrowRight,
  MapPin,
  Clock,
  X,
  Check,
  BedDouble,
  Loader2,
  Inbox,
} from "lucide-react";
import { Avatar, Button, Card, Checklist, Label, Pill, Screen } from "@/components/kit";
import { MapCanvas } from "@/components/MapCanvas";
import { useResQ, type Incident } from "@/hooks/useResQ";

export type HelperStage =
  | "request"
  | "accepted"
  | "nav-victim"
  | "reached"
  | "nav-hospital"
  | "hospital-notify"
  | "police-notify"
  | "handover"
  | "completed";

function severityLabel(inc: Incident | null) {
  return (inc?.severity ?? "high").toUpperCase();
}

function locationLabel(inc: Incident | null) {
  if (inc?.address) return inc.address;
  if (inc?.latitude != null && inc?.longitude != null) {
    return `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`;
  }
  return "Location shared on arrival";
}

/** The incident this device is currently acting on, from either side. */
function useLiveIncident() {
  const { helperIncident, incident } = useResQ();
  return helperIncident ?? incident;
}

/* ---------- 10. New emergency request ---------- */

export function HelperRequest({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const { helperRequests, acceptRequest, declineRequest } = useResQ();
  const req = helperRequests[0] ?? null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sec, setSec] = useState(0);

  useEffect(() => {
    if (!req) return;
    const tick = () => setSec(Math.max(0, Math.round((new Date(req.expires_at).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [req]);

  if (!req) {
    return (
      <Screen className="flex h-full flex-col px-5 pb-6 pt-14">
        <Pill tone="green">
          <Check className="size-3" /> HELPER MODE ON
        </Pill>
        <div className="grid flex-1 place-items-center text-center">
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-[24px] border border-border bg-white/[0.04]">
              <Inbox className="size-7 text-muted-foreground" />
            </span>
            <h1 className="mt-5 text-[24px] font-bold tracking-tight">No emergency requests</h1>
            <p className="mt-2 max-w-[16rem] text-[14px] text-muted-foreground">
              You are on duty. The moment someone nearby raises an alert, it appears here instantly.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onDecline}>
          Back to home
        </Button>
      </Screen>
    );
  }

  const inc = req.incident;

  const respond = async (accept: boolean) => {
    setBusy(true);
    setError(null);
    try {
      if (accept) {
        await acceptRequest(req.id);
        onAccept();
      } else {
        await declineRequest(req.id);
        onDecline();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not respond to this request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-14">
      <motion.div
        animate={{ opacity: [0.5, 0.15, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 120px 18px #FF3B30" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <Pill tone="red">
            <AlertTriangle className="size-3" /> NEW EMERGENCY REQUEST
          </Pill>
          <Pill tone="orange">
            <Clock className="size-3" /> {sec > 0 ? `Expires in ${sec}s` : "Expired"}
          </Pill>
        </div>

        <h1 className="mt-5 text-[26px] font-bold leading-tight tracking-tight">
          {severityLabel(inc).charAt(0) + severityLabel(inc).slice(1).toLowerCase()} Severity Accident
        </h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">Someone near you needs immediate help.</p>

        <Card className="mt-4 p-0">
          <MapCanvas
            className="h-56 rounded-t-[20px]"
            markers={[
              { id: "v", kind: "victim", x: 60, y: 40, pulse: true, label: "Victim" },
              { id: "me", kind: "helper", x: 26, y: 72, label: "You" },
            ]}
            route={{ from: [26, 72], to: [60, 40] }}
          />
          <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
            <div className="p-4">
              <Label>Distance</Label>
              <p className="mt-1 text-[20px] font-bold">
                {req.distance_km != null ? `${req.distance_km} km` : "Nearby"}
              </p>
            </div>
            <div className="p-4">
              <Label>Severity</Label>
              <p className="mt-1 text-[20px] font-bold text-primary">{severityLabel(inc)}</p>
            </div>
          </div>
        </Card>

        <Card className="mt-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/12">
              <MapPin className="size-4.5 text-primary" />
            </span>
            <div className="min-w-0">
              <Label>Location</Label>
              <p className="truncate text-[15px] font-semibold">{locationLabel(inc)}</p>
            </div>
          </div>
        </Card>

        {error && <p className="mt-3 text-[13px] text-primary">{error}</p>}
      </div>

      <div className="relative mt-auto grid grid-cols-2 gap-3 pt-5">
        <Button variant="outline" onClick={() => void respond(false)} disabled={busy}>
          <X className="size-4.5" /> Decline
        </Button>
        <Button variant="emergency" onClick={() => void respond(true)} disabled={busy}>
          {busy ? <Loader2 className="size-4.5 animate-spin" /> : <Check className="size-4.5" />} Accept
        </Button>
      </div>
    </Screen>
  );
}

/* ---------- 11. Accepted ---------- */

export function HelperAccepted({ onStart }: { onStart: () => void }) {
  const inc = useLiveIncident();
  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-16">
      <div className="text-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto grid size-20 place-items-center rounded-full border border-success/40 bg-success/12 shadow-glow-green"
        >
          <CheckCircle2 className="size-10 text-success" />
        </motion.span>
        <h1 className="mt-5 text-[28px] font-bold tracking-tight">Helper Assigned</h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">Navigate to Victim</p>
      </div>

      <Card className="mt-6">
        <div className="flex items-center gap-3">
          <Avatar name="Victim" color="#1677FF" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">{locationLabel(inc)}</p>
            <p className="text-[12.5px] text-muted-foreground">Severity {severityLabel(inc)}</p>
          </div>
          <Pill tone="blue">LIVE</Pill>
        </div>
      </Card>

      <Card className="mt-3 p-0">
        <MapCanvas
          className="h-64 rounded-[20px]"
          markers={[
            { id: "me", kind: "helper", x: 24, y: 74, pulse: true, label: "Helper" },
            { id: "v", kind: "victim", x: 66, y: 36, pulse: true, label: "Victim" },
          ]}
          route={{ from: [24, 74], to: [66, 36] }}
        />
      </Card>

      <Button variant="primary" className="mt-auto" onClick={onStart}>
        <Navigation className="size-4.5" /> Start Navigation
      </Button>
    </Screen>
  );
}

/* ---------- 12/15. Live navigation ---------- */

export function LiveNavigation({
  target,
  onArrive,
}: {
  target: "victim" | "hospital";
  onArrive: () => void;
}) {
  const inc = useLiveIncident();
  const { hospitals, pushHelperLocation } = useResQ();
  const hospital = hospitals.find((h) => h.id === inc?.hospital_id) ?? hospitals[0] ?? null;
  const [t, setT] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setT((v) => Math.min(v + 1, 10)), 1200);
    return () => clearInterval(id);
  }, []);

  // Stream the helper's real position while navigating.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const watch = navigator.geolocation.watchPosition(
      (pos) => void pushHelperLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [pushHelperLocation]);

  const p = t / 10;
  const from: [number, number] = target === "victim" ? [24, 74] : [66, 36];
  const to: [number, number] = target === "victim" ? [66, 36] : [82, 78];
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p;
  const dist = (target === "victim" ? 2.1 : 2.7) * (1 - p);
  const eta = Math.max(1, Math.ceil((target === "victim" ? 6 : 8) * (1 - p)));

  return (
    <div className="relative h-full">
      <MapCanvas
        className="absolute inset-0 size-full"
        markers={[
          { id: "me", kind: "helper", x, y, pulse: true, label: "You" },
          target === "victim"
            ? { id: "v", kind: "victim", x: 66, y: 36, pulse: true, label: "Victim" }
            : { id: "h", kind: "hospital", x: 82, y: 78, pulse: true, label: hospital?.name ?? "Hospital" },
        ]}
        route={{ from, to }}
      />

      <div className="absolute inset-x-4 top-14">
        <Card className="flex items-center gap-3 border-blue/30 bg-background/85">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue/15">
            <Navigation className="size-5 text-blue-bright" />
          </span>
          <div className="min-w-0 flex-1">
            <Label tone="blue">{target === "victim" ? "Navigating to Victim" : "Navigating to Hospital"}</Label>
            <p className="mt-0.5 truncate text-[15px] font-semibold">
              {target === "victim" ? locationLabel(inc) : (hospital?.name ?? "Nearest hospital")}
            </p>
          </div>
        </Card>
      </div>

      <div className="absolute inset-x-4 bottom-6 space-y-3">
        <Card className="bg-background/90">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div>
              <Label>Distance</Label>
              <p className="mt-1 text-[24px] font-bold tabular-nums">{dist.toFixed(1)} km</p>
            </div>
            <div className="pl-4">
              <Label>ETA</Label>
              <p className="mt-1 text-[24px] font-bold tabular-nums text-blue-bright">{eta} min</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" disabled={!hospital?.phone}>
              <Phone className="size-4" /> Call
            </Button>
            <Button variant="outline" size="sm" disabled>
              <MessageSquare className="size-4" /> Chat
            </Button>
            <Button variant="outline" size="sm" disabled>
              <MapPin className="size-4" /> Share
            </Button>
          </div>
        </Card>
        <Button variant={p >= 1 ? "success" : "emergency"} onClick={onArrive}>
          {p >= 1 ? (target === "victim" ? "I've Reached the Victim" : "Arrived at Hospital") : "End Trip"}
        </Button>
      </div>
    </div>
  );
}

/* ---------- 13. Victim reached ---------- */

export function VictimReached({ onHospital }: { onHospital: () => void }) {
  const inc = useLiveIncident();
  return (
    <div className="relative h-full">
      <MapCanvas
        className="absolute inset-0 size-full"
        markers={[{ id: "v", kind: "hospital", x: 52, y: 42, pulse: true, label: "Victim reached" }]}
      />
      <div className="absolute inset-x-4 bottom-6 space-y-3">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card className="border-success/30 bg-background/92">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-success/40 bg-success/15">
                <CheckCircle2 className="size-5.5 text-success" />
              </span>
              <div className="min-w-0">
                <p className="text-[17px] font-bold">Victim Location Reached</p>
                <p className="truncate text-[12.5px] text-success">{locationLabel(inc)}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" size="md" disabled>
                <MapPin className="size-4" /> Victim Location
              </Button>
              <Button variant="success" size="md" onClick={onHospital}>
                <Building2 className="size-4" /> Take to Hospital
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- 14. Choose hospital ---------- */

export function HospitalRoute({ onStart }: { onStart: () => void }) {
  const { hospitals, setHospital } = useResQ();
  const inc = useLiveIncident();
  const [selected, setSelected] = useState<string | null>(inc?.hospital_id ?? hospitals[0]?.id ?? null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selected && hospitals[0]) setSelected(hospitals[0].id);
  }, [hospitals, selected]);

  const start = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await setHospital(selected);
      onStart();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-14">
      <h1 className="text-[26px] font-bold leading-tight tracking-tight">Navigate to Nearby Hospital</h1>
      <p className="mt-1.5 text-[14px] text-muted-foreground">Choose the facility best prepared for this patient.</p>

      <div className="no-scrollbar mt-4 max-h-60 space-y-2.5 overflow-y-auto">
        {hospitals.length === 0 && (
          <Card>
            <p className="text-[13.5px] text-muted-foreground">No hospitals are registered in this area yet.</p>
          </Card>
        )}
        {hospitals.map((h) => (
          <button key={h.id} onClick={() => setSelected(h.id)} className="w-full text-left">
            <Card className={selected === h.id ? "border-success/45 bg-success/[0.07]" : ""}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-success/40 bg-success/15">
                  <Building2 className="size-5 text-success" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-bold">{h.name}</p>
                  <p className="truncate text-[12.5px] text-muted-foreground">
                    {h.trauma_center ? "Trauma centre" : "General hospital"} · {h.beds_available} beds free
                  </p>
                </div>
                {selected === h.id && <Check className="size-5 shrink-0 text-success" />}
              </div>
            </Card>
          </button>
        ))}
      </div>

      <Card className="mt-3 p-0">
        <MapCanvas
          className="h-56 rounded-[20px]"
          markers={[
            { id: "v", kind: "victim", x: 30, y: 34, label: "Pickup" },
            { id: "h", kind: "hospital", x: 78, y: 76, pulse: true, label: "Hospital" },
          ]}
          route={{ from: [30, 34], to: [78, 76] }}
        />
      </Card>

      <Button variant="primary" className="mt-auto" onClick={start} disabled={!selected || busy}>
        {busy ? <Loader2 className="size-4.5 animate-spin" /> : <Navigation className="size-4.5" />} Start Navigation
      </Button>
    </Screen>
  );
}

/* ---------- 16. Hospital notification ---------- */

export function HospitalNotify({ onNext }: { onNext: () => void }) {
  const { hospitals, medical, profile } = useResQ();
  const inc = useLiveIncident();
  const hospital = hospitals.find((h) => h.id === inc?.hospital_id) ?? hospitals[0] ?? null;
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= 3) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [step]);
  const ack = step >= 3;

  const rows: [string, string][] = [
    ["Hospital", hospital?.name ?? "Nearest hospital"],
    ["Name", profile?.full_name ?? "Victim"],
    ["Severity", severityLabel(inc)],
    ["Blood group", medical?.blood_group ?? "Not provided"],
    ["Allergies", medical?.allergies ?? "None recorded"],
  ];

  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-14">
      <Pill tone={ack ? "green" : "blue"}>
        <Building2 className="size-3" /> {ack ? "HOSPITAL ACKNOWLEDGED" : "NOTIFYING HOSPITAL"}
      </Pill>
      <h1 className="mt-4 text-[27px] font-bold leading-tight tracking-tight">
        {ack ? "Hospital Acknowledged" : "Notifying Hospital"}
      </h1>
      <p className="mt-1.5 text-[14px] text-muted-foreground">
        {ack ? "Hospital is prepared for the patient." : "Sharing patient details ahead of arrival."}
      </p>

      <Card className="mt-5">
        <div className="flex items-center justify-between">
          <div>
            <Label>Beds available</Label>
            <p className="mt-1 text-[30px] font-bold leading-none text-warning">{hospital?.beds_available ?? 0}</p>
          </div>
          <span className="grid size-14 place-items-center rounded-2xl border border-warning/35 bg-warning/12">
            <Clock className="size-6 text-warning" />
          </span>
        </div>
      </Card>

      <Card className="mt-3">
        <Label tone="green">Patient Incoming</Label>
        <div className="mt-3 space-y-2.5 text-[14px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{k}</span>
              <span className="truncate font-semibold">{v}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold text-success">{ack ? "Notification Sent ✓" : "Sending…"}</span>
          </div>
        </div>
      </Card>

      <div className="mt-3">
        <Checklist
          items={["Trauma bay reserved", "Blood bank alerted", "Emergency doctor assigned"]}
          done={step}
          tone="green"
        />
      </div>

      <Button variant="primary" className="mt-auto" disabled={!ack} onClick={onNext}>
        Continue <ArrowRight className="size-4.5" />
      </Button>
    </Screen>
  );
}

/* ---------- 17. Police notification ---------- */

export function PoliceNotify({ onNext }: { onNext: () => void }) {
  const inc = useLiveIncident();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= 3) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [step]);
  const ack = step >= 3;

  const rows: [string, string][] = [
    ["Location", locationLabel(inc)],
    ["Severity", severityLabel(inc)],
    ["Reported", inc ? new Date(inc.created_at).toLocaleTimeString() : "—"],
    ["Detection", inc?.detection_source === "manual_sos" ? "Manual SOS" : "Sensor detection"],
    ["Confidence", inc ? `${Math.round(inc.accident_probability * 100)}%` : "—"],
  ];

  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-14">
      <Pill tone={ack ? "green" : "orange"}>
        <Shield className="size-3" /> {ack ? "POLICE ACKNOWLEDGED" : "INFORMING POLICE"}
      </Pill>
      <h1 className="mt-4 text-[27px] font-bold leading-tight tracking-tight">
        {ack ? "Police Acknowledged" : "Informing Police"}
      </h1>
      <p className="mt-1.5 text-[14px] text-muted-foreground">
        {ack ? "Police is on the way." : "Sharing the accident report with the nearest station."}
      </p>

      <Card className="mt-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-warning/35 bg-warning/12">
            <Shield className="size-5 text-warning" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-bold">Nearest police station</p>
            <p className="truncate text-[12.5px] text-muted-foreground">{locationLabel(inc)}</p>
          </div>
        </div>
      </Card>

      <Card className="mt-3">
        <Label tone="orange">Accident Report Shared</Label>
        <div className="mt-3 space-y-2.5 text-[14px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{k}</span>
              <span className="truncate font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-3">
        <Checklist items={["Report transmitted", "Officer assigned", "Patrol dispatched"]} done={step} tone="orange" />
      </div>

      <Button variant="primary" className="mt-auto" disabled={!ack} onClick={onNext}>
        Continue <ArrowRight className="size-4.5" />
      </Button>
    </Screen>
  );
}

/* ---------- 18. Handover ---------- */

export function Handover({ onComplete }: { onComplete: () => void }) {
  const { hospitals } = useResQ();
  const inc = useLiveIncident();
  const hospital = hospitals.find((h) => h.id === inc?.hospital_id) ?? hospitals[0] ?? null;
  const [busy, setBusy] = useState(false);

  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-14">
      <Pill tone="green">
        <Building2 className="size-3" /> AT HOSPITAL
      </Pill>
      <h1 className="mt-4 text-[27px] font-bold tracking-tight">At Hospital</h1>
      <p className="mt-1.5 text-[14px] text-muted-foreground">{hospital?.name ?? "Hospital"} · Emergency Wing</p>

      <Card className="mt-4 p-0">
        <MapCanvas
          className="h-56 rounded-[20px]"
          markers={[{ id: "h", kind: "hospital", x: 52, y: 48, pulse: true, label: hospital?.name ?? "Hospital" }]}
        />
      </Card>

      <Card className="mt-3 border-success/30">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-success/40 bg-success/15">
            <BedDouble className="size-5 text-success" />
          </span>
          <div className="min-w-0">
            <p className="text-[16px] font-bold">Patient Handover</p>
            <p className="text-[12.5px] text-muted-foreground">Hospital team has received the patient.</p>
          </div>
        </div>
      </Card>

      <Button
        variant="success"
        className="mt-auto"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          onComplete();
        }}
      >
        {busy && <Loader2 className="size-4.5 animate-spin" />} Mark as Completed
      </Button>
    </Screen>
  );
}

/* ---------- 19. Completed ---------- */

export function Completed({ onHome, incident }: { onHome: () => void; incident: Incident | null }) {
  const { hospitals } = useResQ();
  const hospital = hospitals.find((h) => h.id === incident?.hospital_id) ?? null;

  const responseTime = useMemo(() => {
    if (!incident?.completed_at) return "—";
    const ms = new Date(incident.completed_at).getTime() - new Date(incident.created_at).getTime();
    const min = Math.floor(ms / 60000);
    const sec = Math.round((ms % 60000) / 1000);
    return `${min} min ${sec} s`;
  }, [incident]);

  const rows: [string, string][] = [
    ["Response time", responseTime],
    ["Severity", severityLabel(incident)],
    ["Hospital", hospital?.name ?? "Not recorded"],
    ["Incident ID", incident ? incident.id.slice(0, 8).toUpperCase() : "—"],
  ];

  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-16">
      <div className="text-center">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 13 }}
          className="mx-auto grid size-24 place-items-center rounded-full border border-success/40 bg-success/12 shadow-glow-green"
        >
          <CheckCircle2 className="size-12 text-success" />
        </motion.span>
        <h1 className="mt-6 text-[28px] font-bold tracking-tight">Emergency Completed</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Help has successfully reached the victim.</p>
      </div>

      <Card className="mt-7">
        <div className="space-y-3 text-[14px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{k}</span>
              <span className="truncate font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-auto">
        <Button variant="success" onClick={onHome}>
          Return Home
        </Button>
      </div>
    </Screen>
  );
}
