/**
 * theme/theme.js
 * MUI theme tokens per the design spec: dark Pan-African palette, custom
 * elevation/shadow scale, Inter + Space Grotesk typography. MUI's
 * Grid/Grid2 is never used in this project — see components/layout.
 */
import { createTheme } from "@mui/material/styles";

export const custom = {
  trustHigh: "#00BFA6",
  trustMedium: "#FFC107",
  trustLow: "#EF5350",
  glassBorder: "rgba(255,255,255,0.06)",
  gradients: {
    cta: "linear-gradient(135deg, #00BFA6 0%, #009688 100%)",
    verifiedSheen: "linear-gradient(120deg, #FFD54F 0%, #FFC107 50%, #FFD54F 100%)",
    heroVignette: "radial-gradient(circle at 50% 0%, rgba(0,191,166,0.12) 0%, transparent 60%)",
    walletCard: "linear-gradient(160deg, #1A1E1E 0%, #121212 100%)",
  },
};

const theme = createTheme({
  custom,
  palette: {
    mode: "dark",
    primary: { main: "#00BFA6", dark: "#009688", light: "#5BE0CB", contrastText: "#0A0A0A" },
    secondary: { main: "#FFC107", dark: "#C79100", light: "#FFD54F", contrastText: "#0A0A0A" },
    error: { main: "#EF5350", dark: "#D32F2F" },
    background: { default: "#121212", paper: "#1A1E1E" },
    divider: "rgba(255,255,255,0.08)",
    text: {
      primary: "#F5F5F5",
      secondary: "rgba(245,245,245,0.68)",
      disabled: "rgba(245,245,245,0.38)",
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "var(--font-inter), Inter, -apple-system, Segoe UI, Roboto, sans-serif",
    h1: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em" },
    h2: { fontSize: "1.625rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em" },
    h3: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3 },
    subtitle1: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: "0.9375rem", fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.5 },
    caption: { fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.4 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shadows: [
    "none",
    "0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)",
    "0 12px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
    "0 24px 64px rgba(0,0,0,0.65)",
    ...Array(21).fill("0 24px 64px rgba(0,0,0,0.65)"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundImage: custom.gradients.cta,
          "&:hover": { backgroundImage: custom.gradients.cta, filter: "brightness(1.08)" },
        },
        root: { borderRadius: 12, paddingInline: 18 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

export default theme;

// Class applied to numeric/tabular figures (wallet balances, bid amounts)
// so they don't jitter on update — see app/globals.css for the font-face.
export const TABULAR_FONT_CLASS = "font-tabular";
