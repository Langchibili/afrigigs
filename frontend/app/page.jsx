"use client";

/**
 * app/page.jsx — Landing "/"
 * Public marketing entry point. Backend calls: GET /api/countries,
 * GET /api/jobs?filters[status]=open&sort=createdAt:desc&pagination[limit]=6
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Button, Typography, Skeleton, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Wallet } from "lucide-react";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import GridBox from "@/components/layout/GridBox";
import GigCard from "@/components/gigs/GigCard";
import SwipeModeBar from "@/components/shared/SwipeModeBar";
import { JobApi } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth-context";
import { useMode } from "@/lib/mode-context";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Escrow-backed, always",
    body: "Every job is funded upfront and held safely until you confirm the work is done. No cash handshakes.",
  },
  {
    icon: MapPin,
    title: "Privacy-safe matching",
    body: "We match you to nearby work by city, never by exact location. Your coordinates stay yours.",
  },
  {
    icon: Wallet,
    title: "Get paid your way",
    body: "Withdraw straight to mobile money once a job poster confirms completion.",
  },
];

export default function LandingPage() {
  const [jobs, setJobs] = useState(null);
  const { user } = useAuth();
  const { setMode } = useMode();
  const theme = useTheme();

  useEffect(() => {
    JobApi.list({ status: "open", pageSize: 6 })
      .then((res) => setJobs(res.data ?? []))
      .catch(() => setJobs([]));
  }, []);

  return (
    <Box component="main">
      {/* Swipe mode bar — sits just below the header (NavBar). Lets a
          signed-out or signed-in visitor flip between "work" (find work,
          green) and "hire" (hire someone, orange) mode; the whole app's
          theme follows this mode. */}
      <SwipeModeBar />

      {/* Hero */}
      <Box
        sx={{
          backgroundImage: (t) => t.custom.gradients.heroVignette,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          pt: { xs: 4, md: 8 },
          pb: { xs: 8, md: 10 },
        }}
      >
        <Container>
          <Stack direction="column" gap={3} align="flex-start" sx={{ maxWidth: 640 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 } }}>
                Find work. Get paid safely. Anywhere in Africa.
              </Typography>
            </motion.div>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: 17 }}>
              AfriGigs connects skilled and professional workers with local and international job
              posters — escrow-backed, privacy-safe, built for how work actually happens here.
            </Typography>
            <Stack gap={1.5}>
              {!user ? (
                <>
                  <Button
                    component={Link}
                    href="/register?intent=hire"
                    variant="contained"
                    size="large"
                    onClick={() => setMode("hire")}
                  >
                    Hire Someone
                  </Button>
                  <Button
                    component={Link}
                    href="/register?intent=work"
                    variant="outlined"
                    size="large"
                    onClick={() => setMode("work")}
                  >
                    Find work
                  </Button>
                </>
              ) : (
                <Button component={Link} href="/dashboard" variant="contained" size="large">
                  Go to dashboard
                </Button>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <GridBox columns={{ xs: 1, sm: 3 }} gap={3}>
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Stack key={title} direction="column" gap={1.25} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
              <Icon size={22} color={theme.palette.primary.main} />
              <Typography variant="h3">{title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {body}
              </Typography>
            </Stack>
          ))}
        </GridBox>
      </Container>

      {/* Live gig ticker */}
      <Container sx={{ pb: { xs: 8, md: 10 } }}>
        <Stack justify="space-between" align="center" sx={{ mb: 2.5 }}>
          <Typography variant="h2">Open gigs right now</Typography>
          <Button component={Link} href="/gigs">
            See all
          </Button>
        </Stack>
        <GridBox columns={{ xs: 1, sm: 2, md: 3 }} gap={3}>
          {jobs === null
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rounded" height={180} />)
            : jobs.map((job) => <GigCard key={job.id} job={job} />)}
        </GridBox>
        {jobs?.length === 0 && (
          <Typography color="text.secondary">No open gigs yet — be the first to post one.</Typography>
        )}
      </Container>
    </Box>
  );
}
