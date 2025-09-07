import { useState } from "react";
import { CoinsIcon, XIcon, TagIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { motion } from "framer-motion";

import { useQueryPetListings } from "@/hooks/useQueryPetListings";
import { useQueryAccessoryListings } from "@/hooks/useQueryAccessoryListings";
import { useQueryOwnedPet } from "@/hooks/useQueryOwnedPet";
import { useQueryOwnedAccessories } from "@/hooks/useQueryOwnedAccessories";
import { useMutateListPet } from "@/hooks/useMutateListPet";
import { useMutateCancelPetListing } from "@/hooks/useMutateCancelPetListing";
import { useMutateListAccessory } from "@/hooks/useMutateListAccessory";
import { useMutateCancelAccessoryListing } from "@/hooks/useMutateCancelAccessoryListing";

import { useCurrentAccount } from "@mysten/dapp-kit";

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

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      <div className="container mx-auto px-4 py-20 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TagIcon className="h-5 w-5" /> List Your Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-md">
                  <h3 className="font-semibold mb-2">Pet</h3>
                  {myPet ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={myPet.image_url}
                        alt={myPet.name}
                        className="w-12 h-12 rounded-full border"
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
                          className="w-24"
                        />
                        <Button
                          size="sm"
                          disabled={listingPet}
                          onClick={() => listPet({ petId: myPet.id, price: petPrice })}
                          className="cursor-pointer"
                        >
                          List
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No pet to list.</p>
                  )}
                </div>
                <div className="p-3 border rounded-md">
                  <h3 className="font-semibold mb-2">Accessories</h3>
                  {myAccs && myAccs.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-auto pr-1">
                      {myAccs.map((acc) => (
                        <div key={acc.id.id} className="flex items-center gap-3">
                          <img
                            src={acc.image_url}
                            alt={acc.name}
                            className="w-10 h-10 rounded-md border"
                          />
                          <div className="flex-1 text-sm font-medium">{acc.name}</div>
                          <Input
                            type="number"
                            min={1}
                            value={accPrices[acc.id.id] ?? 1}
                            onChange={(e) =>
                              setAccPrices((p) => ({ ...p, [acc.id.id]: Number(e.target.value) }))
                            }
                            className="w-24"
                          />
                          <Button
                            size="sm"
                            className="cursor-pointer"
                            disabled={listingAcc}
                            onClick={() =>
                              listAcc({ accessoryId: acc.id.id, price: accPrices[acc.id.id] ?? 1 })
                            }
                          >
                            List
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No accessories.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CoinsIcon className="h-5 w-5" /> Pet Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPets ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : petListings && petListings.length > 0 ? (
                  <div className="space-y-3">
                    {petListings.map((l, idx) => (
                      <motion.div
                        key={l.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut", delay: 0.06 * idx }}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-3 border rounded-md bg-background/60"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={l.pet?.image_url}
                            alt={l.pet?.name}
                            className="w-10 h-10 rounded-full border"
                          />
                          <div>
                            <div className="text-sm font-semibold">{l.pet?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Level {l.pet?.level}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-muted font-mono text-xs">
                            {l.price} SUI
                          </span>
                          {currentAccount?.address === l.seller && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => cancelPet({ listingId: l.id })}
                              disabled={cancelingPet}
                            >
                              <XIcon className="h-4 w-4" /> Cancel
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active listings.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
          >
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CoinsIcon className="h-5 w-5" /> Accessory Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAcc ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : accListings && accListings.length > 0 ? (
                  <div className="space-y-3">
                    {accListings.map((l, idx) => (
                      <motion.div
                        key={l.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut", delay: 0.06 * idx }}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-3 border rounded-md bg-background/60"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={l.accessory?.image_url}
                            alt={l.accessory?.name}
                            className="w-10 h-10 rounded-md border"
                          />
                          <div>
                            <div className="text-sm font-semibold">{l.accessory?.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-muted font-mono text-xs">
                            {l.price} SUI
                          </span>
                          {currentAccount?.address === l.seller && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => cancelAcc({ listingId: l.id })}
                              disabled={cancelingAcc}
                            >
                              <XIcon className="h-4 w-4" /> Cancel
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active listings.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
