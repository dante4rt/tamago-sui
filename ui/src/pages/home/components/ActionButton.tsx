import type { ReactNode } from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

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
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full cursor-pointer"
    >
      {isPending ? (
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <div className="mr-2 h-4 w-4">{icon}</div>
      )}
      {label}
    </Button>
  );
}
