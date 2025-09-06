import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyEquippedAccessory } from "./useQueryEquippedAccessory";
import { queryKeyOwnedAccessories } from "./useQueryOwnedAccessories";

const mutateKeyEquipAccessory = ["mutate", "unequip-accessory"];

type UseMutateUnequipAccessory = {
  petId: string;
};

export function UseMutateUnequipAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyEquipAccessory,
    mutationFn: async ({ petId }: UseMutateUnequipAccessory) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::unequip_accessory`,
        arguments: [tx.object(petId)],
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
      toast.success(
        `Accessory unequipped successfully! Tx: ${response.digest}`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedAccessories });
      queryClient.invalidateQueries({ queryKey: queryKeyEquippedAccessory });
    },
    onError: (error) => {
      console.error("Error feeding pet:", error);
      toast.error(`Error unequipping accessory: ${error.message}`);
    },
  });
}
