import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CLOCK_ID, MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyOwnedPet } from "./useQueryOwnedPet";

const mutationKeyMorning = ["mutate", "morning-routine"] as const;

type UseMutateMorningRoutineParams = {
  petId: string;
  includePlay?: boolean;
};

// Morning Routine: Wake up → Feed → (optional) Play
// Precondition: Only use when pet is actually sleeping to avoid assert.
export function useMutateMorningRoutine() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyMorning,
    mutationFn: async ({ petId, includePlay }: UseMutateMorningRoutineParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::wake_up_pet`,
        arguments: [tx.object(petId), tx.object(CLOCK_ID)],
      });
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::feed_pet`,
        arguments: [tx.object(petId)],
      });
      if (includePlay) {
        tx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAME}::play_with_pet`,
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
      toast.success(`Morning routine done! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      console.error("Error running morning routine:", error);
      toast.error(`Error: ${error.message}`);
    },
  });
}

