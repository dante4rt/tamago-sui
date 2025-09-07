import type { ReactNode } from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { scaleTap } from "@/components/motion/variants";

// Helper component for action buttons to avoid repetition
type ActionButtonProps = {
  onClick: () => void;
  disabled: boolean;
  isPending: boolean;
  label: string;
  icon: ReactNode;
};

export function ActionButton({
  onClick,
  disabled,
  isPending,
  label,
  icon,
}: ActionButtonProps) {
  return (
    <motion.div {...scaleTap} className="w-full">
      <Button
        onClick={onClick}
        disabled={disabled}
        className="w-full cursor-pointer relative overflow-hidden"
      >
        {isPending && (
          <motion.div
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        )}
        {isPending ? (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <div className="mr-2 h-4 w-4">{icon}</div>
        )}
        {label}
      </Button>
    </motion.div>
  );
}
