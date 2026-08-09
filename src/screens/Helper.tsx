import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Avatar, Button, Card, Checklist, Label, Pill, Screen } from "@/components/kit";
import { MapCanvas } from "@/components/MapCanvas";
import { USER } from "@/lib/mock";

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

/* ---------- 10. New emergency request ---------- */

export function HelperRequest({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const [sec, setSec] = useState(25);
  useEffect(() => {
    if (sec <= 0) return;
    const t = setTimeout(() => setSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sec]);

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
            <Clock className="size-3" /> Expires in {sec}s
          </Pill>
        </div>

        <h1 className="mt-5 text-[26px] font-bold leading-tight tracking-tight">High Severity Accident</h1>
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
              <p className="mt-1 text-[20px] font-bold">2.4 km</p>
            </div>
            <div className="p-4">
              <Label>Severity</Label>
              <p className="mt-1 text-[20px] font-bold text-primary">HIGH</p>
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
              <p className="truncate text-[15px] font-semibold">MG Road, Bangalore</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="relative mt-auto grid grid-cols-2 gap-3 pt-5">
        <Button variant="outline" onClick={onDecline}>
          <X className="size-4.5" /> Decline
        </Button>
        <Button variant="emergency" onClick={onAccept}>
          <Check className="size-4.5" /> Accept
        </Button>
      </div>
    </Screen>
  );
}

/* ---------- 11. Accepted ---------- */

export function HelperAccepted({ onStart }: { onStart: () => void }) {
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
        <h1 className="mt-5 text-[28px] font-bold tracking-tight">You Accepted</h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">Navigate to Victim</p>
      </div>

      <Card className="mt-6">
        <div className="flex items-center gap-3">
          <Avatar name="Rohit Sharma" color="#1677FF" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">Rohit will guide you</p>
            <p className="text-[12.5px] text-muted-foreground">ResQNow response coordinator</p>
          </div>
          <Pill tone="blue">LIVE</Pill>
        </div>
      </Card>

      <Card className="mt-3 p-0">
        <MapCanvas
          className="h-64 rounded-[20px]"
          markers={[
            { id: "me", kind: "helper", x: 24, y: 74, pulse: true, label: "You" },
            { id: "v", kind: "victim", x: 66, y: 36, pulse: true, label: "Arjun" },
          ]}
          route={{ from: [24, 74], to: [66, 36] }}
        />
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card>
          <Label>Distance</Label>
          <p className="mt-1 text-[22px] font-bold">2.4 km</p>
        </Card>
        <Card>
          <Label>ETA</Label>
          <p className="mt-1 text-[22px] font-bold text-blue-bright">7 min</p>
        </Card>
      </div>

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
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((v) => Math.min(v + 1, 10)), 1200);
    return () => clearInterval(id);
  }, []);
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
            ? { id: "v", kind: "victim", x: 66, y: 36, pulse: true, label: "Arjun" }
            : { id: "h", kind: "hospital", x: 82, y: 78, pulse: true, label: "City Care" },
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
              {target === "victim" ? "MG Road, Bangalore" : "City Care Hospital"}
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
            <Button variant="outline" size="sm">
              <Phone className="size-4" /> Call
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="size-4" /> Chat
            </Button>
            <Button variant="outline" size="sm">
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
  return (
    <div className="relative h-full">
      <MapCanvas
        className="absolute inset-0 size-full"
        markers={[{ id: "v", kind: "hospital", x: 52, y: 42, pulse: true, label: "Arjun — Safe" }]}
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
                <p className="text-[12.5px] text-success">Victim is Safe</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" size="md">
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
  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-14">
      <h1 className="text-[26px] font-bold leading-tight tracking-tight">Navigate to Nearby Hospital</h1>
      <p className="mt-1.5 text-[14px] text-muted-foreground">Nearest trauma-ready facility selected for you.</p>

      <Card className="mt-4 border-success/30">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-success/40 bg-success/15">
            <Building2 className="size-5 text-success" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-bold">City Care Hospital</p>
            <p className="text-[12.5px] text-muted-foreground">Trauma centre · 6 beds free</p>
          </div>
          <div className="text-right">
            <p className="text-[18px] font-bold">2.7 km</p>
            <p className="text-[11px] text-muted-foreground">8 min</p>
          </div>
        </div>
      </Card>

      <Card className="mt-3 p-0">
        <MapCanvas
          className="h-72 rounded-[20px]"
          markers={[
            { id: "v", kind: "victim", x: 30, y: 34, label: "Pickup" },
            { id: "h", kind: "hospital", x: 78, y: 76, pulse: true, label: "City Care" },
          ]}
          route={{ from: [30, 34], to: [78, 76] }}
        />
      </Card>

      <Button variant="primary" className="mt-auto" onClick={onStart}>
        <Navigation className="size-4.5" /> Start Navigation
      </Button>
    </Screen>
  );
}

