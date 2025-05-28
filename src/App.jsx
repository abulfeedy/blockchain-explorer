import { useState, useContext, useEffect } from "react";
import ThemeProvider, { ThemeContext } from "./components/ThemeContext";
import BlockchainSelector from "./components/BlockchainSelector";
import AddressInput from "./components/AddressInput";
import TransactionList from "./components/TransactionList";
import ExportButtons from "./components/ExportButtons";
import VibeSelector, { getAddressVibe, isBrokeStatus } from "./components/VibeSelector";
import HodlTracker from "./components/HodlTracker";
import About from "./components/About"; 
import InfoIcon from "./components/InfoIcon"; 
import Switch from "react-switch";
import { FaMoon, FaSun } from "react-icons/fa";
import {
  AppContainer,
  Header,
  Title,
  ContentWrapper,
  Footer,
  PopupOverlay,
  PopupContent,
  PopupInput,
  PopupButton,
  VibeSpan,
  TabContainer,
  Tab,
  SummaryCard,
} from "./components/styles";
import html2canvas from "html2canvas";
import { APP_NAME } from "./config";

function AppContent() {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const [selectedChain, setSelectedChain] = useState(null);
  const [address, setAddress] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [vibeStyle, setVibeStyle] = useState("american");
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [showSocialSharePopup, setShowSocialSharePopup] = useState(false);
  const [inputName, setInputName] = useState("");
  const [shareImageData, setShareImageData] = useState(null);
  const [shareText, setShareText] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [hodlData, setHodlData] = useState(null); 
   const [isAboutOpen, setIsAboutOpen] = useState(false);
  const transactionsPerPage = 50;

  const blockchainOptions = [
    { value: "eth", label: "Ethereum" },
    { value: "sol", label: "Solana" },
    { value: "btc", label: "Bitcoin" },
    { value: "bnb", label: "BNB Chain" },
    { value: "usdt-eth", label: "USDT (Ethereum)" },
    { value: "usdt-bnb", label: "USDT (BNB Chain)" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chainParam = params.get("chain");
    const addressParam = params.get("address");

    if (chainParam) {
      const chainOption = blockchainOptions.find((option) => option.value === chainParam);
      if (chainOption) setSelectedChain(chainOption);
    }
    if (addressParam) setAddress(addressParam);
    if (chainParam && addressParam) setHasSearched(true);
  }, []);

  useEffect(() => {
    setTransactions([]);
    setSummary(null);
    setError(null);
    setHasSearched(false);
    setCurrentPage(1);
    setActiveTab("summary");
    setHodlData(null); // Reset HODL data
  }, [selectedChain?.value, address]);

  const indexOfLastTx = currentPage * transactionsPerPage;
  const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTx, indexOfLastTx);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const tooltipText = summary
    ? getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent, vibeStyle).tooltip
    : "No vibe available.";

  const generateSummaryImage = async (name = "") => {
    const summaryElement = document.getElementById("summary-content");
    if (!summaryElement) return null;

    const borderRadius = 10;
    const canvas = await html2canvas(summaryElement, {
      backgroundColor: null,
      scale: 2,
    });

    const padding = 20;
    const headlineHeight = 60;
    const tooltipLineHeight = 22;
    const tooltipMaxLines = 4; // Only for summary tab
    const tooltipHeight = activeTab === "summary" ? tooltipLineHeight * tooltipMaxLines + 20 : 0; // No tooltip height for hodl
    const summaryTopPadding = 20;

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = canvas.width + padding * 2;
    finalCanvas.height = headlineHeight + tooltipHeight + canvas.height + padding * 2 + summaryTopPadding;
    const ctx = finalCanvas.getContext("2d");

    ctx.fillStyle = colors.cardBackground;
    ctx.beginPath();
    ctx.moveTo(borderRadius, 0);
    ctx.lineTo(finalCanvas.width - borderRadius, 0);
    ctx.arcTo(finalCanvas.width, 0, finalCanvas.width, borderRadius, borderRadius);
    ctx.lineTo(finalCanvas.width, finalCanvas.height - borderRadius);
    ctx.arcTo(finalCanvas.width, finalCanvas.height, finalCanvas.width - borderRadius, finalCanvas.height, borderRadius);
    ctx.lineTo(borderRadius, finalCanvas.height);
    ctx.arcTo(0, finalCanvas.height, 0, finalCanvas.height - borderRadius, borderRadius);
    ctx.lineTo(0, borderRadius);
    ctx.arcTo(0, 0, borderRadius, 0, borderRadius);
    ctx.closePath();
    ctx.fill();

    ctx.font = "60px Arial";
    ctx.fillStyle = colors.accent;
    ctx.globalAlpha = 0.3;
    ctx.textAlign = "center";
    ctx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(APP_NAME, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;

    ctx.fillStyle = colors.textPrimary;
    ctx.font = "24px Arial";
    const vibeTitle = summary
      ? getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent, vibeStyle).title
      : "Investor 💼";
    const headline =
      vibeTitle === "Ah! U Broke 😅"
        ? `${name ? `${name}, ` : ""}${vibeTitle}`
        : `${name ? `${name}, ` : ""}${vibeStyle === "nigerian" || vibeStyle === "ghanaian" ? "You Be" : "You"} ${vibeTitle}`;
    const headlineY = padding + 30;
    ctx.fillText(headline, finalCanvas.width / 2, headlineY);

    // Only render tooltip for summary tab
    if (activeTab === "summary") {
      const tooltipText = summary
        ? getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent, vibeStyle).tooltip
        : "No vibe available.";
      ctx.font = "18px Arial";
      ctx.fillStyle = colors.textSecondary;
      const maxWidth = finalCanvas.width - padding * 2;
      const words = tooltipText.split(" ");
      let line = "";
      let y = headlineY + 30;
      const lines = [];
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          lines.push(line.trim());
          line = words[i] + " ";
          y += tooltipLineHeight;
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      const totalTooltipHeight = lines.length * tooltipLineHeight;
      const tooltipStartY = headlineY + 30 + (tooltipHeight - totalTooltipHeight) / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line, finalCanvas.width / 2, tooltipStartY + index * tooltipLineHeight);
      });
    }

    const summaryY = headlineY + tooltipHeight + summaryTopPadding;
    ctx.drawImage(canvas, padding, summaryY);

    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(borderRadius, 0);
    ctx.lineTo(finalCanvas.width - borderRadius, 0);
    ctx.arcTo(finalCanvas.width, 0, finalCanvas.width, borderRadius, borderRadius);
    ctx.lineTo(finalCanvas.width, finalCanvas.height - borderRadius);
    ctx.arcTo(finalCanvas.width, finalCanvas.height, finalCanvas.width - borderRadius, finalCanvas.height, borderRadius);
    ctx.lineTo(borderRadius, finalCanvas.height);
    ctx.arcTo(0, finalCanvas.height, 0, finalCanvas.height - borderRadius, borderRadius);
    ctx.lineTo(0, borderRadius);
    ctx.arcTo(0, 0, borderRadius, 0, borderRadius);
    ctx.closePath();
    ctx.stroke();

    return finalCanvas.toDataURL("image/png");
  };

  const handleShare = async (name = "") => {
    const finalImgData = await generateSummaryImage(name);
    if (!finalImgData) {
      alert("Failed to generate image for sharing.");
      return;
    }

    const vibeTitle = summary
      ? getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent, vibeStyle).title
      : "Investor 💼";
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/?chain=${selectedChain?.value}&address=${address}`;
    const flexText = isBrokeStatus(vibeTitle) ? "Your addy ain’t flexing" : "Your addy’s flexing";
    const vibeText =
      vibeTitle === "Ah! U Broke 😅"
        ? `${name ? `${name}, ` : ""}${vibeTitle}!`
        : `${name ? `${name}, ` : ""}${vibeStyle === "nigerian" || vibeStyle === "ghanaian" ? "You Be" : "You"} ${vibeTitle}!`;
    const hodlText =
      activeTab === "hodl" && hodlData
        ? ` You HODLing ${summary.currentBalance} ${summary.cryptoSymbol} since ${hodlData.startYear} (${hodlData.duration} ${hodlData.duration === 1 ? "year" : "years"} ago)`
        : "";
    const shareText = `${vibeText}${hodlText} ${flexText} on ${APP_NAME}! Check: ${shareUrl}`;

    setShareImageData(finalImgData);
    setShareText(shareText);
    setShowSocialSharePopup(true);
  };

  const handleSocialShare = (platform) => {
    const encodedText = encodeURIComponent(shareText);
    const shareUrls = {
      x: `https://x.com/intent/post?text=${encodedText}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareText)}`,
      instagram: null,
    };

    if (platform === "instagram") {
      alert(
        "Instagram doesn’t support direct sharing via URL. Please download the image using the 'Download' option and share it manually on Instagram."
      );
    } else {
      window.open(shareUrls[platform], "_blank");
      alert(
        "Please download the image using the 'Download' option and attach it to your post if needed."
      );
    }
    setShowSocialSharePopup(false);
  };

  const handleWebShare = async (name = "") => {
    const finalImgData = await generateSummaryImage(name);
    if (!finalImgData) {
      alert("Failed to generate image for sharing.");
      return;
    }

    const response = await fetch(finalImgData);
    const blob = await response.blob();
    const file = new File([blob], `${APP_NAME}_Address_Summary.png`, { type: "image/png" });

    const shareData = {
      title: `${APP_NAME} Address Summary`,
      text: shareText,
      files: [file],
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Web Share failed:", err);
        alert("Sharing failed. Please download the image and share manually.");
      }
    } else {
      alert("Web Share is not supported on this device. Please download the image and share manually.");
    }
    setShowSocialSharePopup(false);
  };

  const handleDownload = async (name = "") => {
    const finalImgData = await generateSummaryImage(name);
    if (!finalImgData) {
      alert("Failed to generate image for download.");
      return;
    }
    const link = document.createElement("a");
    link.href = finalImgData;
    link.download = `${APP_NAME}_Address_Summary.png`;
    link.click();
  };

  const handleNameSubmit = (action) => {
    if (action === "share") handleShare(inputName);
    else if (action === "download") handleDownload(inputName);
    setShowNamePopup(false);
    setInputName("");
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AppContainer colors={colors}>
      <Header>
        <Title colors={colors}>{APP_NAME}</Title>
        <Switch
          onChange={toggleTheme}
          checked={theme === "dark"}
          onColor={colors.accent}
          offColor={colors.textSecondary}
          checkedIcon={<FaMoon style={{ padding: 4 }} />}
          uncheckedIcon={<FaSun style={{ padding: 4 }} />}
        />
         <InfoIcon onClick={() => setIsAboutOpen(true)} />
      </Header>
      <ContentWrapper>
        <VibeSelector vibeStyle={vibeStyle} setVibeStyle={setVibeStyle} colors={colors} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            maxWidth: "300px",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "100%", maxWidth: "300px" }}>
            <BlockchainSelector
              selectedChain={selectedChain}
              setSelectedChain={setSelectedChain}
              style={{ width: "100%", maxWidth: "300px" }}
            />
          </div>
          <div style={{ width: "100%", maxWidth: "300px" }}>
            <AddressInput
              address={address}
              setAddress={setAddress}
              selectedChain={selectedChain}
              setTransactions={setTransactions}
              setLoading={setLoading}
              setError={setError}
              setSummary={setSummary}
              setHasSearched={setHasSearched}
              style={{ width: "100%", maxWidth: "300px", boxSizing: "border-box" }}
            />
          </div>
        </div>
        {loading && (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <p style={{ color: colors.textSecondary }}>Loading...</p>
          </div>
        )}
        {error && (
          <p style={{ color: "red", textAlign: "center", margin: "10px 0" }}>{error}</p>
        )}
        {hasSearched && !loading && !error && (
          <>
            {summary && (
              <div id="summary-section" style={{ textAlign: "center", margin: "20px 0" }}>
                <SummaryCard colors={colors}>
                  <TabContainer>
                    <Tab
                      colors={colors}
                      active={activeTab === "summary"}
                      onClick={() => setActiveTab("summary")}
                    >
                      Summary
                    </Tab>
                    {["btc", "eth", "bnb"].includes(selectedChain?.value) && (
                      <Tab
                        colors={colors}
                        active={activeTab === "hodl"}
                        onClick={() => setActiveTab("hodl")}
                      >
                        HODL History
                      </Tab>
                    )}
                  </TabContainer>
                  <div id="summary-content">
                    {activeTab === "summary" ? (
                      <>
                        <h3 style={{ color: colors.textPrimary, margin: "0 0 10px 0" }}>
                          Address Summary
                        </h3>
                        <p style={{ color: colors.textSecondary, margin: "5px 0" }}>
                          Current Balance: {summary.currentBalance} {summary.cryptoSymbol}
                        </p>
                        <p style={{ color: colors.textSecondary, margin: "5px 0" }}>
                          Equivalent in USD: ${summary.usdtEquivalent}
                        </p>
                        <p style={{ color: colors.textSecondary, margin: "5px 0" }}>
                          Total Transactions: {summary.totalTransactions}
                        </p>
                        <p style={{ color: colors.textSecondary, margin: "5px 0" }}>
                          Total Amount Sent: {summary.totalAmount} {summary.cryptoSymbol}
                        </p>
                        <p style={{ color: colors.textSecondary, margin: "5px 0" }}>
                          Total Amount Traded: {summary.totalAmountTraded} {summary.cryptoSymbol}
                          <br />
                          (${summary.totalAmountTradedUSD})
                        </p>
                      </>
                    ) : (
                      <HodlTracker
                        chain={selectedChain?.value}
                        address={address}
                        summary={summary}
                        vibeStyle={vibeStyle}
                        colors={colors}
                        setHodlData={setHodlData}
                      />
                    )}
                  </div>
                </SummaryCard>
                {activeTab === "summary" && (
                  <h4 style={{ color: colors.textPrimary, margin: "10px 0" }}>
                    Address Vibe:{" "}
                    <VibeSpan
                      colors={colors}
                      data-tooltip={getAddressVibe(
                        summary.totalAmountTradedUSD,
                        summary.usdtEquivalent,
                        vibeStyle
                      ).tooltip}
                    >
                      {getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent, vibeStyle)
                        .title}
                    </VibeSpan>
                  </h4>
                )}
                <button
                  onClick={() => setShowNamePopup(true)}
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.background,
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "10px",
                    width: "100%",
                    maxWidth: "300px",
                    boxSizing: "border-box",
                  }}
                >
                  Share/Download Summary
                </button>
              </div>
            )}
            {showNamePopup && (
              <PopupOverlay>
                <PopupContent colors={colors}>
                  <h3>Personalize Your Vibe</h3>
                  <PopupInput
                    colors={colors}
                    type="text"
                    placeholder="Enter Name (Optional)"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value.slice(0, 20))}
                  />
                  <div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                      <PopupButton colors={colors} onClick={() => handleNameSubmit("share")}>
                        Share
                      </PopupButton>
                      <PopupButton colors={colors} onClick={() => handleNameSubmit("download")}>
                        Download
                      </PopupButton>
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <PopupButton
                        colors={colors}
                        onClick={() => {
                          setShowNamePopup(false);
                          setInputName("");
                        }}
                      >
                        Cancel
                      </PopupButton>
                    </div>
                  </div>
                </PopupContent>
              </PopupOverlay>
            )}
            {showSocialSharePopup && (
              <PopupOverlay>
                <PopupContent colors={colors}>
                  <h3>Share on Social Media</h3>
                  <p
                    style={{
                      color: colors.textSecondary,
                      textAlign: "center",
                      marginBottom: "10px",
                    }}
                  >
                    Select a platform to share your vibe. Download the image using the 'Download'
                    option to attach it to your post. For Instagram, open the app and create a new
                    post with the downloaded image.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      justifyContent: "center",
                    }}
                  >
                    <PopupButton colors={colors} onClick={() => handleSocialShare("x")}>
                      X
                    </PopupButton>
                    <PopupButton colors={colors} onClick={() => handleSocialShare("whatsapp")}>
                      WhatsApp
                    </PopupButton>
                    <PopupButton colors={colors} onClick={() => handleSocialShare("facebook")}>
                      Facebook
                    </PopupButton>
                    <PopupButton colors={colors} onClick={() => handleSocialShare("instagram")}>
                      Instagram
                    </PopupButton>
                    {navigator.canShare && (
                      <PopupButton colors={colors} onClick={() => handleWebShare(inputName)}>
                        Share via Device
                      </PopupButton>
                    )}
                    <PopupButton
                      colors={colors}
                      onClick={() => {
                        setShowSocialSharePopup(false);
                      }}
                    >
                      Cancel
                    </PopupButton>
                  </div>
                </PopupContent>
              </PopupOverlay>
            )}
            {hasSearched && !loading && !error && transactions.length > 0 ? (
              <>
                <TransactionList transactions={currentTransactions} selectedChain={selectedChain} />
                <div
                  style={{
                    textAlign: "center",
                    margin: "20px 0",
                    width: "100%",
                    maxWidth: "800px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      margin: "0 5px",
                      padding: "5px 10px",
                      backgroundColor: currentPage === 1 ? colors.textSecondary : colors.accent,
                      color: colors.background,
                      border: "none",
                      borderRadius: "5px",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      style={{
                        margin: "0 5px",
                        padding: "5px 10px",
                        backgroundColor: currentPage === page ? colors.accent : colors.cardBackground,
                        color: colors.textPrimary,
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      margin: "0 5px",
                      padding: "5px 10px",
                      backgroundColor: currentPage === totalPages ? colors.textSecondary : colors.accent,
                      color: colors.background,
                      border: "none",
                      borderRadius: "5px",
                      cursor: currentPage === totalPages ? "Registered" : "pointer",
                    }}
                  >
                    Next
                  </button>
                  <p style={{ color: colors.textSecondary, marginTop: "10px" }}>
                    Page {currentPage} of {totalPages} (Fetched Transactions: {transactions.length})
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    margin: "20px 0",
                    width: "100%",
                    maxWidth: "800px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <ExportButtons transactions={transactions} />
                </div>
              </>
            ) : hasSearched && !loading && !error ? (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p style={{ color: colors.textSecondary }}>
                  No transactions found for this address on {selectedChain?.label}.
                </p>
              </div>
            ) : null}
          </>
        )}
      </ContentWrapper>
      <About isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <Footer colors={colors}>
        <p>© 2023 {APP_NAME}</p>
      </Footer>
    </AppContainer>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
