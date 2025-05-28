import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { FaInfoCircle } from "react-icons/fa";
import styled from "styled-components";

const InfoButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !["colors"].includes(prop),
})`
  background: none;
  border: none;
  color: ${(props) => props.colors.accent};
  font-size: 1.5rem;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: ${(props) => props.colors.accentHover};
  }

  &:hover::after {
    content: "Vibe Vault";
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: ${(props) => props.colors.cardBackground};
    color: ${(props) => props.colors.textPrimary};
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
    border: 1px solid ${(props) => props.colors.accent};
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const InfoIcon = ({ onClick }) => {
  const { colors } = useContext(ThemeContext);

  return (
    <InfoButton colors={colors} onClick={onClick}>
      <FaInfoCircle />
    </InfoButton>
  );
};

export default InfoIcon;