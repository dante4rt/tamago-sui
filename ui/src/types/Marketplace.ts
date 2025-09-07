export type RawOptionVec<T> = { fields: { vec: T[] } };

export type RawPetListingFields = {
  id: { id: string };
  seller: string;
  price: string | number;
  pet?: {
    fields: {
      id: { id: string };
      name: string;
      image_url: string;
      adopted_at: string | number;
      stats: { fields: { energy: number; happiness: number; hunger: number } };
      game_data: {
        fields: { coins: number; experience: number; level: number };
      };
      personality: number;
    };
  };
};

export type RawAccessoryListingFields = {
  id: { id: string };
  seller: string;
  price: string | number;
  accessory?: {
    fields: {
      id: { id: string };
      name: string;
      image_url: string;
    };
  };
};

export type PetListing = {
  id: string;
  seller: string;
  price: number;
  active: boolean;
  pet?: {
    id: string;
    name: string;
    image_url: string;
    level: number;
  };
};

export type AccessoryListing = {
  id: string;
  seller: string;
  price: number;
  active: boolean;
  accessory?: {
    id: string;
    name: string;
    image_url: string;
  };
};

