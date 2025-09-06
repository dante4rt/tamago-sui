import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { getSuiObjectFields } from "@/lib/utils";
import type { PetAccessoryStruct } from "@/types/Pet";

export const queryKeyOwnedAccessories = ["owned-accessories"];

export function useQueryOwnedAccessories() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: queryKeyOwnedAccessories,
    queryFn: async () => {
      if (!currentAccount) return [];

      const objects = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::${MODULE_NAME}::PetAccessory`,
        },
        options: { showContent: true },
      });

      return objects.data
        .map((obj) => getSuiObjectFields(obj))
        .filter((fields): fields is PetAccessoryStruct => fields !== null);
    },
    enabled: !!currentAccount,
  });
}
