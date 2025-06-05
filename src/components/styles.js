import styled from "styled-components";

export const AppContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  background-color: ${(props) => props.colors.background};
  min-height: 100vh;
  padding: 20px;
  color: ${(props) => props.colors.textPrimary};
  display: flex;
  flex-direction: column;
`;

export const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 10px;
  }
`;

export const Title = styled.h1.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  font-size: 2rem;
  color: ${(props) => props.colors.accent};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  flex: 1;
  overflow-x: hidden; /* Prevent horizontal overflow */
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 5px; /* Reduce padding on mobile */
    max-width: 100%; /* Ensure it fits viewport */
    width: 100%; /* Take full width of viewport */
  }

  @media (max-width: 480px) {
    padding: 0 2px; /* Further reduce padding for smaller screens */
  }
`;

export const SelectorWrapper = styled.div`
  margin-bottom: 20px;
  position: relative; /* Allow dropdown to position correctly */
  z-index: 10; /* Ensure dropdown appears above other elements */

  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px; /* Match BlockchainSelector width */
    margin: 0 auto 20px; /* Center the selector */
  }
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column; /* Stack input and button vertically on PC */
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 300px; /* Keep narrow for vertical layout on PC */
  box-sizing: border-box; /* Ensure padding/margins don't cause overflow */
  overflow: hidden; /* Prevent overflow from child elements */
  justify-content: center; /* Center children horizontally */
  align-items: center; /* Center children vertically within the wrapper */

  @media (max-width: 768px) {
    flex-direction: row; /* Horizontal on mobile */
    gap: 5px;
    max-width: 100%; /* Allow flexibility on mobile */
    width: calc(100% - 10px); /* Account for padding */
    margin: 0 auto; /* Center the input */
    flex-wrap: wrap; /* Allow wrapping on very small screens */
  }
`;

export const StyledInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !["colors", "error"].includes(prop),
})`
  padding: 10px;
  background-color: ${(props) => props.colors.cardBackground};
  border: 1px solid ${(props) => (props.error ? "red" : props.colors.accent)};
  color: ${(props) => props.colors.textPrimary};
  border-radius: 5px;
  outline: none;
  font-size: 16px;
  width: 100%;
  max-width: 300px; /* Fixed width for consistency on PC */
  min-width: 0; /* Prevent growth beyond constraints */
  box-sizing: border-box; /* Prevent padding from increasing width */
  overflow-x: auto; /* Allow scrolling within input for long content */
  white-space: nowrap; /* Prevent text wrapping */
  display: block; /* Ensure the input respects its own width */
  resize: none; /* Prevent any resizing */

  &::-webkit-scrollbar {
    height: 4px; /* Thin scrollbar for better UX */
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.colors.accent};
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.colors.cardBackground};
  }

  &:focus {
    border-color: ${(props) => props.colors.accent};
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px;
    max-width: 200px; /* Smaller on mobile to fit alongside button */
    width: 100%;
  }
`;

export const SearchButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  padding: 10px 20px;
  background-color: ${(props) => props.colors.accent};
  color: ${(props) => props.colors.background};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%; /* Full width on PC for consistency in vertical layout */
  max-width: 300px; /* Match input width on PC */

  &:hover {
    background-color: ${(props) => props.colors.accentHover};
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 16px;
    width: auto; /* Compact on mobile */
    min-width: 100px; /* Slightly smaller on mobile */
    margin: 0; /* Remove auto margin on mobile */
  }
`;

export const TransactionCard = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  background-color: ${(props) => props.colors.cardBackground};
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box; /* Ensure padding doesn't cause overflow */
  overflow-x: auto; /* Allow scrolling for long content */
  white-space: nowrap; /* Prevent wrapping of long content */

  @media (max-width: 768px) {
    padding: 10px;
    max-width: 100%; /* Fit within viewport */
    overflow-x: auto; /* Ensure scrolling on mobile */
  }

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

export const CardHeader = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  display: flex;
  justify-content: space-between;
  color: ${(props) => props.colors.textSecondary};
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
    flex-direction: column;
    gap: 5px;
  }
`;

export const CardContent = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  margin-top: 10px;
  color: ${(props) => props.colors.textPrimary};

  p {
    margin: 5px 0;
    font-size: 14px;
    white-space: nowrap; /* Prevent wrapping of long addresses */
    overflow-x: auto; /* Allow scrolling for long content */
    max-width: 100%; /* Ensure it fits within parent */
    box-sizing: border-box;

    @media (max-width: 768px) {
      font-size: 12px;
      max-width: calc(100vw - 40px); /* Account for padding on mobile */
    }

    @media (max-width: 480px) {
      font-size: 11px;
      max-width: calc(100vw - 20px); /* Tighter fit for smaller screens */
    }
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 5px 0;

    li {
      font-size: 14px;
      white-space: nowrap; /* Prevent wrapping of long addresses */
      overflow-x: auto; /* Allow scrolling for long content */
      max-width: 100%; /* Ensure it fits within parent */
      box-sizing: border-box;

      @media (max-width: 768px) {
        font-size: 12px;
        max-width: calc(100vw - 40px); /* Account for padding on mobile */
      }

      @media (max-width: 480px) {
        font-size: 11px;
        max-width: calc(100vw - 20px); /* Tighter fit for smaller screens */
      }
    }
  }
`;

