import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyAccessoryListings } from "./useQueryAccessoryListings";
import { queryKeyOwnedAccessories } from "./useQueryOwnedAccessories";

type Params = { accessoryId: string; price: number };

export function useMutateListAccessory() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessoryId, price }: Params) => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::list_accessory`,
        arguments: [tx.object(accessoryId), tx.pure.u64(price)],
      });
      const { digest } = await signAndExecute({ transaction: tx });
      const res = await suiClient.waitForTransaction({ digest, options: { showEffects: true } });
      if (res?.effects?.status.status === "failure")
        throw new Error(res.effects.status.error);
      return res;
    },
    onSuccess: (res) => {
      toast.success(`Accessory listed! Tx: ${res.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedAccessories });
      queryClient.invalidateQueries({ queryKey: queryKeyAccessoryListings });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

