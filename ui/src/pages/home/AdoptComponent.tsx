import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutateAdoptPet } from "@/hooks/useMutateAdoptPet";
import { Loader2Icon, HeartIcon, PawPrintIcon, SparklesIcon } from "lucide-react";
import { motion } from "framer-motion";

const INTIAAL_PET_IMAGE_URL =
  "https://raw.githubusercontent.com/xfajarr/stacklend/refs/heads/main/photo_2023-04-30_12-46-11.jpg";

// Enhanced animation variants following Family's delight principles
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.9,
    rotateY: -15,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.05,
    transition: { duration: 0.4 },
  },
};

const petImageVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.05,
    rotate: [0, -2, 2, -1, 1, 0],
    transition: {
      scale: { type: "spring", stiffness: 300, damping: 20 },
      rotate: { duration: 0.6, ease: "easeInOut" },
    },
  },
  bounce: {
    y: [0, -8, 0],
    scale: [1, 1.02, 1],
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const suggestionVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      delay: index * 0.1,
    },
  }),
  hover: {
    scale: 1.05,
    y: -2,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  tap: { scale: 0.95 },
};

export default function AdoptComponent() {
  const [petName, setPetName] = useState("");
  const { mutate: mutateAdoptPet, isPending: isAdopting } = useMutateAdoptPet();
  const suggestions = ["Ron", "xFajar", "Nori", "Pixel", "Pico", "Mint"];

  const handleAdoptPet = () => {
    if (!petName.trim()) return;
    mutateAdoptPet({ name: petName });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdoptPet();
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="w-full max-w-md mx-auto"
    >
      <Card className="w-full text-center border border-border overflow-hidden bg-card">
        <CardHeader className="relative pb-2">
          <motion.div
            className="absolute top-2 right-2 text-xl opacity-60"
            animate={{
              rotate: [0, 20, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute top-2 left-2 text-lg opacity-40"
            animate={{
              y: [0, -5, 0],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            🎮
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <CardTitle className="text-3xl tracking-tight flex items-center justify-center gap-2 gradient-text">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <PawPrintIcon className="h-7 w-7 text-primary" />
              </motion.div>
              🐾 Adopt Your Pet
            </CardTitle>
            <CardDescription className="text-base flex items-center justify-center gap-1 mt-2">
              <motion.div
                animate={{
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                ✨
              </motion.div>
              Ready to find your perfect digital companion?
              <motion.div
                animate={{
                  rotate: [0, -15, 15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 1.5,
                }}
              >
                🌟
                <SparklesIcon className="h-4 w-4 text-secondary" />
              </motion.div>
              A gentle friend awaits you
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 200 }}
          >
            <motion.img
              src={INTIAAL_PET_IMAGE_URL}
              alt="Your new pet"
              className="relative w-48 h-48 mx-auto rounded-full border-4 border-white dark:border-gray-700 object-cover"
              variants={petImageVariants}
              initial="initial"
              animate={["bounce"]}
              whileHover="hover"
            />
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              What will you name your companion?
            </p>

            <div className="relative">
              <Input
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter pet's name"
                disabled={isAdopting}
                className="text-center text-lg py-3 border-2 border-primary/30 focus:border-primary rounded-xl transition-all duration-300"
              />

              <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, petName.trim().length * 8)}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              </div>

              {petName.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    <HeartIcon className="h-5 w-5 text-accent fill-current" />
                  </motion.div>
                </motion.div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Or choose from these suggestions:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    custom={index}
                    variants={suggestionVariants}
                    initial="hidden"
                    animate="show"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setPetName(suggestion)}
                    disabled={isAdopting}
                    className="px-3 py-1.5 text-sm rounded-full bg-secondary/30 text-primary border border-primary/30 hover:bg-secondary/40 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleAdoptPet}
                  disabled={!petName.trim() || isAdopting}
                  className="w-full py-3 text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                >
                  {isAdopting ? (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2Icon className="h-5 w-5" />
                      </motion.div>
                      Creating Your Bond...
                    </motion.div>
                  ) : (
                    <motion.span
                      key="adopt-text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <PawPrintIcon className="h-5 w-5" />
                      Adopt {petName || "Pet"}
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
