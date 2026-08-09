import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* ---------------- Button ---------------- */

type Variant = "emergency" | "primary" | "ghost" | "outline" | "success" | "danger-soft";

export function Button({
  children,
  variant = "primary",
  className,
  size = "lg",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "lg" | "md" | "sm" }) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight transition-all active:scale-[0.975] disabled:opacity-40 disabled:active:scale-100";
  const sizes = {
    lg: "h-14 px-6 text-[15px]",
    md: "h-12 px-5 text-[14px]",
    sm: "h-10 px-4 text-[13px] rounded-xl",
  };
  const variants: Record<Variant, string> = {
    emergency: "bg-primary text-primary-foreground shadow-glow-red hover:brightness-110",
    primary: "bg-blue text-primary-foreground shadow-glow-blue hover:brightness-110",
    success: "bg-success text-[#04140d] hover:brightness-110",
    outline: "border border-border bg-white/[0.03] text-foreground hover:bg-white/[0.07]",
    ghost: "text-muted-foreground hover:text-foreground",
    "danger-soft": "bg-primary/12 text-primary border border-primary/30 hover:bg-primary/20",
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

/* ---------------- Card ---------------- */

export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-border bg-card/90 p-4 shadow-card backdrop-blur",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[15px] font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function Label({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "red" | "green" | "orange" | "blue" }) {
  const tones = {
    muted: "text-muted-foreground",
    red: "text-primary",
    green: "text-success",
    orange: "text-warning",
    blue: "text-blue-bright",
  };
  return <span className={cn("label-xs", tones[tone])}>{children}</span>;
}

export function Pill({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "red" | "green" | "orange" | "blue";
  className?: string;
}) {
  const tones = {
    muted: "bg-white/[0.06] text-muted-foreground border-white/10",
    red: "bg-primary/15 text-primary border-primary/30",
    green: "bg-success/15 text-success border-success/30",
    orange: "bg-warning/15 text-warning border-warning/30",
    blue: "bg-blue/15 text-blue-bright border-blue/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Countdown ring ---------------- */

export function CountdownRing({
  value,
  total,
  label,
  color = "var(--color-primary)",
  size = 232,
  children,
}: {
  value: number;
  total: number;
  label?: string;
  color?: string;
  size?: number;
  children?: ReactNode;
}) {
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / total));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <span
        className="pulse-ring absolute inset-0 rounded-full"
        style={{ border: `2px solid ${color}`, opacity: 0.4 }}
      />
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={12} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 12px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        {children ?? (
          <>
            <div className="text-[64px] font-bold leading-none tabular-nums">{value}</div>
            <div className="label-xs mt-2 text-muted-foreground">{label ?? "Seconds"}</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Checklist ---------------- */

export function Checklist({
  items,
  done,
  tone = "green",
}: {
  items: string[];
  done: number;
  tone?: "green" | "orange" | "blue";
}) {
  const toneMap = { green: "text-success", orange: "text-warning", blue: "text-blue-bright" };
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const isDone = i < done;
        const isActive = i === done;
        return (
          <div
            key={item}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-500",
              isDone
                ? "border-white/10 bg-white/[0.05] opacity-100"
                : isActive
                  ? "border-white/10 bg-white/[0.03] opacity-90"
                  : "border-transparent bg-white/[0.02] opacity-40",
            )}
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full border text-[12px] font-bold",
                isDone ? cn("border-current bg-current/15", toneMap[tone]) : "border-white/15 text-muted-foreground",
              )}
            >
              {isDone ? "✓" : isActive ? <span className="size-1.5 animate-ping rounded-full bg-current" /> : ""}
            </span>
            <span className={cn("text-[14px]", isDone ? "font-medium" : "text-muted-foreground")}>{item}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Avatar ---------------- */

export function Avatar({ name, color = "#1677FF", size = 44 }: { name: string; color?: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="grid shrink-0 place-items-center rounded-2xl font-bold"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(140deg, ${color}44, ${color}18)`,
        border: `1px solid ${color}55`,
        color,
        fontSize: size * 0.34,
      }}
    >
      {initials}
    </div>
  );
}

/* ---------------- Progress dots ---------------- */

export function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i === active ? "w-7 bg-primary" : "w-1.5 bg-white/20",
          )}
        />
      ))}
    </div>
  );
}

/* ---------------- Screen scaffold ---------------- */

export function Screen({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "no-scrollbar h-full overflow-y-auto overscroll-contain",
        padded && "px-5 pt-14 pb-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TopBar({
  title,
  subtitle,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 pb-5">
      <div className="shrink-0">{left}</div>
      <div className="min-w-0">
        <h1 className="truncate text-[19px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="shrink-0">{right}</div>
    </header>
  );
}

export function IconButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "grid size-10 place-items-center rounded-xl border border-border bg-white/[0.04] text-muted-foreground transition-colors hover:text-foreground active:scale-95",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
