"use client";

/**
 * app/dashboard/page.jsx — "/dashboard"
 * Role-aware home. Workers see active bids + assigned jobs + wallet
 * snapshot; job posters see their posted jobs + pending bids to review.
 * Backend calls: GET /api/users/me?populate=..., GET /api/jobs?filters[owner]
 * or filters[assigned_worker], GET /api/wallets?filters[user]
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Skeleton, Typography } from "@mui/material";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import GridBox from "@/components/layout/GridBox";
import GigCard from "@/components/gigs/GigCard";
import ProfileCompletionRing from "@/components/shared/ProfileCompletionRing";
import WalletBalanceChip from "@/components/wallet/WalletBalanceChip";
import DisputeFlagBanner from "@/components/shared/DisputeFlagBanner";
import VerifiedTag from "@/components/shared/VerifiedTag";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { JobApi } from "@/lib/endpoints";

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  const [postedJobs, setPostedJobs] = useState(null);
  const [assignedJobs, setAssignedJobs] = useState(null);

  useEffect(() => {
    if (!user) return;
    JobApi.list({ ownerId: user.id, pageSize: 6 }).then((r) => setPostedJobs(r.data ?? []));
    JobApi.list({ assignedWorkerId: user.id, pageSize: 6 }).then((r) => setAssignedJobs(r.data ?? []));
  }, [user]);

  if (isLoading || !user) {
    return (
      <Container sx={{ py: 6 }}>
        <Skeleton variant="rounded" height={120} />
      </Container>
    );
  }

  const completionPercent = user.professional_profile
    ? user.profile_completion_professional
    : user.profile_completion_skilled;

  const disputedJob = [...(postedJobs ?? []), ...(assignedJobs ?? [])].find((j) => j.status === "disputed");

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <Stack justify="space-between" align="flex-start" wrap="wrap" gap={3} sx={{ mb: 4 }}>
        <Stack direction="column" gap={1}>
          <Stack align="center" gap={1.5}>
            <Typography variant="h1" sx={{ fontSize: 28 }}>
              Welcome back, {user.username}
            </Typography>
            <VerifiedTag verified={user.is_verified_human} />
          </Stack>
          <Typography color="text.secondary">
            {user.country?.name ?? "Set your country"} · {user.native_last_city ?? "Location not set"}
          </Typography>
        </Stack>
        <Stack align="center" gap={3}>
          <ProfileCompletionRing percent={completionPercent} label="Profile" />
          <WalletBalanceChip />
        </Stack>
      </Stack>

      {disputedJob && (
        <Stack sx={{ mb: 3 }}>
          <DisputeFlagBanner />
        </Stack>
      )}

      <Stack justify="space-between" align="center" sx={{ mb: 2 }}>
        <Typography variant="h2">Jobs you posted</Typography>
        <Button component={Link} href="/gigs/new">
          Post a new job
        </Button>
      </Stack>
      <GridBox columns={{ xs: 1, sm: 2, md: 3 }} gap={3} sx={{ mb: 5 }}>
        {postedJobs === null
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rounded" height={170} />)
          : postedJobs.map((job) => <GigCard key={job.id} job={job} />)}
      </GridBox>
      {postedJobs?.length === 0 && (
        <Typography color="text.secondary" sx={{ mb: 5 }}>
          You haven't posted any jobs yet.
        </Typography>
      )}

      <Typography variant="h2" sx={{ mb: 2 }}>
        Jobs assigned to you
      </Typography>
      <GridBox columns={{ xs: 1, sm: 2, md: 3 }} gap={3}>
        {assignedJobs === null
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rounded" height={170} />)
          : assignedJobs.map((job) => <GigCard key={job.id} job={job} />)}
      </GridBox>
      {assignedJobs?.length === 0 && (
        <Typography color="text.secondary">
          No active work yet — <Link href="/gigs">browse open gigs</Link> to place your first bid.
        </Typography>
      )}
    </Container>
  );
}
