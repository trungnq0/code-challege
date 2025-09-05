import { useMemo, useState } from "react";
import useSWR from "swr";
import "./App.css";

const PRICES_URL = "https://interview.switcheo.com/prices.json";
const fetcher = (url) => fetch(url).then((res) => res.json());
const iconUrl = (symbol) =>
  symbol
    ? `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`
    : "";

function App() {
  const { data, error, isLoading } = useSWR(PRICES_URL, fetcher, {
    refreshInterval: 30000,
  });

  const latestPrices = useMemo(() => {
    if (!Array.isArray(data)) return {};
    const map = {};
    for (const item of data) {
      if (!item || !item.currency || typeof item.price !== "number") continue;
      const existing = map[item.currency];
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        map[item.currency] = { price: item.price, date: item.date };
      }
    }
    return map;
  }, [data]);

  const currencies = useMemo(
    () => Object.keys(latestPrices).sort(),
    [latestPrices]
  );

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("USDC");
  const [amount, setAmount] = useState("1");
  const [history, setHistory] = useState([]);

  const fromPrice = latestPrices[fromCurrency]?.price ?? 0;
  const toPrice = latestPrices[toCurrency]?.price ?? 0;
  const rate = fromPrice && toPrice ? fromPrice / toPrice : 0;
  const outputAmount = amount && rate ? Number(amount) * rate : 0;

  const amountNumber = Number(amount);
  const isAmountValid = Number.isFinite(amountNumber) && amountNumber > 0;
  const hasPrices = fromPrice > 0 && toPrice > 0;
  const isPairValid = fromCurrency && toCurrency && fromCurrency !== toCurrency;
  const isValidSwap = isAmountValid && hasPrices && isPairValid;

  return (
    <div className="swap-container">
      <h1>Currency Swap</h1>
      <div className="status">
        {isLoading && <span>Loading prices…</span>}
        {error && <span className="error">Failed to load prices</span>}
        {!isLoading && !error && (
          <span>Prices updated: {new Date().toLocaleTimeString()}</span>
        )}
      </div>

      <div className="layout">
        <div className="left">
          <div className="swap-card">
            <div className="field">
              <label>From</label>
              <div className="row">
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onBlur={() => {
                    if (!isAmountValid) {
                      alert("Please enter a valid amount greater than 0.");
                    }
                  }}
                  className={`amount-input${!isAmountValid ? " invalid" : ""}`}
                />
                <div className="select-with-icon">
                  <img
                    className="token-icon"
                    src={iconUrl(fromCurrency)}
                    alt={`${fromCurrency} icon`}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="hint">
                1 {fromCurrency} ≈ {(rate || 0).toFixed(6)} {toCurrency}
              </div>
              {!isAmountValid && (
                <div className="error-text">
                  Please enter a valid amount greater than 0.
                </div>
              )}
            </div>

            <button
              className="switch-btn"
              onClick={() => {
                setFromCurrency(toCurrency);
                setToCurrency(fromCurrency);
              }}
              disabled={!fromPrice || !toPrice}
            >
              ⇅
            </button>

            <div className="field">
              <label>To</label>
              <div className="row">
                <input
                  value={outputAmount ? outputAmount.toFixed(6) : ""}
                  readOnly
                  className="amount-input"
                />
                <div className="select-with-icon">
                  <img
                    className="token-icon"
                    src={iconUrl(toCurrency)}
                    alt={`${toCurrency} icon`}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="hint">
                Price: {toPrice ? `$${toPrice.toFixed(6)}` : "-"}
              </div>
              {!isPairValid && (
                <div className="error-text">
                  Choose two different currencies.
                </div>
              )}
            </div>

            <button
              className="swap-btn"
              disabled={!isValidSwap}
              onClick={() => {
                if (!isValidSwap) {
                  if (!isAmountValid)
                    alert("Please enter a valid amount greater than 0.");
                  else if (!isPairValid)
                    alert("Choose two different currencies.");
                  return;
                }
                const amtIn = Number(amount) || 0;
                const amtOut = outputAmount || 0;
                const entry = {
                  id: Date.now(),
                  time: new Date().toLocaleTimeString(),
                  fromCurrency,
                  toCurrency,
                  amountIn: amtIn,
                  amountOut: Number(amtOut.toFixed(6)),
                  status: "success",
                };
                setHistory((prev) => [entry, ...prev].slice(0, 50));
              }}
            >
              Swap
            </button>
          </div>

          <div className="prices">
            <h3>Available Currencies</h3>
            <div className="grid">
              {currencies.map((c) => (
                <div key={c} className="price-item">
                  <div className="price-head">
                    <img
                      className="token-icon"
                      src={iconUrl(c)}
                      alt={`${c} icon`}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="code">{c}</div>
                  </div>
                  <div className="val">${latestPrices[c].price.toFixed(6)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="history">
          <div className="history-header">
            <h3>Recent Transactions</h3>
          </div>
          <div className="history-list">
            {history.length === 0 && (
              <div className="empty">No transactions yet</div>
            )}
            {history.map((h) => (
              <div className="history-item" key={h.id}>
                <div className="row1">
                  <span className={`badge ${h.status}`}>{h.status}</span>
                  <span className="time ">{h.time}</span>
                </div>
                <div className="row2">
                  <span className="with-icon">
                    <img
                      className="token-icon"
                      src={iconUrl(h.fromCurrency)}
                      alt={`${h.fromCurrency} icon`}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    {h.amountIn} {h.fromCurrency}
                  </span>
                  <span className="arrow">→</span>
                  <span className="with-icon">
                    <img
                      className="token-icon"
                      src={iconUrl(h.toCurrency)}
                      alt={`${h.toCurrency} icon`}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    {h.amountOut} {h.toCurrency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
