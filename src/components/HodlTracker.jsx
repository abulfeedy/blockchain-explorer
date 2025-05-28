import { useState, useEffect, useMemo } from "react";
import { getCachedHodlData, setCachedHodlData } from "./HodlCache";
import {
  TimelineContainer,
  TimelineBar,
  TimelineMarker,
  TimelineLabel,
  VibeSpan,
} from "./styles";
import { getAddressVibe } from "./VibeSelector";

const HodlTracker = ({ chain, address, summary, vibeStyle, colors, setHodlData }) => {
  const [hodlData, setLocalHodlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const supportedChains = ["btc", "eth", "bnb"];
  const cryptoCompareSymbols = { btc: "BTC", eth: "ETH", bnb: "BNB" };

  // Load API keys
  const ETHERSCAN_API_KEYS = [
    import.meta.env.VITE_ETHERSCAN_API_KEYA,
    import.meta.env.VITE_ETHERSCAN_API_KEYB,
    import.meta.env.VITE_ETHERSCAN_API_KEYC,
    // import.meta.env.VITE_ETHERSCAN_API_KEYD,
  ].filter(Boolean);
  const BSCSCAN_API_KEYS = [
    import.meta.env.VITE_BSCSCAN_API_KEYA,
    import.meta.env.VITE_BSCSCAN_API_KEYB,
    import.meta.env.VITE_BSCSCAN_API_KEYC,
    // import.meta.env.VITE_BSCSCAN_API_KEYD,
  ].filter(Boolean);
  const CRYPTOCOMPARE_API_KEYS = [
    import.meta.env.VITE_CRYPTOCOMPARE_API_KEYA,
    import.meta.env.VITE_CRYPTOCOMPARE_API_KEYB,
    import.meta.env.VITE_CRYPTOCOMPARE_API_KEYC,
    import.meta.env.VITE_CRYPTOCOMPARE_API_KEYD,
    import.meta.env.VITE_CRYPTOCOMPARE_API_KEYE,
  ].filter(Boolean);
  const BTC_APIS = [
    "https://mempool.space/api",
    "https://blockstream.info/api",
    "https://chain.so/api/v2",
  ];

  // Check for API keys
  if (chain === "eth" && ETHERSCAN_API_KEYS.length === 0) {
    setError("Ethereum API keys are missing. Please set VITE_ETHERSCAN_API_KEYA to VITE_ETHERSCAN_API_KEYF in .env");
    return null;
  }
  if (chain === "bnb" && BSCSCAN_API_KEYS.length === 0) {
    setError("BNB API keys are missing. Please set VITE_BSCSCAN_API_KEYA to VITE_BSCSCAN_API_KEYF in .env");
    return null;
  }

  const chainApis = {
    btc: `${BTC_APIS[0]}/address/${address}/txs`,
    eth: `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEYS[0]}`,
    bnb: `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${BSCSCAN_API_KEYS[0]}`,
  };

  const isValidAddress = (chain, address) => {
    if (chain === "btc") {
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
    } else if (chain === "eth" || chain === "bnb") {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    return false;
  };

  const fetchHistoricalPrice = async (coinId, date) => {
    const cacheKey = `price:${coinId}:${date}`;
    const cachedPrice = await getCachedHodlData(cacheKey);
    if (cachedPrice && cachedPrice > 0) return cachedPrice;

    let cycleCount = 0;
    while (cycleCount < 2) {
      for (let i = 0; i < CRYPTOCOMPARE_API_KEYS.length; i++) {
        try {
          if (!navigator.onLine) {
            throw new Error("No internet connection, please check your network");
          }
          const [day, month, year] = date.split("-");
          const parsedDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
          const timestamp = Math.floor(parsedDate.getTime() / 1000);

          if (isNaN(timestamp) || parsedDate.getFullYear() > new Date().getFullYear()) {
            throw new Error(`Invalid date: ${date}`);
          }

          console.log(`Fetching price for ${coinId} on ${date} (timestamp: ${timestamp}) with CryptoCompare key ${i + 1}`);

          const url = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${cryptoCompareSymbols[coinId]}&tsyms=USD&ts=${timestamp}&api_key=${CRYPTOCOMPARE_API_KEYS[i]}`;
          const response = await fetch(url);
          if (!response.ok) {
            if (response.status === 429) {
              console.warn(`CryptoCompare rate limit exceeded for key ${i + 1}, trying next key`);
              continue;
            }
            throw new Error(`CryptoCompare API error: ${response.statusText}`);
          }
          const data = await response.json();
          console.log(`CryptoCompare response for ${coinId} on ${date}:`, data);

          const price = data?.[cryptoCompareSymbols[coinId]]?.USD;
          if (!price || price <= 0) {
            throw new Error(`Invalid or missing price data for ${coinId} on ${date}.`);
          }
          await setCachedHodlData(cacheKey, price);
          return price;
        } catch (err) {
          console.error(`CryptoCompare fetch error with key ${i + 1}:`, err.message);
          if (err.message.includes("No internet connection")) {
            throw err; // Immediately throw network errors
          }
          if (i === CRYPTOCOMPARE_API_KEYS.length - 1) {
            console.warn(`All CryptoCompare keys failed in cycle ${cycleCount + 1}, retrying from first key after delay`);
            cycleCount++;
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second delay before next cycle
          }
        }
      }
      if (cycleCount >= 2) {
        throw new Error("System busy, please try again later");
      }
    }
  };

  const fetchWithRetry = async (url, retries = 3, delayMs = 1000) => {
    let apiKeys = [];
    let apis = [url];
    let baseUrl = url;

    if (chain === "eth") {
      apiKeys = ETHERSCAN_API_KEYS;
      baseUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=`;
      apis = apiKeys.map(key => `${baseUrl}${key}`);
    } else if (chain === "bnb") {
      apiKeys = BSCSCAN_API_KEYS;
      baseUrl = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=`;
      apis = apiKeys.map(key => `${baseUrl}${key}`);
    } else if (chain === "btc") {
      apis = BTC_APIS.map(api => `${api}/address/${address}/txs`);
    }

    let cycleCount = 0;
    while (cycleCount < 2) {
      for (let i = 0; i < apis.length; i++) {
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            if (!navigator.onLine) {
              throw new Error("No internet connection, please check your network");
            }
            console.log(`Fetching from ${apis[i]}, attempt ${attempt + 1}`);
            const response = await fetch(apis[i]);
            if (!response.ok) {
              if (response.status === 429) {
                console.warn(`Rate limit hit for API ${i + 1}, trying next API`);
                break; // Move to next API
              }
              throw new Error(`Chain API error: ${response.statusText}`);
            }
            return await response.json();
          } catch (err) {
            console.warn(`Fetch attempt ${attempt + 1} failed for API ${i + 1}: ${err.message}`);
            if (err.message.includes("No internet connection")) {
              throw err; // Immediately throw network errors
            }
            if (err.message.includes('429')) {
              break; // Move to next API
            }
            if (attempt < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
            } else if (i === apis.length - 1) {
              console.warn(`All APIs failed in cycle ${cycleCount + 1}, retrying from first API after delay`);
              cycleCount++;
              await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second delay before next cycle
            }
          }
        }
      }
      if (cycleCount >= 2) {
        throw new Error("System busy, please try again later");
      }
    }
  };

  const fetchHodlData = async () => {
    if (!supportedChains.includes(chain) || !address || !summary) return;

    if (!isValidAddress(chain, address)) {
      setError("Invalid address format for the selected chain");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const cacheKey = `hodl:${chain}:${address}`;
    const cachedData = await getCachedHodlData(cacheKey);
    if (cachedData && cachedData.currentValue === summary.usdtEquivalent.replace(/,/g, "")) {
      setLocalHodlData(cachedData);
      setHodlData(cachedData);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchWithRetry(chainApis[chain]);
      let earliestDate = null;

      if (chain === "btc") {
        if (!Array.isArray(data)) {
          throw new Error("Invalid response from mempool.space API: Expected an array of transactions");
        }
        const receivedTxs = data.filter(
          (tx) =>
            tx.vout?.some((out) => out.scriptpubkey_address === address && out.value > 0) &&
            tx.status?.confirmed &&
            tx.status?.block_time
        );
        if (receivedTxs.length > 0) {
          earliestDate = new Date(receivedTxs[0].status.block_time * 1000);
        }
      } else {
        if (data.status !== "1" || data.message !== "OK") {
          if (data.message === "NOTOK" && data.result.includes("Invalid API Key")) {
            throw new Error(`${chain.toUpperCase()} API key is invalid`);
          } else if (data.message === "NOTOK" && data.result.includes("Invalid Address")) {
            throw new Error(`Invalid ${chain.toUpperCase()} address`);
          } else if (data.result === "Max rate limit reached") {
            throw new Error(`${chain.toUpperCase()} API rate limit exceeded`);
          } else {
            throw new Error(`Unexpected ${chain.toUpperCase()} API response: ${data.message || "Unknown error"}`);
          }
        }
        const txs = data?.result || [];
        if (!Array.isArray(txs)) {
          throw new Error(`Invalid response from ${chain} API: Expected an array of transactions`);
        }
        const receivedTxs = txs.filter(
          (tx) => tx.to?.toLowerCase() === address.toLowerCase() && parseFloat(tx.value) > 0
        );
        if (receivedTxs.length > 0) {
          if (!receivedTxs[0].timeStamp) {
            throw new Error("Transaction data missing timeStamp");
          }
          earliestDate = new Date(parseInt(receivedTxs[0].timeStamp) * 1000);
        }
      }

      if (!earliestDate) {
        setLocalHodlData({ error: "No confirmed HODL history available" });
        setHodlData({ error: "No confirmed HODL history available" });
        setLoading(false);
        return;
      }

      const launchDates = {
        btc: new Date("2009-01-03"),
        eth: new Date("2015-07-30"),
        bnb: new Date("2017-07-01"),
      };
      if (earliestDate < launchDates[chain]) {
        earliestDate = launchDates[chain];
      }

      const dateStr = earliestDate.toISOString().split("T")[0];
      const formattedDate = `${dateStr.slice(8, 10)}-${dateStr.slice(5, 7)}-${dateStr.slice(0, 4)}`;

      const historicalPrice = await fetchHistoricalPrice(chain, formattedDate);
      if (!historicalPrice) {
        setLocalHodlData({ error: "Historical price unavailable. Unable to calculate appreciation." });
        setHodlData({ error: "Historical price unavailable. Unable to calculate appreciation." });
        setLoading(false);
        return;
      }

      const currentBalance = parseFloat(summary.currentBalance) || 0;
      const currentValue = parseFloat(summary.usdtEquivalent.replace(/,/g, "")) || 0;
      const valueThen = currentBalance * historicalPrice;
      const appreciation = currentValue && valueThen > 0 ? (currentValue / valueThen).toFixed(1) : "N/A";
      const duration = new Date().getFullYear() - earliestDate.getFullYear();
      const hodlScore = duration * Math.log10(parseFloat(appreciation) || 1);
     const scaledScore = Math.min(Math.round(hodlScore * 10), 100);
      let tier;
      if (scaledScore > 80) tier = "Legend";
      else if (scaledScore > 50) tier = "Elite";
      else if (scaledScore > 20) tier = "Veteran";
      else if (scaledScore > 10) tier = "Rookie";
      else tier = "Newbie";
      // Validate calculations
      if (valueThen <= 0 || isNaN(valueThen)) {
        setLocalHodlData({ error: "Invalid historical value calculated." });
        setHodlData({ error: "Invalid historical value calculated." });
        setLoading(false);
        return;
      }

      const hodlData = {
        startYear: earliestDate.getFullYear(),
        duration,
        valueThen: valueThen.toFixed(2),
        appreciation,
        currentValue: currentValue.toFixed(2),
        hodlScore: scaledScore,
        tier,
        timelineStart: earliestDate.getFullYear(),
      };

      await setCachedHodlData(cacheKey, hodlData, 5);
      setLocalHodlData(hodlData);
      setHodlData(hodlData);
    } catch (err) {
      console.error("HODL fetch error:", err.message);
      setError(err.message || "Failed to fetch HODL data");
    } finally {
      setLoading(false);
    }
  };

  const stableSummary = useMemo(() => ({
    currentBalance: summary?.currentBalance,
    usdtEquivalent: summary?.usdtEquivalent,
    totalAmountTradedUSD: summary?.totalAmountTradedUSD,
    cryptoSymbol: summary?.cryptoSymbol,
  }), [summary?.currentBalance, summary?.usdtEquivalent, summary?.totalAmountTradedUSD, summary?.cryptoSymbol]);

  useEffect(() => {
    fetchHodlData();
  }, [chain, address, stableSummary]);

  if (!supportedChains.includes(chain)) return null;
  if (loading) return <p style={{ color: colors.textSecondary, textAlign: "center" }}>Loading HODL...</p>;
  if (error || hodlData?.error) {
    return (
      <p style={{ color: colors.textSecondary, textAlign: "center" }}>
        {hodlData?.error || error}
      </p>
    );
  }
  if (!hodlData) return null;

  const { startYear, duration, valueThen, appreciation, currentValue, hodlScore, tier, timelineStart } = hodlData;
  const vibeTitle = summary
    ? getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent, vibeStyle).title
    : "Investor 💼";
  const timelineWidth = new Date().getFullYear() - timelineStart;
  const startPosition = 0;
  const endPosition = 100;

  return (
    <div style={{ textAlign: "center", color: colors.textPrimary }}>
      <p>
         You HODLing {stableSummary.currentBalance} {stableSummary.cryptoSymbol} <br /> since {startYear} ({duration} {duration === 1 ? "year" : "years"} ago)
      </p>
      <p>
        HODL Score: <VibeSpan colors={colors} data-tooltip="Years HODLed × Log(Appreciation), higher is better!">
          {hodlScore} ({tier})
        </VibeSpan>
      </p>
      <p>Asset Valued Then: ${parseFloat(valueThen).toLocaleString()}</p>
      <p>Appreciation: {appreciation}X</p>
      <p>Current Value: ${parseFloat(currentValue).toLocaleString()}</p>
      <TimelineContainer>
        <TimelineBar colors={colors} />
        <TimelineMarker colors={colors} position={startPosition} />
        <TimelineLabel colors={colors} position={startPosition}>
          {timelineStart}
        </TimelineLabel>
        <TimelineMarker colors={colors} position={endPosition} />
        <TimelineLabel colors={colors} position={endPosition}>
          {new Date().getFullYear()}
        </TimelineLabel>
      </TimelineContainer>
    </div>
  );
};

export default HodlTracker;