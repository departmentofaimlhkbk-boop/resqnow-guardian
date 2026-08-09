import { useState } from "react";
import { Check, Users, Loader2, Plus, X } from "lucide-react";
import { Avatar, Button, Pill, Screen } from "@/components/kit";
import { useResQ } from "@/hooks/useResQ";
import { cn } from "@/lib/utils";

export function SelectContacts({ onDone }: { onDone: () => void }) {
  const { contacts, toggleContact, addContact, deleteContact, loadingData } = useResQ();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", relation: "" });

  const selected = contacts.filter((c) => c.is_selected);
  const full = selected.length === 5;

  const toggle = async (id: string, next: boolean) => {
    setError(null);
    setBusyId(id);
    try {
      await toggleContact(id, next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update contact.");
    } finally {
      setBusyId(null);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!draft.name.trim() || !draft.phone.trim()) {
      setError("Name and phone number are required.");
      return;
    }
    try {
      await addContact({
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        relation: draft.relation.trim() || "Contact",
      });
      setDraft({ name: "", phone: "", relation: "" });
      setAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add contact.");
    }
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
        <Pill tone={full ? "green" : "orange"}>{selected.length}/5 Selected</Pill>
        {!full && <span className="text-[12px] text-muted-foreground">Pick {5 - selected.length} more</span>}
      </div>

      {error && (
        <p className="mt-3 rounded-2xl border border-primary/35 bg-primary/[0.08] p-3 text-[13px] text-primary">{error}</p>
      )}

      <div className="no-scrollbar mt-4 flex-1 space-y-2.5 overflow-y-auto pb-4">
        {loadingData && contacts.length === 0 && (
          <div className="grid place-items-center py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}

        {contacts.map((c) => {
          const on = c.is_selected;
          const blocked = !on && full;
          return (
            <div
              key={c.id}
              className={cn(
                "flex w-full items-center gap-3 rounded-[20px] border p-3.5 text-left transition-all",
                on ? "border-primary/45 bg-primary/[0.08]" : "border-border bg-card/80",
                blocked && "opacity-40",
              )}
            >
              <button
                onClick={() => toggle(c.id, !on)}
                disabled={blocked || busyId === c.id}
                className="flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.99]"
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
                  {busyId === c.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    on && <Check className="size-3.5 text-white" strokeWidth={3} />
                  )}
                </span>
              </button>
              <button
                onClick={() => void deleteContact(c.id)}
                aria-label={`Remove ${c.name}`}
                className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}

        {adding ? (
          <form onSubmit={create} className="space-y-2 rounded-[20px] border border-border bg-card/80 p-3.5">
            {(["name", "phone", "relation"] as const).map((k) => (
              <input
                key={k}
                value={draft[k]}
                onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                placeholder={k === "relation" ? "Relation (e.g. Brother)" : k === "phone" ? "Phone number" : "Full name"}
                className="h-11 w-full rounded-xl border border-border bg-white/[0.03] px-3 text-[14px] outline-none focus:border-blue/60"
              />
            ))}
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add contact
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-dashed border-border p-3.5 text-[13.5px] font-semibold text-muted-foreground"
          >
            <Plus className="size-4" /> Add a new contact
          </button>
        )}
      </div>

      <Button variant="emergency" disabled={!full} onClick={onDone}>
        Save &amp; Continue
      </Button>
    </Screen>
  );
}
