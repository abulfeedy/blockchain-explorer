import { useState, useContext, useEffect } from "react";
import ThemeProvider, { ThemeContext } from "./components/ThemeContext";
import BlockchainSelector from "./components/BlockchainSelector";
import AddressInput from "./components/AddressInput";
import TransactionList from "./components/TransactionList";
import ExportButtons from "./components/ExportButtons";
import Switch from "react-switch";
import { FaMoon, FaSun } from "react-icons/fa";
import {
  AppContainer,
  Header,
  Title,
  ContentWrapper,
  Footer,
  VibeSelectorWrapper,
  VibeLabel,
  VibeSelect,
  VibeSpan,
  PopupOverlay,
  PopupContent,
  PopupInput,
  PopupButton,
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
  const [vibeStyle, setVibeStyle] = useState("nigerian");
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [showSocialSharePopup, setShowSocialSharePopup] = useState(false);
  const [inputName, setInputName] = useState("");
  const [shareImageData, setShareImageData] = useState(null);
  const [shareText, setShareText] = useState("");
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

    console.log("URL Params:", { chainParam, addressParam });

    if (chainParam) {
      const chainOption = blockchainOptions.find(option => option.value === chainParam);
      if (chainOption) {
        setSelectedChain(chainOption);
      }
    }

    if (addressParam) {
      setAddress(addressParam);
    }

    if (chainParam && addressParam) {
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    setTransactions([]);
    setSummary(null);
    setError(null);
    setHasSearched(false);
    setCurrentPage(1);
  }, [selectedChain?.value, address]);

  const indexOfLastTx = currentPage * transactionsPerPage;
  const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTx, indexOfLastTx);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const getAddressVibe = (totalAmountTradedUSD, usdtEquivalent) => {
    const traded = parseFloat(totalAmountTradedUSD.replace(/,/g, "")) || 0;
    const balance = parseFloat(usdtEquivalent.replace(/,/g, "")) || 0;
    const titles = {
      nigerian: [
        { title: "Azaman 🦁", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "Real blockchain royalty. Money na water. The street dey worship you and so does the blockchain!" },
        { title: "Odogwu 🔥", tradedMin: 10001, tradedMax: 1000000, balance: 0, tooltip: "Odogwu with the Big trades. You're leading the pride, lion style. Blockcahin dey salama bossman!" },
        { title: "Big Fish 🐳", tradedMin: 1001, tradedMax: 10000, balance: 0, tooltip: "You dey swim for deep water. The big player! Making waves with solid trades!" },
        { title: "Mazi 🕶️", tradedMin: 51, tradedMax: 1000, balance: 0, tooltip: "The boss on the rise! you self no small pulling few heavy trades, blockcahin dey salama!" },
        { title: "Ah! U Broke 😅", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "Omo, step it up! Low trades and funds? hustle harder brokie!" },
      ],
      american: [
        { title: "Tycoon 💰", tradedMin: 1000001, tradedMax: Infinity, balance: 0, tooltip: "The crypto mogul! Dominating the blockchain, Making M's on-chain. Everyone wants your alpha, OG!" },
        { title: "Ballin’ 🏀", tradedMin: 10001, tradedMax: 1000000, balance: 0, tooltip: "Living large! Big plays, fast gains. This wallet don’t miss!" },
        { title: "Heavy Hitter ⚾", tradedMin: 1001, tradedMax: 10000, balance: 0, tooltip: "A major player! Stepping into the market like a boss. Solid swings and solid bags" },
        { title: "Hustler 😎", tradedMin: 51, tradedMax: 1000, balance: 0, tooltip: "Grinding hard! Every satoshi earned with grind. From the mud to the moon" },
        { title: "Rookie 🥶", tradedMin: 0, tradedMax: 50, balance: 0, tooltip: "brokie! Well every whale started as a guppy. Time to level up brokie!" },
      ],
    };

    const selectedTitles = titles[vibeStyle] || titles.nigerian;
    for (const { title, tradedMin, tradedMax, balance: balanceThreshold, tooltip } of selectedTitles) {
      if (traded >= tradedMin && traded <= tradedMax && balance >= balanceThreshold) {
        return { title, tooltip };
      }
    }
    return selectedTitles[selectedTitles.length - 1];
  };

  const isBrokeStatus = (vibeTitle) => {
    return vibeTitle === "Ah! U Broke 😅" || vibeTitle === "Rookie 🥶";
  };

  const generateSummaryImage = async (name = "") => {
    const summaryElement = document.getElementById("summary-content");
    if (!summaryElement) {
      console.error("Summary content element not found");
      return null;
    }

    const canvas = await html2canvas(summaryElement, { 
      backgroundColor: null,
      scale: 2,
    });

    const padding = 20;
    const headlineHeight = 60; // Fixed height for headline
    const tooltipLineHeight = 22; // Increased to accommodate larger text
    const tooltipMaxLines = 4; // Max lines for tooltip text
    const tooltipHeight = tooltipLineHeight * tooltipMaxLines + 20; // Fixed height for tooltip
    const summaryTopPadding = 20; // Padding between tooltip and summary content

    // Calculate final canvas height
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = canvas.width + padding * 2;
    finalCanvas.height = headlineHeight + tooltipHeight + canvas.height + padding * 2 + summaryTopPadding;
    const ctx = finalCanvas.getContext("2d");

    // Draw background and border
    const borderRadius = 20;
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

    // Draw watermark
    ctx.font = "60px Arial";
    ctx.fillStyle = colors.accent;
    ctx.globalAlpha = 0.3;
    ctx.textAlign = "center";
    ctx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(APP_NAME, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;

    // Draw headline
    ctx.fillStyle = colors.textPrimary;
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    const vibeTitle = summary ? getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent).title : "Investor 💼";
    const headline = vibeTitle === "Ah! U Broke 😅"
      ? `${name ? `${name}, ` : ""}${vibeTitle}`
      : `${name ? `${name}, ` : ""}${vibeStyle === "nigerian" ? "You Be" : "You"} ${vibeTitle}`;
    const headlineY = padding + 30;
    ctx.fillText(headline, finalCanvas.width / 2, headlineY);

    // Draw tooltip with larger text
    const tooltipText = summary ? getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent).tooltip : "No vibe available.";
    ctx.font = "18px Arial"; // Increased from 16px to 18px
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

    // Center the tooltip text vertically within the allocated height
    const totalTooltipHeight = lines.length * tooltipLineHeight;
    const tooltipStartY = headlineY + 30 + (tooltipHeight - totalTooltipHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, finalCanvas.width / 2, tooltipStartY + index * tooltipLineHeight);
    });

    // Draw the summary content
    const summaryY = headlineY + tooltipHeight + summaryTopPadding;
    ctx.drawImage(canvas, padding, summaryY);

    // Draw border
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

    const vibeTitle = summary ? getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent).title : "Investor 💼";
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/?chain=${selectedChain?.value}&address=${address}`;
    const flexText = isBrokeStatus(vibeTitle) ? "Your addy ain’t flexing" : "Your addy’s flexing";
    const vibeText = vibeTitle === "Ah! U Broke 😅"
      ? `${name ? `${name}, ` : ""}${vibeTitle}!`
      : `${name ? `${name}, ` : ""}${vibeStyle === "nigerian" ? "You Be" : "You"} ${vibeTitle}!`;
    const shareText = `${vibeText} ${flexText} on ${APP_NAME}! Check: ${shareUrl}`;

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
    if (action === "share") {
      handleShare(inputName);
    } else if (action === "download") {
      handleDownload(inputName);
    }
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
      </Header>
      <ContentWrapper>
        <VibeSelectorWrapper>
          <VibeLabel colors={colors}>Vibe Style:</VibeLabel>
          <VibeSelect
            colors={colors}
            value={vibeStyle}
            onChange={(e) => setVibeStyle(e.target.value)}
          >
            <option value="nigerian">Nigerian 🇳🇬</option>
            <option value="american">American 🇺🇸</option>
          </VibeSelect>
        </VibeSelectorWrapper>
        {/* Stack BlockchainSelector and AddressInput vertically on PC */}
        <div
          style={{
            display: "flex",
            flexDirection: "column", // Default to column for PC
            alignItems: "center", // Center items horizontally
            gap: "10px",
            width: "100%",
            maxWidth: "300px", // Match the input width for consistency
            margin: "0 auto",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 10,
            '@media (maxWidth: 768px)': {
              flexDirection: "row", // Horizontal on mobile
              maxWidth: "800px", // Wider on mobile to accommodate horizontal layout
              flexWrap: "wrap", // Allow wrapping on small screens
              gap: "20px", // Match previous mobile spacing
            },
          }}
        >
          <div
            style={{
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            <BlockchainSelector
              selectedChain={selectedChain}
              setSelectedChain={setSelectedChain}
              style={{ width: "100%", maxWidth: "300px" }}
            />
          </div>
          <div
            style={{
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "300px",
            }}
          >
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
          <p style={{ color: "red", textAlign: "center", margin: "10px 0" }}>
            {error}
          </p>
        )}
        {hasSearched && !loading && !error && (
          <>
            {summary && (
              <div id="summary-section" style={{ textAlign: "center", margin: "20px 0" }}>
                <div
                  id="summary-content"
                  style={{
                    padding: "10px",
                    backgroundColor: colors.cardBackground,
                    borderRadius: "8px",
                    display: "inline-block",
                    textAlign: "center",
                    minWidth: "300px",
                    maxWidth: "100%", // Ensure it doesn't exceed parent
                    boxSizing: "border-box",
                  }}
                >
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
                </div>
                <h4 style={{ color: colors.textPrimary, margin: "10px 0" }}>
                  Address Vibe:{" "}
                  <VibeSpan
                    colors={colors}
                    data-tooltip={getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent).tooltip}
                  >
                    {getAddressVibe(summary.totalAmountTradedUSD, summary.usdtEquivalent).title}
                  </VibeSpan>
                </h4>
                <button
                  onClick={() => setShowNamePopup(true)}
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.textPrimary,
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
                    {navigator.share && (
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
                <div style={{ textAlign: "center", margin: "20px 0", width: "100%", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      margin: "0 5px",
                      padding: "5px 10px",
                      backgroundColor: currentPage === 1 ? colors.textSecondary : colors.accent,
                      color: colors.textPrimary,
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
                      color: colors.textPrimary,
                      border: "none",
                      borderRadius: "5px",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next
                  </button>
                  <p style={{ color: colors.textSecondary, marginTop: "10px" }}>
                    Page {currentPage} of {totalPages} (Total Transactions: {transactions.length})
                  </p>
                </div>
                <div style={{ textAlign: "center", margin: "20px 0", width: "100%", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
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
      <Footer colors={colors}>
        <p>© 2025 {APP_NAME}</p>
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