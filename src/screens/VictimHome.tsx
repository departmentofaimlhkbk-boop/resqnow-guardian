import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  ShieldCheck,
  MapPin,
  Users,
  Building2,
  Zap,
  ChevronRight,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { Avatar, Card, Pill, Screen } from "@/components/kit";
import { MapCanvas } from "@/components/MapCanvas";
import { useResQ } from "@/hooks/useResQ";

export function VictimHome({
  onSos,
  onSimulate,
  onHelperMode,
  onNotifications,
}: {
  onSos: () => void;
  onSimulate: () => void;
  onHelperMode: () => void;
  onNotifications: () => void;
}) {
  const { profile, hospitals, incident, unreadCount, helper, nearbyHelpers } = useResQ();
  const [hold, setHold] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const firstName = (profile?.full_name ?? "there").split(" ")[0];

  const start = () => {
    if (timer.current) return;
    timer.current = setInterval(() => {
      setHold((h) => {
        if (h >= 100) {
          clearInterval(timer.current!);
          timer.current = null;
          onSos();
          return 0;
        }
        return h + 100 / 30;
      });
    }, 100);
  };
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setHold(0);
  };
  useEffect(() => () => stop(), []);

  const emergencyActive = Boolean(incident);

  return (
    <Screen className="px-5 pb-32 pt-14">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={profile?.full_name ?? "ResQNow"} color={profile?.avatar_color ?? "#FF3B30"} size={46} />
          <div className="min-w-0">
            <p className="truncate text-[20px] font-bold tracking-tight">Hello, {firstName} 👋</p>
            <p className="text-[12.5px] text-muted-foreground">Stay safe!</p>
          </div>
        </div>
        <button
          onClick={onNotifications}
          aria-label="Notifications"
          className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-white/[0.04]"
        >
          <Bell className="size-4.5 text-muted-foreground" />
          {unreadCount > 0 && <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary" />}
        </button>
      </header>

      <Card
        className={
          emergencyActive ? "mt-5 border-primary/35 bg-primary/[0.08]" : "mt-5 border-success/25 bg-success/[0.07]"
        }
      >
        <div className="flex items-center gap-3">
          <span
            className={`grid size-11 place-items-center rounded-2xl border ${
              emergencyActive ? "border-primary/40 bg-primary/15" : "border-success/40 bg-success/15"
            }`}
          >
            {emergencyActive ? (
              <AlertTriangle className="size-5.5 text-primary" />
            ) : (
              <ShieldCheck className="size-5.5 text-success" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-bold">{emergencyActive ? "Emergency in progress" : "You are Safe"}</p>
            <p className="truncate text-[12.5px] text-muted-foreground">
              {emergencyActive ? incident!.stage.replace(/_/g, " ") : "All systems normal"}
            </p>
          </div>
          <Pill tone={emergencyActive ? "red" : "green"}>
            <span
              className={`size-1.5 animate-pulse rounded-full ${emergencyActive ? "bg-primary" : "bg-success"}`}
            />{" "}
            {emergencyActive ? "LIVE" : "ACTIVE"}
          </Pill>
        </div>
      </Card>

      <div className="mt-7 grid place-items-center">
        <div className="relative grid place-items-center">
          <span className="pulse-ring absolute size-44 rounded-full border-2 border-primary" />
          <span className="pulse-ring absolute size-44 rounded-full border-2 border-primary [animation-delay:1.2s]" />
          <svg className="absolute size-52 -rotate-90">
            <circle cx="104" cy="104" r="96" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="104"
              cy="104"
              r="96"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 96}
              strokeDashoffset={2 * Math.PI * 96 * (1 - hold / 100)}
            />
          </svg>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            className="grid size-44 select-none place-items-center rounded-full bg-gradient-to-b from-[#FF5A50] to-[#D6221A] shadow-glow-red"
          >
            <span className="text-[40px] font-bold leading-none tracking-tight text-white">SOS</span>
            <span className="mt-2 text-[12px] font-medium text-white/80">Hold for 3 sec</span>
          </motion.button>
        </div>
      </div>

      <Card className="mt-7 p-0">
        <div className="flex items-center gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue/30 bg-blue/12">
            <MapPin className="size-4.5 text-blue-bright" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="label-xs text-muted-foreground">Current Location</p>
            <p className="mt-0.5 truncate text-[15px] font-semibold">{profile?.location ?? "Location not set"}</p>
          </div>
          <Pill tone="blue">
            <span className="size-1.5 animate-pulse rounded-full bg-blue-bright" /> LIVE
          </Pill>
        </div>
        <MapCanvas
          className="h-32 border-t border-border"
          markers={[{ id: "me", kind: "me", x: 42, y: 55, pulse: true }]}
        />
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card>
          <Users className="size-5 text-blue-bright" />
          <p className="mt-3 text-[26px] font-bold leading-none">{nearbyHelpers.length}</p>
          <p className="mt-1.5 text-[12px] text-muted-foreground">Available Helpers</p>
        </Card>
        <Card>
          <Building2 className="size-5 text-success" />
          <p className="mt-3 text-[26px] font-bold leading-none">{hospitals.length}</p>
          <p className="mt-1.5 text-[12px] text-muted-foreground">Nearby Hospitals</p>
        </Card>
      </div>

      <div className="mt-4 space-y-2.5">
        <button
          onClick={onSimulate}
          className="flex w-full items-center gap-3 rounded-[20px] border border-warning/30 bg-warning/[0.08] p-4 text-left active:scale-[0.99]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-warning/40 bg-warning/15">
            <Zap className="size-4.5 text-warning" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-semibold">Simulate Accident</p>
            <p className="text-[12px] text-muted-foreground">Runs the real detection and alarm pipeline</p>
          </div>
          <ChevronRight className="size-4.5 shrink-0 text-muted-foreground" />
        </button>
        <button
          onClick={onHelperMode}
          className="flex w-full items-center gap-3 rounded-[20px] border border-border bg-card/80 p-4 text-left active:scale-[0.99]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue/30 bg-blue/12">
            <Activity className="size-4.5 text-blue-bright" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-semibold">Switch to Helper Mode</p>
            <p className="text-[12px] text-muted-foreground">
              {helper?.is_available ? "On duty — receiving nearby requests" : "Receive nearby emergency requests"}
            </p>
          </div>
          <ChevronRight className="size-4.5 shrink-0 text-muted-foreground" />
        </button>
      </div>
    </Screen>
  );
}
