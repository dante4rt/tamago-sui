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
