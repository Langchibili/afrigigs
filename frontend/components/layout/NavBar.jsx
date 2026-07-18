"use client";

/**
 * components/layout/NavBar.jsx
 * Top navigation. Shows auth-aware links: guests see Login/Get started,
 * signed-in users see Dashboard/Gigs/Wallet/Messages + their WalletBalanceChip.
 */
import Link from "next/link";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Divider,
  Avatar,
} from "@mui/material";
import { Menu, Briefcase, Wallet, MessageCircle, User as UserIcon } from "lucide-react";
import Stack from "./Stack";
import Container from "./Container";
import { useAuth } from "@/lib/auth-context";
import { useMode } from "@/lib/mode-context";
import WalletBalanceChip from "@/components/wallet/WalletBalanceChip";
import VerifiedTag from "@/components/shared/VerifiedTag";
import { initials } from "@/lib/format";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { mode } = useMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "rgba(18,18,18,0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Container maxWidth="xl" disableGutters={false}>
        <Toolbar disableGutters sx={{ py: 1.5, gap: 3 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Stack align="center" gap={1}>
              <Briefcase size={22} color="#00BFA6" />
              <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                AfriGigs
              </Typography>
            </Stack>
          </Link>

          <Stack align="center" gap={2.5} sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}>
            {mode === "hire" ? (
              <Link href="/gigs/new" style={navLinkStyle}>
                Post a Job
              </Link>
            ) : (
              <Link href="/gigs" style={navLinkStyle}>
                Browse Gigs
              </Link>
            )}
            {user && (
              <Link href="/dashboard" style={navLinkStyle}>
                Dashboard
              </Link>
            )}
          </Stack>

          <Stack align="center" gap={1.5} sx={{ display: { xs: "none", md: "flex" }, ml: "auto" }}>
            {user ? (
              <>
                <WalletBalanceChip compact />
                <IconButton component={Link} href="/messages" size="small">
                  <MessageCircle size={20} />
                </IconButton>
                <IconButton component={Link} href="/wallet" size="small">
                  <Wallet size={20} />
                </IconButton>
                <Stack align="center" gap={0.75} component={Link} href={`/profile/${user.id}`} sx={{ textDecoration: "none" }}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: "primary.dark" }}>
                    {initials(user.username)}
                  </Avatar>
                  <VerifiedTag verified={user.is_verified_human} compact />
                </Stack>
                <Button size="small" color="inherit" onClick={logout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} href="/login" color="inherit">
                  Log in
                </Button>
                <Button
                  component={Link}
                  href={`/register?intent=${mode}`}
                  variant="contained"
                  color="primary"
                >
                  {mode === "hire" ? "Hire Someone" : "Find work"}
                </Button>
              </>
            )}
          </Stack>

          <IconButton sx={{ display: { md: "none" }, ml: "auto" }} onClick={() => setDrawerOpen(true)}>
            <Menu />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Stack direction="column" gap={1} sx={{ width: 260, p: 3 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Menu
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <MobileLink href="/gigs" label="Browse Gigs" icon={<Briefcase size={18} />} onClick={() => setDrawerOpen(false)} />
          {user && (
            <>
              <MobileLink href="/dashboard" label="Dashboard" icon={<UserIcon size={18} />} onClick={() => setDrawerOpen(false)} />
              <MobileLink href="/gigs/new" label="Post a Job" icon={<Briefcase size={18} />} onClick={() => setDrawerOpen(false)} />
              <MobileLink href="/wallet" label="Wallet" icon={<Wallet size={18} />} onClick={() => setDrawerOpen(false)} />
              <MobileLink href="/messages" label="Messages" icon={<MessageCircle size={18} />} onClick={() => setDrawerOpen(false)} />
              <Divider sx={{ my: 1 }} />
              <Button color="inherit" onClick={logout}>
                Log out
              </Button>
            </>
          )}
          {!user && (
            <>
              <Divider sx={{ my: 1 }} />
              <Button component={Link} href="/login" color="inherit">
                Log in
              </Button>
              <Button component={Link} href={`/register?intent=${mode}`} variant="contained">
                {mode === "hire" ? "Hire Someone" : "Find work"}
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </AppBar>
  );
}

const navLinkStyle = {
  textDecoration: "none",
  color: "inherit",
  fontSize: 14,
  fontWeight: 600,
  opacity: 0.85,
};

function MobileLink({ href, label, icon, onClick }) {
  return (
    <Button
      component={Link}
      href={href}
      onClick={onClick}
      color="inherit"
      startIcon={icon}
      sx={{ justifyContent: "flex-start" }}
    >
      {label}
    </Button>
  );
}