export const MemeText = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  color: ${(props) => props.colors.accent};
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const ExportButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  padding: 10px 20px;
  background-color: ${(props) => props.colors.accent};
  color: ${(props) => props.colors.background};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: ${(props) => props.colors.accentHover};
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 16px;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
`;

export const Footer = styled.footer.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  text-align: center;
  margin-top: 30px;
  color: ${(props) => props.colors.textSecondary};
  font-size: 14px;

  p {
    margin: 5px 0;
  }

  h4, a {
    margin: 5px 0;
    font-style: italic;
    color: ${(props) => props.colors.textSecondary};
  }

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const VibeSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 8px; /* Slightly smaller gap for mobile */
    flex-wrap: wrap; 
  }
`;

export const VibeLabel = styled.label.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  color: ${(props) => props.colors.textPrimary};
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const VibeSelect = styled.select.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  padding: 8px;
  background-color: ${(props) => props.colors.cardBackground};
  border: 1px solid ${(props) => props.colors.accent};
  color: ${(props) => props.colors.textPrimary};
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  width: 150px;

  &:hover {
    background-color: ${(props) => props.colors.textSecondary};
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px;
    width: 120px; /* Slightly smaller on mobile */
    max-width: 100%;
  }
`;

export const VibeSpan = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  position: relative;
  cursor: pointer;

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    top: -100%; /* Adjust to appear above */
    left: 50%;
    transform: translateX(-50%);
    background: ${(props) => props.colors.cardBackground};
    color: ${(props) => props.colors.textPrimary};
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    max-width: 90vw; /* Limit width to viewport */
    width: 200px; /* Fixed width for consistency */
    white-space: normal; /* Allow text wrapping */
    word-wrap: break-word; /* Break long words */
    z-index: 10;
    border: 1px solid ${(props) => props.colors.accent};
    box-sizing: border-box;

    @media (max-width: 768px) {
      font-size: 10px;
      padding: 6px;
      width: 180px; /* Smaller width for mobile */
      max-width: 85vw;
    }
  }
`;

export const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const PopupContent = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  background: ${(props) => props.colors.cardBackground};
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
  color: ${(props) => props.colors.textPrimary};

  @media (max-width: 768px) {
    width: 90%;
    padding: 15px;
  }
`;

export const PopupInput = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  background: ${(props) => props.colors.background};
  border: 1px solid ${(props) => props.colors.accent};
  color: ${(props) => props.colors.textPrimary};
  border-radius: 5px;

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

export const PopupButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  padding: 10px 20px;
  background: ${(props) => props.colors.accent};
  color: ${(props) => props.colors.background};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;

  &:hover {
    background: ${(props) => props.colors.accentHover};
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;


// HODL STYLE
export const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

export const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => !["colors", "active"].includes(prop),
})`
  background-color: ${({ active, colors }) => (active ? colors.accent : colors.cardBackground)};
  color: ${({ active, colors }) => (active ? colors.background : colors.textPrimary)};
  border: 1px solid ${({ colors }) => colors.accent};
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, color 0.3s;
  &:hover {
    background-color: ${({ colors }) => colors.accentHover};
    color: ${({ colors }) => colors.background};
  }
  &:not(:last-child) {
    margin-right: 10px;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 12px;
  }
`;

export const SummaryCard = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  background-color: ${({ colors }) => colors.cardBackground};
  border-radius: 8px;
  padding: 15px;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  box-sizing: border-box;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 10px;
    max-width: 100%;
  }
`;

export const TimelineContainer = styled.div`
  margin-top: 15px;
  width: 100%;
  max-width: 250px;
  height: 20px;
  position: relative;
  margin-left: auto;
  margin-right: auto;
`;

export const TimelineBar = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  background-color: ${({ colors }) => colors.textSecondary};
  height: 2px;
  width: 100%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`;

export const TimelineMarker = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  background-color: ${({ colors }) => colors.accent};
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  left: ${({ position }) => position}%;
`;

export const TimelineLabel = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "colors",
})`
  color: ${({ colors }) => colors.textPrimary};
  font-size: 10px;
  position: absolute;
  top: -15px;
  left: ${({ position }) => position}%;
  transform: translateX(-50%);
`;
