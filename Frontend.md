# ⚛️ Module 2: Building the Frontend (75 minutes)

## Step 1: Setup Frontend Project

```bash
# Go back to root directory (tamagosui)
cd ..

# Create React project with Vite
npm create vite@latest tamagosui-ui -- --template react-ts
cd tamagosui-ui
```

## Step 2: Install Dependencies

```bash
# Core dependencies
npm install @mysten/dapp-kit @mysten/sui.js @tanstack/react-query
npm install @radix-ui/react-progress @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tooltip
npm install class-variance-authority clsx lucide-react next-themes
npm install react-router-dom sonner tailwind-merge tailwindcss @tailwindcss/vite

# Dev dependencies
npm install -D @types/node autoprefixer postcss typescript
```

## Step 3: Configure Environment

Create the file **`.env`** and add:

```env
VITE_PACKAGE_ID=YOUR_PACKAGE_ID_HERE
```

**⚠️ Replace `YOUR_PACKAGE_ID_HERE` with the Package ID from your contract deployment!**

## Step 4: Setup Project Configuration

### Create **`components.json`**:

```typescript
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Update **`vite.config.ts`**:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Update **tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### Update **`/tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Update (`/src/env.d.ts`):

```typescript
/// <reference types="vite/client" />
//
interface ImportMetaEnv {
  readonly VITE_PACKAGE_ID: string;
}
```

## Step 5: Setup Styles

Replace **`src/index.css`** content with:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Step 6: Create Project Structure

```bash
# Create all required directories
mkdir -p src/{components/ui,constants,hooks,pages/home/components,providers,types,lib}
```

## Step 7: Setup Core Files

### Create **`src/constants/contract.ts`**:

```typescript
export const CLOCK_ID: string = "0x6";
export const MODULE_NAME: string = "tamagosui";
export const PACKAGE_ID: string = import.meta.env.VITE_PACKAGE_ID;
```

### Create **`src/networkConfig.ts`**:

```typescript
import { createNetworkConfig } from "@mysten/dapp-kit";

import { getFullnodeUrl } from "@mysten/sui/client";

export const { networkConfig } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl("devnet"),
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
  },
});
```

### Create **`src/types/Pet.ts`**:

```typescript
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
};
```

### Create **`src/lib/utils.ts`**:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { SuiObjectResponse } from "@mysten/sui/client";
import type { RawPetStructFields, PetStruct } from "@/types/Pet";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSuiObjectFields<T>(object: SuiObjectResponse): T | null {
  if (
    object.error ||
    !object.data ||
    object.data.content?.dataType !== "moveObject" ||
    !object.data.content.fields
  )
    return null;

  return object.data.content.fields as T;
}

export function normalizeSuiPetObject(
  object: SuiObjectResponse,
): PetStruct | null {
  const fields = getSuiObjectFields<RawPetStructFields>(object);
  if (!fields) return null;

  return {
    id: fields.id.id,
    name: fields.name,
    image_url: fields.image_url,
    adopted_at: Number(fields.adopted_at),
    stats: {
      energy: fields.stats.fields.energy,
      happiness: fields.stats.fields.happiness,
      hunger: fields.stats.fields.hunger,
    },
    game_data: {
      coins: Number(fields.game_data.fields.coins),
      experience: Number(fields.game_data.fields.experience),
      level: fields.game_data.fields.level,
    },
  } as PetStruct;
}

export function getTimeSinceAdoption(adoptedAt: number) {
  if (!adoptedAt) return "Just adopted";

  const now = new Date();
  const adopted = new Date(adoptedAt); // Already milliseconds in Sui

  const diff = now.getTime() - adopted.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getSuiExplorerUrl(type: "tx" | "object", id: string) {
  return `https://suiscan.xyz/testnet/${type}/${id}`;
}
```

## Step 8: Create Providers

### Create **`src/providers/index.tsx`**:

```typescript
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";

import { networkConfig } from "@/networkConfig";

import "@mysten/dapp-kit/dist/index.css";

const queryClient = new QueryClient();

type AppProviderProps = {
  children: ReactNode;
};

export default function Providers({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

## Step 9: Create Essential UI Components

```
npx shadcn@latest add button card input progress separator sonner tooltip
```

## Step 10: Create Core Hooks

### Create **`src/hooks/useMutateAdoptPet.ts`**:

```typescript
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { CLOCK_ID, MODULE_NAME, PACKAGE_ID } from "@/constants/contract";

const mutationKeyAdoptPet = ["mutate", "adopt-pet"];

type UseMutateAdoptPetParams = {
  name: string;
};

export function useMutateAdoptPet() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeyAdoptPet,
    mutationFn: async ({ name }: UseMutateAdoptPetParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::adopt_pet`,
        arguments: [tx.pure.string(name), tx.object(CLOCK_ID)],
      });

      const result = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest: result.digest,
        options: { showEvents: true, showEffects: true },
      });

      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`Pet adopted successfully! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      console.error("Error adopting pet:", error);
      toast.error(`Error adopting pet: ${error.message}`);
    },
  });
}
```

