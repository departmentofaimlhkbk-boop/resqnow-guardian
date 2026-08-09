import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, PhoneCall, ShieldCheck, Radar, Brain, CheckCircle2, Volume2 } from "lucide-react";
import { Button, Card, Checklist, CountdownRing, Label, Pill, Screen } from "@/components/kit";

/* ---------- Alarms 1..3, 30s each ---------- */

export function AlarmScreen({
  alarm,
  onSafe,
  onExpire,
  onCallHelp,
}: {
  alarm: 1 | 2 | 3;
  onSafe: () => void;
  onExpire: () => void;
  onCallHelp: () => void;
}) {
  const [sec, setSec] = useState(30);

  useEffect(() => {
    setSec(30);
  }, [alarm]);

  useEffect(() => {
    if (sec <= 0) {
      onExpire();
      return;
    }
    const t = setTimeout(() => setSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec]);

  const color = alarm === 1 ? "#FF9800" : alarm === 2 ? "#FF6B2C" : "#FF3B30";

  return (
    <motion.div
      key={alarm}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-full overflow-hidden"
      style={{ background: `radial-gradient(circle at 50% 32%, ${color}22, #050B14 62%)` }}
    >
      <motion.div
        animate={{ opacity: [0.35, 0.08, 0.35] }}
        transition={{ duration: 1.1, repeat: Infinity }}
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: `inset 0 0 120px 24px ${color}` }}
      />
      <Screen className="relative flex h-full flex-col px-6 pb-8 pt-14">
        <div className="flex items-center justify-between">
          <Pill tone={alarm === 3 ? "red" : "orange"}>
            <Volume2 className="size-3" /> ALARM {alarm} OF 3
          </Pill>
          <span className="label-xs text-muted-foreground">{(3 - alarm) * 30 + sec}s left total</span>
        </div>

        <div className="mt-8 text-center">
          <span
            className="mx-auto grid size-12 place-items-center rounded-2xl border"
            style={{ borderColor: `${color}55`, background: `${color}1f` }}
          >
            <AlertTriangle className="size-6" style={{ color }} />
          </span>
          <h1 className="mt-4 text-[30px] font-bold leading-tight tracking-tight">
            {alarm === 1 ? "Impact Detected" : "Emergency Detected"}
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">Are you okay? Respond before the timer ends.</p>
        </div>

        <div className="mt-8 grid flex-1 place-items-start justify-center">
          <CountdownRing value={sec} total={30} color={color} />
        </div>

        <div className="mb-5 flex items-center justify-center gap-1.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className="h-1.5 w-14 rounded-full transition-colors"
              style={{ background: n < alarm ? "#FF3B3055" : n === alarm ? color : "rgba(255,255,255,0.12)" }}
            />
          ))}
        </div>

        <div className="space-y-2.5">
          <Button variant="success" onClick={onSafe} className="h-16 text-[17px]">
            <ShieldCheck className="size-5" /> I'm Safe
          </Button>
          <Button variant="danger-soft" onClick={onCallHelp}>
            <PhoneCall className="size-4.5" /> Call for Help Now
          </Button>
        </div>
      </Screen>
    </motion.div>
  );
}

/* ---------- No response ---------- */

const NR_ITEMS = [
  "Notifying emergency contacts",
  "Alerting nearby ResQNow users",
  "Contacting nearest hospital",
  "Informing police",
];

export function NoResponse({ onNext }: { onNext: () => void }) {
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (done >= NR_ITEMS.length) {
      const t = setTimeout(onNext, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 850);
    return () => clearTimeout(t);
  }, [done, onNext]);

  return (
    <Screen className="flex h-full flex-col px-6 pb-8 pt-20">
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-[24px] border border-primary/40 bg-primary/12 shadow-glow-red">
          <AlertTriangle className="size-8 text-primary" />
        </span>
        <h1 className="mt-5 text-[30px] font-bold tracking-tight">No Response</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">No response detected. Taking action...</p>
      </div>
      <div className="mt-10">
        <Label tone="red">Automatic emergency protocol</Label>
        <div className="mt-3">
          <Checklist items={NR_ITEMS} done={done} tone="orange" />
        </div>
      </div>
    </Screen>
  );
}

/* ---------- AI analysis ---------- */

