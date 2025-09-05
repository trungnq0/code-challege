## 1. Missing field on `WalletBalance`

**Issue**: `WalletBalance` lacks `blockchain`, yet it’s used (e.g., `balance.blockchain`).  
**Fix**:

```ts
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}
```

---

## 2. `getPriority` uses `any`

**Issue**: `getPriority(blockchain: any)` loses type safety.  
**Fix**:

```ts
const PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
const getPriority = (blockchain: Blockchain) => PRIORITY[blockchain] ?? -99;
```

---

## 3. Unused `children`

**Issue**: `children` is destructured but not used.  
**Fix**: Remove from destructuring (or render it if intended).

```ts
const { /* children, */ ...rest } = props;
```

---

## 4. `BoxProps` import not shown

**Issue**: `Props extends BoxProps` without import may fail.  
**Fix**:

```ts
import type { BoxProps } from "@mui/material";
interface Props extends BoxProps {}
```

---

## 5. `balances` / `prices` lack explicit types

**Issue**: Makes usage error-prone (e.g., expects `blockchain`, `prices[symbol]`).  
**Fix**:

```ts
const balances: WalletBalance[] = useWalletBalances();
const prices: Record<string, number> = usePrices();
```

---

## 6. Undefined variable and inverted filter logic

**Issue**: Uses `lhsPriority` (undefined) instead of `balancePriority`; keeps `amount <= 0`.  
**Fix**:

```ts
const filtered = balances.filter(
  (b) => getPriority(b.blockchain) > -99 && b.amount > 0
);
```

---

## 7. Sort comparator can return `undefined`

**Issue**: No `return 0` for equal priority → unstable sort.  
**Fix**:

```ts
.sort((a, b) => {
  const ap = getPriority(a.blockchain);
  const bp = getPriority(b.blockchain);
  if (ap > bp) return -1;
  if (ap < bp) return 1;
  return a.currency.localeCompare(b.currency); // tie-breaker
})
```

---

## 8. `useMemo` has an extra dependency

**Issue**: `prices` is in `[balances, prices]` but not used → needless recomputes.  
**Fix**: Depend only on what’s used.

```ts
const sortedBalances = useMemo(() => {
  /* ... */
}, [balances]);
```

---

## 9. `formattedBalances` computed but never used

**Issue**: Dead work.  
**Fix**: Either use it to render, or remove the computation. (In refactor we use it.)

---

## 10. Type mismatch in `rows` map

**Issue**: `sortedBalances.map((balance: FormattedWalletBalance, ...)` even though items are `WalletBalance`; then `balance.formatted` is accessed but doesn’t exist.  
**Fix**: Map to `FormattedWalletBalance` first **or** use correct type when rendering.

---

## 11. Potential `NaN` for `usdValue`

**Issue**: `prices[balance.currency]` may be `undefined`.  
**Fix**:

```ts
const price = prices[balance.currency] ?? 0;
const usdValue = price * balance.amount;
```

---

## 12. `index` used as React `key`

**Issue**: Causes bad reconciliation on reorders.  
**Fix**: Use a stable domain key.

```tsx
key={`${balance.blockchain}:${balance.currency}`}
```

---

## 13. `classes.row` not defined/imported

**Issue**: Will throw at runtime.  
**Fix**: Ensure `classes` exists or replace with a string/class you own.

---

## 14. `toFixed()` with no precision

**Issue**: Defaults to `0` decimals; usually wrong for token amounts.  
**Fix**:

```ts
const formatted = balance.amount.toFixed(2); // or use Intl.NumberFormat
```

---

## 15. Minor: `getPriority` recreated every render

**Issue**: Not a big perf issue, but can move outside component for clarity.  
**Fix**: Define it at module scope (as in section #2).

---
