import { useState } from "react";
import { CoinsIcon, XIcon, TagIcon, SparklesIcon, HeartIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";

import { useQueryPetListings } from "@/hooks/useQueryPetListings";
import { useQueryAccessoryListings } from "@/hooks/useQueryAccessoryListings";
import { useQueryOwnedPet } from "@/hooks/useQueryOwnedPet";
import { useQueryOwnedAccessories } from "@/hooks/useQueryOwnedAccessories";
import { useMutateListPet } from "@/hooks/useMutateListPet";
import { useMutateCancelPetListing } from "@/hooks/useMutateCancelPetListing";
import { useMutateListAccessory } from "@/hooks/useMutateListAccessory";
import { useMutateCancelAccessoryListing } from "@/hooks/useMutateCancelAccessoryListing";

import { useCurrentAccount } from "@mysten/dapp-kit";

// Enhanced animation variants following Family's principles
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const listingItemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.98 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      delay: index * 0.1,
    },
  }),
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  loading: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.6, repeat: Infinity },
  },
};

export default function MarketplacePage() {
  const currentAccount = useCurrentAccount();
  const { data: petListings, isLoading: loadingPets } = useQueryPetListings();
  const { data: accListings, isLoading: loadingAcc } = useQueryAccessoryListings();
  const { data: myPet } = useQueryOwnedPet();
  const { data: myAccs } = useQueryOwnedAccessories();

  const { mutate: listPet, isPending: listingPet } = useMutateListPet();
  const { mutate: cancelPet, isPending: cancelingPet } = useMutateCancelPetListing();

  const { mutate: listAcc, isPending: listingAcc } = useMutateListAccessory();
  const { mutate: cancelAcc, isPending: cancelingAcc } = useMutateCancelAccessoryListing();

  const [petPrice, setPetPrice] = useState(1);
  const [accPrices, setAccPrices] = useState<Record<string, number>>({});
  const [showListingForm, setShowListingForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-32 left-20 text-lg opacity-20"
          animate={{
            y: [0, -8, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🛍️
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-20 text-lg opacity-15"
          animate={{
            x: [0, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        >
          ✨
        </motion.div>
      </div>

      <Header />

      <div className="container mx-auto px-4 pt-28 pb-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border mb-6">
            <SparklesIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">🎪 Tamagotchi Marketplace</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">
            🌟 Find Your Perfect Companion! 🐾
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover adorable pets and magical accessories in our enchanted marketplace ✨
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pb-20 space-y-8">
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="border border-border bg-card">
            <CardHeader>
              <motion.div className="flex items-center justify-between" layout>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <motion.div
                    animate={{ rotate: showListingForm ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <TagIcon className="h-5 w-5 text-primary" />
                  </motion.div>
                  List Your Assets
                </CardTitle>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowListingForm(!showListingForm)}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 cursor-pointer"
                >
                  {showListingForm ? "Hide" : "Show"} Options
                </motion.button>
              </motion.div>
            </CardHeader>

            <AnimatePresence>
              {showListingForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        className="p-4 border rounded-lg bg-accent/10"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <HeartIcon className="h-4 w-4 text-accent" />
                          Pet
                        </h3>
                        {myPet ? (
                          <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <img
                              src={myPet.image_url}
                              alt={myPet.name}
                              className="w-12 h-12 rounded-full border-2 border-primary/30"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{myPet.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Level {myPet.game_data.level}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={1}
                                value={petPrice}
                                onChange={(e) => setPetPrice(Number(e.target.value))}
                                className="w-24 text-center"
                                placeholder="Price"
                              />
                              <motion.div
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                animate={listingPet ? "loading" : "idle"}
                              >
                                <Button
                                  size="sm"
                                  disabled={listingPet}
                                  onClick={() => listPet({ petId: myPet.id, price: petPrice })}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  {listingPet ? "Listing..." : "List"}
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No pet to list.</p>
                        )}
                      </motion.div>

                      <motion.div
                        className="p-4 border rounded-lg bg-secondary/10"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <SparklesIcon className="h-4 w-4 text-secondary" />
                          Accessories
                        </h3>
                        {myAccs && myAccs.length > 0 ? (
                          <div className="space-y-3 max-h-48 overflow-auto pr-1">
                            {myAccs.map((acc, index) => (
                              <motion.div
                                key={acc.id.id}
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <img
                                  src={acc.image_url}
                                  alt={acc.name}
                                  className="w-10 h-10 rounded-md border-2 border-primary/30"
                                />
                                <div className="flex-1 text-sm font-medium">{acc.name}</div>
                                <Input
                                  type="number"
                                  min={1}
                                  value={accPrices[acc.id.id] ?? 1}
                                  onChange={(e) =>
                                    setAccPrices((p) => ({
                                      ...p,
                                      [acc.id.id]: Number(e.target.value),
                                    }))
                                  }
                                  className="w-20 text-center"
                                  placeholder="Price"
                                />
                                <motion.div
                                  variants={buttonVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                  animate={listingAcc ? "loading" : "idle"}
                                >
                                  <Button
                                    size="sm"
                                    disabled={listingAcc}
                                    onClick={() =>
                                      listAcc({
                                        accessoryId: acc.id.id,
                                        price: accPrices[acc.id.id] ?? 1,
                                      })
                                    }
                                    className="bg-primary hover:bg-primary/90"
                                  >
                                    {listingAcc ? "..." : "List"}
                                  </Button>
                                </motion.div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No accessories to list.</p>
                        )}
                      </motion.div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <HeartIcon className="h-5 w-5 text-accent" />
                  </motion.div>
                  Pet Listings
                  {petListings && petListings.length > 0 && (
                    <span className="text-sm bg-accent/20 text-accent px-2 py-1 rounded-full">
                      {petListings.length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPets ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-sm text-muted-foreground text-center py-8"
                  >
                    Searching for adorable pets...
                  </motion.div>
                ) : petListings && petListings.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {petListings.map((l, idx) => (
                        <motion.div
                          key={l.id}
                          custom={idx}
                          variants={listingItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          whileHover="hover"
                          layout
                          className="flex items-center justify-between p-4 border rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <motion.img
                              src={l.pet?.image_url}
                              alt={l.pet?.name}
                              className="w-12 h-12 rounded-full border-2 border-accent/30"
                              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                            <div>
                              <div className="text-sm font-semibold">{l.pet?.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Level {l.pet?.level}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <motion.span
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border bg-primary/20 font-mono text-sm font-medium"
                              whileHover={{ scale: 1.05 }}
                            >
                              <CoinsIcon className="h-3 w-3" />
                              {l.price} SUI
                            </motion.span>
                            {currentAccount?.address === l.seller && (
                              <motion.div
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                animate={cancelingPet ? "loading" : "idle"}
                              >
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => cancelPet({ listingId: l.id })}
                                  disabled={cancelingPet}
                                  className="opacity-90 hover:opacity-100"
                                >
                                  <XIcon className="h-4 w-4" />
                                  {cancelingPet ? "..." : "Cancel"}
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No pets are looking for new homes yet.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Be the first to list your companion!
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 4,
                    }}
                  >
                    <SparklesIcon className="h-5 w-5 text-secondary" />
                  </motion.div>
                  Accessory Listings
                  {accListings && accListings.length > 0 && (
                    <span className="text-sm bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                      {accListings.length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAcc ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-sm text-muted-foreground text-center py-8"
                  >
                    Discovering magical accessories...
                  </motion.div>
                ) : accListings && accListings.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {accListings.map((l, idx) => (
                        <motion.div
                          key={l.id}
                          custom={idx}
                          variants={listingItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          whileHover="hover"
                          layout
                          className="flex items-center justify-between p-4 border rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <motion.img
                              src={l.accessory?.image_url}
                              alt={l.accessory?.name}
                              className="w-12 h-12 rounded-lg border-2 border-secondary/30"
                              whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                            <div>
                              <div className="text-sm font-semibold">{l.accessory?.name}</div>
                              <div className="text-xs text-muted-foreground">Magical Item</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <motion.span
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full border bg-secondary/20 font-mono text-sm font-medium"
                              whileHover={{ scale: 1.05 }}
                            >
                              <CoinsIcon className="h-3 w-3" />
                              {l.price} SUI
                            </motion.span>
                            {currentAccount?.address === l.seller && (
                              <motion.div
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                animate={cancelingAcc ? "loading" : "idle"}
                              >
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => cancelAcc({ listingId: l.id })}
                                  disabled={cancelingAcc}
                                  className="opacity-90 hover:opacity-100"
                                >
                                  <XIcon className="h-4 w-4" />
                                  {cancelingAcc ? "..." : "Cancel"}
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No magical accessories available yet.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      List your treasures to start trading!
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
