import { useQueryOwnedPet } from "@/hooks/useQueryOwnedPet";
import { useCurrentAccount } from "@mysten/dapp-kit";
import AdoptComponent from "./AdoptComponent";
import PetComponent from "./PetComponent";
import Header from "@/components/Header";
import { AnimatePresence, motion } from "framer-motion";
import { fadeInUp } from "@/components/motion/variants";

export default function HomePage() {
  const currentAccount = useCurrentAccount();
  const { data: ownedPet, isPending: isOwnedPetLoading } = useQueryOwnedPet();

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 pt-24">
        <AnimatePresence mode="popLayout">
          {!currentAccount ? (
            <motion.div
              key="connect"
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              exit="exit"
              className="text-center p-8 border-4 border-primary bg-background shadow-[8px_8px_0px_#000]"
            >
              <h2 className="text-4xl uppercase">Please Connect Wallet</h2>
            </motion.div>
          ) : isOwnedPetLoading ? (
            <motion.div
              key="loading"
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              exit="exit"
              className="text-center p-8 border-4 border-primary bg-background shadow-[8px_8px_0px_#000]"
            >
              <h2 className="text-4xl uppercase">Loading Pet...</h2>
            </motion.div>
          ) : ownedPet ? (
            <motion.div key="pet" variants={fadeInUp} initial="hidden" animate="show" exit="exit">
              <PetComponent pet={ownedPet} />
            </motion.div>
          ) : (
            <motion.div key="adopt" variants={fadeInUp} initial="hidden" animate="show" exit="exit">
              <AdoptComponent />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
