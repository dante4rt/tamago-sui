import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

import { getSuiObjectFields } from "@/lib/utils";
import type { SuiWrappedDynamicField, PetAccessoryStruct } from "@/types/Pet";

export const queryKeyEquippedAccessory = ["owned-equipped-accessory"];

type UseQueryEquippedAccessoryParams = {
  petId?: string;
};

export function useQueryEquippedAccessory({
  petId,
}: UseQueryEquippedAccessoryParams) {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: queryKeyEquippedAccessory,
    queryFn: async () => {
      if (!petId) return;

      const dynamicFields = await suiClient.getDynamicFields({
        parentId: petId,
      });
      const accessoryField = dynamicFields.data.find(
        (field) =>
          field.name.type === "0x1::string::String" &&
          field.name.value === "equipped_item",
      );

      if (!accessoryField) return null;

      const fieldObjectResponse = await suiClient.getDynamicFieldObject({
        parentId: petId,
        name: accessoryField.name,
      });

      const wrappedField =
        getSuiObjectFields<SuiWrappedDynamicField<PetAccessoryStruct>>(
          fieldObjectResponse,
        );

      // Return the fields of the accessory if it exists
      if (wrappedField && wrappedField.value && wrappedField.value.fields)
        return wrappedField.value.fields;

      // If the pet has no accessory equipped, return null
      return null;
    },
    enabled: !!petId,
  });
}
