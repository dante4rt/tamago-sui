import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyPetListings } from "./useQueryPetListings";

type Params = { listingId: string };

export function useMutateCancelPetListing() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId }: Params) => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::cancel_pet_listing`,
        arguments: [tx.object(listingId)],
      });
      const { digest } = await signAndExecute({ transaction: tx });
      const res = await suiClient.waitForTransaction({ digest, options: { showEffects: true } });
      if (res?.effects?.status.status === "failure")
        throw new Error(res.effects.status.error);
      return res;
    },
    onSuccess: (res) => {
      toast.success(`Listing canceled! Tx: ${res.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyPetListings });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