### Create **`src/hooks/useMutateCheckLevel.ts`**:

```typescript
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";

const mutateKeyCheckAndLevelUp = ["mutate", "check-and-level-up"];

type UseMutateCheckAndLevelUp = {
  petId: string;
};

export function useMutateCheckAndLevelUp() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyCheckAndLevelUp,
    mutationFn: async ({ petId }: UseMutateCheckAndLevelUp) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::check_and_level_up`,
        arguments: [tx.object(petId)],
      });

      const { digest } = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true, showEvents: true },
      });
      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`Level up pet successfully! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      console.error("Error feeding pet:", error);
      toast.error(`Error checking pet level: ${error.message}`);
    },
  });
}
```

### Create **`src/hooks/useMutateEquipAccessory.ts`**:

```typescript
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyOwnedAccessories } from "./useQueryOwnedAccessories";
import { queryKeyEquippedAccessory } from "./useQueryEquippedAccessory";

const mutateKeyEquipAccessory = ["mutate", "equip-accessory"];

type UseMutateEquipAccessory = {
  petId: string;
  accessoryId: string;
};

export function UseMutateEquipAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyEquipAccessory,
    mutationFn: async ({ petId, accessoryId }: UseMutateEquipAccessory) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::equip_accessory`,
        arguments: [tx.object(petId), tx.object(accessoryId)],
      });

      const { digest } = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true, showEvents: true },
      });
      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`Accessory equipped successfully! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedAccessories });
      queryClient.invalidateQueries({ queryKey: queryKeyEquippedAccessory });
    },
    onError: (error) => {
      console.error("Error feeding pet:", error);
      toast.error(`Error equipping accessory: ${error.message}`);
    },
  });
}
```

### Create **`src/hooks/useMutateFeedPet.ts`**:

```typescript
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";

const mutateKeyFeedPet = ["mutate", "feed-pet"];

type UseMutateFeedPetParams = {
  petId: string;
};

export function useMutateFeedPet() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyFeedPet,
    mutationFn: async ({ petId }: UseMutateFeedPetParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::feed_pet`,
        arguments: [tx.object(petId)],
      });

      const { digest } = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true, showEvents: true },
      });
      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`Pet fed successfully! Tx: ${response.digest}`);

      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      console.error("Error feeding pet:", error);
      toast.error(`Error feeding pet: ${error.message}`);
    },
  });
}
```

### Create **`src/hooks/useMutateLetPetSleep.ts`**:

```typescript
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { CLOCK_ID, MODULE_NAME, PACKAGE_ID } from "@/constants/contract";

const mutateKeyLetPetSleep = ["mutate", "let-pet-sleep"];

type UseMutateLetPetSleepParams = {
  petId: string;
};

export function useMutateLetPetSleep() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyLetPetSleep,
    mutationFn: async ({ petId }: UseMutateLetPetSleepParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::let_pet_sleep`,
        arguments: [tx.object(petId), tx.object(CLOCK_ID)],
      });

      const { digest } = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true },
      });
      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`Your pet is now sleeping! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      toast.error(`Failed to let your pet sleep: ${error.message}`);
      console.error("Error letting pet sleep:", error);
    },
  });
}
```

### Create **`src/hooks/useMutateMintAccessory.ts`**:

```typescript
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyOwnedAccessories } from "./useQueryOwnedAccessories";

const mutateKeyMintAccessory = ["mutate", "mint-accessory"];

export function useMutateMintAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyMintAccessory,
    mutationFn: async () => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::mint_accessory`,
      });

      const { digest } = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true, showEvents: true },
      });
      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`Accessory minted successfully! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedAccessories });
    },
    onError: (error) => {
      console.error("Error feeding pet:", error);
      toast.error(`Error minting accessory: ${error.message}`);
    },
  });
}
```

### Create **`src/hooks/useMutatePlayWithPet.ts`**:

```typescript
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";

const mutateKeyPlayWithPet = ["mutate", "play-with-pet"];

type UseMutatePlayWithPetParams = {
  petId: string;
};

