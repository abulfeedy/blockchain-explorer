import { useState, useContext, useCallback, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";
import { ThemeContext } from "./ThemeContext";
import { InputWrapper, StyledInput, SearchButton } from "./styles";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { getCachedData, setCachedData } from "./IndexedDBCache";

// Utility function to add a delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to validate wallet address format
const isValidAddress = (address, chain) => {
  if (!address) return false;
  switch (chain) {
    case "eth":
    case "bnb":
    case "usdt-eth":
    case "usdt-bnb":
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case "sol":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    case "btc":
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
    default:
      return true;
  }
};

// Utility function to rotate API keys
const getNextApiKey = (keys, currentIndex) => {
  return { key: keys[currentIndex % keys.length], nextIndex: (currentIndex + 1) % keys.length };
};

// Retry function with immediate stop on no internet
export const retry = async (fn, retries = 3, delayMs = 1000, fallbackApis = []) => {
  if (!navigator.onLine) {
    throw new Error('No internet connection. Please check your network and try again.');
  }
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      console.log(`Fetch succeeded on attempt ${i + 1} with primary API`);
      return result;
    } catch (err) {
      lastError = err;
      if (err.message.includes('ERR_NAME_NOT_RESOLVED')) {
        throw new Error('Network error. Please check your connection or try again later.');
      }
      if (err.message.includes('429')) {
        await delay(delayMs * Math.pow(2, i));
        continue;
      }
      await delay(delayMs * Math.pow(2, i));
    }
  }
  if (fallbackApis.length > 0) {
    for (const api of fallbackApis) {
      try {
        const result = await fn(api);
        console.log(`Fetch succeeded with fallback API: ${api}`);
        return result;
      } catch (err) {
        // Silently handle fallback failures
      }
    }
  }
  throw lastError || new Error("All retries and fallbacks failed");
};

