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

const mutationKeyComboCare = ["mutate", "combo-care"] as const;

type UseMutateComboCareParams = {
  petId: string;
  withLevelCheck?: boolean;
};

// Feed + Play (+ optional Check Level) in a single PTB
export function useMutateComboCare() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyComboCare,
    mutationFn: async ({ petId, withLevelCheck }: UseMutateComboCareParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::feed_pet`,
        arguments: [tx.object(petId)],
      });
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::play_with_pet`,
        arguments: [tx.object(petId)],
      });
      if (withLevelCheck) {
        tx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAME}::check_and_level_up`,
          arguments: [tx.object(petId)],
        });
      }

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
      toast.success(`Care combo executed! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      console.error("Error running care combo:", error);
      toast.error(`Error: ${error.message}`);
    },
  });
}

