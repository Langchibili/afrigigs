"use client";

/**
 * components/layout/BottomNav.jsx
 * Fixed bottom navigation shown only on small screens, for an app-like
 * mobile feel. Items adapt to the active mode (work/hire) and to whether
 * the person is signed in.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Paper } from "@mui/material";
import { Home, Briefcase, LayoutDashboard, Wallet, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useMode } from "@/lib/mode-context";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { mode } = useMode();

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/gigs", label: mode === "hire" ? "Post" : "Gigs", icon: Briefcase },
    ...(user ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    ...(user ? [{ href: "/wallet", label: "Wallet", icon: Wallet }] : []),
    ...(user ? [{ href: "/messages", label: "Chat", icon: MessageCircle }] : []),
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        justifyContent: "space-around",
        py: 1,
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 0,
        backgroundColor: "rgba(18,18,18,0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Box
            key={href}
            component={Link}
            href={href}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.25,
              textDecoration: "none",
              color: active ? "primary.main" : "text.secondary",
              fontSize: 10,
              minWidth: 48,
            }}
          >
            <Icon size={20} />
            {label}
          </Box>
        );
      })}
    </Paper>
  );
}
