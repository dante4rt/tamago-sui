import { useQueryOwnedPet } from "@/hooks/useQueryOwnedPet";
import { useCurrentAccount } from "@mysten/dapp-kit";
import AdoptComponent from "./AdoptComponent";
import PetComponent from "./PetComponent";
import Header from "@/components/Header";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOffIcon, LoaderIcon, SparklesIcon } from "lucide-react";

// Enhanced page transition variants following Family's fluid principles
const pageVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.96,
    filter: "blur(10px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.6,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    filter: "blur(5px)",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          variants={backgroundParticleVariants}
          animate="animate"
          className="absolute top-20 left-10 w-6 h-6 rounded-full opacity-40 bg-tea-green animate-float"
        />
        <motion.div
          variants={backgroundParticleVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute top-40 right-20 w-4 h-4 rounded-full opacity-30 bg-apricot animate-float"
        />
        <motion.div
          variants={backgroundParticleVariants}
          animate="animate"
          style={{ animationDelay: "4s" }}
          className="absolute bottom-40 left-20 w-8 h-8 rounded-full opacity-20 bg-pistachio animate-float"
        />
        <motion.div
          variants={backgroundParticleVariants}
          animate="animate"
          style={{ animationDelay: "6s" }}
          className="absolute bottom-20 right-10 w-5 h-5 rounded-full opacity-35 bg-dutch-white animate-float"
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
          🌱
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
          ✨
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
          🎮
        </motion.div>
      </div>

      <Header />

      <main className="flex-1 flex items-center justify-center p-4 pt-24 relative z-10 min-h-0">
        <AnimatePresence mode="popLayout">
          {!currentAccount ? (
            <motion.div
              key="connect"
              variants={pageVariants}
              initial="hidden"
              animate="show"
              exit="exit"
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
              <h2 className="text-2xl font-bold mb-4 text-foreground">🔗 Connect Your Wallet</h2>
              <p className="text-muted-foreground">
                Ready to meet your digital companion? Let's get you connected! 🌟
              </p>
            </motion.div>
          ) : isOwnedPetLoading ? (
            <motion.div
              key="loading"
              variants={pageVariants}
              initial="hidden"
              animate="show"
              exit="exit"
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
              <h2 className="text-2xl font-bold mb-4 text-foreground">🔍 Finding Your Pet...</h2>
              <motion.p
                className="text-muted-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Searching the digital realm for your furry friend! 🐾
              </motion.p>
            </motion.div>
          ) : ownedPet ? (
            <motion.div
              key="pet"
              variants={pageVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="w-full max-w-4xl mx-auto justify-center flex"
            >
              <PetComponent pet={ownedPet} />
            </motion.div>
          ) : (
            <motion.div
              key="adopt"
              variants={pageVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="w-full max-w-md"
            >
              <AdoptComponent />
            </motion.div>
          )}
        </AnimatePresence>
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
        🎈
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
        🌟
      </motion.div>
    </div>
  );
}
