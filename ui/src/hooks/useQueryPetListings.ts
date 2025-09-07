import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { getSuiObjectFields } from "@/lib/utils";
import type { PetListing, RawPetListingFields } from "@/types/Marketplace";

export const queryKeyPetListings = ["marketplace", "pet-listings"] as const;

export function useQueryPetListings() {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: queryKeyPetListings,
    queryFn: async (): Promise<PetListing[]> => {
      // Derive by recent events
      const eventType = `${PACKAGE_ID}::${MODULE_NAME}::PetListed`;

      const events = await suiClient.queryEvents({
        query: { MoveEventType: eventType },
        limit: 50,
      });

      type IdMaybe = string | { id?: string } | { bytes?: string };
      type ListedEventParsed = { listing_id?: IdMaybe; listingId?: IdMaybe };
      const extractId = (v: IdMaybe | undefined): string | null => {
        if (!v) return null;
        if (typeof v === "string") return v;
        const obj = v as Record<string, unknown>;
        const id = (obj.id ?? obj.bytes) as string | undefined;
        return typeof id === "string" ? id : null;
      };
      const listingIds = Array.from(
        new Set(
          events.data
            .map((e): string | null => {
              const pj = (e as { parsedJson?: unknown }).parsedJson;
              if (pj && typeof pj === "object") {
                const idMaybe =
                  (pj as ListedEventParsed).listing_id ?? (pj as ListedEventParsed).listingId;
                return extractId(idMaybe);
              }
              return null;
            })
            .filter((v: string | null): v is string => v !== null)
        )
      );

      if (listingIds.length === 0) {
        return [];
      }

      const objs = await suiClient.multiGetObjects({
        ids: listingIds,
        options: { showContent: true },
      });

      const mapped: PetListing[] = objs
        .map((obj) => {
          const fields = getSuiObjectFields<RawPetListingFields>(obj);

          return fields;
        })
        .filter((f): f is RawPetListingFields => {
          const isValid = !!f;

          return isValid;
        })
        .map<PetListing>((f) => {
          // The pet field is either null/undefined (sold/cancelled) or a direct Pet object
          const petData = f.pet;
          let active = false;
          let pet = undefined;

          if (petData && petData.fields) {
            active = true;
            pet = {
              id: petData.fields.id.id,
              name: petData.fields.name,
              image_url: petData.fields.image_url,
              level: petData.fields.game_data.fields.level,
            };
          }

          const listing = {
            id: f.id.id,
            seller: f.seller,
            price: Number(f.price),
            active,
            pet,
          };

          return listing;
        })
        .filter((l: PetListing) => {
          return l.active;
        });

      return mapped;
    },
  });
}
