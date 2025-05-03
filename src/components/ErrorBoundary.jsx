import { useContext } from "react";
import { jsPDF } from "jspdf";
import Papa from "papaparse";
import { ExportButton } from "./styles";
import { motion } from "framer-motion";
import { ThemeContext } from "./ThemeContext";

const ExportButtons = ({ transactions }) => {
  const { colors } = useContext(ThemeContext);

  const exportToCSV = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Transaction Summary", 10, 10);
    doc.setFontSize(12);
    transactions.forEach((tx, index) => {
      const y = 20 + index * 20;
      doc.text(`Hash: ${tx.hash.slice(0, 10)}...`, 10, y);
      doc.text(`From: ${tx.from.slice(0, 10)}...`, 10, y + 5);
      doc.text(`To: ${tx.to.slice(0, 10)}...`, 10, y + 10);
      doc.text(`Value: ${tx.value}`, 10, y + 15);
      doc.text(`Gas Fee: ${tx.gas}`, 10, y + 20);
      doc.text(`Confirmations: ${tx.confirmations}`, 10, y + 25);
    });
    doc.save("transactions.pdf");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}
    >
      <ExportButton colors={colors} onClick={exportToCSV}>
        Export CSV
      </ExportButton>
      <ExportButton colors={colors} onClick={exportToPDF}>
        Export PDF
      </ExportButton>
    </motion.div>
  );
};

export default ExportButtons;