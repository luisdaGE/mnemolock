import type { ReactNode } from "react";

export function PipelineStep({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="pipeline-step">
      {icon}
      <span>{label}</span>
    </div>
  );
}
