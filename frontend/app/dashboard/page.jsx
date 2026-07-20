// "use client";

// /**
//  * app/dashboard/page.jsx — "/dashboard"
//  * Mode-aware home (see lib/mode-context.jsx). In "hire" mode, only the
//  * hiring-relevant surface shows: jobs you posted + pending bids to
//  * review. In "work" mode, only the worker surface shows: jobs assigned
//  * to you + a nudge to browse gigs. The two are mutually exclusive on
//  * this page — switching modes (via the SwipeModeBar) swaps the section
//  * and the theme color. Backend calls: GET /api/users/me?populate=...,
//  * GET /api/jobs?filters[owner] or filters[assigned_worker],
//  * GET /api/wallets?filters[user]
//  */
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Button, Chip, Skeleton, Typography } from "@mui/material";
// import Container from "@/components/layout/Container";
// import Stack from "@/components/layout/Stack";
// import GridBox from "@/components/layout/GridBox";
// import GigCard from "@/components/gigs/GigCard";
// import ProfileCompletionRing from "@/components/shared/ProfileCompletionRing";
// import WalletBalanceChip from "@/components/wallet/WalletBalanceChip";
// import DisputeFlagBanner from "@/components/shared/DisputeFlagBanner";
// import VerifiedTag from "@/components/shared/VerifiedTag";
// import SwipeModeBar from "@/components/shared/SwipeModeBar";
// import { useRequireAuth } from "@/hooks/useRequireAuth";
// import { useMode } from "@/lib/mode-context";
// import { JobApi } from "@/lib/endpoints";

// export default function DashboardPage() {
//   const { user, isLoading } = useRequireAuth();
//   const { mode } = useMode();
//   const [postedJobs, setPostedJobs] = useState(null);
//   const [assignedJobs, setAssignedJobs] = useState(null);

//   useEffect(() => {
//     if (!user) return;
//     // Only fetch the list this mode actually needs.
//     if (mode === "hire") {
//       JobApi.list({ ownerId: user.id, pageSize: 6 }).then((r) => setPostedJobs(r.data ?? []));
//     } else {
//       JobApi.list({ assignedWorkerId: user.id, pageSize: 6 }).then((r) => setAssignedJobs(r.data ?? []));
//     }
//   }, [user, mode]);

//   if (isLoading || !user) {
//     return (
//       <Container sx={{ py: 6 }}>
//         <Skeleton variant="rounded" height={120} />
//       </Container>
//     );
//   }

//   const completionPercent = user.professional_profile
//     ? user.profile_completion_professional
//     : user.profile_completion_skilled;

//   const disputedJob = [...(postedJobs ?? []), ...(assignedJobs ?? [])].find((j) => j.status === "disputed");

//   return (
//     <>
//       <SwipeModeBar />
//       <Container sx={{ py: { xs: 2, md: 4 } }}>
//         <Stack justify="space-between" align="flex-start" wrap="wrap" gap={3} sx={{ mb: 4 }}>
//           <Stack direction="column" gap={1}>
//             <Stack align="center" gap={1.5}>
//               <Typography variant="h1" sx={{ fontSize: 28 }}>
//                 Welcome back, {user.username}
//               </Typography>
//               <VerifiedTag verified={user.is_verified_human} />
//               <Chip
//                 size="small"
//                 label={mode === "hire" ? "Hiring mode" : "Working mode"}
//                 color="primary"
//                 variant="outlined"
//               />
//             </Stack>
//             <Typography color="text.secondary">
//               {user.country?.name ?? "Set your country"} · {user.native_last_city ?? "Location not set"}
//             </Typography>
//           </Stack>
//           <Stack align="center" gap={3}>
//             {mode === "work" && <ProfileCompletionRing percent={completionPercent} label="Profile" />}
//             <WalletBalanceChip />
//           </Stack>
//         </Stack>

//         {disputedJob && (
//           <Stack sx={{ mb: 3 }}>
//             <DisputeFlagBanner />
//           </Stack>
//         )}

