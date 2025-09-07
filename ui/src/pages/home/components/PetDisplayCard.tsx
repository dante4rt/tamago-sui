import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatDisplay } from "./StatDisplay";
import { CoinsIcon, HeartIcon, StarIcon, BatteryIcon, UtensilsIcon, MoonIcon } from "lucide-react";
import type { PetStruct } from "@/types/Pet";
import { animate } from "animejs";
import { useEffect, useRef } from "react";

type PetDisplayCardProps = {
  pet: PetStruct;
};

const petImageVariants = {
  initial: { scale: 1, rotate: 0 },
  bounce: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
    },
  },
  hover: {
    scale: 1.15,
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 300,
    },
  },
};

export function PetDisplayCard({ pet }: PetDisplayCardProps) {
  const petImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Pet image breathing animation
    if (petImageRef.current && !pet.isSleeping) {
      animate(petImageRef.current, {
        scale: [1, 1.05, 1],
        duration: 3000,
        loop: true,
        direction: "alternate",
        easing: "easeInOutSine",
      });
    }
  }, [pet.isSleeping]);

  return (
    <div className="w-full">
      <Card className="w-full h-full border border-border overflow-hidden bg-gradient-to-br from-card via-card to-card/90 hover:shadow-lg transition-all duration-300 justify-center">
        <CardHeader className="text-center relative pb-4">
          <CardTitle className="text-3xl tracking-tight flex items-center justify-center gap-2">
            {pet.name}
            {pet.isSleeping && (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg"
              >
                <MoonIcon className="h-5 w-5" />
              </motion.span>
            )}
          </CardTitle>
          <CardDescription className="text-base">
            Level {pet.game_data.level}
            {pet.isSleeping && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted border">
                Sleeping
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div
            className="relative flex justify-center"
            variants={petImageVariants}
            initial="initial"
            animate={pet.isSleeping ? "initial" : "bounce"}
            whileHover="hover"
          >
            <motion.img
              ref={petImageRef}
              src={pet.image_url}
              alt={pet.name}
              className="w-32 h-32 rounded-full border-4 border-primary/20 object-cover cursor-pointer"
              whileTap={{ scale: 0.95 }}
            />

            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <StatDisplay
                icon={<HeartIcon className="h-4 w-4" />}
                label="Happiness"
                value={pet.stats.happiness}
              />
            </div>

            <div>
              <StatDisplay
                icon={<UtensilsIcon className="h-4 w-4" />}
                label="Hunger"
                value={pet.stats.hunger}
              />
            </div>

            <div>
              <StatDisplay
                icon={<BatteryIcon className="h-4 w-4" />}
                label="Energy"
                value={pet.stats.energy}
              />
            </div>

            <div>
              <StatDisplay
                icon={<StarIcon className="h-4 w-4" />}
                label="Experience"
                value={pet.game_data.experience}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
            <CoinsIcon className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg text-primary">{pet.game_data.coins} Coins</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
