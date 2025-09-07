import { GlassesIcon, Loader2Icon, WarehouseIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CardFooter } from "@/components/ui/card";

import { UseMutateEquipAccessory } from "@/hooks/useMutateEquipAccessory";
import { useMutateMintAccessory } from "@/hooks/useMutateMintAccessory";
import { useMutateMintHat } from "@/hooks/useMutateMintHat";
import { useMutateMintToy } from "@/hooks/useMutateMintToy";
import { UseMutateUnequipAccessory } from "@/hooks/useMutateUnequipAccessory";
import { useMutateMintAndEquip } from "@/hooks/useMutateMintAndEquip";
import { useQueryEquippedAccessory } from "@/hooks/useQueryEquippedAccessory";
import { useQueryOwnedAccessories } from "@/hooks/useQueryOwnedAccessories";

import type { PetStruct } from "@/types/Pet";
import { motion } from "framer-motion";
import { scaleTap } from "@/components/motion/variants";

type WardrobeManagerProps = {
  pet: PetStruct;
  isAnyActionPending: boolean;
};

export function WardrobeManager({ pet, isAnyActionPending }: WardrobeManagerProps) {
  // --- Hooks for Actions ---
  const { mutate: mutateMint, isPending: isMinting } = useMutateMintAccessory();
  const { mutate: mutateMintHat, isPending: isMintingHat } = useMutateMintHat();
  const { mutate: mutateMintToy, isPending: isMintingToy } = useMutateMintToy();
  const { mutate: mutateEquip, isPending: isEquipping } = UseMutateEquipAccessory();
  const { mutate: mutateUnequip, isPending: isUnequipping } = UseMutateUnequipAccessory();
  const { mutate: mutateMintEquip, isPending: isMintEquipping } = useMutateMintAndEquip();

  // --- Wardrobe Data Fetching Hooks ---
  const { data: ownedAccessories, isLoading: isLoadingAccessories } = useQueryOwnedAccessories();
  const { data: equippedAccessory, isLoading: isLoadingEquipped } = useQueryEquippedAccessory({
    petId: pet.id,
  });

  // A specific loading state for wardrobe actions to disable buttons.
  const isProcessingWardrobe =
    isMinting || isMintingHat || isMintingToy || isEquipping || isUnequipping || isMintEquipping;
  const isLoading = isLoadingAccessories || isLoadingEquipped;

  const renderContent = () => {
    if (isLoading) return <p className="text-sm text-muted-foreground">Loading wardrobe...</p>;

    return (
      <div className="w-full space-y-3">
        {/* Equipped section (if any) */}
        {equippedAccessory && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <img
                src={equippedAccessory.image_url}
                alt={equippedAccessory.name}
                className="w-12 h-12 rounded-md border p-1 bg-white"
              />
              <p className="text-sm font-semibold">
                Equipped: <strong>{equippedAccessory.name}</strong>
              </p>
            </div>
            <motion.div {...scaleTap}>
              <Button
                className="cursor-pointer"
                onClick={() => mutateUnequip({ petId: pet.id })}
                disabled={isAnyActionPending || isProcessingWardrobe}
                variant="destructive"
                size="sm"
              >
                {isUnequipping && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />} Unequip
              </Button>
            </motion.div>
          </div>
        )}

        {/* Inventory list */}
        {ownedAccessories && ownedAccessories.length > 0 && (
          <div className="space-y-2">
            {ownedAccessories.map((acc) => (
              <div key={acc.id.id} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <img
                    src={acc.image_url}
                    alt={acc.name}
                    className="w-10 h-10 rounded-md border p-1 bg-white"
                  />
                  <p className="text-sm font-medium">{acc.name}</p>
                </div>
                <motion.div {...scaleTap}>
                  <Button
                    className="cursor-pointer"
                    onClick={() =>
                      mutateEquip({
                        petId: pet.id,
                        accessoryId: acc.id.id,
                        accessoryName: acc.name,
                      })
                    }
                    disabled={isAnyActionPending || isProcessingWardrobe}
                    size="sm"
                  >
                    {isEquipping && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />} Equip
                  </Button>
                </motion.div>
              </div>
            ))}
          </div>
        )}

        {/* Mint actions — always visible */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <motion.div {...scaleTap}>
            <Button
              onClick={() => mutateMint()}
              disabled={isAnyActionPending || isProcessingWardrobe}
              className="cursor-pointer w-full"
              size="sm"
            >
              {isMinting ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GlassesIcon className="mr-2 h-4 w-4" />
              )}{" "}
              Glasses
            </Button>
          </motion.div>
          <motion.div {...scaleTap}>
            <Button
              onClick={() => mutateMintHat()}
              disabled={isAnyActionPending || isProcessingWardrobe}
              className="cursor-pointer w-full"
              size="sm"
            >
              {isMintingHat ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <WarehouseIcon className="mr-2 h-4 w-4" />
              )}{" "}
              Hat
            </Button>
          </motion.div>
          <motion.div {...scaleTap}>
            <Button
              onClick={() => mutateMintToy()}
              disabled={isAnyActionPending || isProcessingWardrobe}
              className="cursor-pointer w-full"
              size="sm"
            >
              {isMintingToy ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <WarehouseIcon className="mr-2 h-4 w-4" />
              )}{" "}
              Toy
            </Button>
          </motion.div>
        </div>

        {/* Mint + Equip combos (PTB) — compact icon-only buttons */}
        <TooltipProvider>
          <div className="grid grid-cols-3 gap-2 w-full">
            <motion.div {...scaleTap}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => mutateMintEquip({ petId: pet.id, kind: "glasses" })}
                    disabled={isAnyActionPending || isProcessingWardrobe}
                    className="cursor-pointer w-full"
                    size="sm"
                    variant="secondary"
                  >
                    {isMintEquipping ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <GlassesIcon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mint + Equip Glasses</TooltipContent>
              </Tooltip>
            </motion.div>
            <motion.div {...scaleTap}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => mutateMintEquip({ petId: pet.id, kind: "hat" })}
                    disabled={isAnyActionPending || isProcessingWardrobe}
                    className="cursor-pointer w-full"
                    size="sm"
                    variant="secondary"
                  >
                    {isMintEquipping ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <WarehouseIcon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mint + Equip Hat</TooltipContent>
              </Tooltip>
            </motion.div>
            <motion.div {...scaleTap}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => mutateMintEquip({ petId: pet.id, kind: "toy" })}
                    disabled={isAnyActionPending || isProcessingWardrobe}
                    className="cursor-pointer w-full"
                    size="sm"
                    variant="secondary"
                  >
                    {isMintEquipping ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <WarehouseIcon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mint + Equip Toy</TooltipContent>
              </Tooltip>
            </motion.div>
          </div>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <CardFooter className="flex-col items-start gap-4 border-t pt-4">
      <h3 className="font-bold text-muted-foreground flex items-center gap-2 mx-auto">
        <WarehouseIcon size={16} /> WARDROBE
      </h3>
      <div className="w-full text-center p-2 bg-muted rounded-lg min-h-[72px] flex items-center justify-center">
        {renderContent()}
      </div>
    </CardFooter>
  );
}
