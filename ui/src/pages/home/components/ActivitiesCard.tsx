import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionButton } from "./ActionButton";
import { Button } from "@/components/ui/button";
import {
  PlayIcon,
  BriefcaseIcon,
  DumbbellIcon,
  BookOpenIcon,
  HeartIcon,
  UtensilsIcon,
  Loader2Icon,
  ChevronUpIcon,
  ZapIcon,
  BedIcon,
  CoffeeIcon,
  GamepadIcon,
} from "lucide-react";
import type { PetStruct } from "@/types/Pet";
import { scaleTap } from "@/components/motion/variants";

type ActivitiesCardProps = {
  pet: PetStruct;
  onFeed: () => void;
  onPlay: () => void;
  onWork: () => void;
  onExercise: () => void;
  onStudy: () => void;
  onRest: () => void;
  onLevelUp: () => void;
  onEvolve: () => void;
  onWakeUp: () => void;
  onSleep: () => void;
  onComboCare: () => void;
  canFeed: boolean;
  canPlay: boolean;
  canWork: boolean;
  canExercise: boolean;
  canStudy: boolean;
  canRest: boolean;
  canLevelUp: boolean;
  canComboCare: boolean;
  isAnyActionPending: boolean;
  isFeeding: boolean;
  isPlaying: boolean;
  isWorking: boolean;
  isExercising: boolean;
  isStudying: boolean;
  isResting: boolean;
  isLevelingUp: boolean;
  isEvolving: boolean;
  isWakingUp: boolean;
  isSleeping: boolean;
  isComboCaring: boolean;
};

export function ActivitiesCard({
  pet,
  onFeed,
  onPlay,
  onWork,
  onExercise,
  onStudy,
  onRest,
  onLevelUp,
  onEvolve,
  onWakeUp,
  onSleep,
  onComboCare,
  canFeed,
  canPlay,
  canWork,
  canExercise,
  canStudy,
  canRest,
  canLevelUp,
  canComboCare,
  isAnyActionPending,
  isFeeding,
  isPlaying,
  isWorking,
  isExercising,
  isStudying,
  isResting,
  isLevelingUp,
  isEvolving,
  isWakingUp,
  isSleeping,
  isComboCaring,
}: ActivitiesCardProps) {
  const basicActivities = [
    {
      component: ActionButton,
      props: {
        onClick: onFeed,
        disabled: !canFeed || isAnyActionPending,
        isPending: isFeeding,
        label: "Feed",
        icon: <UtensilsIcon />,
      },
    },
    {
      component: ActionButton,
      props: {
        onClick: onPlay,
        disabled: !canPlay || isAnyActionPending,
        isPending: isPlaying,
        label: "Play",
        icon: <PlayIcon />,
      },
    },
    {
      component: ActionButton,
      props: {
        onClick: onWork,
        disabled: !canWork || isAnyActionPending,
        isPending: isWorking,
        label: "Work",
        icon: <BriefcaseIcon />,
      },
    },
    {
      component: ActionButton,
      props: {
        onClick: onExercise,
        disabled: !canExercise || isAnyActionPending,
        isPending: isExercising,
        label: "Exercise",
        icon: <DumbbellIcon />,
      },
    },
    {
      component: ActionButton,
      props: {
        onClick: onStudy,
        disabled: !canStudy || isAnyActionPending,
        isPending: isStudying,
        label: "Study",
        icon: <BookOpenIcon />,
      },
    },
    {
      component: ActionButton,
      props: {
        onClick: onComboCare,
        disabled: !canComboCare || isAnyActionPending,
        isPending: isComboCaring,
        label: "Combo",
        icon: <HeartIcon />,
      },
    },
  ];

  return (
    <div className="w-full">
      <Card className="w-full h-full border border-border overflow-hidden bg-gradient-to-br from-card via-card to-card/90 hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <GamepadIcon className="h-6 w-6" />
            </motion.div>
            Activities
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {canLevelUp && (
            <div>
              <motion.div {...scaleTap}>
                <Button
                  onClick={onLevelUp}
                  disabled={!canLevelUp || isAnyActionPending}
                  className="w-full relative overflow-hidden cursor-pointer bg-gradient-to-r from-apricot to-dutch-white hover:from-apricot/80 hover:to-dutch-white/80 text-foreground"
                >
                  {isLevelingUp ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronUpIcon className="mr-2 h-4 w-4" />
                  )}
                  Level Up!
                </Button>
              </motion.div>
            </div>
          )}

          <motion.div {...scaleTap}>
            <Button
              onClick={onEvolve}
              disabled={isAnyActionPending || isEvolving}
              className="w-full relative overflow-hidden cursor-pointer bg-gradient-to-r from-tea-green to-pistachio hover:from-tea-green/80 hover:to-pistachio/80 text-foreground border"
              variant="secondary"
            >
              {isEvolving ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronUpIcon className="mr-2 h-4 w-4" />
              )}
              Evolve
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {basicActivities.map((activity) => (
              <div key={activity.props.label}>
                <activity.component {...activity.props} />
              </div>
            ))}
          </div>

          <div className="pt-2">
            {pet.isSleeping ? (
              <Button
                onClick={onWakeUp}
                disabled={isWakingUp}
                className="w-full relative overflow-hidden cursor-pointer bg-gradient-to-r from-dutch-white to-apricot hover:from-dutch-white/80 hover:to-apricot/80 text-foreground"
                variant="secondary"
              >
                {isWakingUp ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ZapIcon className="mr-2 h-4 w-4" />
                )}
                Wake Up!
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={onSleep}
                  disabled={isAnyActionPending}
                  className="w-full relative overflow-hidden cursor-pointer"
                  variant="secondary"
                >
                  {isSleeping ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BedIcon className="mr-2 h-4 w-4" />
                  )}
                  Sleep
                </Button>
                <Button
                  onClick={onRest}
                  disabled={!canRest || isAnyActionPending}
                  className="w-full relative overflow-hidden cursor-pointer"
                  variant="secondary"
                >
                  {isResting ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CoffeeIcon className="mr-2 h-4 w-4" />
                  )}
                  Rest
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
