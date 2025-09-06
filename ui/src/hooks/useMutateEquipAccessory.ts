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
import { queryKeyOwnedAccessories } from "./useQueryOwnedAccessories";
import { queryKeyEquippedAccessory } from "./useQueryEquippedAccessory";

const mutateKeyEquipAccessory = ["mutate", "equip-accessory"];

type UseMutateEquipAccessory = {
  petId: string;
  accessoryId: string;
  accessoryName?: string;
};

export function UseMutateEquipAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyEquipAccessory,
    mutationFn: async ({ petId, accessoryId, accessoryName }: UseMutateEquipAccessory) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      // Map simple name to kind: 1 glasses, 2 hat, 3 toy
      const lower = (accessoryName || "").toLowerCase();
      const kind = lower.includes("hat")
        ? 2
        : lower.includes("toy")
          ? 3
          : 1;

      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::equip_accessory_with_kind`,
        arguments: [tx.object(petId), tx.object(accessoryId), tx.pure.u8(kind)],
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
      toast.success(`Accessory equipped successfully! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedAccessories });
      queryClient.invalidateQueries({ queryKey: queryKeyEquippedAccessory });
    },
    onError: (error) => {
      console.error("Error equipping accessory:", error);
      toast.error(`Error equipping accessory: ${error.message}`);
    },
  });
}
