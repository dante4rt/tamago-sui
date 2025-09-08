import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatDisplay } from "./StatDisplay";
import {
  HeartIcon,
  BatteryIcon,
  UtensilsIcon,
  MoonIcon,
  CalendarIcon,
  StarIcon,
  TrophyIcon,
  SparklesIcon,
} from "lucide-react";
import type { PetStruct } from "@/types/Pet";
import { animate } from "animejs";
import { useEffect, useRef } from "react";

type PetDisplayCardProps = {
  pet: PetStruct;
};

function getPersonalityInfo(personality: number) {
  switch (personality) {
    case 1:
      return { label: "Athletic", description: "Loves physical activities", icon: "💪" };
    case 2:
      return { label: "Studious", description: "Gains more from learning", icon: "📚" };
    case 3:
      return { label: "Lazy", description: "Prefers rest and relaxation", icon: "😴" };
    default:
      return { label: "Balanced", description: "Well-rounded approach", icon: "⚖️" };
  }
}

function calculateAge(adoptedAt: number): string {
  const now = Date.now();
  const ageMs = now - adoptedAt;
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  const ageHours = Math.floor((ageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (ageDays > 0) {
    return `${ageDays} day${ageDays !== 1 ? "s" : ""} old`;
  } else if (ageHours > 0) {
    return `${ageHours} hour${ageHours !== 1 ? "s" : ""} old`;
  } else {
    return "Just adopted!";
  }
}

function getEvolutionStage(level: number): { stage: number; name: string; nextAt?: number } {
  if (level >= 15) {
    return { stage: 3, name: "Mature" };
  } else if (level >= 8) {
    return { stage: 2, name: "Young Adult", nextAt: 15 };
  } else {
    return { stage: 1, name: "Youth", nextAt: 8 };
  }
}

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
  const personalityInfo = getPersonalityInfo(pet.personality);
  const petAge = calculateAge(pet.adopted_at);
  const evolutionInfo = getEvolutionStage(pet.game_data.level);

  useEffect(() => {
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
            Level {pet.game_data.level} • {evolutionInfo.name} Stage
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

          <div className="grid grid-cols-3 gap-3">
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
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/30 p-3 rounded-lg border">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-base">{personalityInfo.icon}</span>
                <span className="font-medium text-foreground">{personalityInfo.label}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {personalityInfo.description}
              </p>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Age</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">{petAge}</p>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border">
              <div className="flex items-center justify-center gap-2 mb-1">
                <StarIcon className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Evolution</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Stage {evolutionInfo.stage} –{" "}
                {evolutionInfo.nextAt && <>Next at level {evolutionInfo.nextAt}</>}
              </p>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrophyIcon className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Development</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {pet.game_data.experience % 100}/100 to next level
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-muted/30 px-4 py-3 rounded-full text-sm border">
              {pet.isSleeping ? (
                <>
                  <MoonIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-blue-500 font-medium">Sleeping peacefully</span>
                  <SparklesIcon className="h-3 w-3 text-blue-400 ml-1" />
                </>
              ) : (
                <>
                  <HeartIcon className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium">Active & Ready to Play</span>
                  <SparklesIcon className="h-3 w-3 text-primary/70 ml-1" />
                </>
              )}
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground bg-muted/20 p-2 rounded border">
            Overall wellness:{" "}
            {Math.round((pet.stats.happiness + pet.stats.energy + (100 - pet.stats.hunger)) / 3)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
