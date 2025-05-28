import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTelegram, FaEnvelope } from "react-icons/fa";
import styled from "styled-components";

// Styled components for the About modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !["colors"].includes(prop),
})`
  background: ${(props) => props.colors?.cardBackground || "#fff"};
  border-radius: 10px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  position: relative;
  color: ${(props) => props.colors?.textPrimary || "#333"};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  max-height: 80vh;

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 95%;
  }
`;

const CloseButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !["colors"].includes(prop),
})`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: ${(props) => props.colors?.accent || "#007bff"};
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: ${(props) => props.colors?.accentHover || "#0056b3"};
  }
`;

const Title = styled.h2.withConfig({
  shouldForwardProp: (prop) => !["colors"].includes(prop),
})`
  color: ${(props) => props.colors?.accent || "#007bff"};
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const Subtitle = styled.h3.withConfig({
  shouldForwardProp: (prop) => !["colors"].includes(prop),
})`
  color: ${(props) => props.colors?.textPrimary || "#333"};
  font-size: 1.2rem;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Text = styled.p.withConfig({
  shouldForwardProp: (prop) => !["colors"].includes(prop),
})`
  color: ${(props) => props.colors?.textSecondary || "#666"};
  font-size: 1rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const List = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
  margin: 10px 0;
`;

const ListItem = styled.li.withConfig({
  shouldForwardProp: (prop) => !["colors"].includes(prop),
})`
  color: ${(props) => props.colors?.textSecondary || "#666"};
  font-size: 1rem;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ContactWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

const ContactLink = styled.a.withConfig({
  shouldForwardProp: (prop) => !["colors"].includes(prop),
})`
  color: ${(props) => props.colors?.accent || "#007bff"};
  font-size: 1.5rem;
  transition: color 0.3s;

  &:hover {
    color: ${(props) => props.colors?.accentHover || "#0056b3"};
  }
`;

const About = ({ isOpen, onClose }) => {
  const { colors } = useContext(ThemeContext);

  // Fallback colors if context is undefined
  const defaultColors = {
    cardBackground: "#fff",
    textPrimary: "#333",
    textSecondary: "#666",
    accent: "#007bff",
    accentHover: "#0056b3",
  };

  const safeColors = colors || defaultColors;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay onClick={onClose}>
          <ModalContent
            colors={safeColors}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton colors={safeColors} onClick={onClose}>
              <FaTimes />
            </CloseButton>
            <Title colors={safeColors}>Welcome to the Vibe Vault</Title>
            <Section>
              <Subtitle colors={safeColors}>What is Blockchain Explorer Lite?</Subtitle>
              <Text colors={safeColors}>
                Blockchain Explorer Lite is your go-to Web3 tool for diving into the pulse of blockchain addresses with style and swagger! We bring culture, fun, and flair to wallet analytics, turning raw data into vibrant insights. Whether you’re a crypto kingpin or a small-time hustler, our platform celebrates your journey with metrics that vibe with your roots.
              </Text>
            </Section>
            <Section>
              <Subtitle colors={safeColors}>Our Mission</Subtitle>
              <Text colors={safeColors}>
                We’re here to make blockchain exploration accessible and entertaining. By blending Web3 data with cultural vibes from countries like USA, Nigeria, South Africa, Brazil, UAE, India and more, we give every address a unique personality. Track your wallet’s hustle, flex your crypto achievements, and share your blockchain swagger with the world!
              </Text>
            </Section>
            <Section>
              <Subtitle colors={safeColors}>Supported Blockchains</Subtitle>
              <Text colors={safeColors}>
                We currently support the following blockchains:
              </Text>
              <List>
                <ListItem colors={safeColors}>Ethereum (ETH)</ListItem>
                <ListItem colors={safeColors}>Binance Coin (BNB)</ListItem>
                <ListItem colors={safeColors}>Bitcoin (BTC)</ListItem>
                <ListItem colors={safeColors}>Solana (SOL)</ListItem>
                <ListItem colors={safeColors}>Tether on Ethereum (USDT-ETH)</ListItem>
                <ListItem colors={safeColors}>Tether on Binance (USDT-BNB)</ListItem>
              </List>
            </Section>
            <Section>
              <Subtitle colors={safeColors}>What We Offer</Subtitle>
              <List>
                <ListItem colors={safeColors}>
                  <strong>Vibe Check</strong>: Assigns your address a cultural title (e.g., “Crypto Canuck 🍁” for Canadians or “Odogwu 🔥” for Nigerians  ) based on total amount traded and balance, reflecting vibes from 10+ countries.
                </ListItem>
                <ListItem colors={safeColors}>
                  <strong>Summary Card</strong>: Displays key metrics like current balance, total transactions (capped at 10,000 for Solana high rollers), total amount sent, and total amount traded in USD.
                </ListItem>
                <ListItem colors={safeColors}>
                  <strong>HODL Insights</strong>: Available for ETH, BNB, and BTC, showing HODL duration and a HODL Score with five tiers:
                  <List>
                    <ListItem colors={safeColors}>Legend (81–100): Unshakable diamond hands!</ListItem>
                    <ListItem colors={safeColors}>Elite (51–80): A seasoned HODLer.</ListItem>
                    <ListItem colors={safeColors}>Veteran (21–50): Steadfast in the game.</ListItem>
                    <ListItem colors={safeColors}>Rookie (11–20): Building those HODL muscles.</ListItem>
                    <ListItem colors={safeColors}>Newbie (0–10): Just starting the HODL journey.</ListItem>
                  </List>
                </ListItem>
                <ListItem colors={safeColors}>
                  <strong>Transaction History</strong>: View up to 100 recent transactions, downloadable as CSV or PDF for all supported chains.
                </ListItem>
                <ListItem colors={safeColors}>
                  <strong>Flex & Share</strong>: Personalize your address with your name, download a custom flex image, and share your blockchain vibe on social media.
                </ListItem>
              </List>
            </Section>
            <Section>
              <Subtitle colors={safeColors}>Get in Touch</Subtitle>
              <ContactWrapper>
                <ContactLink
                  colors={safeColors}
                  href="http://t.me/qubagency" 
                  target="_blank"
                  rel="quba Tg"
                >
                  <FaTelegram />
                </ContactLink>
                <ContactLink
                  colors={safeColors}
                  href="qubaweb3agency@gmail.com" 
                  target="_blank"
                  rel="quba email"
                >
                  <FaEnvelope />
                </ContactLink>
              </ContactWrapper>
            </Section>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default About;