import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { queryKeyOwnedAccessories } from "./useQueryOwnedAccessories";
import { queryKeyEquippedAccessory } from "./useQueryEquippedAccessory";

const mutationKeyMintEquip = ["mutate", "mint-and-equip"] as const;

type AccessoryKind = "glasses" | "hat" | "toy";

type UseMutateMintAndEquipParams = {
  petId: string;
  kind: AccessoryKind;
};

// Mint an accessory and equip it to the pet in a single PTB
export function useMutateMintAndEquip() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyMintEquip,
    mutationFn: async ({ petId, kind }: UseMutateMintAndEquipParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();

      let result;
      if (kind === "hat") {
        result = tx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAME}::mint_hat`,
          arguments: [],
        });
      } else if (kind === "toy") {
        result = tx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAME}::mint_toy`,
          arguments: [],
        });
      } else {
        result = tx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAME}::mint_accessory`,
          arguments: [],
        });
      }

      // Map JS kind to on-chain numeric kind
      const kindNum = kind === "hat" ? 2 : kind === "toy" ? 3 : 1;

      // Equip using the newly minted accessory (result is the object)
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::equip_accessory_with_kind`,
        arguments: [tx.object(petId), result, tx.pure.u8(kindNum)],
      });

      const { digest } = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true, showEvents: true },
      });
      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`Minted and equipped! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedAccessories });
      queryClient.invalidateQueries({ queryKey: queryKeyEquippedAccessory });
    },
    onError: (error) => {
      console.error("Error mint+equip:", error);
      toast.error(`Error: ${error.message}`);
    },
  });
}