export function useMutatePlayWithPet() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyPlayWithPet,
    mutationFn: async ({ petId }: UseMutatePlayWithPetParams) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::play_with_pet`,
        arguments: [tx.object(petId)],
      });

      const { digest } = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true },
      });
      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`You played with your pet! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      console.error("Error playing with pet:", error);
      toast.error(`Error playing with pet: ${error.message}`);
    },
  });
}
```

### Create **`src/hooks/useMutateUnequipAccessory.ts`**:

```typescript
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";
import { queryKeyEquippedAccessory } from "./useQueryEquippedAccessory";
import { queryKeyOwnedAccessories } from "./useQueryOwnedAccessories";

const mutateKeyEquipAccessory = ["mutate", "unequip-accessory"];

type UseMutateUnequipAccessory = {
  petId: string;
};

export function UseMutateUnequipAccessory() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyEquipAccessory,
    mutationFn: async ({ petId }: UseMutateUnequipAccessory) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::unequip_accessory`,
        arguments: [tx.object(petId)],
      });

      const { digest } = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true, showEvents: true },
      });
      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(
        `Accessory unequipped successfully! Tx: ${response.digest}`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedAccessories });
      queryClient.invalidateQueries({ queryKey: queryKeyEquippedAccessory });
    },
    onError: (error) => {
      console.error("Error feeding pet:", error);
      toast.error(`Error unequipping accessory: ${error.message}`);
    },
  });
}
```

### Create **`src/hooks/useMutateWakeUpPet.ts`**:

```typescript
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { CLOCK_ID, MODULE_NAME, PACKAGE_ID } from "@/constants/contract";

const mutateKeyWakeUpPet = ["mutate", "let-pet-sleep"];

type UseMutateWakeUpPet = {
  petId: string;
};

export function useMutateWakeUpPet() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyWakeUpPet,
    mutationFn: async ({ petId }: UseMutateWakeUpPet) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::wake_up_pet`,
        arguments: [tx.object(petId), tx.object(CLOCK_ID)],
      });

      const { digest } = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true },
      });
      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`Your pet has woken up! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      toast.error(`Failed to wake up pet: ${error}`);
      console.error("Failed to wake up pet:", error);
    },
  });
}
```

### Create **`src/hooks/useMutateWorkForCoins.ts`**:

```typescript
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeyOwnedPet } from "./useQueryOwnedPet";
import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";

const mutateKeyWorkForCoins = ["mutate", "work-for-coins"];

type UseMutateWorkForCoins = {
  petId: string;
};

export function useMutateWorkForCoins() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutateKeyWorkForCoins,
    mutationFn: async ({ petId }: UseMutateWorkForCoins) => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::work_for_coins`,
        arguments: [tx.object(petId)],
      });

      const { digest } = await signAndExecute({ transaction: tx });
      const response = await suiClient.waitForTransaction({
        digest,
        options: { showEffects: true },
      });
      if (response?.effects?.status.status === "failure")
        throw new Error(response.effects.status.error);

      return response;
    },
    onSuccess: (response) => {
      toast.success(`Your pet worked for coins! Tx: ${response.digest}`);
      queryClient.invalidateQueries({ queryKey: queryKeyOwnedPet() });
    },
    onError: (error) => {
      console.error("Error working for coins:", error);
      toast.error(`Error working for coins: ${error.message}`);
    },
  });
}
```

### Create **`src/hooks/useQueryEquippedAccessory.ts`**:

```typescript
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
```

### Create **`src/hooks/useQueryGameBalance.ts`**:

```typescript
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { bcs } from "@mysten/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { useQuery } from "@tanstack/react-query";

import { MODULE_NAME, PACKAGE_ID } from "@/constants/contract";

const GameBalanceBCS = bcs.struct("GameBalance", {
  max_stat: bcs.u8(),

  feed_coins_cost: bcs.u64(),
  feed_experience_gain: bcs.u64(),
  feed_hunger_gain: bcs.u8(),

  play_energy_loss: bcs.u8(),
  play_hunger_loss: bcs.u8(),
  play_experience_gain: bcs.u64(),
  play_happiness_gain: bcs.u8(),

  work_energy_loss: bcs.u8(),
  work_happiness_loss: bcs.u8(),
  work_hunger_loss: bcs.u8(),
  work_coins_gain: bcs.u64(),
  work_experience_gain: bcs.u64(),

  sleep_energy_gain_ms: bcs.u64(),
  sleep_hunger_loss_ms: bcs.u64(),
  sleep_happiness_loss_ms: bcs.u64(),

  exp_per_level: bcs.u64(),
});

const queryKeyGameBalance = ["game-balance"];

