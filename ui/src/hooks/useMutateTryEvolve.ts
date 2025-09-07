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

const mutationKeyTryEvolve = ["mutate", "try-evolve"] as const;

type UseMutateTryEvolveParams = {
  petId: string;
};

export function useMutateTryEvolve() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyTryEvolve,
    mutationFn: async ({ petId }: UseMutateTryEvolveParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::try_evolve`,
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
      toast.success(`Evolution checked! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      console.error("Error evolving:", error);
      toast.error(`Error: ${error.message}`);
    },
  });
}

