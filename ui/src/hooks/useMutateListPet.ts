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
import { queryKeyPetListings } from "./useQueryPetListings";

type Params = { petId: string; price: number };

export function useMutateListPet() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, price }: Params) => {
      if (!currentAccount) throw new Error("No connected account");
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::list_pet`,
        arguments: [tx.object(petId), tx.pure.u64(price)],
      });
      const { digest } = await signAndExecute({ transaction: tx });
      const res = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true },
      });
      if (res?.effects?.status.status === "failure")
        throw new Error(res.effects.status.error);
      return res;
    },
    onSuccess: (response) => {
      toast.success(`Pet listed! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
      queryClient.invalidateQueries({ queryKey: queryKeyPetListings });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