export function useQueryGameBalance() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: queryKeyGameBalance,
    queryFn: async () => {
      if (!currentAccount) throw new Error("No connected account");

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::get_game_balance`,
      });

      // Dev inspect the transaction to read the return value without executing it on-chain
      const result = await suiClient.devInspectTransactionBlock({
        sender: currentAccount.address,
        transactionBlock: tx,
      });

      // Parse the return value from the dev inspect result
      const returnValues = result.results?.[0]?.returnValues;
      if (!returnValues || returnValues.length === 0)
        throw new Error("Could not read game balance from contract");

      // The return value is a base64-encoded BCS byte array
      const [returnValue] = returnValues; // Expect only one return value
      const rawBytes = returnValue[0]; // Use [0] for data, [1] is type
      const bytes = new Uint8Array(rawBytes);

      // Parse the BCS bytes into a GameBalance object
      const parsedGameBalance = GameBalanceBCS.parse(bytes);
      return parsedGameBalance;
    },
    enabled: !!currentAccount,
    staleTime: Infinity, // Game balance is static, no need to refetch
    gcTime: Infinity, // Cache forever
  });
}
```

### Create **`src/hooks/useQueryOwnedAccessories.ts`**:

```typescript
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
```

### Create **`src/hooks/useQueryOwnedPet.ts`**:

```typescript
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
```

## Step 11: Create Main Components

### Create **`src/components/Header.tsx`**:

```typescript
import { ConnectButton } from "@mysten/dapp-kit";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-2xl font-bold tracking-tighter">TAMAGOSUI</h1>
        <ConnectButton />
      </div>
    </header>
  );
}
```

### Create **`src/pages/home/components/ActionButton.tsx`**:

```typescript
import type { ReactNode } from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

// Helper component for action buttons to avoid repetition
type ActionButtonProps = {
  onClick: () => void;
  disabled: boolean;
  isPending: boolean;
  label: string;
  icon: ReactNode;
};

export function ActionButton({
  onClick,
  disabled,
  isPending,
  label,
  icon,
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full cursor-pointer"
    >
      {isPending ? (
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <div className="mr-2 h-4 w-4">{icon}</div>
      )}
      {label}
    </Button>
  );
}
```

### Create **`src/pages/home/components/StatDisplay.tsx`**:

```typescript
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

// Helper component for individual stat display
type StatDisplayProps = {
  icon: ReactNode;
  label: string;
  value: number;
};

export function StatDisplay({ icon, label, value }: StatDisplayProps) {
  return (
    <Tooltip>
      <TooltipTrigger className="w-full">
        <div className="flex items-center gap-3 w-full">
          <div className="w-6 h-6">{icon}</div>
          <Progress value={value} className="w-full" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {label}: {value} / 100
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
```

### Create **`src/pages/home/components/Wardrobe.tsx`**:

```typescript
import { GlassesIcon, Loader2Icon, WarehouseIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

import { UseMutateEquipAccessory } from "@/hooks/useMutateEquipAccessory";
import { useMutateMintAccessory } from "@/hooks/useMutateMintAccessory";
import { UseMutateUnequipAccessory } from "@/hooks/useMutateUnequipAccessory";
import { useQueryEquippedAccessory } from "@/hooks/useQueryEquippedAccessory";
import { useQueryOwnedAccessories } from "@/hooks/useQueryOwnedAccessories";

import type { PetStruct } from "@/types/Pet";

type WardrobeManagerProps = {
  pet: PetStruct;
  isAnyActionPending: boolean;
};

export function WardrobeManager({
  pet,
  isAnyActionPending,
}: WardrobeManagerProps) {
  // --- Hooks for Actions ---
  const { mutate: mutateMint, isPending: isMinting } = useMutateMintAccessory();
  const { mutate: mutateEquip, isPending: isEquipping } =
    UseMutateEquipAccessory();
  const { mutate: mutateUnequip, isPending: isUnequipping } =
    UseMutateUnequipAccessory();

  // --- Wardrobe Data Fetching Hooks ---
  const { data: ownedAccessories, isLoading: isLoadingAccessories } =
    useQueryOwnedAccessories();
  const { data: equippedAccessory, isLoading: isLoadingEquipped } =
    useQueryEquippedAccessory({ petId: pet.id });

  // A specific loading state for wardrobe actions to disable buttons.
  const isProcessingWardrobe = isMinting || isEquipping || isUnequipping;
  const isLoading = isLoadingAccessories || isLoadingEquipped;

  const renderContent = () => {
    // Priority 1: Handle the loading state first to prevent UI flicker.
    if (isLoading) {
      return (
        <p className="text-sm text-muted-foreground">Loading wardrobe...</p>
      );
    }
    // Priority 2: Check if an accessory is currently equipped. If so, show the "Unequip" UI.
    if (equippedAccessory) {
      return (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <img
              src={equippedAccessory.image_url}
              alt={equippedAccessory.name}
              className="w-12 h-12 rounded-md border p-1 bg-white"
            />
            <p className="text-sm font-semibold">
              Equipped: <strong>{equippedAccessory.name}</strong>
            </p>
          </div>
          <Button
            className="cursor-pointer"
            onClick={() => mutateUnequip({ petId: pet.id })}
            disabled={isAnyActionPending || isProcessingWardrobe}
            variant="destructive"
            size="sm"
          >
            {isUnequipping && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}{" "}
            Unequip
          </Button>
        </div>
      );
    }
    // Priority 3: If nothing is equipped, check the user's wallet inventory.
    if (ownedAccessories && ownedAccessories.length > 0) {
      return (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <img
              src={ownedAccessories[0].image_url}
              alt={ownedAccessories[0].name}
              className="w-12 h-12 rounded-md border p-1 bg-white"
            />
            <p className="text-sm font-semibold">{ownedAccessories[0].name}</p>
          </div>
          <Button
            className="cursor-pointer"
            onClick={() =>
              mutateEquip({
                petId: pet.id,
                accessoryId: ownedAccessories[0].id.id,
              })
            }
            disabled={isAnyActionPending || isProcessingWardrobe}
            size="sm"
          >
            {isEquipping && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}{" "}
            Equip
          </Button>
        </div>
      );
    }
    // Priority 4: If nothing is equipped and inventory is empty, show the "Mint" button.
    return (
      <Button
        onClick={() => mutateMint()}
        disabled={isAnyActionPending || isProcessingWardrobe}
        className="w-full cursor-pointer"
      >
        {isMinting ? (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GlassesIcon className="mr-2 h-4 w-4" />
        )}{" "}
        Mint Cool Glasses
      </Button>
    );
  };

  return (
    <CardFooter className="flex-col items-start gap-4 border-t pt-4">
      <h3 className="font-bold text-muted-foreground flex items-center gap-2 mx-auto">
        <WarehouseIcon size={16} /> WARDROBE
      </h3>
      <div className="w-full text-center p-2 bg-muted rounded-lg min-h-[72px] flex items-center justify-center">
        {renderContent()}
      </div>
    </CardFooter>
  );
}
```

### Create **`src/pages/home/AdoptComponent.tsx`**:

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutateAdoptPet } from "@/hooks/useMutateAdoptPet";
import { Loader2Icon } from "lucide-react";