const AI_ITEMS = ["Analyzing Impact", "Analyzing Speed", "Checking Motion", "Verifying Location", "Predicting Severity"];

export function AIAnalysis({
  onNext,
  severity,
  confidence,
}: {
  onNext: () => void;
  severity: string;
  confidence: number;
}) {
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (done >= AI_ITEMS.length) {
      const t = setTimeout(onNext, 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 750);
    return () => clearTimeout(t);
  }, [done, onNext]);
  const complete = done >= AI_ITEMS.length;

  return (
    <Screen className="flex h-full flex-col px-6 pb-8 pt-14">
      <div className="text-center">
        <Pill tone="blue">
          <Brain className="size-3" /> RESQNOW AI
        </Pill>
        <h1 className="mt-4 text-[28px] font-bold tracking-tight">AI Analyzing...</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">Assessing crash severity from sensor data</p>
      </div>

      <div className="mt-7 grid place-items-center">
        <div className="relative grid size-40 place-items-center">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue border-r-blue/40"
          />
          <motion.span
            animate={{ rotate: -360 }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-2 border-transparent border-b-warning border-l-warning/30"
          />
          <span className="pulse-ring absolute inset-8 rounded-full border border-blue" />
          <div className="grid size-20 place-items-center rounded-full border border-blue/40 bg-blue/12 shadow-glow-blue">
            <Brain className="size-9 text-blue-bright" />
          </div>
        </div>
      </div>

      <div className="mt-7">
        <Checklist items={AI_ITEMS} done={done} tone="blue" />
      </div>

      <motion.div animate={{ opacity: complete ? 1 : 0.25 }} className="mt-5">
        <Card className="border-primary/35 bg-primary/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <Label tone="orange">Estimated Severity</Label>
              <p className="mt-1 text-[28px] font-bold uppercase leading-none text-primary">{severity}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted-foreground">Confidence</p>
              <p className="text-[18px] font-bold text-warning">{Math.round(confidence * 100)}%</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </Screen>
  );
}

/* ---------- Broadcast ---------- */

const BC_ITEMS = ["Emergency Contacts", "Nearby Helpers", "Nearest Hospital", "Police"];

export function Broadcast({ onTracking }: { onTracking: () => void }) {
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (done >= BC_ITEMS.length) return;
    const t = setTimeout(() => setDone((d) => d + 1), 900);
    return () => clearTimeout(t);
  }, [done]);
  const sent = done >= BC_ITEMS.length;

  return (
    <Screen className="flex h-full flex-col px-6 pb-8 pt-14">
      <div className="text-center">
        <Pill tone={sent ? "green" : "red"}>
          {sent ? <CheckCircle2 className="size-3" /> : <Radar className="size-3" />}
          {sent ? "ALERT DELIVERED" : "BROADCASTING"}
        </Pill>
        <h1 className="mt-4 text-[28px] font-bold tracking-tight">
          {sent ? "Help is on the way" : "Sending Alert..."}
        </h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          {sent ? "Nearby helpers have been notified." : "Reaching everyone who can help you right now"}
        </p>
      </div>

      <div className="mt-8 grid place-items-center">
        <div className="relative grid size-48 place-items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="pulse-ring absolute size-24 rounded-full border-2"
              style={{
                borderColor: sent ? "var(--color-success)" : "var(--color-primary)",
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
          <div
            className="grid size-24 place-items-center rounded-full border"
            style={{
              borderColor: sent ? "var(--color-success)" : "var(--color-primary)",
              background: sent ? "rgba(22,199,132,0.12)" : "rgba(255,59,48,0.12)",
            }}
          >
            {sent ? (
              <CheckCircle2 className="size-11 text-success" />
            ) : (
              <Radar className="size-11 text-primary" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex-1">
        <div className="mb-3 flex items-center justify-between">
          <Label>Delivery progress</Label>
          <span className="text-[12px] font-semibold">{Math.round((done / BC_ITEMS.length) * 100)}%</span>
        </div>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(done / BC_ITEMS.length) * 100}%` }}
          />
        </div>
        <Checklist items={BC_ITEMS} done={done} tone="green" />
      </div>

      <Button variant="primary" disabled={!sent} onClick={onTracking}>
        View Live Tracking
      </Button>
    </Screen>
  );
}
