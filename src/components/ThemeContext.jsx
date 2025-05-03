// src/context/ThemeContext.jsx
import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");

  const themes = {
    dark: {
      background: "#1E2329",
      cardBackground: "#2C3137",
      textPrimary: "#FFFFFF",
      textSecondary: "#B0B5BD",
      accent: "#F0B90B",
      accentHover: "#d4a017",
    },
    light: {
      background: "#F5F5F5",
      cardBackground: "#FFFFFF",
      textPrimary: "#1E2329",
      textSecondary: "#6B7280",
      accent: "#F0B90B",
      accentHover: "#d4a017",
    },
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;