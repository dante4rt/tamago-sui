import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

// Helper component for individual stat display
type StatDisplayProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

export function StatDisplay({ icon, label, value }: StatDisplayProps) {
  return (
    <Tooltip>
      <TooltipTrigger className="w-full">
        <div className="flex items-center gap-3 w-full">
          <div className="w-6 h-6">{icon}</div>
          <Progress value={value} className="w-full" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {label}: {value} / 100
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
