"use client";

/**
 * app/providers.jsx
 * Client-only providers wrapper: ModeProvider (work/hire) drives a
 * mode-aware MUI theme (green for work, orange for hire), plus
 * AuthProvider. Kept separate from app/layout.jsx so that stays a
 * server component for metadata export.
 */
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { getTheme } from "@/theme/theme";
import { AuthProvider } from "@/lib/auth-context";
import { ModeProvider, useMode } from "@/lib/mode-context";

function ThemedShell({ children }) {
  const { mode } = useMode();
  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function Providers({ children }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ModeProvider>
        <AuthProvider>
          <ThemedShell>{children}</ThemedShell>
        </AuthProvider>
      </ModeProvider>
    </AppRouterCacheProvider>
  );
}
