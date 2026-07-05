import { cn } from "@/lib/utils";

interface JarvisPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  gold?: boolean;
  id?: string;
}

export function JarvisPanel({ children, className, glow, gold, id }: JarvisPanelProps) {
  return (
    <div
      id={id}
      className={cn(
        "jarvis-panel",
        glow && "jarvis-panel-glow",
        gold && "jarvis-panel-gold",
        className
      )}
    >
      {children}
    </div>
  );
}

interface JarvisMetricProps {
  label: string;
  value: string | number;
  sub?: string;
  gold?: boolean;
  href?: string;
  icon?: React.ReactNode;
}

export function JarvisMetric({ label, value, sub, gold, icon }: JarvisMetricProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {icon && <span className="text-cyan-400/80">{icon}</span>}
        <span className="jarvis-label">{label}</span>
      </div>
      <span className={cn("jarvis-metric-value", gold && "jarvis-metric-value-gold")}>{value}</span>
      {sub && <span className="admin-text-muted text-xs">{sub}</span>}
    </div>
  );
}

interface JarvisStatusPillProps {
  label: string;
  status: "ok" | "warn" | "error" | "off";
}

export function JarvisStatusPill({ label, status }: JarvisStatusPillProps) {
  return (
    <span className="jarvis-status-pill inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-50">
      <span className={cn("jarvis-status-dot", status)} aria-hidden />
      {label}
    </span>
  );
}
