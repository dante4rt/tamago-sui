import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

// Helper component for individual stat display
type StatDisplayProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

export function StatDisplay({ icon, label, value }: StatDisplayProps) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ width: `${value}%` });
  }, [value, controls]);

  return (
    <Tooltip>
      <TooltipTrigger className="w-full">
        <div className="flex items-center gap-3 w-full">
          <div className="w-6 h-6">{icon}</div>
          <div className="w-full h-3 rounded bg-muted overflow-hidden border">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={controls}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
            />
          </div>
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
