import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { slideUp } from "@/components/motion/variants";

type TrayProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export function Tray({ open, title, onClose, children }: TrayProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border bg-background p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold tracking-wide uppercase opacity-70">
                {title}
              </div>
              <button
                aria-label="Close"
                className="p-2 rounded-md hover:bg-muted"
                onClick={onClose}
              >
                <XIcon size={16} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

