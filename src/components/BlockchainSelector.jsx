import { useContext } from "react";
import Select from "react-select";
import { ThemeContext } from "./ThemeContext";
import { motion } from "framer-motion";

const BlockchainSelector = ({ selectedChain, setSelectedChain }) => {
  const { colors } = useContext(ThemeContext);

  const options = [
    { value: "eth", label: "Ethereum" },
    { value: "sol", label: "Solana" },
    { value: "btc", label: "Bitcoin" },
    { value: "bnb", label: "BNB Chain" },
    { value: "usdt-eth", label: "USDT (Ethereum)" },
    { value: "usdt-bnb", label: "USDT (BNB Chain)" },
  ];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: colors.cardBackground,
      borderColor: colors.textSecondary,
      color: colors.textPrimary,
      boxShadow: "none",
      "&:hover": {
        borderColor: colors.accent,
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: colors.cardBackground,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? colors.accent
        : state.isFocused
        ? colors.textSecondary
        : colors.cardBackground,
      color: colors.textPrimary,
      "&:hover": {
        backgroundColor: colors.textSecondary,
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: colors.textPrimary,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Select
        options={options}
        value={selectedChain}
        onChange={setSelectedChain}
        placeholder="Select Blockchain"
        styles={customStyles}
        isSearchable={false} 
      />
    </motion.div>
  );
};

export default BlockchainSelector;