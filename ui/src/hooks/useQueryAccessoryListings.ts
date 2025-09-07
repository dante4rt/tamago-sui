import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { getSuiObjectFields } from "@/lib/utils";
import type { AccessoryListing, RawAccessoryListingFields } from "@/types/Marketplace";

export const queryKeyAccessoryListings = [
  "marketplace",
  "accessory-listings",
] as const;

export function useQueryAccessoryListings() {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: queryKeyAccessoryListings,
    queryFn: async (): Promise<AccessoryListing[]> => {
      const extractOptionFirst = <T,>(opt: unknown): T | null => {
        if (!opt || typeof opt !== "object") return null;
        const o = opt as { fields?: Record<string, unknown> };
        if (!o.fields || typeof o.fields !== "object") return null;
        const maybeVec = (o.fields as { vec?: unknown }).vec;
        if (Array.isArray(maybeVec)) return (maybeVec[0] as T) ?? null;
        const maybeSome = (o.fields as { some?: unknown }).some;
        if (maybeSome) return maybeSome as T;
        const maybeValue = (o.fields as { value?: unknown }).value;
        if (maybeValue) return maybeValue as T;
        return null;
      };
      // Derive via recent events (robust across indexers)
      const events = await suiClient.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::AccessoryListed` },
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
                const idMaybe = (pj as ListedEventParsed).listing_id ?? (pj as ListedEventParsed).listingId;
                return extractId(idMaybe);
              }
              return null;
            })
            .filter((v: string | null): v is string => v !== null),
        ),
      );
      if (listingIds.length === 0) return [];
      const objs = await suiClient.multiGetObjects({ ids: listingIds, options: { showContent: true } });
      const mapped: AccessoryListing[] = objs
        .map((obj) => getSuiObjectFields<RawAccessoryListingFields>(obj))
        .filter((f): f is RawAccessoryListingFields => !!f)
        .map<AccessoryListing>((f) => {
          type InnerAcc = { fields: { id: { id: string }; name: string; image_url: string } };
          const inner = extractOptionFirst<InnerAcc>(f.accessory);
          const active = !!inner;
          const accessory = inner
            ? {
                id: inner.fields.id.id,
                name: inner.fields.name,
                image_url: inner.fields.image_url,
              }
            : undefined;
          return {
            id: f.id.id,
            seller: f.seller,
            price: Number(f.price),
            active,
            accessory,
          };
        })
        .filter((l: AccessoryListing) => l.active);
      return mapped;
    },
  });
}
