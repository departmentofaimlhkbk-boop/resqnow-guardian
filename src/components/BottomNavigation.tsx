import { Home, Map, Siren, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "home" | "map" | "sos" | "community" | "profile";

const ITEMS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "map", label: "Map", icon: Map },
  { id: "sos", label: "SOS", icon: Siren },
  { id: "community", label: "Community", icon: Users },
  { id: "profile", label: "Profile", icon: User },
];

export function BottomNavigation({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 border-t border-border bg-[#0B1422]/95 px-2 pb-5 pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-5">
        {ITEMS.map((it) => {
          const on = active === it.id;
          if (it.id === "sos") {
            return (
              <button key={it.id} onClick={() => onChange("sos")} className="relative grid place-items-center">
                <span className="absolute -top-7 grid size-14 place-items-center rounded-full bg-primary shadow-glow-red transition-transform active:scale-95">
                  <Siren className="size-6 text-white" />
                </span>
                <span className="mt-7 label-xs text-primary">SOS</span>
              </button>
            );
          }
          return (
            <button key={it.id} onClick={() => onChange(it.id)} className="grid place-items-center gap-1 py-1.5">
              <it.icon className={cn("size-5", on ? "text-blue-bright" : "text-muted-foreground")} />
              <span className={cn("text-[10px] font-semibold", on ? "text-blue-bright" : "text-muted-foreground")}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
