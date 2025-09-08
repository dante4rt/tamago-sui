import { useQueryOwnedPet } from "@/hooks/useQueryOwnedPet";
import { useCurrentAccount } from "@mysten/dapp-kit";
import AdoptComponent from "./AdoptComponent";
import { PetDisplayCard } from "./components/PetDisplayCard";
import { ActivitiesCard } from "./components/ActivitiesCard";
import { StatsCard } from "./components/StatsCard";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import {
  WifiOffIcon,
  LoaderIcon,
  SparklesIcon,
  SearchIcon,
  SproutIcon,
  GamepadIcon,
  CircleIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { animate } from "animejs";

// Import all the pet action hooks
import { useMutateCheckAndLevelUp } from "@/hooks/useMutateCheckLevel";
import { useMutateFeedPet } from "@/hooks/useMutateFeedPet";
import { useMutateLetPetSleep } from "@/hooks/useMutateLetPetSleep";
import { useMutatePlayWithPet } from "@/hooks/useMutatePlayWithPet";
import { useMutateWakeUpPet } from "@/hooks/useMutateWakeUpPet";
import { useMutateWorkForCoins } from "@/hooks/useMutateWorkForCoins";
import { useMutateExercise } from "@/hooks/useMutateExercise";
import { useMutateStudy } from "@/hooks/useMutateStudy";
import { useMutateRest } from "@/hooks/useMutateRest";
import { useMutateComboCare } from "@/hooks/useMutateComboCare";
import { useMutateTryEvolve } from "@/hooks/useMutateTryEvolve";
import { useQueryGameBalance } from "@/hooks/useQueryGameBalance";

const backgroundParticleVariants = {
  animate: {
    y: [0, -20, 0],
    x: [0, 10, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function HomePage() {
  const currentAccount = useCurrentAccount();
  const { data: ownedPet, isPending: isOwnedPetLoading } = useQueryOwnedPet();
  const { data: gameBalance } = useQueryGameBalance();
  const particlesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pet action hooks
  const { mutate: mutateFeedPet, isPending: isFeeding } = useMutateFeedPet();
  const { mutate: mutatePlayWithPet, isPending: isPlaying } = useMutatePlayWithPet();
  const { mutate: mutateWorkForCoins, isPending: isWorking } = useMutateWorkForCoins();
  const { mutate: mutateExercise, isPending: isExercising } = useMutateExercise();
  const { mutate: mutateStudy, isPending: isStudying } = useMutateStudy();
  const { mutate: mutateRest, isPending: isResting } = useMutateRest();
  const { mutate: mutateComboCare, isPending: isComboCaring } = useMutateComboCare();
  const { mutate: mutateLetPetSleep, isPending: isSleeping } = useMutateLetPetSleep();
  const { mutate: mutateWakeUpPet, isPending: isWakingUp } = useMutateWakeUpPet();
  const { mutate: mutateLevelUp, isPending: isLevelingUp } = useMutateCheckAndLevelUp();
  const { mutate: mutateTryEvolve, isPending: isEvolving } = useMutateTryEvolve();

  const isAnyActionPending =
    isFeeding ||
    isPlaying ||
    isWorking ||
    isExercising ||
    isStudying ||
    isResting ||
    isComboCaring ||
    isSleeping ||
    isWakingUp ||
    isLevelingUp ||
    isEvolving;

  // Set page title
  useEffect(() => {
    document.title = "Tamagosui – Home";
  }, []);

  // Helper functions to check if actions are allowed
  const canFeed = ownedPet && ownedPet.stats.hunger < (gameBalance?.max_stat || 100);
  const canPlay = ownedPet && ownedPet.stats.happiness < (gameBalance?.max_stat || 100);
  const canWork = ownedPet && ownedPet.stats.energy >= (gameBalance?.work_energy_loss || 10);
  const canExercise =
    ownedPet && ownedPet.stats.energy >= (gameBalance?.exercise_energy_loss || 15);
  const canStudy = ownedPet && ownedPet.stats.energy >= (gameBalance?.study_energy_loss || 20);
  const canRest = ownedPet && ownedPet.stats.energy < (gameBalance?.max_stat || 100);
  const canLevelUp = ownedPet && ownedPet.game_data.experience >= ownedPet.game_data.level * 100;
  const canComboCare =
    ownedPet &&
    ownedPet.stats.hunger < (gameBalance?.max_stat || 100) &&
    ownedPet.stats.happiness < (gameBalance?.max_stat || 100) &&
    ownedPet.stats.energy < (gameBalance?.max_stat || 100);

  // Action handlers
  const handleFeed = () => mutateFeedPet({ petId: ownedPet!.id });
  const handlePlay = () => mutatePlayWithPet({ petId: ownedPet!.id });
  const handleWork = () => mutateWorkForCoins({ petId: ownedPet!.id });
  const handleExercise = () => mutateExercise({ petId: ownedPet!.id });
  const handleStudy = () => mutateStudy({ petId: ownedPet!.id });
  const handleRest = () => mutateRest({ petId: ownedPet!.id });
  const handleComboCare = () => mutateComboCare({ petId: ownedPet!.id });
  const handleSleep = () => mutateLetPetSleep({ petId: ownedPet!.id });
  const handleWakeUp = () => mutateWakeUpPet({ petId: ownedPet!.id });
  const handleLevelUp = () => mutateLevelUp({ petId: ownedPet!.id });
  const handleEvolve = () => mutateTryEvolve({ petId: ownedPet!.id });

  // Enhanced particle system with anime.js - with proper timing
  useEffect(() => {
    // Only start animations after data is loaded and initial render is complete
    if (!currentAccount || isOwnedPetLoading) return;

    const createFloatingParticles = () => {
      if (!particlesRef.current) return;

      // Clear existing particles
      particlesRef.current.innerHTML = "";

      // Create 30 beautiful floating particles
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div");
        particle.className = "absolute rounded-full pointer-events-none blur-[0.5px]";

        // Random particle properties
        const size = Math.random() * 8 + 4;
        const colors = ["bg-tea-green/50", "bg-apricot/50", "bg-pistachio/50", "bg-dutch-white/50"];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.className += ` ${color}`;

        particlesRef.current.appendChild(particle);

        // Anime.js smooth floating animation with initial delay
        animate(particle, {
          translateY: [
            { value: () => -20 - Math.random() * 40, duration: 3000 + Math.random() * 2000 },
            { value: () => 20 + Math.random() * 40, duration: 3000 + Math.random() * 2000 },
          ],
          translateX: [
            { value: () => -15 - Math.random() * 30, duration: 4000 + Math.random() * 1000 },
            { value: () => 15 + Math.random() * 30, duration: 4000 + Math.random() * 1000 },
          ],
          scale: [
            { value: 1.3, duration: 2000 + Math.random() * 1000 },
            { value: 0.7, duration: 2000 + Math.random() * 1000 },
          ],
          opacity: [
            { value: 0.8, duration: 1500 + Math.random() * 1500 },
            { value: 0.3, duration: 1500 + Math.random() * 1500 },
          ],
          loop: true,
          direction: "alternate",
          easing: "easeInOutSine",
          delay: 800 + Math.random() * 2000, // Add substantial initial delay
        });
      }
    };

    // Create magical sparkle bursts
    const createSparkleEffect = () => {
      const container = containerRef.current;
      if (!container) return;

      const sparkle = document.createElement("div");
      sparkle.className = "absolute pointer-events-none text-2xl";
      const sparkleIcons = ["✨", "⭐", "💫", "�"];
      sparkle.innerHTML = sparkleIcons[Math.floor(Math.random() * sparkleIcons.length)];
      sparkle.style.left = `${Math.random() * 90 + 5}%`;
      sparkle.style.top = `${Math.random() * 90 + 5}%`;
      sparkle.style.zIndex = "1";

      container.appendChild(sparkle);

      // Beautiful sparkle animation with anime.js
      animate(sparkle, {
        scale: [
          { value: 0, duration: 0 },
          { value: 1.5, duration: 600, easing: "easeOutElastic(1, .6)" },
          { value: 0.8, duration: 400, easing: "easeOutQuad" },
          { value: 0, duration: 800, easing: "easeInQuad" },
        ],
        rotate: [
          { value: 0, duration: 0 },
          { value: 180, duration: 600, easing: "easeOutBack(1.7)" },
          { value: 360, duration: 1200, easing: "easeInOutSine" },
        ],
        opacity: [
          { value: 0, duration: 0 },
          { value: 1, duration: 300 },
          { value: 1, duration: 900 },
          { value: 0, duration: 600 },
        ],
        complete: () => sparkle.remove(),
      });
    };

    // Initialize particle system with delay
    setTimeout(() => {
      createFloatingParticles();
    }, 500);

    // Create sparkles periodically with initial delay
    const sparkleInterval = setInterval(createSparkleEffect, 2500);

    return () => {
      clearInterval(sparkleInterval);
    };
  }, [currentAccount, isOwnedPetLoading]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background flex flex-col">
      <div ref={particlesRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className="fixed inset-0 pointer-events-none z-10">
        <motion.div
          variants={backgroundParticleVariants}
          animate="animate"
          className="absolute top-20 left-10 w-6 h-6 rounded-full opacity-40 bg-tea-green animate-float floating-element"
        />
        <motion.div
          variants={backgroundParticleVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute top-40 right-20 w-4 h-4 rounded-full opacity-30 bg-apricot animate-float floating-element"
        />
        <motion.div
          variants={backgroundParticleVariants}
          animate="animate"
          style={{ animationDelay: "4s" }}
          className="absolute bottom-40 left-20 w-8 h-8 rounded-full opacity-20 bg-pistachio animate-float floating-element"
        />
        <motion.div
          variants={backgroundParticleVariants}
          animate="animate"
          style={{ animationDelay: "6s" }}
          className="absolute bottom-20 right-10 w-5 h-5 rounded-full opacity-35 bg-dutch-white animate-float floating-element"
        />

        <motion.div
          className="absolute top-32 left-1/4 text-2xl opacity-60"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <SproutIcon className="h-6 w-6" />
        </motion.div>
        <motion.div
          className="absolute top-60 right-1/3 text-xl opacity-50"
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <SparklesIcon className="h-5 w-5" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-1/3 text-lg opacity-40"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <GamepadIcon className="h-5 w-5" />
        </motion.div>
      </div>

      <Header />

      <main className="main-content flex-1 flex items-center justify-center p-4 pt-24 relative z-20 min-h-0">
        {!currentAccount ? (
          <div
            key="connect"
            className="text-center p-12 rounded-2xl bg-card border border-border max-w-md mx-auto transform hover:scale-105 transition-transform duration-300"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="mb-6"
            >
              <WifiOffIcon className="h-16 w-16 mx-auto text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center justify-center gap-2">
              Connect Your Wallet
            </h2>
            <p className="text-muted-foreground">
              Ready to meet your digital companion? Let's get you connected!
            </p>
          </div>
        ) : isOwnedPetLoading ? (
          <div
            key="loading"
            className="text-center p-12 rounded-2xl bg-card border border-border max-w-md mx-auto"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity },
              }}
              className="mb-6"
            >
              <LoaderIcon className="h-16 w-16 mx-auto text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
              <SearchIcon className="h-6 w-6" />
              Finding Your Pet...
            </h2>
            <motion.p
              className="text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Searching the digital realm for your furry friend!
            </motion.p>
          </div>
        ) : ownedPet ? (
          <div key="pet" className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-stretch gap-6 min-h-[600px] p-4">
              <div className="lg:flex-1 flex">
                <StatsCard pet={ownedPet} />
              </div>

              <div className="lg:flex-[2] flex">
                <PetDisplayCard pet={ownedPet} />
              </div>

              <div className="lg:flex-1 flex">
                <ActivitiesCard
                  pet={ownedPet}
                  onFeed={handleFeed}
                  onPlay={handlePlay}
                  onWork={handleWork}
                  onExercise={handleExercise}
                  onStudy={handleStudy}
                  onRest={handleRest}
                  onLevelUp={handleLevelUp}
                  onEvolve={handleEvolve}
                  onWakeUp={handleWakeUp}
                  onSleep={handleSleep}
                  onComboCare={handleComboCare}
                  canFeed={!!canFeed}
                  canPlay={!!canPlay}
                  canWork={!!canWork}
                  canExercise={!!canExercise}
                  canStudy={!!canStudy}
                  canRest={!!canRest}
                  canLevelUp={!!canLevelUp}
                  canComboCare={!!canComboCare}
                  isAnyActionPending={isAnyActionPending}
                  isFeeding={isFeeding}
                  isPlaying={isPlaying}
                  isWorking={isWorking}
                  isExercising={isExercising}
                  isStudying={isStudying}
                  isResting={isResting}
                  isLevelingUp={isLevelingUp}
                  isEvolving={isEvolving}
                  isWakingUp={isWakingUp}
                  isSleeping={isSleeping}
                  isComboCaring={isComboCaring}
                />
              </div>
            </div>
          </div>
        ) : (
          <div key="adopt" className="w-full max-w-md">
            <AdoptComponent />
          </div>
        )}
      </main>

      <motion.div
        className="fixed bottom-10 right-10 pointer-events-none text-primary"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <SparklesIcon className="h-8 w-8 opacity-40" />
      </motion.div>

      <motion.div
        className="fixed bottom-20 left-10 pointer-events-none text-2xl"
        animate={{
          x: [0, 10, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <CircleIcon className="h-6 w-6 opacity-50" />
      </motion.div>

      <motion.div
        className="fixed top-1/2 right-5 pointer-events-none text-xl opacity-30"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      >
        <SparklesIcon className="h-5 w-5" />
      </motion.div>
    </div>
  );
}
