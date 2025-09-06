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
