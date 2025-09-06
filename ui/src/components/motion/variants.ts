import type { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { opacity: 0, y: 16, transition: { duration: 0.2 } },
};

export const slideUp: Variants = {
  hidden: { y: "100%", opacity: 0.6 },
  show: { y: 0, opacity: 1, transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] } },
  exit: { y: "100%", opacity: 0.6, transition: { duration: 0.25 } },
};

export const scaleTap = { whileTap: { scale: 0.98 }, whileHover: { scale: 1.02 } };

export const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
};

export const itemFade: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