/* ---------- 16. Hospital notification ---------- */

export function HospitalNotify({ onNext }: { onNext: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= 3) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [step]);
  const ack = step >= 3;

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
            <Label>Estimated Arrival</Label>
            <p className="mt-1 text-[30px] font-bold leading-none text-warning">7 min</p>
          </div>
          <span className="grid size-14 place-items-center rounded-2xl border border-warning/35 bg-warning/12">
            <Clock className="size-6 text-warning" />
          </span>
        </div>
      </Card>

      <Card className="mt-3">
        <Label tone="green">Patient Incoming</Label>
        <div className="mt-3 space-y-2.5 text-[14px]">
          {[
            ["Hospital", "City Care Hospital"],
            ["Name", USER.name],
            ["Severity", "High"],
            ["Blood group", USER.blood],
            ["ETA", "7 min"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-semibold">{v}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold text-success">Notification Sent ✓</span>
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
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= 3) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [step]);
  const ack = step >= 3;

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
            <p className="truncate text-[16px] font-bold">MG Road Police Station</p>
            <p className="text-[12.5px] text-muted-foreground">1.2 km from incident</p>
          </div>
        </div>
      </Card>

      <Card className="mt-3">
        <Label tone="orange">Accident Report Shared</Label>
        <div className="mt-3 space-y-2.5 text-[14px]">
          {[
            ["Location", "MG Road, Bangalore"],
            ["Severity", "High"],
            ["Time", "21:42 IST"],
            ["Vehicle", "Two-wheeler impact"],
            ["Helper", "Rohit Sharma"],
          ].map(([k, v]) => (
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
  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-14">
      <Pill tone="green">
        <Building2 className="size-3" /> AT HOSPITAL
      </Pill>
      <h1 className="mt-4 text-[27px] font-bold tracking-tight">At Hospital</h1>
      <p className="mt-1.5 text-[14px] text-muted-foreground">City Care Hospital · Emergency Wing</p>

      <Card className="mt-4 p-0">
        <MapCanvas
          className="h-56 rounded-[20px]"
          markers={[{ id: "h", kind: "hospital", x: 52, y: 48, pulse: true, label: "City Care Hospital" }]}
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

      <Button variant="success" className="mt-auto" onClick={onComplete}>
        Mark as Completed
      </Button>
    </Screen>
  );
}

/* ---------- 19. Completed ---------- */

export function Completed({ onHome }: { onHome: () => void }) {
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
          {[
            ["Response time", "11 min 24 s"],
            ["Helper", "Rohit Sharma"],
            ["Hospital", "City Care Hospital"],
            ["Incident ID", "RQ-2291"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-auto space-y-2.5">
        <Button variant="outline" onClick={onHome}>
          View Incident
        </Button>
        <Button variant="success" onClick={onHome}>
          Return Home
        </Button>
      </div>
    </Screen>
  );
}