const AddressInput = ({
  address,
  setAddress,
  selectedChain,
  setTransactions,
  setLoading,
  setError,
  setSummary,
  setHasSearched,
}) => {
  const { colors } = useContext(ThemeContext);
  const [inputError, setInputError] = useState("");
  const [etherscanKeyIndex, setEtherscanKeyIndex] = useState(0);
  const [bscscanKeyIndex, setBscscanKeyIndex] = useState(0);

  // API key arrays
  const etherscanApiKeys = [
    import.meta.env.VITE_ETHERSCAN_API_KEY_1,
    import.meta.env.VITE_ETHERSCAN_API_KEY_2,
    import.meta.env.VITE_ETHERSCAN_API_KEY_3,
  ].filter(Boolean);
  const bscscanApiKeys = [
    import.meta.env.VITE_BSCADA_API_KEY_1,
    import.meta.env.VITE_BSCADA_API_KEY_2,
    import.meta.env.VITE_BSCADA_API_KEY_3,
  ].filter(Boolean);

  useEffect(() => {
    setInputError("");
  }, [selectedChain]);

  const fetchTransactions = useCallback(
    debounce(async () => {
      const chainConfig = {
        "usdt-eth": {
          decimals: 6,
          maxBalance: 100_000_000_000,
          symbol: "USDT",
          rpc: import.meta.env.VITE_INFURA_RPC_URL,
          fallbackApis: [
            import.meta.env.VITE_INFURA_FALLBACK_RPC_URL_1,
            import.meta.env.VITE_INFURA_FALLBACK_RPC_URL_2,
          ].filter(Boolean),
        },
        "usdt-bnb": {
          decimals: 18,
          maxBalance: 100_000_000_000,
          symbol: "USDT",
          rpc: import.meta.env.VITE_BSC_RPC_URL,
          fallbackApis: [
            import.meta.env.VITE_QUICKNODE_BSC_RPC_URL_1,
            import.meta.env.VITE_BSC_FALLBACK_1,
            import.meta.env.VITE_QUICKNODE_BSC_RPC_URL_2,
            import.meta.env.VITE_BSC_FALLBACK_2,
          ].filter(Boolean),
        },
        eth: {
          decimals: 18,
          maxBalance: 10_000,
          symbol: "ETH",
          rpc: import.meta.env.VITE_INFURA_RPC_URL,
          fallbackApis: [
            import.meta.env.VITE_INFURA_FALLBACK_RPC_URL_1,
            import.meta.env.VITE_INFURA_FALLBACK_RPC_URL_2,
          ].filter(Boolean),
        },
        bnb: {
          decimals: 18,
          maxBalance: 1_000_000,
          symbol: "BNB",
          rpc: import.meta.env.VITE_BSC_RPC_URL,
          fallbackApis: [
            import.meta.env.VITE_QUICKNODE_BSC_RPC_URL,
            import.meta.env.VITE_BSC_FALLBACK_1,
            import.meta.env.VITE_BSC_FALLBACK_2,
          ].filter(Boolean),
        },
        sol: {
          decimals: 9,
          maxBalance: 10_000_000,
          symbol: "SOL",
          rpc: import.meta.env.VITE_SOLANA_RPC_URL,
          fallbackApis: [
            import.meta.env.VITE_ALCHEMY_SOLANA_RPC_URL_1,
            import.meta.env.VITE_ALCHEMY_SOLANA_RPC_URL_2,
          ].filter(Boolean),
        },
        btc: {
          decimals: 8,
          maxBalance: 1_000_000,
          symbol: "BTC",
          api: "https://mempool.space/api",
          fallbackApis: ["https://blockstream.info/api", "https://chain.so/api/v2"],
        },
      };

      try {
        if (!selectedChain) {
          setError("Please select a blockchain.");
          return;
        }
        if (!address) {
          setInputError("Please enter a wallet address.");
          return;
        }
        if (!isValidAddress(address, selectedChain.value)) {
          setInputError(`Invalid ${selectedChain.label} address format.`);
          return;
        }

        setLoading(true);
        setError(null);
        setInputError("");
        setTransactions([]);
        setSummary(null);
        setHasSearched(true);

        const summaryKey = `${selectedChain.value}:${address}:summary`;
        const txsKey = `${selectedChain.value}:${address}:txs`;
        const cachedData = await getCachedData(summaryKey, txsKey);
        if (cachedData && !cachedData.isExpired) {
          setTransactions(cachedData.transactions);
          setSummary(cachedData.summary);
          setLoading(false);
          return;
        } else if (cachedData && cachedData.isExpired) {
          setTransactions(cachedData.transactions);
          setSummary(cachedData.summary);
        }

        let txData = [];
        let allTxs = [];
        let totalAmount = 0;
        let totalAmountTraded = 0;
        let totalAmountTradedUSD = 0;
        let currentBalance = 0;
        let totalTransactions = 0;
        let usdtEquivalent = 0;
        let isCapped = false;

        const config = chainConfig[selectedChain.value];
        if (!config) {
          throw new Error("Unsupported blockchain selected.");
        }

        if (selectedChain.value === "usdt-eth" || selectedChain.value === "usdt-bnb") {
          const contractAddress =
            selectedChain.value === "usdt-eth"
              ? "0xdAC17F958D2ee523a2206206994597C13D831ec7"
              : "0x55d398326f99059fF775485246999027B3197955";

          const network =
            selectedChain.value === "usdt-eth"
              ? { name: "mainnet", chainId: 1 }
              : { name: "binance", chainId: 56 };

          let provider = new ethers.JsonRpcProvider(config.rpc, network, {
            pollingInterval: 1000,
            timeout: 10000,
          });

          const usdtAbi = [
            "function balanceOf(address) view returns (uint256)",
            "event Transfer(address indexed from, address indexed to, uint256 value)",
          ];
          let usdtContract = new ethers.Contract(contractAddress, usdtAbi, provider);

          const balance = await retry(
            async (rpc = config.rpc) => {
              if (rpc !== config.rpc) {
                provider = new ethers.JsonRpcProvider(rpc, network, {
                  pollingInterval: 1000,
                  timeout: 10000,
                });
                usdtContract = new ethers.Contract(contractAddress, usdtAbi, provider);
              }
              return usdtContract.balanceOf(address);
            },
            3,
            1000,
            config.fallbackApis
          );
          currentBalance = parseFloat(ethers.formatUnits(balance, config.decimals));

          if (currentBalance > config.maxBalance) {
            throw new Error(`Unrealistic ${config.symbol} balance detected. Please verify the address.`);
          }

          const apiBase = selectedChain.value === "usdt-eth" ? "https://api.etherscan.io" : "https://api.bscscan.com";
          const { key: apiKey, nextIndex } =
            selectedChain.value === "usdt-eth"
              ? getNextApiKey(etherscanApiKeys, etherscanKeyIndex)
              : getNextApiKey(bscscanApiKeys, bscscanKeyIndex);
          if (selectedChain.value === "usdt-eth") {
            setEtherscanKeyIndex(nextIndex);
          } else {
            setBscscanKeyIndex(nextIndex);
          }

          if (!apiKey) {
            throw new Error("Missing API key for transaction fetching.");
          }

          const summaryUrl = `${apiBase}/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&tag=latest&apikey=${apiKey}`;
          const summaryResponse = await retry(() => axios.get(summaryUrl, { timeout: 10000 }));
          if (summaryResponse.data.status !== "1") {
            throw new Error("Failed to fetch summary data from Etherscan/BSCscan API.");
          }

          let page = 1;
          const pageSize = 1000;
          totalAmount = 0;
          totalAmountTraded = 0;
          totalTransactions = 0;

          while (true) {
            const { key: nextApiKey, nextIndex: newIndex } =
              selectedChain.value === "usdt-eth"
                ? getNextApiKey(etherscanApiKeys, etherscanKeyIndex)
                : getNextApiKey(bscscanApiKeys, bscscanKeyIndex);
            if (selectedChain.value === "usdt-eth") {
              setEtherscanKeyIndex(newIndex);
            } else {
              setBscscanKeyIndex(newIndex);
            }

            const url = `${apiBase}/api?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&startblock=0&endblock=99999999&sort=asc&page=${page}&offset=${pageSize}&apikey=${nextApiKey}`;
            const response = await retry(() => axios.get(url, { timeout: 10000 }));

            if (!response.data || typeof response.data !== "object") {
              throw new Error("Invalid response from Etherscan/BSCscan API.");
            }

            if (response.data.status === "0") {
              if (response.data.message === "No transactions found") {
                totalTransactions = 0;
                break;
              } else {
                throw new Error(response.data.result || "Etherscan/BSCscan API error.");
              }
            } else if (!Array.isArray(response.data.result)) {
              throw new Error("Invalid transaction data from Etherscan/BSCscan API.");
            }

            const txs = response.data.result;
            totalTransactions += txs.length;

            txs.forEach((tx) => {
              const value = parseFloat(tx.value) / Math.pow(10, config.decimals);
              if (tx.from.toLowerCase() === address.toLowerCase()) {
                totalAmount += value;
              }
              totalAmountTraded += value;
            });

            allTxs = allTxs.concat(txs);

            if (txs.length < pageSize) {
              break;
            }
            page++;
            await delay(200);
          }

          txData = allTxs.slice(0, 100).map((tx) => {
            const value = parseFloat(tx.value) / Math.pow(10, config.decimals);
            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to || "N/A",
              value: value.toFixed(4),
              time: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString(),
              gas: (parseInt(tx.gasUsed) * parseInt(tx.gasPrice) / 1e18).toFixed(4),
              confirmations: tx.confirmations || null,
              blockHeight: tx.blockNumber,
              status: parseInt(tx.isError) === 0 ? "Success" : "Failed",
            };
          });

          usdtEquivalent = currentBalance;
          totalAmountTradedUSD = totalAmountTraded;
        } else if (selectedChain.value === "eth" || selectedChain.value === "bnb") {
          const network =
            selectedChain.value === "eth"
              ? { name: "mainnet", chainId: 1 }
              : { name: "binance", chainId: 56 };

          let provider = new ethers.JsonRpcProvider(config.rpc, network, {
            pollingInterval: 1000,
            timeout: 10000,
          });

          const balance = await retry(
            async (rpc = config.rpc) => {
              if (rpc !== config.rpc) {
                provider = new ethers.JsonRpcProvider(rpc, network, {
                  pollingInterval: 1000,
                  timeout: 10000,
                });
              }
              return provider.getBalance(address);
            },
            3,
            1000,
            config.fallbackApis
          );
          currentBalance = parseFloat(ethers.formatUnits(balance, config.decimals));

          if (currentBalance > config.maxBalance) {
            throw new Error(`Unrealistic ${config.symbol} balance detected. Please verify the address.`);
          }

          const apiBase = selectedChain.value === "eth" ? "https://api.etherscan.io" : "https://api.bscscan.com";
          const { key: apiKey, nextIndex } =
            selectedChain.value === "eth"
              ? getNextApiKey(etherscanApiKeys, etherscanKeyIndex)
              : getNextApiKey(bscscanApiKeys, bscscanKeyIndex);
          if (selectedChain.value === "eth") {
            setEtherscanKeyIndex(nextIndex);
          } else {
            setBscscanKeyIndex(nextIndex);
          }

          if (!apiKey) {
            throw new Error("Missing API key for transaction fetching.");
          }

          let page = 1;
          const pageSize = 1000;
          totalAmount = 0;
          totalAmountTraded = 0;
          totalTransactions = 0;

          while (true) {
            const { key: nextApiKey, nextIndex: newIndex } =
              selectedChain.value === "eth"
                ? getNextApiKey(etherscanApiKeys, etherscanKeyIndex)
                : getNextApiKey(bscscanApiKeys, bscscanKeyIndex);
            if (selectedChain.value === "eth") {
              setEtherscanKeyIndex(newIndex);
            } else {
              setBscscanKeyIndex(newIndex);
            }

            const url = `${apiBase}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&page=${page}&offset=${pageSize}&apikey=${nextApiKey}`;
            const response = await retry(() => axios.get(url, { timeout: 10000 }));

            if (!response.data || typeof response.data !== "object") {
              throw new Error("Invalid response from Etherscan/BSCscan API.");
            }

            if (response.data.status === "0") {
              if (response.data.message === "No transactions found") {
                totalTransactions = 0;
                break;
              } else {
                throw new Error(response.data.result || "Etherscan/BSCscan API error.");
              }
            } else if (!Array.isArray(response.data.result)) {
              throw new Error("Invalid transaction data from Etherscan/BSCscan API.");
            }

            const txs = response.data.result;
            totalTransactions += txs.length;

            txs.forEach((tx) => {
              const value = parseFloat(tx.value) / Math.pow(10, config.decimals);
              if (tx.from.toLowerCase() === address.toLowerCase()) {
                totalAmount += value;
              }
              totalAmountTraded += value;
            });

            allTxs = allTxs.concat(txs);

            if (txs.length < pageSize) {
              break;
            }
            page++;
            await delay(200);
          }

          txData = allTxs.slice(0, 100).map((tx) => {
            const value = parseFloat(tx.value) / Math.pow(10, config.decimals);
            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to || "N/A",
              value: value.toFixed(4),
              time: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString(),
              gas: (parseInt(tx.gasUsed) * parseInt(tx.gasPrice) / 1e18).toFixed(4),
              confirmations: tx.confirmations || null,
              blockHeight: tx.blockNumber,
              status: parseInt(tx.isError) === 0 ? "Success" : "Failed",
            };
          });
        } else if (selectedChain.value === "sol") {
          let connection = new Connection(config.rpc, "confirmed");
          let pubKey;
          try {
            pubKey = new PublicKey(address);
          } catch (err) {
            throw new Error("Invalid Solana address format.");
          }

          const balance = await retry(
            async (rpc = config.rpc) => {
              if (rpc !== config.rpc) {
                connection = new Connection(rpc, "confirmed");
              }
              return connection.getBalance(pubKey);
            },
            3,
            1000,
            config.fallbackApis
          );
          currentBalance = balance / Math.pow(10, config.decimals);

          if (currentBalance > config.maxBalance) {
            throw new Error(`Unrealistic ${config.symbol} balance detected. Please verify the address.`);
          }

          // Fetch total transaction count with a cap at 10,000
          let totalCount = 0;
          let before = null;
          const signatureLimit = 1000;
          const maxTransactions = 10000;
          let allSignatures = [];
          while (totalCount < maxTransactions) {
            const signatures = await retry(
              async (rpc = config.rpc) => {
                if (rpc !== config.rpc) {
                  connection = new Connection(rpc, "confirmed");
                }
                return connection.getSignaturesForAddress(pubKey, { limit: signatureLimit, before });
              },
              3,
              1000,
              config.fallbackApis
            );
            totalCount += signatures.length;
            allSignatures = allSignatures.concat(signatures);
            if (signatures.length < signatureLimit || totalCount >= maxTransactions) {
              if (totalCount >= maxTransactions) {
                isCapped = true;
                totalCount = maxTransactions;
              }
              break;
            }
            before = signatures[signatures.length - 1].signature;
            await delay(300);
          }
          totalTransactions = totalCount;

          // Fetch details for up to 100 transactions for display
          const displaySignatures = allSignatures.slice(0, 100);
          const batchSize = 25;
          const signatureBatches = [];
          for (let i = 0; i < displaySignatures.length; i += batchSize) {
            signatureBatches.push(displaySignatures.slice(i, i + batchSize));
          }

          const txResults = [];
          for (let i = 0; i < signatureBatches.length; i++) {
            const batch = signatureBatches[i];
            await delay(200 * (i % 5));
            const batchTxs = await retry(
              async (rpc = config.rpc) => {
                if (rpc !== config.rpc) {
                  connection = new Connection(rpc, "confirmed");
                }
                return connection.getParsedTransactions(
                  batch.map(sig => sig.signature),
                  { maxSupportedTransactionVersion: 0 }
                );
              },
              3,
              1000,
              config.fallbackApis
            );

            batchTxs.forEach((tx, index) => {
              if (tx) {
                txResults.push({
                  signature: batch[index].signature,
                  tx,
                });
              }
            });
          }

          txData = txResults
            .filter(result => result.tx !== null)
            .map(result => {
              const tx = result.tx;
              const preBalances = tx.meta.preBalances;
              const postBalances = tx.meta.postBalances;
              const accounts = tx.transaction.message.accountKeys;

              const senderIndex = accounts.findIndex(acc => acc.pubkey.toString() === address);
              const amount =
                senderIndex !== -1
                  ? (preBalances[senderIndex] - postBalances[senderIndex]) / Math.pow(10, config.decimals)
                  : 0;
              if (amount > 0) totalAmount += amount;
              totalAmountTraded += Math.abs(amount);

              const receiverIndex = accounts.findIndex(
                (acc, idx) => idx !== senderIndex && postBalances[idx] - preBalances[idx] > 0
              );
              const toAddress = receiverIndex !== -1 ? accounts[receiverIndex].pubkey.toString() : "N/A";

              return {
                hash: result.signature,
                from: address,
                to: toAddress,
                value: amount.toFixed(4),
                time: tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : null,
                gas: tx.meta.fee / Math.pow(10, config.decimals),
                confirmations: tx.confirmationStatus || null,
                blockHeight: tx.slot || null,
                status: tx.meta.err ? "Failed" : "Success",
              };
            });

          txData.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

         
        } else if (selectedChain.value === "btc") {
          let chainStats;
          try {
            const addressUrl = `${config.api}/address/${address}`;
            chainStats = await retry(
              async (api = config.api) => {
                if (api.includes("chain.so")) {
                  const response = await axios.get(`${api}/address/BTC/${address}`, { timeout: 10000 });
                  const data = response.data.data;
                  return {
                    chain_stats: {
                      funded_txo_sum: data.total_received * 1e8,
                      spent_txo_sum: data.total_sent * 1e8,
                      tx_count: data.txs,
                    },
                  };
                }
                return (await axios.get(addressUrl, { timeout: 10000 })).data;
              },
              3,
              1000,
              config.fallbackApis
            );
          } catch (err) {
            throw new Error(`Failed to fetch BTC address data: ${err.message}`);
          }

          chainStats = chainStats.chain_stats;
          currentBalance = (chainStats.funded_txo_sum - chainStats.spent_txo_sum) / Math.pow(10, config.decimals);
          totalTransactions = chainStats.tx_count;
          totalAmount = chainStats.spent_txo_sum / Math.pow(10, config.decimals);
          totalAmountTraded = (chainStats.funded_txo_sum + chainStats.spent_txo_sum) / Math.pow(10, config.decimals);

          if (currentBalance < 0) {
            throw new Error("Invalid Bitcoin balance: negative value.");
          }

          if (currentBalance > config.maxBalance) {
            throw new Error(`Unrealistic ${config.symbol} balance detected. Please verify the address.`);
          }

          let txs = [];
          let lastTxid = null;
          const maxRequests = 10;
          let requestCount = 0;

          while (txs.length < 100 && requestCount < maxRequests) {
            try {
              const txUrl = lastTxid
                ? `${config.api}/address/${address}/txs?after_txid=${lastTxid}`
                : `${config.api}/address/${address}/txs`;
              const txResponse = await retry(
                async (api = config.api) => {
                  if (api.includes("chain.so")) {
                    const response = await axios.get(`${api}/address/BTC/${address}`, { timeout: 10000 });
                    const txids = response.data.data.txs.slice(txs.length, txs.length + 25).map(tx => tx.txid);
                    const fetchedTxs = await Promise.all(
                      txids.map(async (txid) => {
                        const txResponse = await axios.get(`${api}/get_tx/BTC/${txid}`, { timeout: 10000 });
                        const tx = txResponse.data.data;
                        return {
                          txid: tx.txid,
                          vin: tx.inputs.map(input => ({ prevout: { scriptpubkey_address: input.address } })),
                          vout: tx.outputs.map(output => ({
                            scriptpubkey_address: output.address,
                            value: output.value * 1e8,
                          })),
                          status: { confirmed: tx.confirmations > 0, block_height: tx.block_no, block_time: tx.time },
                        };
                      })
                    );
                    return fetchedTxs;
                  }
                  return (await axios.get(txUrl, { timeout: 10000 })).data;
                },
                3,
                1000,
                config.fallbackApis
              );

              if (!Array.isArray(txResponse)) {
                throw new Error("Invalid transaction data from BTC API.");
              }

              if (txResponse.length === 0) {
                break;
              }

              txs = txs.concat(txResponse);

              if (txs.length >= 100 || txResponse.length < 25) {
                break;
              }

              lastTxid = txResponse[txResponse.length - 1].txid;
              requestCount++;
              await delay(300);
            } catch (err) {
              throw new Error(`Failed to fetch BTC transactions: ${err.message}`);
            }
          }

          const seenTxids = new Set();
          allTxs = txs.filter(tx => {
            if (seenTxids.has(tx.txid)) {
              return false;
            }
            seenTxids.add(tx.txid);
            return true;
          });

          txData = allTxs.slice(0, 100).map((tx) => {
            const inputs = tx.vin.map(vin => vin.prevout?.scriptpubkey_address || "N/A");
            const outputs = tx.vout.map(vout => ({
              addr: vout.scriptpubkey_address || "N/A",
              value: vout.value / Math.pow(10, config.decimals),
            }));

            const fromAddress = inputs.includes(address) ? address : inputs[0] || "N/A";
            const toAddress = outputs[0]?.addr || "N/A";
            const totalValue = outputs.reduce((sum, out) => sum + out.value, 0);

            return {
              hash: tx.txid,
              from: fromAddress,
              to: toAddress,
              value: totalValue.toFixed(4),
              time: tx.status.confirmed ? new Date(tx.status.block_time * 1000).toLocaleString() : null,
              gas: null,
              confirmations: tx.status.confirmed ? tx.status.block_height : null,
              blockHeight: tx.status.block_height || null,
              status: tx.status.confirmed ? "Success" : "Pending",
              outputs,
            };
          });

          txData.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
        }

        let pricePerToken = 1;
        if (selectedChain.value !== "usdt-eth" && selectedChain.value !== "usdt-bnb") {
          try {
            const coinId =
              selectedChain.value === "eth"
                ? "ethereum"
                : selectedChain.value === "sol"
                ? "solana"
                : selectedChain.value === "btc"
                ? "bitcoin"
                : "binancecoin";
            const priceResponse = await retry(() =>
              axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`, { timeout: 10000 })
            );
            const priceData = priceResponse.data[coinId];
            if (!priceData || typeof priceData.usd !== "number" || priceData.usd <= 0) {
              throw new Error("Invalid or zero USD price from CoinGecko.");
            }
            pricePerToken = priceData.usd;
            usdtEquivalent = currentBalance * pricePerToken;
            if (selectedChain.value === "sol" && isCapped) {
              totalAmountTradedUSD = (totalAmountTraded * pricePerToken).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) + ">>";
            } else {
              totalAmountTradedUSD = totalAmountTraded * pricePerToken;
            }
          } catch (priceError) {
            setError("USD conversion unavailable for this address.");
            usdtEquivalent = 0;
            totalAmountTradedUSD = 0;
          }
        } else {
          totalAmountTradedUSD = totalAmountTraded;
        }

        const summaryData = {
          totalTransactions: (selectedChain.value === "sol" && isCapped) ? `${totalTransactions}>>` : totalTransactions,
          totalAmount: (selectedChain.value === "sol" && isCapped)
            ? parseFloat(totalAmount).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + ">>"
            : parseFloat(totalAmount).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
          totalAmountTraded: (selectedChain.value === "sol" && isCapped)
            ? parseFloat(totalAmountTraded).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + ">>"
            : parseFloat(totalAmountTraded).toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
          totalAmountTradedUSD: (selectedChain.value === "sol" && isCapped)
            ? totalAmountTradedUSD
            : parseFloat(totalAmountTradedUSD).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          currentBalance: parseFloat(currentBalance).toLocaleString("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          }),
          usdtEquivalent: parseFloat(usdtEquivalent).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          cryptoSymbol: config.symbol,
        };


        setTransactions(txData);
        setSummary(summaryData);
        await setCachedData(summaryKey, txsKey, summaryData, txData);
      } catch (err) {
        const errorMessage = err.message.includes('ERR_NAME_NOT_RESOLVED')
          ? 'Network error. Please check your connection or try again later.'
          : err.message.includes('429') || err.message.includes('403')
          ? 'Error retrieving blockchain data, retrying...'
          : `Failed to fetch transactions: ${err.message}`;
        setError(errorMessage);
        console.error("Error fetching transactions:", err.message);
        setTransactions([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }, 1000),
    [selectedChain, address, setTransactions, setLoading, setError, setSummary, setHasSearched, etherscanKeyIndex, bscscanKeyIndex]
  );

  const handleSearch = async () => {
    try {
      await fetchTransactions();
    } catch (err) {
      console.error(`Search failed: ${err.message}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <InputWrapper>
        <StyledInput
          colors={colors}
          type="text"
          placeholder="Enter wallet address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (!e.target.value) {
              setInputError("");
              setError(null);
              setTransactions([]);
              setSummary(null);
              setHasSearched(false);
            }
          }}
          error={inputError}
        />
        {inputError && <p style={{ color: "red", fontSize: "14px" }}>{inputError}</p>}
        <SearchButton colors={colors} onClick={handleSearch}>
          <FaSearch /> Search
        </SearchButton>
      </InputWrapper>
    </motion.div>
  );
};

export default AddressInput;
