import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUpIcon, StarIcon, CoinsIcon, BarChart3Icon } from "lucide-react";
import type { PetStruct } from "@/types/Pet";
import { animate } from "animejs";
import { useEffect, useRef } from "react";

type StatsCardProps = {
  pet: PetStruct;
};

const cardVariants = {
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

export function StatsCard({ pet }: StatsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const experienceNeeded = pet.game_data.level * 100;
  const experienceProgress = (pet.game_data.experience / experienceNeeded) * 100;

  useEffect(() => {
    // Level badge animation
    if (levelRef.current) {
      animate(levelRef.current, {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
        duration: 2000,
        easing: "easeInOutQuad",
        loop: true,
        delay: 500,
      });
    }
  }, []);

  return (
    <motion.div ref={cardRef} whileHover="hover" variants={cardVariants} className="w-full">
      <Card className="w-full h-full border border-border overflow-hidden bg-gradient-to-br from-card via-card to-card/90 hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <BarChart3Icon className="h-6 w-6" />
            </motion.div>
            Progress & Wealth
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <motion.div
                ref={levelRef}
                className="flex items-center gap-2 bg-gradient-to-r from-tea-green to-pistachio dark:text-white px-4 py-2 rounded-full font-bold"
              >
                <StarIcon className="h-5 w-5" />
                Level {pet.game_data.level}
              </motion.div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Experience</span>
                <span>
                  {pet.game_data.experience} / {experienceNeeded}
                </span>
              </div>
              <Progress value={experienceProgress} className="h-3 bg-muted" />
            </div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <div>
                <CoinsIcon className="h-5 w-5" />
              </div>
              {pet.game_data.coins} Coins
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-full text-sm w-full justify-center">
              <TrendingUpIcon className="h-4 w-4" />
              <span className="font-medium">
                {pet.personality === 0 && "Balanced"}
                {pet.personality === 1 && "Athletic"}
                {pet.personality === 2 && "Studious"}
                {pet.personality === 3 && "Lazy"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
