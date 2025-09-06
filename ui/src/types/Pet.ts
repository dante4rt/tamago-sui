type PetStructGameData = {
  coins: number;
  experience: number;
  level: number;
};

type PetStructStats = {
  energy: number;
  happiness: number;
  hunger: number;
};

export type PetStruct = {
  id: string;
  name: string;
  adopted_at: number;
  image_url: string;
  stats: PetStructStats;
  game_data: PetStructGameData;
  personality: number; // 0 Balanced, 1 Athletic, 2 Studious, 3 Lazy

  // Dynamic Fields
  isSleeping: boolean;
};

export type PetAccessoryStruct = {
  id: { id: string };
  name: string;
  image_url: string;
};

export type SuiWrappedDynamicField<T> = {
  id: { id: string };
  name: any;
  value: {
    fields: T;
  };
};

export type RawPetStructFields = {
  id: { id: string };
  name: string;
  image_url: string;
  adopted_at: string;
  stats: { fields: { energy: number; happiness: number; hunger: number } };
  game_data: { fields: { coins: number; experience: number; level: number } };
  personality: number;
};
