import { useState } from "react";
import { Check, Users } from "lucide-react";
import { Avatar, Button, Pill, Screen } from "@/components/kit";
import { CONTACTS } from "@/lib/mock";
import { cn } from "@/lib/utils";

export function SelectContacts({ onDone }: { onDone: () => void }) {
  const [sel, setSel] = useState<string[]>(["c1", "c2", "c3"]);
  const full = sel.length === 5;

  const toggle = (id: string) => {
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 5 ? s : [...s, id]));
  };

  return (
    <Screen className="flex h-full flex-col px-5 pb-6 pt-14">
      <div>
        <span className="grid size-11 place-items-center rounded-2xl border border-primary/30 bg-primary/12">
          <Users className="size-5 text-primary" />
        </span>
        <h1 className="mt-4 text-[26px] font-bold leading-tight tracking-tight">Select 5 Emergency Contacts</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">Choose people we can contact in emergencies.</p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Pill tone={full ? "green" : "orange"}>{sel.length}/5 Selected</Pill>
        {!full && <span className="text-[12px] text-muted-foreground">Pick {5 - sel.length} more</span>}
      </div>

      <div className="no-scrollbar mt-4 flex-1 space-y-2.5 overflow-y-auto pb-4">
        {CONTACTS.map((c) => {
          const on = sel.includes(c.id);
          const blocked = !on && full;
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              disabled={blocked}
              className={cn(
                "flex w-full items-center gap-3 rounded-[20px] border p-3.5 text-left transition-all active:scale-[0.99]",
                on ? "border-primary/45 bg-primary/[0.08]" : "border-border bg-card/80",
                blocked && "opacity-40",
              )}
            >
              <Avatar name={c.name} color={c.color} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{c.name}</p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {c.phone} · {c.relation}
                </p>
              </div>
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border transition-all",
                  on ? "border-primary bg-primary" : "border-white/20",
                )}
              >
                {on && <Check className="size-3.5 text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <Button variant="emergency" disabled={!full} onClick={onDone}>
        Save &amp; Continue
      </Button>
    </Screen>
  );
}
