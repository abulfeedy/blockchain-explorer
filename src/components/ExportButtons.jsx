import { useContext } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { ExportButton } from "./styles";
import { motion } from "framer-motion";
import { ThemeContext } from "./ThemeContext";

const ExportButtons = ({ transactions, disabled }) => {
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
    try {
      console.log("Export PDF button clicked");
      console.log("Transactions:", transactions);
      console.log("First Transaction:", transactions[0]);

      if (!transactions || transactions.length === 0) {
        throw new Error("No transactions available to export");
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const tableData = transactions.map((tx, index) => {
        const hash = tx.hash || tx.transactionHash || "N/A";
        const from = tx.from || tx.sender || "N/A";
        const to = tx.to || tx.recipient || "N/A";
        const value = tx.value || tx.amount || "0";
        const gas = tx.gas || tx.gasUsed || "0";
        const confirmations = tx.confirmations || tx.confirmationCount || "0";
        const date = tx.time ? tx.time.replace(/:\d{2}\s/, " ") : "N/A"; 

        return [
          (index + 1).toString(),
          hash.length > 16 ? `${hash.slice(0, 8)}...${hash.slice(-8)}` : hash,
          from.length > 16 ? `${from.slice(0, 8)}...${from.slice(-8)}` : from,
          to.length > 16 ? `${to.slice(0, 8)}...${to.slice(-8)}` : to,
          value,
          gas,
          confirmations,
          date,
        ];
      });

      console.log("Table Data:", tableData);
      console.log("First Table Row:", tableData[0]);

      const tableColumns = [
        "No.",
        "Hash",
        "From",
        "To",
        "Value",
        "Gas Fee",
        "Confirmations",
        "Date",
      ];

      doc.setFontSize(16);
      doc.setTextColor(colors.textPrimary || "#000000");
      doc.text("Transaction Summary", 10, 10);

      console.log("Calling autoTable with columns:", tableColumns);
      console.log("Calling autoTable with body:", tableData);

      autoTable(doc, {
        startY: 20,
        head: [tableColumns],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: colors.accent || "#000000",
          overflow: "linebreak",
          halign: "center",
        },
        headStyles: {
          fillColor: colors.accent || "#000000",
          textColor: colors.background || "#FFFFFF",
          fontSize: 9,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },  
          1: { cellWidth: 35, halign: "center" },  
          2: { cellWidth: 30, halign: "center" },  
          3: { cellWidth: 30, halign: "center" },  
          4: { cellWidth: 15, halign: "right" },   
          5: { cellWidth: 15, halign: "right" },   
          6: { cellWidth: 15, halign: "right" },   
          7: { cellWidth: 40, halign: "center" },  
        },
        margin: { left: 10, right: 10 },
        didDrawPage: (data) => {
          console.log("autoTable didDrawPage:", data);
          const pageCount = doc.internal.getNumberOfPages();
          const pageNumber = data.pageNumber;
          doc.setFontSize(8);
          doc.setTextColor(colors.textSecondary || "#666666");
          doc.text(`Page ${pageNumber} of ${pageCount}`, 190, 285);
        },
      });

      const finalY = doc.lastAutoTable.finalY || 20;
      doc.setFontSize(8);
      doc.setTextColor(colors.textSecondary || "#666666");
      doc.text(
        "Blockchain Exporer LIte",
        10,
        finalY + 10 > 285 ? 285 : finalY + 10
      );

      doc.save("transactions.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please check the console for details.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        marginTop: "20px",
        width: "100%",
      }}
    >
      <ExportButton colors={colors} onClick={exportToCSV} disabled={disabled}>
        Export CSV
      </ExportButton>
      <ExportButton colors={colors} onClick={exportToPDF} disabled={disabled}>
        Export PDF
      </ExportButton>
    </motion.div>
  );
};

export default ExportButtons;