//         {mode === "hire" ? (
//           <>
//             <Stack justify="space-between" align="center" sx={{ mb: 2 }}>
//               <Typography variant="h2">Jobs you posted</Typography>
//               <Button component={Link} href="/gigs/new">
//                 Post a new job
//               </Button>
//             </Stack>
//             <GridBox columns={{ xs: 1, sm: 2, md: 3 }} gap={3}>
//               {postedJobs === null
//                 ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rounded" height={170} />)
//                 : postedJobs.map((job) => <GigCard key={job.id} job={job} />)}
//             </GridBox>
//             {postedJobs?.length === 0 && (
//               <Typography color="text.secondary">You haven't posted any jobs yet.</Typography>
//             )}
//           </>
//         ) : (
//           <>
//             <Typography variant="h2" sx={{ mb: 2 }}>
//               Jobs assigned to you
//             </Typography>
//             <GridBox columns={{ xs: 1, sm: 2, md: 3 }} gap={3}>
//               {assignedJobs === null
//                 ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rounded" height={170} />)
//                 : assignedJobs.map((job) => <GigCard key={job.id} job={job} />)}
//             </GridBox>
//             {assignedJobs?.length === 0 && (
//               <Typography color="text.secondary">
//                 No active work yet — <Link href="/gigs">browse open gigs</Link> to place your first bid.
//               </Typography>
//             )}
//           </>
//         )}
//       </Container>
//     </>
//   );
// }
"use client";

/**
 * app/dashboard/page.jsx — "/dashboard"
 * Mode-aware home (see lib/mode-context.jsx). In "hire" mode, only the
 * hiring-relevant surface shows: jobs you posted + pending bids to
 * review. In "work" mode, only the worker surface shows: jobs assigned
 * to you + a nudge to browse gigs. The two are mutually exclusive on
 * this page — switching modes (via the SwipeModeBar) swaps the section
 * and the theme color. Backend calls: GET /api/users/me?populate=...,
 * GET /api/jobs?filters[owner] or filters[assigned_worker],
 * GET /api/wallets?filters[user]
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Chip, Skeleton, Typography } from "@mui/material";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import GridBox from "@/components/layout/GridBox";
import GigCard from "@/components/gigs/GigCard";
import ProfileCompletionRing from "@/components/shared/ProfileCompletionRing";
import WalletBalanceChip from "@/components/wallet/WalletBalanceChip";
import DisputeFlagBanner from "@/components/shared/DisputeFlagBanner";
import VerifiedTag from "@/components/shared/VerifiedTag";
import SwipeModeBar from "@/components/shared/SwipeModeBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useMode } from "@/lib/mode-context";
import { JobApi } from "@/lib/endpoints";

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  const { mode } = useMode();
  const [postedJobs, setPostedJobs] = useState(null);
  const [assignedJobs, setAssignedJobs] = useState(null);

  useEffect(() => {
    if (!user) return;
    // Only fetch the list this mode actually needs.
    if (mode === "hire") {
      JobApi.mine("owner", 6).then((r) => setPostedJobs(r.data ?? []));
    } else {
      JobApi.mine("assigned", 6).then((r) => setAssignedJobs(r.data ?? []));
    }
  }, [user, mode]);

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
    <>
      <SwipeModeBar />
      <Container sx={{ py: { xs: 2, md: 4 } }}>
        <Stack justify="space-between" align="flex-start" wrap="wrap" gap={3} sx={{ mb: 4 }}>
          <Stack direction="column" gap={1}>
            <Stack align="center" gap={1.5}>
              <Typography variant="h1" sx={{ fontSize: 28 }}>
                Welcome back, {user.username}
              </Typography>
              <VerifiedTag verified={user.is_verified_human} />
              <Chip
                size="small"
                label={mode === "hire" ? "Hiring mode" : "Working mode"}
                color="primary"
                variant="outlined"
              />
            </Stack>
            <Typography color="text.secondary">
              {user.country?.name ?? "Set your country"} · {user.native_last_city ?? "Location not set"}
            </Typography>
          </Stack>
          <Stack align="center" gap={3}>
            {mode === "work" && <ProfileCompletionRing percent={completionPercent} label="Profile" />}
            <WalletBalanceChip />
          </Stack>
        </Stack>

        {disputedJob && (
          <Stack sx={{ mb: 3 }}>
            <DisputeFlagBanner />
          </Stack>
        )}

        {mode === "hire" ? (
          <>
            <Stack justify="space-between" align="center" sx={{ mb: 2 }}>
              <Typography variant="h2">Jobs you posted</Typography>
              <Button component={Link} href="/gigs/new">
                Post a new job
              </Button>
            </Stack>
            <GridBox columns={{ xs: 1, sm: 2, md: 3 }} gap={3}>
              {postedJobs === null
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rounded" height={170} />)
                : postedJobs.map((job) => <GigCard key={job.id} job={job} />)}
            </GridBox>
            {postedJobs?.length === 0 && (
              <Typography color="text.secondary">You haven't posted any jobs yet.</Typography>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
      </Container>
    </>
  );
}