import { useState, useContext, useCallback, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";
import { ThemeContext } from "./ThemeContext";
import { InputWrapper, StyledInput, SearchButton } from "./styles";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { debounce } from "lodash";

// Utility function to add a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// Retry function with network disconnection handling and limited retries
const retry = async (fn, retries = 3, delayMs = 1000, fallbackRpcs = []) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`Retry attempt ${i + 1} failed:`, err.message);
      if (err.message.includes('ERR_INTERNET_DISCONNECTED') || err.message.includes('Failed to fetch')) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      if (i === retries - 1 && fallbackRpcs.length > 0) {
        console.log("Switching to fallback RPCs...");
        for (const rpc of fallbackRpcs) {
          try {
            console.log(`Trying fallback RPC: ${rpc}`);
            return await fn(rpc);
          } catch (fallbackErr) {
            lastError = fallbackErr;
            console.warn(`Fallback RPC ${rpc} failed:`, fallbackErr.message);
          }
        }
      }
      await delay(delayMs * Math.pow(2, i));
    }
  }
  throw lastError;
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

  // Clear inputError when selectedChain changes
  useEffect(() => {
    setInputError("");
  }, [selectedChain]);

  const fetchTransactions = useCallback(
    debounce(async () => {
      // Define chainConfig outside the try block to ensure it's always accessible
      const chainConfig = {
        "usdt-eth": {
          decimals: 6,
          maxBalance: 100_000_000_000,
          symbol: "USDT",
          rpc: "https://mainnet.infura.io/v3/eddaa868faf14690ab1a76e1af78758e",
        },
        "usdt-bnb": {
          decimals: 18,
          maxBalance: 100_000_000_000,
          symbol: "USDT",
          rpc: "https://bsc-dataseed.binance.org/",
        },
        eth: {
          decimals: 18,
          maxBalance: 10_000,
          symbol: "ETH",
          rpc: "https://mainnet.infura.io/v3/eddaa868faf14690ab1a76e1af78758e",
        },
        bnb: {
          decimals: 18,
          maxBalance: 1_000_000,
          symbol: "BNB",
          rpc: "https://bsc-dataseed.binance.org/",
        },
        sol: {
          decimals: 9,
          maxBalance: 10_000_000,
          symbol: "SOL",
          rpc: import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
          fallbackRpcs: [],
        },
        btc: {
          decimals: 8,
          maxBalance: 1_000_000,
          symbol: "BTC",
          api: "https://mempool.space/api",
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

        let txData = [];
        let totalAmount = 0;
        let totalAmountTraded = 0;
        let totalAmountTradedUSD = 0;
        let currentBalance = 0;
        let totalTransactions = 0;
        let usdtEquivalent = 0;

        const config = chainConfig[selectedChain.value];
        if (!config) {
          throw new Error("Unsupported blockchain selected.");
        }

        // Check internet connectivity before proceeding
        if (!navigator.onLine) {
          throw new Error("No internet connection. Please check your network and try again.");
        }

        if (selectedChain.value === "usdt-eth" || selectedChain.value === "usdt-bnb") {
          const contractAddress =
            selectedChain.value === "usdt-eth"
              ? "0xdAC17F958D2ee523a2206206994597C13D831ec7"
              : "0x55d398326f99059fF775485246999027B3197955";

          try {
            const provider = new ethers.JsonRpcProvider(config.rpc, undefined, {
              pollingInterval: 1000,
              timeout: 5000,
            });

            const usdtAbi = [
              "function balanceOf(address) view returns (uint256)",
              "event Transfer(address indexed from, address indexed to, uint256 value)",
            ];
            const usdtContract = new ethers.Contract(contractAddress, usdtAbi, provider);

            const balance = await retry(() => usdtContract.balanceOf(address));
            currentBalance = parseFloat(ethers.formatUnits(balance, config.decimals));
            console.log(`Calculated ${config.symbol} Balance:`, currentBalance);

            if (currentBalance > config.maxBalance) {
              console.warn(
                `Unrealistic ${config.symbol} balance detected: ${currentBalance} for address: ${address}`
              );
              throw new Error(`Unrealistic ${config.symbol} balance detected. Please verify the address.`);
            }

            const apiBase = selectedChain.value === "usdt-eth" ? "https://api.etherscan.io" : "https://api.bscscan.com";
            const apiKey =
              selectedChain.value === "usdt-eth"
                ? import.meta.env.VITE_ETHERSCAN_API_KEY
                : import.meta.env.VITE_BSCSCAN_API_KEY;

            if (!apiKey) {
              throw new Error("Missing API key for transaction fetching.");
            }

            const summaryUrl = `${apiBase}/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&tag=latest&apikey=${apiKey}`;
            const summaryResponse = await retry(() => axios.get(summaryUrl));
            if (summaryResponse.data.status !== "1") {
              throw new Error("Failed to fetch summary data from Etherscan/BSCscan API.");
            }

            let allTxs = [];
            let page = 1;
            const pageSize = 1000;
            totalAmount = 0;
            totalAmountTraded = 0;
            totalTransactions = 0;

            while (true) {
              const url = `${apiBase}/api?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&startblock=0&endblock=99999999&sort=asc&page=${page}&offset=${pageSize}&apikey=${apiKey}`;
              const response = await retry(() => axios.get(url));

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

            const recentTxs = allTxs.slice(-100);
            txData = recentTxs.map((tx) => {
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
          } catch (usdtError) {
            console.error("USDT fetch error:", usdtError.message);
            currentBalance = 0;
            usdtEquivalent = 0;
            totalAmountTradedUSD = 0;
            txData = [];
            totalTransactions = 0;
            totalAmount = 0;
            totalAmountTraded = 0;
          }
        } else if (selectedChain.value === "eth" || selectedChain.value === "bnb") {
          const provider = new ethers.JsonRpcProvider(config.rpc, undefined, {
            pollingInterval: 1000,
            timeout: 5000,
          });

          const balance = await retry(() => provider.getBalance(address));
          console.log(`Raw ${config.symbol} Balance (wei): ${balance.toString()}`);
          currentBalance = parseFloat(ethers.formatUnits(balance, config.decimals));
          console.log(`Calculated ${config.symbol} Balance:`, currentBalance);

          if (currentBalance > config.maxBalance) {
            console.warn(
              `Unrealistic ${config.symbol} balance detected: ${currentBalance} for address: ${address}`
            );
            throw new Error(`Unrealistic ${config.symbol} balance detected. Please verify the address.`);
          }

          const apiBase = selectedChain.value === "eth" ? "https://api.etherscan.io" : "https://api.bscscan.com";
          const apiKey =
            selectedChain.value === "eth"
              ? import.meta.env.VITE_ETHERSCAN_API_KEY
              : import.meta.env.VITE_BSCSCAN_API_KEY;

          if (!apiKey) {
            throw new Error("Missing API key for transaction fetching.");
          }

          let allTxs = [];
          let page = 1;
          const pageSize = 1000;
          totalAmount = 0;
          totalAmountTraded = 0;
          totalTransactions = 0;

          while (true) {
            const url = `${apiBase}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&page=${page}&offset=${pageSize}&apikey=${apiKey}`;
            const response = await retry(() => axios.get(url));

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

          const recentTxs = allTxs.slice(-100);
          txData = recentTxs.map((tx) => {
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
            config.fallbackRpcs
          );
          currentBalance = balance / Math.pow(10, config.decimals);
          console.log(`Calculated ${config.symbol} Balance:`, currentBalance);

          if (currentBalance > config.maxBalance) {
            console.warn(
              `Unrealistic ${config.symbol} balance detected: ${currentBalance} for address: ${address}`
            );
            throw new Error(`Unrealistic ${config.symbol} balance detected. Please verify the address.`);
          }

          let allSignatures = [];
          let lastSignature = null;
          totalAmount = 0;
          totalAmountTraded = 0;
          totalTransactions = 0;

          while (true) {
            const signatures = await retry(
              async (rpc = config.rpc) => {
                if (rpc !== config.rpc) {
                  connection = new Connection(rpc, "confirmed");
                }
                return connection.getSignaturesForAddress(pubKey, {
                  limit: 1000,
                  before: lastSignature,
                });
              },
              3,
              1000,
              config.fallbackRpcs
            );

            if (signatures.length === 0) {
              break;
            }

            allSignatures = allSignatures.concat(signatures);
            totalTransactions += signatures.length;
            lastSignature = signatures[signatures.length - 1].signature;
            await delay(200);
          }

          const txPromises = allSignatures.map(async (sig, index) => {
            await delay(200 * (index % 5));
            const tx = await retry(
              async (rpc = config.rpc) => {
                if (rpc !== config.rpc) {
                  connection = new Connection(rpc, "confirmed");
                }
                return connection.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 });
              },
              3,
              1000,
              config.fallbackRpcs
            );

            if (!tx) {
              return null;
            }

            const preBalances = tx.meta.preBalances;
            const postBalances = tx.meta.postBalances;
            const accounts = tx.transaction.message.accountKeys;

            const senderIndex = accounts.findIndex((acc) => acc.pubkey.toBase58() === address);
            const amount =
              senderIndex !== -1
                ? (preBalances[senderIndex] - postBalances[senderIndex]) / Math.pow(10, config.decimals)
                : 0;
            if (amount > 0) totalAmount += amount;
            totalAmountTraded += Math.abs(amount);

            return {
              signature: sig.signature,
              tx,
              amount,
            };
          });

          const txResults = (await Promise.all(txPromises)).filter((tx) => tx !== null);

          const recentSignatures = allSignatures.slice(-100);
          const recentTxPromises = recentSignatures.map(async (sig, index) => {
            await delay(200 * (index % 5));
            const tx = await retry(
              async (rpc = config.rpc) => {
                if (rpc !== config.rpc) {
                  connection = new Connection(rpc, "confirmed");
                }
                return connection.getParsedTransaction(sig.signature, { maxSupportedTransactionVersion: 0 });
              },
              3,
              1000,
              config.fallbackRpcs
            );

            if (!tx) {
              return {
                hash: sig.signature,
                from: address,
                to: "N/A",
                value: "0",
                time: "N/A",
                gas: null,
                confirmations: null,
                blockHeight: null,
                status: "Data unavailable",
              };
            }

            const preBalances = tx.meta.preBalances;
            const postBalances = tx.meta.postBalances;
            const accounts = tx.transaction.message.accountKeys;

            const senderIndex = accounts.findIndex((acc) => acc.pubkey.toBase58() === address);
            const amount =
              senderIndex !== -1
                ? (preBalances[senderIndex] - postBalances[senderIndex]) / Math.pow(10, config.decimals)
                : 0;

            const receiverIndex = accounts.findIndex(
              (acc, idx) => idx !== senderIndex && postBalances[idx] - preBalances[idx] > 0
            );
            const toAddress = receiverIndex !== -1 ? accounts[receiverIndex].pubkey.toBase58() : "N/A";

            return {
              hash: sig.signature,
              from: address,
              to: toAddress,
              value: amount.toFixed(4),
              time: tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : null,
              gas: tx.meta.fee / Math.pow(10, config.decimals),
              confirmations: sig.confirmationStatus || null,
              blockHeight: tx.slot || null,
              status: tx.meta.err ? "Failed" : "Success",
            };
          });

          txData = await Promise.all(recentTxPromises);
          txData.sort((a, b) => new Date(a.time || 0) - new Date(b.time || 0));
        } else if (selectedChain.value === "btc") {
          const addressUrl = `${config.api}/address/${address}`;
          const response = await retry(() => axios.get(addressUrl));

          if (!response.data || typeof response.data !== "object") {
            throw new Error("Invalid response from mempool.space API.");
          }

          const chainStats = response.data.chain_stats;
          currentBalance = (chainStats.funded_txo_sum - chainStats.spent_txo_sum) / Math.pow(10, config.decimals);
          totalTransactions = chainStats.tx_count;
          totalAmount = chainStats.spent_txo_sum / Math.pow(10, config.decimals);
          totalAmountTraded = (chainStats.funded_txo_sum + chainStats.spent_txo_sum) / Math.pow(10, config.decimals);

          if (currentBalance < 0) {
            throw new Error("Invalid Bitcoin balance: negative value.");
          }

          if (currentBalance > config.maxBalance) {
            console.warn(
              `Unrealistic ${config.symbol} balance detected: ${currentBalance} for address: ${address}`
            );
            throw new Error(`Unrealistic ${config.symbol} balance detected. Please verify the address.`);
          }

          const txUrl = `${config.api}/address/${address}/txs`;
          const txResponse = await retry(() => axios.get(txUrl));

          if (!Array.isArray(txResponse.data)) {
            throw new Error("Invalid transaction data from mempool.space API.");
          }

          if (txResponse.data.length > 0) {
            txData = txResponse.data.slice(0, 100).map((tx) => {
              const inputs = tx.vin.map((vin) => vin.prevout?.scriptpubkey_address || "N/A");
              const outputs = tx.vout.map((vout) => ({
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

            txData.sort((a, b) => new Date(a.time || 0) - new Date(b.time || 0));
          } else {
            txData = [];
          }
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
              axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`)
            );
            const priceData = priceResponse.data[coinId];
            console.log("CoinGecko Response:", JSON.stringify(priceResponse.data, null, 2));
            if (!priceData || typeof priceData.usd !== "number" || priceData.usd <= 0) {
              console.warn(`Invalid USD price for ${coinId}:`, priceData?.usd);
              throw new Error("Invalid or zero USD price from CoinGecko.");
            }
            pricePerToken = priceData.usd;
            usdtEquivalent = currentBalance * pricePerToken;
            totalAmountTradedUSD = totalAmountTraded * pricePerToken;
          } catch (priceError) {
            console.error("Price fetch failed:", priceError.message);
            setError("USD conversion unavailable for this address.");
            usdtEquivalent = 0;
            totalAmountTradedUSD = 0;
          }
        } else {
          totalAmountTradedUSD = totalAmountTraded;
        }

        const summaryData = {
          totalTransactions,
          totalAmount: parseFloat(totalAmount).toLocaleString("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          }),
          totalAmountTraded: parseFloat(totalAmountTraded).toLocaleString("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          }),
          totalAmountTradedUSD: parseFloat(totalAmountTradedUSD).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
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
        console.log("Setting summary with:", summaryData);
        setTransactions(txData);
        setSummary(summaryData);
        console.log("Summary set, new state should be:", summaryData);
      } catch (err) {
        const errorMessage = err.message.includes('ERR_INTERNET_DISCONNECTED') || err.message.includes('Failed to fetch')
          ? 'No internet connection. Please check your network and try again.'
          : err.message.includes("403")
          ? "Solana RPC access denied. Please try again later or contact support."
          : `Failed to fetch transactions: ${err.message}`;
        setError(errorMessage);
        console.error("Fetch Error:", err.message);
        // Use a fallback symbol if selectedChain or chainConfig is not defined
        const cryptoSymbol = selectedChain?.value
          ? chainConfig[selectedChain.value]?.symbol || "Unknown"
          : "Unknown";
        const summaryData = {
          totalTransactions: 0,
          totalAmount: "0.0000",
          totalAmountTraded: "0.0000",
          totalAmountTradedUSD: "0.00",
          currentBalance: "0.0000",
          usdtEquivalent: "0.00",
          cryptoSymbol,
        };
        setTransactions([]);
        setSummary(summaryData);
        console.log("Error occurred, set default summary:", summaryData);
      } finally {
        setLoading(false);
      }
    }, 500),
    [selectedChain, address, setTransactions, setLoading, setError, setSummary, setHasSearched]
  );

  // Wrap fetchTransactions in a function to handle promise rejections
  const handleSearch = async () => {
    try {
      await fetchTransactions();
    } catch (err) {
      console.error("Search Error:", err.message);
      // Error is already handled in fetchTransactions, no need to set again
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