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

import type { PetStruct } from "@/types/Pet";

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

  const { mutate: mutateLetPetSleep, isPending: isSleeping } =
    useMutateLetPetSleep();
  const { mutate: mutateWakeUpPet, isPending: isWakingUp } =
    useMutateWakeUpPet();
  const { mutate: mutateLevelUp, isPending: isLevelingUp } =
    useMutateCheckAndLevelUp();

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
    isFeeding || isPlaying || isSleeping || isWorking || isLevelingUp;

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
  const canLevelUp =
    !pet.isSleeping &&
    pet.game_data.experience >=
      pet.game_data.level * Number(gameBalance.exp_per_level);

  return (
    <TooltipProvider>
      <Card className="w-full max-w-sm shadow-hard border-2 border-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">{pet.name}</CardTitle>
          <CardDescription className="text-lg">
            Level {pet.game_data.level}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pet Image */}
          <div className="flex justify-center">
            <img
              src={pet.image_url}
              alt={pet.name}
              className="w-36 h-36 rounded-full border-4 border-primary/20 object-cover"
            />
          </div>

          {/* Game & Stats Data */}
          <div className="space-y-3">
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

            {/* Stat Bars */}
            <div className="space-y-2">
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
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => mutateLevelUp({ petId: pet.id })}
              disabled={!canLevelUp || isAnyActionPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLevelingUp ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronUpIcon className="mr-2 h-4 w-4" />
              )}
              Level Up!
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              onClick={() => mutateFeedPet({ petId: pet.id })}
              disabled={!canFeed || isAnyActionPending}
              isPending={isFeeding}
              label="Feed"
              icon={<DrumstickIcon />}
            />
            <ActionButton
              onClick={() => mutatePlayWithPet({ petId: pet.id })}
              disabled={!canPlay || isAnyActionPending}
              isPending={isPlaying}
              label="Play"
              icon={<PlayIcon />}
            />
            <div className="col-span-2">
              <ActionButton
                onClick={() => mutateWorkForCoins({ petId: pet.id })}
                disabled={!canWork || isAnyActionPending}
                isPending={isWorking}
                label="Work"
                icon={<BriefcaseIcon />}
              />
            </div>
          </div>
          <div className="col-span-2 pt-2">
            {pet.isSleeping ? (
              <Button
                onClick={() => mutateWakeUpPet({ petId: pet.id })}
                disabled={isWakingUp}
                className="w-full bg-yellow-500 hover:bg-yellow-600"
              >
                {isWakingUp ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ZapIcon className="mr-2 h-4 w-4" />
                )}{" "}
                Wake Up!
              </Button>
            ) : (
              <Button
                onClick={() => mutateLetPetSleep({ petId: pet.id })}
                disabled={isAnyActionPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSleeping ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BedIcon className="mr-2 h-4 w-4" />
                )}{" "}
                Sleep
              </Button>
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
