import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { CLOCK_ID, MODULE_NAME, PACKAGE_ID } from "@/constants/contract";

const mutationKeyAdoptPet = ["mutate", "adopt-pet"];

type UseMutateAdoptPetParams = {
  name: string;
};

export function useMutateAdoptPet() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyAdoptPet,
    mutationFn: async ({ name }: UseMutateAdoptPetParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::adopt_pet`,
        arguments: [tx.pure.string(name), tx.object(CLOCK_ID)],
      });

      const result = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest: result.digest,
        options: { showEvents: true, showEffects: true },
      });

      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`Pet adopted successfully! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      console.error("Error adopting pet:", error);
      toast.error(`Error adopting pet: ${error.message}`);
    },
  });
}
