import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyPetListings } from "./useQueryPetListings";
import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import type { PetListing } from "@/types/Marketplace";

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
      const res = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true, showEvents: true }
      });
      if (res?.effects?.status.status === "failure")
        throw new Error(res.effects.status.error);
      return res;
    },
    onMutate: async ({ listingId }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeyPetListings });

      // Snapshot the previous value
      const previousListings = queryClient.getQueryData<PetListing[]>(queryKeyPetListings);

      // Optimistically update to remove the listing
      queryClient.setQueryData<PetListing[]>(queryKeyPetListings, (old) => {
        if (!old) return old;
        return old.filter((listing) => listing.id !== listingId);
      });

      // Return a context object with the snapshotted value
      return { previousListings };
    },
    onError: (err, _listingId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousListings) {
        queryClient.setQueryData(queryKeyPetListings, context.previousListings);
      }
      toast.error(`Failed to cancel listing: ${err.message}`);
    },
    onSuccess: (res) => {
      toast.success(`Listing canceled! Tx: ${res.digest}`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeyPetListings });
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
  });
}

