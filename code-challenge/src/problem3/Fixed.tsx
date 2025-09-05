import * as React from "react";
import type { BoxProps } from "@mui/material";

type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // added to type
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

const PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: Blockchain): number =>
  PRIORITY[blockchain] ?? -99;

const formatAmount = (n: number) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(n);

export const WalletPage = ({ ...rest }: Props) => {
  const balances = useWalletBalances() as WalletBalance[]; // ensure hook types
  const prices = usePrices() as Record<string, number>; // e.g. { ETH: 3500, ... }

  // Filter once (positive amounts, known priority); sort by priority desc
  const sortedBalances = React.useMemo(() => {
    return balances
      .filter((b) => getPriority(b.blockchain) > -99 && b.amount > 0)
      .sort((a, b) => {
        const diff = getPriority(b.blockchain) - getPriority(a.blockchain);
        if (diff !== 0) return diff;
        // stable tie-breakers to avoid index keys
        if (a.blockchain !== b.blockchain)
          return a.blockchain.localeCompare(b.blockchain);
        return a.currency.localeCompare(b.currency);
      });
  }, [balances]);

  // Derive formatted values; recompute when prices change
  const formattedBalances: FormattedWalletBalance[] = React.useMemo(() => {
    return sortedBalances.map((b) => {
      const price = prices?.[b.currency] ?? 0;
      const usdValue = price * b.amount;
      return {
        ...b,
        formatted: formatAmount(b.amount),
        usdValue,
      };
    });
  }, [sortedBalances, prices]);

  return (
    <div {...rest}>
      {formattedBalances.map((b) => (
        <WalletRow
          key={`${b.blockchain}:${b.currency}`} // stable key
          className={"row"}
          amount={b.amount}
          usdValue={b.usdValue}
          formattedAmount={b.formatted}
          currency={b.currency}
          blockchain={b.blockchain}
        />
      ))}
    </div>
  );
};
