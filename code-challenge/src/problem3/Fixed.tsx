import * as React from "react";
import type { BoxProps } from "@mui/material";

type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
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
const getPriority = (b: Blockchain) => PRIORITY[b] ?? -99;

const fmt = (n: number, min = 2, max = 6) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }).format(n);

export const WalletPage: React.FC<Props> = (props: Props) => {
  const { ...rest } = props;
  const balances = useWalletBalances() as WalletBalance[];
  const prices = usePrices() as Record<string, number>;

  const sortedBalances = React.useMemo(() => {
    return balances
      .filter((b) => getPriority(b.blockchain) > -99 && b.amount > 0)
      .sort((a, b) => {
        const ap = getPriority(a.blockchain);
        const bp = getPriority(b.blockchain);
        if (ap > bp) return -1;
        if (ap < bp) return 1;
        return a.currency.localeCompare(b.currency);
      });
  }, [balances]);

  const formattedBalances = React.useMemo<FormattedWalletBalance[]>(() => {
    return sortedBalances.map((b) => {
      const price = prices[b.currency] ?? 0;
      const usdValue = price * b.amount;
      return { ...b, formatted: fmt(b.amount), usdValue };
    });
  }, [sortedBalances, prices]);

  const rows = formattedBalances.map((balance) => {
    return (
      <WalletRow
        className={"row"}
        key={`${balance.blockchain}:${balance.currency}`}
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};
