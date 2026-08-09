import { useState } from "react";
import {
  MapPin,
  Activity,
  Bell,
  PhoneCall,
  MessageSquare,
  Navigation,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Button, Card, Screen } from "@/components/kit";
import { PERMISSIONS } from "@/lib/mock";
import { cn } from "@/lib/utils";

const ICONS = { MapPin, Activity, Bell, PhoneCall, MessageSquare, Navigation };

export function Permissions({ onDone }: { onDone: () => void }) {
  const [granted, setGranted] = useState<string[]>([]);
  const all = granted.length === PERMISSIONS.length;

  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-14">
      <div>
        <span className="grid size-11 place-items-center rounded-2xl border border-blue/30 bg-blue/12">
          <ShieldCheck className="size-5 text-blue-bright" />
        </span>
        <h1 className="mt-4 text-[26px] font-bold leading-tight tracking-tight">Set Up Permissions</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          ResQNow only uses these to keep you protected. Nothing is shared until an emergency.
        </p>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-success transition-all duration-500"
          style={{ width: `${(granted.length / PERMISSIONS.length) * 100}%` }}
        />
      </div>

      <div className="no-scrollbar mt-4 flex-1 space-y-2.5 overflow-y-auto pb-4">
        {PERMISSIONS.map((p) => {
          const Icon = ICONS[p.icon as keyof typeof ICONS];
          const on = granted.includes(p.id);
          return (
            <Card key={p.id} className={cn("transition-colors", on && "border-success/35 bg-success/[0.06]")}>
              <div className="flex gap-3">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl border",
                    on ? "border-success/40 bg-success/15 text-success" : "border-border bg-white/[0.04] text-blue-bright",
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[15px] font-semibold">{p.title}</p>
                    <span className={cn("label-xs shrink-0", on ? "text-success" : "text-muted-foreground")}>
                      {on ? "Allowed" : "Required"}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{p.why}</p>
                  <button
                    onClick={() => setGranted((g) => (g.includes(p.id) ? g : [...g, p.id]))}
                    disabled={on}
                    className={cn(
                      "mt-3 inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold transition-all active:scale-95",
                      on ? "bg-success/15 text-success" : "bg-blue text-white",
                    )}
                  >
                    {on ? (
                      <>
                        <Check className="size-3.5" strokeWidth={3} /> Granted
                      </>
                    ) : (
                      "Allow"
                    )}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-2">
        <Button variant="emergency" disabled={!all} onClick={onDone}>
          {all ? "Continue to Home" : `Allow all permissions (${granted.length}/${PERMISSIONS.length})`}
        </Button>
        <button
          onClick={() => setGranted(PERMISSIONS.map((p) => p.id))}
          className="w-full text-center text-[12.5px] font-medium text-muted-foreground"
        >
          Allow all at once
        </button>
      </div>
    </Screen>
  );
}
