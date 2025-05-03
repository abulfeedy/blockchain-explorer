import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { TransactionCard, CardHeader, CardContent, MemeText } from "./styles";
import { motion } from "framer-motion";

const TransactionList = ({ transactions, selectedChain }) => {
  const { colors } = useContext(ThemeContext);

  const getMemeComment = (value) => {
    const amount = parseFloat(value);
    if (selectedChain?.value === "btc") {
      if (amount > 5) return "Whale Alert! 🐳";
      if (amount > 1) return "Big Spender! 💸";
      if (amount > 0.5) return "This Address on Fire! 🔥";
    } else {
      if (amount > 500) return "Whale Alert! 🐳";
      if (amount > 100) return "Big Spender! 💸";
      if (amount > 50) return "This Address on Fire! 🔥";
    }
    return null;
  };

  if (!transactions || transactions.length === 0) {
    return null; // Don't render anything if there are no transactions for this page
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width: "100%",
        maxWidth: "800px", // Match ContentWrapper's max-width
        margin: "0 auto", // Center the content
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ color: colors.textPrimary, textAlign: "center", marginBottom: "20px" }}>
        Transaction History
      </h3>
      {transactions.map((tx) => {
        const memeComment = getMemeComment(tx.value);
        const explorerUrl =
          selectedChain?.value === "eth" || selectedChain?.value === "usdt-eth"
            ? `https://etherscan.io/tx/${tx.hash}`
            : selectedChain?.value === "bnb" || selectedChain?.value === "usdt-bnb"
            ? `https://bscscan.com/tx/${tx.hash}`
            : selectedChain?.value === "sol"
            ? `https://solscan.io/tx/${tx.hash}`
            : `https://mempool.space/tx/${tx.hash}`;

        return (
          <TransactionCard key={tx.hash} colors={colors}>
            <CardHeader colors={colors}>
              <span>
                Hash: {" "}
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: colors.accent, textDecoration: "none" }}
                >
                  {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                </a>
              </span>
              <span>{tx.time || "N/A"}</span>
            </CardHeader>
            <CardContent colors={colors}>
              <p>
                Amount: {tx.value !== "N/A" ? `${tx.value} ${selectedChain?.value.startsWith("usdt") ? "USDT" : selectedChain?.label || ""}` : "N/A"}
              </p>
              <p>From: {tx.from.slice(0, 6)}...{tx.from.slice(-4)}</p>
              <p>
                To: {tx.to !== "N/A" ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : "N/A"}
                {selectedChain?.value === "btc" && tx.outputs?.length > 1 && (
                  <span> (+{tx.outputs.length - 1} more outputs)</span>
                )}
              </p>
              {selectedChain?.value === "btc" && tx.outputs?.length > 1 && (
                <div>
                  <p>Additional Outputs:</p>
                  <ul>
                    {tx.outputs.slice(1).map((out, idx) => (
                      <li key={idx}>
                        {out.addr.slice(0, 6)}...{out.addr.slice(-4)}: {out.value.toFixed(4)} BTC
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tx.gas !== null && (
                <p>{selectedChain?.value === "btc" ? "Fee" : "Gas Fee"}: {tx.gas}</p>
              )}
              {tx.blockHeight !== null && (
                <p>Block Height: {tx.blockHeight}</p>
              )}
              {tx.confirmations !== null && (
                <p>Confirmations: {tx.confirmations}</p>
              )}
              <p>Status: <span style={{ color: tx.status === "Success" ? "green" : "red" }}>{tx.status}</span></p>
              {memeComment && (
                <MemeText colors={colors}>{memeComment}</MemeText>
              )}
            </CardContent>
          </TransactionCard>
        );
      })}
    </motion.div>
  );
};

export default TransactionList;