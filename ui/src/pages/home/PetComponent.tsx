import { useEffect, useState } from "react";
import {
  CoinsIcon,
  HeartIcon,
  StarIcon,
  Loader2Icon,
  BatteryIcon,
  DrumstickIcon,
  PlayIcon,
  BedIcon,
  BriefcaseIcon,
  ZapIcon,
  ChevronUpIcon,
  BookOpenIcon,
  DumbbellIcon,
  CoffeeIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { StatDisplay } from "./components/StatDisplay";
import { ActionButton } from "./components/ActionButton";
import { WardrobeManager } from "./components/Wardrobe";

import { useMutateCheckAndLevelUp } from "@/hooks/useMutateCheckLevel";
import { useMutateFeedPet } from "@/hooks/useMutateFeedPet";
import { useMutateLetPetSleep } from "@/hooks/useMutateLetPetSleep";
import { useMutatePlayWithPet } from "@/hooks/useMutatePlayWithPet";
import { useMutateWakeUpPet } from "@/hooks/useMutateWakeUpPet";
import { useMutateWorkForCoins } from "@/hooks/useMutateWorkForCoins";
import { useQueryGameBalance } from "@/hooks/useQueryGameBalance";
import { useMutateExercise } from "@/hooks/useMutateExercise";
import { useMutateStudy } from "@/hooks/useMutateStudy";
import { useMutateRest } from "@/hooks/useMutateRest";
import { useMutateComboCare } from "@/hooks/useMutateComboCare";
import { useMutateMorningRoutine } from "@/hooks/useMutateMorningRoutine";
import { useMutateTryEvolve } from "@/hooks/useMutateTryEvolve";

import type { PetStruct } from "@/types/Pet";
import { motion } from "framer-motion";
import { scaleTap, fadeInUp, listStagger, itemFade } from "@/components/motion/variants";

type PetDashboardProps = {
  pet: PetStruct;
};

export default function PetComponent({ pet }: PetDashboardProps) {
  // --- Fetch Game Balance ---
  const { data: gameBalance, isLoading: isLoadingGameBalance } =
    useQueryGameBalance();

  const [displayStats, setDisplayStats] = useState(pet.stats);

  // --- Hooks for Main Pet Actions ---
  const { mutate: mutateFeedPet, isPending: isFeeding } = useMutateFeedPet();
  const { mutate: mutatePlayWithPet, isPending: isPlaying } =
    useMutatePlayWithPet();
  const { mutate: mutateWorkForCoins, isPending: isWorking } =
    useMutateWorkForCoins();
  const { mutate: mutateExercise, isPending: isExercising } =
    useMutateExercise();
  const { mutate: mutateStudy, isPending: isStudying } = useMutateStudy();
  const { mutate: mutateRest, isPending: isResting } = useMutateRest();
  const { mutate: mutateComboCare, isPending: isComboCaring } =
    useMutateComboCare();
  const { mutate: mutateMorning, isPending: isMorning } =
    useMutateMorningRoutine();

  const { mutate: mutateLetPetSleep, isPending: isSleeping } =
    useMutateLetPetSleep();
  const { mutate: mutateWakeUpPet, isPending: isWakingUp } =
    useMutateWakeUpPet();
  const { mutate: mutateLevelUp, isPending: isLevelingUp } =
    useMutateCheckAndLevelUp();
  const { mutate: mutateTryEvolve, isPending: isEvolving } =
    useMutateTryEvolve();

  // Visual effects state
  const [burstKey, setBurstKey] = useState(0);
  const [burstType, setBurstType] = useState<"none" | "level" | "evolve">(
    "none",
  );
  const triggerBurst = (type: "level" | "evolve") => {
    setBurstType(type);
    setBurstKey((k) => k + 1);
    // auto clear after animation
    setTimeout(() => setBurstType("none"), 1400);
  };

  useEffect(() => {
    setDisplayStats(pet.stats);
  }, [pet.stats]);

  useEffect(() => {
    // This effect only runs when the pet is sleeping
    if (pet.isSleeping && !isWakingUp && gameBalance) {
      // Start a timer that updates the stats every second
      const intervalId = setInterval(() => {
        setDisplayStats((prev) => {
          const energyPerSecond =
            1000 / Number(gameBalance.sleep_energy_gain_ms);
          const hungerLossPerSecond =
            1000 / Number(gameBalance.sleep_hunger_loss_ms);
          const happinessLossPerSecond =
            1000 / Number(gameBalance.sleep_happiness_loss_ms);

          return {
            energy: Math.min(
              gameBalance.max_stat,
              prev.energy + energyPerSecond,
            ),
            hunger: Math.max(0, prev.hunger - hungerLossPerSecond),
            happiness: Math.max(0, prev.happiness - happinessLossPerSecond),
          };
        });
      }, 1000); // Runs every second

      // IMPORTANT: Clean up the timer when the pet wakes up or the component unmounts
      return () => clearInterval(intervalId);
    }
  }, [pet.isSleeping, isWakingUp, gameBalance]); // Rerun this effect if sleep status or balance changes

  if (isLoadingGameBalance || !gameBalance)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl">Loading Game Rules...</h1>
      </div>
    );

  // --- Client-side UI Logic & Button Disabling ---
  // `isAnyActionPending` prevents the user from sending multiple transactions at once.
  const isAnyActionPending =
    isFeeding ||
    isPlaying ||
    isSleeping ||
    isWorking ||
    isLevelingUp ||
    isExercising ||
    isStudying ||
    isResting ||
    isComboCaring ||
    isMorning;

  // These `can...` variables mirror the smart contract's rules (`assert!`) on the client-side.
  const canFeed =
    !pet.isSleeping &&
    pet.stats.hunger < gameBalance.max_stat &&
    pet.game_data.coins >= Number(gameBalance.feed_coins_cost);
  const canPlay =
    !pet.isSleeping &&
    pet.stats.energy >= gameBalance.play_energy_loss &&
    pet.stats.hunger >= gameBalance.play_hunger_loss;
  const canWork =
    !pet.isSleeping &&
    pet.stats.energy >= gameBalance.work_energy_loss &&
    pet.stats.happiness >= gameBalance.work_happiness_loss &&
    pet.stats.hunger >= gameBalance.work_hunger_loss;
  const canExercise =
    !pet.isSleeping &&
    pet.stats.energy >= gameBalance.exercise_energy_loss &&
    pet.stats.hunger >= gameBalance.exercise_hunger_loss;
  const canStudy =
    !pet.isSleeping && pet.stats.energy >= gameBalance.study_energy_loss;
  const canRest = !pet.isSleeping && pet.stats.energy < gameBalance.max_stat;
  const canLevelUp =
    !pet.isSleeping &&
    pet.game_data.experience >=
      pet.game_data.level * Number(gameBalance.exp_per_level);
  const canComboCare = !pet.isSleeping && canFeed && canPlay;

  const energyPerSecond = gameBalance
    ? 1000 / Number(gameBalance.sleep_energy_gain_ms)
    : 0;
  const hungerLossPerSecond = gameBalance
    ? 1000 / Number(gameBalance.sleep_hunger_loss_ms)
    : 0;

  return (
    <TooltipProvider>
      <Card className="w-full max-w-md border border-border shadow-sm overflow-hidden">
        <CardHeader className="text-center relative">
          <div className="absolute inset-0 -z-10">
            <motion.div
              className="absolute left-1/2 top-3 -translate-x-1/2 size-40 rounded-full blur-2xl"
              style={{ background: "radial-gradient(60% 60% at 50% 50%, var(--accent) 0%, transparent 70%)" }}
              animate={{ opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute left-1/2 top-10 -translate-x-1/2 size-52 rounded-full blur-2xl"
              style={{ background: "radial-gradient(60% 60% at 50% 50%, var(--primary) 0%, transparent 70%)" }}
              animate={{ opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <CardTitle className="text-3xl tracking-tight">{pet.name}</CardTitle>
          <CardDescription className="text-base">Level {pet.game_data.level}</CardDescription>
          {pet.isSleeping && (
            <span className="absolute right-3 top-3 text-xs px-2 py-0.5 rounded-full bg-muted border">Sleeping</span>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pet Image */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="rounded-full relative"
            >
              <motion.img
                src={pet.image_url}
                alt={pet.name}
                className="w-44 h-44 rounded-full border-4 border-primary/20 object-cover bg-secondary"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.03 }}
              />
              {/* Confetti burst */}
              {burstType !== "none" && (
                <ConfettiBurst key={`burst-${burstKey}`} type={burstType} />
              )}
            </motion.div>
          </div>

          {/* Game & Stats Data */}
          <motion.div variants={fadeInUp} initial="hidden" animate="show" className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2">
                  <CoinsIcon className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold">{pet.game_data.coins}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Coins</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2">
                  <span className="font-bold">{pet.game_data.experience}</span>
                  <StarIcon className="w-5 h-5 text-purple-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Experience Points (XP)</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {/* Personality */}
            <div className="flex justify-center">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 border">
                Personality: {personalityLabel(pet.personality)}
              </span>
            </div>

            {/* Stat Bars */}
            <motion.div variants={listStagger} initial="hidden" animate="show" className="space-y-2">
              <StatDisplay
                icon={<BatteryIcon className="text-green-500" />}
                label="Energy"
                value={displayStats.energy}
              />
              <StatDisplay
                icon={<HeartIcon className="text-pink-500" />}
                label="Happiness"
                value={displayStats.happiness}
              />
              <StatDisplay
                icon={<DrumstickIcon className="text-orange-500" />}
                label="Hunger"
                value={displayStats.hunger}
              />
            </motion.div>
            {/* Live sleep ticker */}
            {pet.isSleeping && (
              <div className="flex justify-center">
                <span className="text-xs px-2 py-1 rounded-full bg-muted border">
                  +{energyPerSecond.toFixed(1)} energy/s · -{hungerLossPerSecond.toFixed(1)} hunger/s
                </span>
              </div>
            )}
          </motion.div>

          <div className="pt-2">
            <motion.div {...scaleTap}>
              <Button
                onClick={() =>
                  mutateLevelUp(
                    { petId: pet.id },
                    { onSuccess: () => triggerBurst("level") },
                  )
                }
                disabled={!canLevelUp || isAnyActionPending}
                className="w-full relative overflow-hidden"
              >
                {isLevelingUp && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                )}
                {isLevelingUp ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ChevronUpIcon className="mr-2 h-4 w-4" />
                )}
                Level Up!
              </Button>
            </motion.div>
            <div className="mt-2">
              <motion.div {...scaleTap}>
                <Button
                  onClick={() =>
                    mutateTryEvolve(
                      { petId: pet.id },
                      { onSuccess: () => triggerBurst("evolve") },
                    )
                  }
                  disabled={isAnyActionPending || isEvolving}
                  className="w-full relative overflow-hidden"
                  variant="secondary"
                >
                  {isEvolving && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  {isEvolving ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronUpIcon className="mr-2 h-4 w-4" />
                  )}
                  Evolve (if ready)
                </Button>
              </motion.div>
            </div>
          </div>

          <motion.div variants={listStagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
            {/* Combo Actions */}
            {!pet.isSleeping ? (
              <motion.div variants={itemFade}>
              <ActionButton
                onClick={() =>
                  mutateComboCare({
                    petId: pet.id,
                    withLevelCheck: canLevelUp,
                  })
                }
                disabled={!canComboCare || isAnyActionPending}
                isPending={isComboCaring}
                label="Combo"
                icon={<ZapIcon />}
              />
              </motion.div>
            ) : (
              <motion.div variants={itemFade}>
              <ActionButton
                onClick={() =>
                  mutateMorning({ petId: pet.id, includePlay: true })
                }
                disabled={isAnyActionPending}
                isPending={isMorning}
                label="Wake Combo"
                icon={<ZapIcon />}
              />
              </motion.div>
            )}
            <motion.div variants={itemFade}>
            <ActionButton
              onClick={() => mutateFeedPet({ petId: pet.id })}
              disabled={!canFeed || isAnyActionPending}
              isPending={isFeeding}
              label="Feed"
              icon={<DrumstickIcon />}
            />
            </motion.div>
            <motion.div variants={itemFade}>
            <ActionButton
              onClick={() => mutatePlayWithPet({ petId: pet.id })}
              disabled={!canPlay || isAnyActionPending}
              isPending={isPlaying}
              label="Play"
              icon={<PlayIcon />}
            />
            </motion.div>
            <motion.div variants={itemFade}>
            <ActionButton
              onClick={() => mutateExercise({ petId: pet.id })}
              disabled={!canExercise || isAnyActionPending}
              isPending={isExercising}
              label="Exercise"
              icon={<DumbbellIcon />}
            />
            </motion.div>
            <motion.div variants={itemFade}>
            <ActionButton
              onClick={() => mutateStudy({ petId: pet.id })}
              disabled={!canStudy || isAnyActionPending}
              isPending={isStudying}
              label="Study"
              icon={<BookOpenIcon />}
            />
            </motion.div>
            <div className="col-span-2">
              <motion.div variants={itemFade}>
              <ActionButton
                onClick={() => mutateWorkForCoins({ petId: pet.id })}
                disabled={!canWork || isAnyActionPending}
                isPending={isWorking}
                label="Work"
                icon={<BriefcaseIcon />}
              />
              </motion.div>
            </div>
          </motion.div>
          <div className="col-span-2 pt-2">
            {pet.isSleeping ? (
              <Button
                onClick={() => mutateWakeUpPet({ petId: pet.id })}
                disabled={isWakingUp}
                className="w-full relative overflow-hidden"
                variant="secondary"
              >
                {isWakingUp && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                )}
                {isWakingUp ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ZapIcon className="mr-2 h-4 w-4" />
                )}{" "}
                Wake Up!
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => mutateLetPetSleep({ petId: pet.id })}
                  disabled={isAnyActionPending}
                  className="w-full relative overflow-hidden"
                  variant="secondary"
                >
                  {isSleeping && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  {isSleeping ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BedIcon className="mr-2 h-4 w-4" />
                  )}{" "}
                  Sleep
                </Button>
                <Button
                  onClick={() => mutateRest({ petId: pet.id })}
                  disabled={!canRest || isAnyActionPending}
                  className="w-full relative overflow-hidden"
                  variant="secondary"
                >
                  {isResting && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  {isResting ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CoffeeIcon className="mr-2 h-4 w-4" />
                  )}{" "}
                  Rest
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <WardrobeManager
          pet={pet}
          isAnyActionPending={isAnyActionPending || pet.isSleeping}
        />
      </Card>
    </TooltipProvider>
  );
}

function personalityLabel(value: number) {
  switch (value) {
    case 1:
      return "Athletic";
    case 2:
      return "Studious";
    case 3:
      return "Lazy";
    default:
      return "Balanced";
  }
}

// Tiny confetti burst using framer-motion
function ConfettiBurst({ type }: { type: "level" | "evolve" }) {
  const colors =
    type === "level"
      ? ["var(--primary)", "#9ae6b4", "#34d399"]
      : ["var(--accent)", "#fbb6ce", "#f59e0b"];
  const count = 14;
  const items = Array.from({ length: count });
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {items.map((_, i) => {
        const angle = (360 / count) * i + (i % 2 === 0 ? 8 : -8);
        const rad = (angle * Math.PI) / 180;
        const dist = 56 + (i % 3) * 10;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        const c = colors[i % colors.length];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.6, rotate: 0 }}
            animate={{ opacity: 0, x, y, scale: 1.1, rotate: angle * 2 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ color: c }}
            className="absolute text-sm select-none"
          >
            ✦
          </motion.div>
        );
      })}
    </div>
  );
}
