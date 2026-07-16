"use client";

/**
 * app/providers.jsx
 * Client-only providers wrapper: MUI ThemeProvider (+ CssBaseline) and
 * AuthProvider. Kept as a separate client component so app/layout.jsx
 * can stay a server component for metadata export.
 */
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import theme from "@/theme/theme";
import { AuthProvider } from "@/lib/auth-context";

export default function Providers({ children }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
