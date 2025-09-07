import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyAccessoryListings } from "./useQueryAccessoryListings";
import { queryKeyOwnedAccessories } from "./useQueryOwnedAccessories";

type Params = { listingId: string; price: number };

export function useMutateBuyAccessory() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, price }: Params) => {
      const tx = new Transaction();
      const payment = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::buy_listed_accessory`,
        arguments: [tx.object(listingId), payment],
      });
      const { digest } = await signAndExecute({ transaction: tx });
      const res = await suiClient.waitForTransaction({ digest, options: { showEffects: true } });
      if (res?.effects?.status.status === "failure")
        throw new Error(res.effects.status.error);
      return res;
    },
    onSuccess: (res) => {
      toast.success(`Accessory purchased! Tx: ${res.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyAccessoryListings });
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedAccessories });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

