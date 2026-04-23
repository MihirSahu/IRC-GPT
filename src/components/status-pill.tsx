import type { ProviderId } from "@/lib/models";

export function StatusPill({ provider, label, compact = false }: { provider: ProviderId; label: string; compact?: boolean }) {
  return <span className={`pill pill--provider-${provider}`} style={compact ? { height: 20, fontSize: 10 } : undefined}>{label}</span>;
}
