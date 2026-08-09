import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldPlus } from "lucide-react";
import { Onboarding } from "@/screens/Onboarding";
import { Auth } from "@/screens/Auth";
import { SelectContacts } from "@/screens/SelectContacts";
import { Permissions } from "@/screens/Permissions";
import { VictimHome } from "@/screens/VictimHome";
import { AlarmScreen, NoResponse, AIAnalysis, Broadcast } from "@/screens/Emergency";
import {
  HelperRequest,
  HelperAccepted,
  LiveNavigation,
  VictimReached,
  HospitalRoute,
  HospitalNotify,
  PoliceNotify,
  Handover,
  Completed,
} from "@/screens/Helper";
import { MapScreen, HistoryScreen, CommunityScreen, ProfileScreen, SettingsScreen } from "@/screens/Tabs";
import { BottomNavigation, type Tab } from "@/components/BottomNavigation";

type Stage =
  | "onboarding"
  | "auth"
  | "contacts"
  | "permissions"
  | "app"
  | "alarm1"
  | "alarm2"
  | "alarm3"
  | "no-response"
  | "ai"
  | "broadcast"
  | "helper-request"
  | "helper-accepted"
  | "nav-victim"
  | "reached"
  | "hospital-route"
  | "nav-hospital"
  | "hospital-notify"
  | "police-notify"
  | "handover"
  | "completed"
  | "settings"
  | "history";

const FULLSCREEN: Stage[] = [
  "onboarding",
  "auth",
  "contacts",
  "permissions",
  "alarm1",
  "alarm2",
  "alarm3",
  "no-response",
  "ai",
  "broadcast",
  "helper-request",
  "helper-accepted",
  "nav-victim",
  "reached",
  "hospital-route",
  "nav-hospital",
  "hospital-notify",
  "police-notify",
  "handover",
  "completed",
];

export function ResQNowApp() {
  const [stage, setStage] = useState<Stage>("onboarding");
  const [tab, setTab] = useState<Tab>("home");
  const go = (s: Stage) => setStage(s);

  const showNav = !FULLSCREEN.includes(stage);

  const content = (() => {
    switch (stage) {
      case "onboarding":
        return <Onboarding onDone={() => go("auth")} />;
      case "auth":
        return <Auth onDone={() => go("contacts")} />;
      case "contacts":
        return <SelectContacts onDone={() => go("permissions")} />;
      case "permissions":
        return <Permissions onDone={() => go("app")} />;
      case "alarm1":
      case "alarm2":
      case "alarm3": {
        const n = Number(stage.slice(-1)) as 1 | 2 | 3;
        return (
          <AlarmScreen
            alarm={n}
            onSafe={() => {
              setTab("home");
              go("app");
            }}
            onCallHelp={() => go("no-response")}
            onExpire={() => go(n === 3 ? "no-response" : ((`alarm${n + 1}`) as Stage))}
          />
        );
      }
      case "no-response":
        return <NoResponse onNext={() => go("ai")} />;
      case "ai":
        return <AIAnalysis onNext={() => go("broadcast")} />;
      case "broadcast":
        return <Broadcast onTracking={() => go("helper-request")} />;
      case "helper-request":
        return (
          <HelperRequest
            onAccept={() => go("helper-accepted")}
            onDecline={() => {
              setTab("home");
              go("app");
            }}
          />
        );
      case "helper-accepted":
        return <HelperAccepted onStart={() => go("nav-victim")} />;
      case "nav-victim":
        return <LiveNavigation target="victim" onArrive={() => go("reached")} />;
      case "reached":
        return <VictimReached onHospital={() => go("hospital-route")} />;
      case "hospital-route":
        return <HospitalRoute onStart={() => go("nav-hospital")} />;
      case "nav-hospital":
        return <LiveNavigation target="hospital" onArrive={() => go("hospital-notify")} />;
      case "hospital-notify":
        return <HospitalNotify onNext={() => go("police-notify")} />;
      case "police-notify":
        return <PoliceNotify onNext={() => go("handover")} />;
      case "handover":
        return <Handover onComplete={() => go("completed")} />;
      case "completed":
        return (
          <Completed
            onHome={() => {
              setTab("home");
              go("app");
            }}
          />
        );
      case "settings":
        return <SettingsScreen onBack={() => go("app")} />;
      case "history":
        return <HistoryScreen />;
      default:
        switch (tab) {
          case "map":
            return <MapScreen />;
          case "community":
            return <CommunityScreen onHelperMode={() => go("helper-request")} />;
          case "profile":
            return (
              <ProfileScreen
                onSettings={() => go("settings")}
                onHistory={() => go("history")}
                onLogout={() => go("auth")}
              />
            );
          default:
            return (
              <VictimHome
                onSos={() => go("alarm3")}
                onSimulate={() => go("alarm1")}
                onHelperMode={() => go("helper-request")}
              />
            );
        }
    }
  })();

  return (
    <div className="relative h-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage === "app" ? `app-${tab}` : stage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
        >
          {content}
        </motion.div>
      </AnimatePresence>

      {showNav && (
        <BottomNavigation
          active={stage === "history" || stage === "settings" ? "profile" : tab}
          onChange={(t) => {
            if (t === "sos") {
              go("alarm3");
              return;
            }
            setTab(t);
            go("app");
          }}
        />
      )}
    </div>
  );
}

export function PhoneShell() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#0d1a2c,#05080f_60%)]">
      {/* Mobile: full bleed */}
      <div className="h-[100dvh] lg:hidden">
        <ResQNowApp />
      </div>

      {/* Desktop / tablet: framed presentation */}
      <div className="mx-auto hidden min-h-screen max-w-6xl items-center gap-14 px-10 py-16 lg:flex">
        <div className="max-w-md">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary shadow-glow-red">
              <ShieldPlus className="size-5 text-white" />
            </span>
            <span className="text-[20px] font-bold tracking-tight">
              ResQ<span className="text-primary">Now</span>
            </span>
          </div>
          <h1 className="mt-8 text-[46px] font-bold leading-[1.05] tracking-tight">
            Community. Response.
            <br />
            <span className="text-primary">Save Lives.</span>
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
            ResQNow detects road accidents through phone sensors, escalates through three 30-second alarms, and
            connects victims with nearby verified helpers, hospitals and police — automatically.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ["90 s", "Response window"],
              ["6.4 min", "Avg. helper ETA"],
              ["1,284", "Active helpers"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-border bg-card/70 p-4">
                <p className="text-[20px] font-bold leading-none">{v}</p>
                <p className="mt-1.5 text-[11px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[12.5px] text-muted-foreground">
            Interactive prototype — tap “Simulate Accident” on the home screen to run the full emergency flow.
          </p>
        </div>

        <div className="relative shrink-0">
          <div className="absolute -inset-10 rounded-[80px] bg-primary/10 blur-3xl" />
          <div className="relative h-[844px] w-[390px] rounded-[54px] border-[10px] border-[#1b2534] bg-black p-0 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]">
            <div className="absolute left-1/2 top-3 z-30 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
            <div className="h-full overflow-hidden rounded-[44px]">
              <ResQNowApp />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
