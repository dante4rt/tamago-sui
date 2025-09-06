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

const mutateKeyMintToy = ["mutate", "mint-toy"];

export function useMutateMintToy() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyMintToy,
    mutationFn: async () => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::mint_toy`,
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
      toast.success(`Toy minted! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedAccessories });
    },
    onError: (error) => {
      console.error("Error minting toy:", error);
      toast.error(`Error minting toy: ${error.message}`);
    },
  });
}

