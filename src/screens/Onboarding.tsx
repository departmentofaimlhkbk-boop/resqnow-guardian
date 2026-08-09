import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Radio, Ambulance, HeartHandshake, ShieldPlus, MapPin, Siren, Users } from "lucide-react";
import { Button, Dots, Screen } from "@/components/kit";
import { MapCanvas } from "@/components/MapCanvas";

const SLIDES = [
  {
    key: "detect",
    title: "Detects Accidents",
    desc: "AI-powered sensors in your phone detect sudden impact, speed and motion changes.",
  },
  {
    key: "alert",
    title: "Sends Alerts",
    desc: "If you don't respond, ResQNow sends an alert to your emergency contacts and nearby helpers.",
  },
  {
    key: "help",
    title: "Get Help Fast",
    desc: "Nearby helpers receive your location and can navigate to you or take you to the nearest hospital.",
  },
  {
    key: "community",
    title: "Community. Response. Save Lives.",
    desc: "ResQNow connects accident victims with verified helpers nearby — turning bystanders into first responders.",
  },
];

function Art({ index }: { index: number }) {
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[300px] place-items-center">
      <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(255,59,48,0.18),transparent_65%)]" />
      <div className="absolute inset-0 rounded-[40px] border border-border bg-card/40 backdrop-blur" />
      {index === 0 && (
        <div className="relative grid place-items-center">
          <span className="pulse-ring absolute size-28 rounded-full border-2 border-primary" />
          <span className="pulse-ring absolute size-28 rounded-full border-2 border-primary [animation-delay:1.2s]" />
          <div className="grid size-28 place-items-center rounded-[32px] border border-primary/40 bg-primary/12 shadow-glow-red">
            <Car className="size-12 text-primary" strokeWidth={1.6} />
          </div>
          <div className="absolute -right-2 -top-2 grid size-11 place-items-center rounded-2xl border border-warning/40 bg-warning/15">
            <Siren className="size-5 text-warning" />
          </div>
        </div>
      )}
      {index === 1 && (
        <div className="relative grid place-items-center">
          <span className="pulse-ring absolute size-32 rounded-full border-2 border-blue" />
          <div className="grid size-28 place-items-center rounded-full border border-blue/40 bg-blue/12 shadow-glow-blue">
            <Radio className="size-12 text-blue-bright" strokeWidth={1.6} />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute grid size-9 place-items-center rounded-xl border border-border bg-card"
              style={{
                transform: `rotate(${i * 90 + 45}deg) translate(96px) rotate(-${i * 90 + 45}deg)`,
              }}
            >
              <MapPin className="size-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
      {index === 2 && (
        <div className="relative size-full p-6">
          <MapCanvas
            className="size-full rounded-[34px] border border-border"
            markers={[
              { id: "v", kind: "victim", x: 32, y: 62, pulse: true, label: "You" },
              { id: "h", kind: "helper", x: 70, y: 34, label: "Helper" },
              { id: "hp", kind: "hospital", x: 80, y: 76, label: "Hospital" },
            ]}
            route={{ from: [70, 34], to: [32, 62] }}
            labels={false}
          />
          <div className="absolute bottom-9 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/85 px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
            <Ambulance className="size-3.5 text-success" /> 6 min away
          </div>
        </div>
      )}
      {index === 3 && (
        <div className="relative grid place-items-center">
          <span className="pulse-ring absolute size-28 rounded-full border-2 border-success" />
          <div className="grid size-28 place-items-center rounded-[34px] border border-success/40 bg-success/12 shadow-glow-green">
            <HeartHandshake className="size-12 text-success" strokeWidth={1.6} />
          </div>
          <div className="absolute -left-4 top-2 grid size-11 place-items-center rounded-2xl border border-border bg-card">
            <Users className="size-5 text-blue-bright" />
          </div>
          <div className="absolute -right-3 bottom-2 grid size-11 place-items-center rounded-2xl border border-border bg-card">
            <ShieldPlus className="size-5 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i]!;

  return (
    <Screen className="flex flex-col px-6 pb-8 pt-14">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-primary shadow-glow-red">
            <ShieldPlus className="size-4.5 text-white" />
          </span>
          <span className="text-[15px] font-bold tracking-tight">
            ResQ<span className="text-primary">Now</span>
          </span>
        </div>
        {!last && (
          <button onClick={onDone} className="text-[13px] font-medium text-muted-foreground hover:text-foreground">
            Skip
          </button>
        )}
      </div>

      <div
        className="mt-8 flex flex-1 flex-col"
        onTouchStart={(e) => ((window as any).__sx = e.touches[0]!.clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0]!.clientX - ((window as any).__sx ?? 0);
          if (dx < -50 && !last) setI(i + 1);
          if (dx > 50 && i > 0) setI(i - 1);
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.key}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            <Art index={i} />
            <div className="mt-10">
              <p className="label-xs text-primary">Step {i + 1} of 4</p>
              <h2 className="mt-3 text-[32px] font-bold leading-[1.1] tracking-tight">{slide.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{slide.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 space-y-5">
        <Dots count={4} active={i} />
        <Button variant={last ? "emergency" : "primary"} onClick={() => (last ? onDone() : setI(i + 1))}>
          {last ? "Get Started" : "Next"}
        </Button>
      </div>
    </Screen>
  );
}
