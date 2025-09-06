import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { normalizeSuiPetObject } from "@/lib/utils";

export const queryKeyOwnedPet = (address?: string) => {
  if (address) return ["owned-pet", address];
  return ["owned-pet"];
};

export function useQueryOwnedPet() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: queryKeyOwnedPet(currentAccount?.address),
    queryFn: async () => {
      if (!currentAccount) throw new Error("No connected account");

      // First, get the main pet object
      const petResponse = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: { StructType: `${PACKAGE_ID}::${MODULE_NAME}::Pet` },
        options: { showContent: true },
      });
      if (petResponse.data.length === 0) return null;

      const petObject = petResponse.data[0];
      const normalizedPet = normalizeSuiPetObject(petObject);

      if (!normalizedPet) return null;

      const dynamicFields = await suiClient.getDynamicFields({
        parentId: normalizedPet.id,
      });

      const isSleeping = dynamicFields.data.some(
        (field) =>
          field.name.type === "0x1::string::String" &&
          field.name.value === "sleep_started_at",
      );

      return { ...normalizedPet, isSleeping };
    },
    enabled: !!currentAccount,
  });
}