const INTIAAL_PET_IMAGE_URL =
  "https://tan-kind-lizard-741.mypinata.cloud/ipfs/bafkreidkhjpthergw2tcg6u5r344shgi2cdg5afmhgpf5bv34vqfrr7hni";

export default function AdoptComponent() {
  const [petName, setPetName] = useState("");
  const { mutate: mutateAdoptPet, isPending: isAdopting } = useMutateAdoptPet();

  const handleAdoptPet = () => {
    if (!petName.trim()) return;
    mutateAdoptPet({ name: petName });
  };

  return (
    <Card className="w-full max-w-sm text-center shadow-hard border-2 border-primary">
      <CardHeader>
        <CardTitle className="text-3xl">ADOPT YOUR PET</CardTitle>
        <CardDescription>A new friend awaits!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <img
            src={INTIAAL_PET_IMAGE_URL}
            alt="Your new pet"
            className="w-40 h-40 mx-auto image-rendering-pixelated bg-secondary p-2 border-2 border-primary"
          />
        </div>

        <div className="space-y-2">
          <p className="text-lg">What will you name it?</p>
          <Input
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="Enter pet's name"
            disabled={isAdopting}
            className="text-center text-lg border-2 border-primary focus:ring-2 focus:ring-offset-2 focus:ring-ring"
          />
        </div>

        <div>
          <Button
            onClick={handleAdoptPet}
            disabled={!petName.trim() || isAdopting}
            className="w-full text-lg py-6 border-2 border-primary shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5"
          >
            {isAdopting ? (
              <>
                <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />{" "}
                Adopting...
              </>
            ) : (
              "ADOPT NOW"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Create **`src/pages/home/PetComponent.tsx`**:

<details>
<summary>📋 Click to expand Pet Dashboard component</summary>

```typescript
import { useEffect, useState } from "react";
import {
  CoinsIcon,
  HeartIcon,
  StarIcon,
  Loader2Icon,
  BatteryIcon,
  DrumstickIcon,
  PlayIcon,
  BedIcon,
  BriefcaseIcon,
  ZapIcon,
  ChevronUpIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { StatDisplay } from "./components/StatDisplay";
import { ActionButton } from "./components/ActionButton";
import { WardrobeManager } from "./components/Wardrobe";

import { useMutateCheckAndLevelUp } from "@/hooks/useMutateCheckLevel";
import { useMutateFeedPet } from "@/hooks/useMutateFeedPet";
import { useMutateLetPetSleep } from "@/hooks/useMutateLetPetSleep";
import { useMutatePlayWithPet } from "@/hooks/useMutatePlayWithPet";
import { useMutateWakeUpPet } from "@/hooks/useMutateWakeUpPet";
import { useMutateWorkForCoins } from "@/hooks/useMutateWorkForCoins";
import { useQueryGameBalance } from "@/hooks/useQueryGameBalance";

import type { PetStruct } from "@/types/Pet";

type PetDashboardProps = {
  pet: PetStruct;
};

export default function PetComponent({ pet }: PetDashboardProps) {
  // --- Fetch Game Balance ---
  const { data: gameBalance, isLoading: isLoadingGameBalance } =
    useQueryGameBalance();

  const [displayStats, setDisplayStats] = useState(pet.stats);

  // --- Hooks for Main Pet Actions ---
  const { mutate: mutateFeedPet, isPending: isFeeding } = useMutateFeedPet();
  const { mutate: mutatePlayWithPet, isPending: isPlaying } =
    useMutatePlayWithPet();
  const { mutate: mutateWorkForCoins, isPending: isWorking } =
    useMutateWorkForCoins();

  const { mutate: mutateLetPetSleep, isPending: isSleeping } =
    useMutateLetPetSleep();
  const { mutate: mutateWakeUpPet, isPending: isWakingUp } =
    useMutateWakeUpPet();
  const { mutate: mutateLevelUp, isPending: isLevelingUp } =
    useMutateCheckAndLevelUp();

  useEffect(() => {
    setDisplayStats(pet.stats);
  }, [pet.stats]);

  useEffect(() => {
    // This effect only runs when the pet is sleeping
    if (pet.isSleeping && !isWakingUp && gameBalance) {
      // Start a timer that updates the stats every second
      const intervalId = setInterval(() => {
        setDisplayStats((prev) => {
          const energyPerSecond =
            1000 / Number(gameBalance.sleep_energy_gain_ms);
          const hungerLossPerSecond =
            1000 / Number(gameBalance.sleep_hunger_loss_ms);
          const happinessLossPerSecond =
            1000 / Number(gameBalance.sleep_happiness_loss_ms);

          return {
            energy: Math.min(
              gameBalance.max_stat,
              prev.energy + energyPerSecond,
            ),
            hunger: Math.max(0, prev.hunger - hungerLossPerSecond),
            happiness: Math.max(0, prev.happiness - happinessLossPerSecond),
          };
        });
      }, 1000); // Runs every second

      // IMPORTANT: Clean up the timer when the pet wakes up or the component unmounts
      return () => clearInterval(intervalId);
    }
  }, [pet.isSleeping, isWakingUp, gameBalance]); // Rerun this effect if sleep status or balance changes

  if (isLoadingGameBalance || !gameBalance)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl">Loading Game Rules...</h1>
      </div>
    );

  // --- Client-side UI Logic & Button Disabling ---
  // `isAnyActionPending` prevents the user from sending multiple transactions at once.
  const isAnyActionPending =
    isFeeding || isPlaying || isSleeping || isWorking || isLevelingUp;

  // These `can...` variables mirror the smart contract's rules (`assert!`) on the client-side.
  const canFeed =
    !pet.isSleeping &&
    pet.stats.hunger < gameBalance.max_stat &&
    pet.game_data.coins >= Number(gameBalance.feed_coins_cost);
  const canPlay =
    !pet.isSleeping &&
    pet.stats.energy >= gameBalance.play_energy_loss &&
    pet.stats.hunger >= gameBalance.play_hunger_loss;
  const canWork =
    !pet.isSleeping &&
    pet.stats.energy >= gameBalance.work_energy_loss &&
    pet.stats.happiness >= gameBalance.work_happiness_loss &&
    pet.stats.hunger >= gameBalance.work_hunger_loss;
  const canLevelUp =
    !pet.isSleeping &&
    pet.game_data.experience >=
      pet.game_data.level * Number(gameBalance.exp_per_level);

  return (
    <TooltipProvider>
      <Card className="w-full max-w-sm shadow-hard border-2 border-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">{pet.name}</CardTitle>
          <CardDescription className="text-lg">
            Level {pet.game_data.level}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pet Image */}
          <div className="flex justify-center">
            <img
              src={pet.image_url}
              alt={pet.name}
              className="w-36 h-36 rounded-full border-4 border-primary/20 object-cover"
            />
          </div>

          {/* Game & Stats Data */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2">
                  <CoinsIcon className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold">{pet.game_data.coins}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Coins</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2">
                  <span className="font-bold">{pet.game_data.experience}</span>
                  <StarIcon className="w-5 h-5 text-purple-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Experience Points (XP)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Stat Bars */}
            <div className="space-y-2">
              <StatDisplay
                icon={<BatteryIcon className="text-green-500" />}
                label="Energy"
                value={displayStats.energy}
              />
              <StatDisplay
                icon={<HeartIcon className="text-pink-500" />}
                label="Happiness"
                value={displayStats.happiness}
              />
              <StatDisplay
                icon={<DrumstickIcon className="text-orange-500" />}
                label="Hunger"
                value={displayStats.hunger}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => mutateLevelUp({ petId: pet.id })}
              disabled={!canLevelUp || isAnyActionPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLevelingUp ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronUpIcon className="mr-2 h-4 w-4" />
              )}
              Level Up!
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              onClick={() => mutateFeedPet({ petId: pet.id })}
              disabled={!canFeed || isAnyActionPending}
              isPending={isFeeding}
              label="Feed"
              icon={<DrumstickIcon />}
            />
            <ActionButton
              onClick={() => mutatePlayWithPet({ petId: pet.id })}
              disabled={!canPlay || isAnyActionPending}
              isPending={isPlaying}
              label="Play"
              icon={<PlayIcon />}
            />
            <div className="col-span-2">
              <ActionButton
                onClick={() => mutateWorkForCoins({ petId: pet.id })}
                disabled={!canWork || isAnyActionPending}
                isPending={isWorking}
                label="Work"
                icon={<BriefcaseIcon />}
              />
            </div>
          </div>
          <div className="col-span-2 pt-2">
            {pet.isSleeping ? (
              <Button
                onClick={() => mutateWakeUpPet({ petId: pet.id })}
                disabled={isWakingUp}
                className="w-full bg-yellow-500 hover:bg-yellow-600"
              >
                {isWakingUp ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ZapIcon className="mr-2 h-4 w-4" />
                )}{" "}
                Wake Up!
              </Button>
            ) : (
              <Button
                onClick={() => mutateLetPetSleep({ petId: pet.id })}
                disabled={isAnyActionPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSleeping ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BedIcon className="mr-2 h-4 w-4" />
                )}{" "}
                Sleep
              </Button>
            )}
          </div>
        </CardContent>
        <WardrobeManager
          pet={pet}
          isAnyActionPending={isAnyActionPending || pet.isSleeping}
        />
      </Card>
    </TooltipProvider>
  );
}
```

</details>

## Step 12: Create Main Pages

### Create **`src/pages/home/index.tsx`**:

```typescript
import { useQueryOwnedPet } from "@/hooks/useQueryOwnedPet";
import { useCurrentAccount } from "@mysten/dapp-kit";
import AdoptComponent from "./AdoptComponent";
import PetComponent from "./PetComponent";
import Header from "@/components/Header";

export default function HomePage() {
  const currentAccount = useCurrentAccount();
  const { data: ownedPet, isPending: isOwnedPetLoading } = useQueryOwnedPet();

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 pt-24">
        {!currentAccount ? (
          <div className="text-center p-8 border-4 border-primary bg-background shadow-[8px_8px_0px_#000]">
            <h2 className="text-4xl uppercase">Please Connect Wallet</h2>
          </div>
        ) : isOwnedPetLoading ? (
          <div className="text-center p-8 border-4 border-primary bg-background shadow-[8px_8px_0px_#000]">
            <h2 className="text-4xl uppercase">Loading Pet...</h2>
          </div>
        ) : ownedPet ? (
          <PetComponent pet={ownedPet} />
        ) : (
          <AdoptComponent />
        )}
      </main>
    </div>
  );
}
```

### Update **`src/App.tsx`**:

```typescript
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Providers from "./providers";
import HomePage from "./pages/home";
import { Toaster } from "./components/ui/sonner";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <Toaster />
    </Providers>
  );
}

export default App;
```

## Step 13: Run the Application

```bash
# Start development server
npm run dev
```

Open your browser to `http://localhost:5173` and you should see your TamagoSui app!

---

# 🎯 Module 3: Testing & Demo (15 minutes)

## Live Demo Flow

### 1. **Connect Wallet**

- Connect your Sui wallet to testnet
- Ensure you have test tokens

### 2. **Adopt Pet**

- Enter a pet name
- Submit adoption transaction
- Pet appears with initial stats

### 3. **Interact with Pet**

- **Feed**: Costs 5 coins, increases hunger (+20), gains XP (+5)
- **Play**: Uses energy (-15), hunger (-15), increases happiness (+25), gains XP (+10)
- **Work**: Uses energy (-20), happiness (-20), hunger (-20), gains coins (+10), XP (+15)
- **Sleep**: Pet sleeps, recovers energy over time (1 per second)
- **Wake Up**: Calculate time-based stat changes
- **Level Up**: Available when XP ≥ level \* 100

### 4. **Observe Dynamic Fields**

- Sleep state stored/removed dynamically
- Pet image changes based on state and level
- Real-time updates in UI
- Progress bars show current stats

---

# 🎮 Key Gaming Features Demonstrated

## 1. **Dynamic Fields in Action**

### Sleep System:

```move
// When pet sleeps - add dynamic field
dynamic_field::add(&mut pet.id, b"sleep_started_at", timestamp);

// When pet wakes - remove dynamic field + calculate stats
let sleep_time = dynamic_field::remove<String, u64>(&mut pet.id, key);
```

### Equipment System:

```move
// Store accessory in pet object
dynamic_field::add(&mut pet.id, b"equipped_item", accessory);
```

## 2. **Object-Centric Benefits**

- **True Ownership**: Pet NFT belongs to user
- **Composability**: Pet can "own" accessories via dynamic fields
- **Flexibility**: Add features without schema changes
- **Efficiency**: Pay only for storage you use

## 3. **Real-time Gaming**

- All stat changes happen in single transaction
- No complex state synchronization needed
- Immediate UI updates via React Query
- Sub-second transaction finality on Sui

---

# 🏆 Workshop Summary

## What We Built

✅ **Complete Virtual Pet Game**  
✅ **Dynamic Fields Implementation**  
✅ **Object-Centric Architecture**  
✅ **Real-time Frontend Integration**  
✅ **Sui Gaming Best Practices**

## Key Takeaways

### For Developers:

- **Dynamic Fields** = Flexible, efficient storage
- **Object-Centric Model** = True ownership + composability
- **Move Language** = Safe, resource-oriented programming
- **Sui dApp Kit** = Easy blockchain integration

### For Gaming:

- **Lower Costs** = More sustainable game economies
- **Real-time Updates** = Better user experience
- **True Ownership** = Players own their assets
- **Extensibility** = Easy to add new features

---

# 🚀 Next Steps

## Immediate Actions:

1. ✅ Complete the workshop implementation
2. ✅ Deploy your contract to testnet
3. ✅ Test all pet interactions
4. ✅ Explore Sui Explorer for your transactions

## Advanced Features to Add:

- **Breeding System**: Combine pets to create new ones
- **Marketplace**: Trade pets and accessories
- **Battles**: Pet vs pet combat system
- **Quests**: Story-driven gameplay
- **Guilds**: Multiplayer features

## Learning Resources:

- 📚 [Sui Documentation](https://docs.sui.io)
- 🎮 [Move Book](https://move-book.com)
- 💬 [Sui Discord](https://discord.gg/sui)
- 🐦 [Sui Twitter](https://twitter.com/SuiNetwork)
- 🔍 [Sui Explorer](https://suiscan.xyz/testnet)

---

# ❓ Troubleshooting

## Common Issues:

### 1. **Package ID Error**

```bash
# Make sure .env.local has correct Package ID
VITE_PACKAGE_ID=0x123abc...
```

### 2. **Build Errors**

```bash
# Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install
```

### 3. **Transaction Failures**

- Ensure wallet connected to testnet
- Check sufficient gas balance
- Verify contract deployed correctly
- Check pet has enough energy/coins for actions

### 4. **Dynamic Fields Not Working**

- Check if pet exists in your wallet
- Verify Package ID matches deployed contract
- Ensure proper transaction completion

### 5. **Missing Hooks**

Remember to create all the missing hook files:

- `useMutatePlayWithPet.ts`
- `useMutateWorkForCoins.ts`
- `useMutateLetPetSleep.ts`
- `useMutateWakeUpPet.ts`
- `useMutateCheckLevel.ts`

---

# 🎉 Congratulations!

You've successfully built **TamagoSui** - a complete virtual pet game showcasing Sui's gaming advantages!

**You now understand:**

- ✅ Dynamic Fields for flexible game data
- ✅ Object-centric architecture for true ownership
- ✅ Move programming for secure smart contracts
- ✅ Real-time blockchain gaming integration

## Keep Building! 🚀

The gaming industry is just getting started on blockchain. With Sui's unique features, you're well-equipped to build the next generation of on-chain games.

**Happy Gaming on Sui! 🎮⚡**

---
