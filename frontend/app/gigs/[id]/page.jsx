// // "use client";

// // /**
// //  * app/gigs/[id]/page.jsx — "/gigs/[id]"
// //  * Full job description + bid panel + ranked bid list (job owner) +
// //  * messaging entry point. Backend calls: GET /api/jobs/:id?populate=...,
// //  * GET /api/jobs/:id/rank-bids, POST /api/bids,
// //  * GET /api/conversations?filters[job][id]=:id
// //  */
// // import { useCallback, useEffect, useState } from "react";
// // import { useParams } from "next/navigation";
// // import { Button, Chip, Divider, Skeleton, Typography } from "@mui/material";
// // import { Globe, MapPin, MessageCircle } from "lucide-react";
// // import Container from "@/components/layout/Container";
// // import Stack from "@/components/layout/Stack";
// // import BidTicket from "@/components/gigs/BidTicket";
// // import BidList from "@/components/gigs/BidList";
// // import EscrowStatusTimeline from "@/components/wallet/EscrowStatusTimeline";
// // import DisputeFlagBanner from "@/components/shared/DisputeFlagBanner";
// // import VerifiedTag from "@/components/shared/VerifiedTag";
// // import TrustBadge from "@/components/shared/TrustBadge";
// // import { useAuth } from "@/lib/auth-context";
// // import { JobApi, MessagingApi } from "@/lib/endpoints";
// // import { formatMoney, timeAgo } from "@/lib/format";

// // export default function GigDetailPage() {
// //   const { id } = useParams();
// //   const { user } = useAuth();
// //   const [job, setJob] = useState(null);
// //   const [bids, setBids] = useState(null);
// //   const [conversationId, setConversationId] = useState(null);

// //   const load = useCallback(async () => {
// //     const jobRes = await JobApi.get(id);
// //     setJob(jobRes.data);

// //     const isOwner = user && jobRes.data?.owner?.id === user.id;
// //     if (isOwner) {
// //       const rank = await JobApi.rankBids(id);
// //       setBids(rank.data ?? []);
// //     }
// //   }, [id, user]);

// //   useEffect(() => {
// //     load();
// //   }, [load]);

// //   useEffect(() => {
// //     if (!user || !job) return;
// //     MessagingApi.listConversations(user.id).then((res) => {
// //       const conv = (res.data ?? []).find((c) => c.job?.id === job.id);
// //       setConversationId(conv?.id ?? null);
// //     });
// //   }, [user, job]);

// //   if (!job) {
// //     return (
// //       <Container sx={{ py: 6 }}>
// //         <Skeleton variant="rounded" height={300} />
// //       </Container>
// //     );
// //   }

// //   const isOwner = user && job.owner?.id === user.id;
// //   const isInternational = user && job.owner?.country?.id && job.country?.id && job.owner.country.id !== user.country?.id;
// //   const isGlobal = job.scope === "FOR_EVERYONE";

// //   return (
// //     <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
// //       {job.status === "disputed" && (
// //         <Stack sx={{ mb: 3 }}>
// //           <DisputeFlagBanner />
// //         </Stack>
// //       )}

// //       <Stack justify="space-between" align="flex-start" wrap="wrap" gap={2} sx={{ mb: 1.5 }}>
// //         <Typography variant="h1" sx={{ fontSize: 26, maxWidth: 560 }}>
// //           {job.title}
// //         </Typography>
// //         <Chip
// //           icon={isGlobal ? <Globe size={14} /> : <MapPin size={14} />}
// //           label={isGlobal ? "Open to everyone" : job.target_city || "Local"}
// //         />
// //       </Stack>

// //       <Stack align="center" gap={2} sx={{ mb: 3 }} wrap="wrap">
// //         <Typography variant="h2" className="font-tabular" sx={{ color: "secondary.main", fontSize: 22 }}>
// //           {formatMoney(job.budget_amount, job.budget_currency)}
// //         </Typography>
// //         <Typography variant="body2" color="text.secondary">
// //           Posted {timeAgo(job.createdAt)} by {job.owner?.username}
// //         </Typography>
// //         <VerifiedTag verified={job.owner?.is_verified_human} />
// //       </Stack>

// //       <Stack gap={0.75} wrap="wrap" sx={{ mb: 3 }}>
// //         {(job.skills_required ?? []).map((s) => (
// //           <Chip key={s.id} label={s.name} variant="outlined" size="small" />
// //         ))}
// //       </Stack>

// //       <Typography variant="body1" sx={{ mb: 4, whiteSpace: "pre-wrap" }}>
// //         {job.description?.replace(/<[^>]+>/g, "")}
// //       </Typography>

// //       {job.escrow_status !== "unfunded" && (
// //         <Stack direction="column" gap={1} sx={{ mb: 4 }}>
// //           <Typography variant="h3">Escrow status</Typography>
// //           <EscrowStatusTimeline status={job.escrow_status} />
// //         </Stack>
// //       )}

// //       <Divider sx={{ mb: 4 }} />

// //       {isOwner ? (
// //         <Stack direction="column" gap={2}>
// //           <Typography variant="h2" sx={{ fontSize: 20 }}>
// //             Bids ranked for you
// //           </Typography>
// //           {bids === null ? <Skeleton variant="rounded" height={160} /> : <BidList bids={bids} job={job} isInternational={false} />}
// //         </Stack>
// //       ) : (
// //         <BidTicket job={job} isInternational={!!isInternational} onBidPlaced={load} />
// //       )}

// //       {user && (isOwner || job.assigned_worker?.id === user.id) && (
// //         <Stack sx={{ mt: 4 }}>
// //           <Button
// //             variant="outlined"
// //             startIcon={<MessageCircle size={16} />}
// //             href={conversationId ? `/messages/${conversationId}` : "/messages"}
// //           >
// //             {conversationId ? "Open conversation" : "Messages"}
// //           </Button>
// //         </Stack>
// //       )}
// //     </Container>
// //   );
// // }
// "use client";

// /**
//  * app/gigs/[id]/page.jsx — "/gigs/[id]"
//  * Full job description + bid panel + ranked bid list (job owner) +
//  * messaging entry point. Backend calls: GET /api/jobs/:id?populate=...,
//  * GET /api/jobs/:id/rank-bids, POST /api/bids,
//  * GET /api/conversations?filters[job][id]=:id
//  */
// import { useCallback, useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Button, Chip, Divider, Skeleton, Typography } from "@mui/material";
// import { Globe, MapPin, MessageCircle } from "lucide-react";
// import Container from "@/components/layout/Container";
// import Stack from "@/components/layout/Stack";
// import BidTicket from "@/components/gigs/BidTicket";
// import BidList from "@/components/gigs/BidList";
// import EscrowStatusTimeline from "@/components/wallet/EscrowStatusTimeline";
// import DisputeFlagBanner from "@/components/shared/DisputeFlagBanner";
// import VerifiedTag from "@/components/shared/VerifiedTag";
// import TrustBadge from "@/components/shared/TrustBadge";
// import { useAuth } from "@/lib/auth-context";
// import { JobApi, MessagingApi } from "@/lib/endpoints";
// import { formatMoney, timeAgo } from "@/lib/format";

// export default function GigDetailPage() {
//   const { id } = useParams();
//   const { user } = useAuth();
//   const [job, setJob] = useState(null);
//   const [bids, setBids] = useState(null);
//   const [conversationId, setConversationId] = useState(null);

//   const load = useCallback(async () => {
//     const jobRes = await JobApi.get(id);
//     setJob(jobRes.data);

//     const isOwner = user && jobRes.data?.owner?.id === user.id;
//     if (isOwner) {
//       const rank = await JobApi.rankBids(id);
//       setBids(rank.data ?? []);
//     }
//   }, [id, user]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   useEffect(() => {
//     if (!user || !job) return;
//     MessagingApi.mine().then((res) => {
//       const conv = (res.data ?? []).find((c) => c.job?.id === job.id);
//       setConversationId(conv?.id ?? null);
//     });
//   }, [user, job]);

//   if (!job) {
//     return (
//       <Container sx={{ py: 6 }}>
//         <Skeleton variant="rounded" height={300} />
//       </Container>
//     );
//   }

//   const isOwner = user && job.owner?.id === user.id;
//   const isInternational = user && job.owner?.country?.id && job.country?.id && job.owner.country.id !== user.country?.id;
//   const isGlobal = job.scope === "FOR_EVERYONE";

//   return (
//     <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
//       {job.status === "disputed" && (
//         <Stack sx={{ mb: 3 }}>
//           <DisputeFlagBanner />
//         </Stack>
//       )}

//       <Stack justify="space-between" align="flex-start" wrap="wrap" gap={2} sx={{ mb: 1.5 }}>
//         <Typography variant="h1" sx={{ fontSize: 26, maxWidth: 560 }}>
//           {job.title}
//         </Typography>
//         <Chip
//           icon={isGlobal ? <Globe size={14} /> : <MapPin size={14} />}
//           label={isGlobal ? "Open to everyone" : job.target_city || "Local"}
//         />
//       </Stack>

//       <Stack align="center" gap={2} sx={{ mb: 3 }} wrap="wrap">
//         <Typography variant="h2" className="font-tabular" sx={{ color: "secondary.main", fontSize: 22 }}>
//           {formatMoney(job.budget_amount, job.budget_currency)}
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           Posted {timeAgo(job.createdAt)} by {job.owner?.username}
//         </Typography>
//         <VerifiedTag verified={job.owner?.is_verified_human} />
//       </Stack>

//       <Stack gap={0.75} wrap="wrap" sx={{ mb: 3 }}>
//         {(job.skills_required ?? []).map((s) => (
//           <Chip key={s.id} label={s.name} variant="outlined" size="small" />
//         ))}
//       </Stack>

//       <Typography variant="body1" sx={{ mb: 4, whiteSpace: "pre-wrap" }}>
//         {job.description?.replace(/<[^>]+>/g, "")}
//       </Typography>

//       {job.escrow_status !== "unfunded" && (
//         <Stack direction="column" gap={1} sx={{ mb: 4 }}>
//           <Typography variant="h3">Escrow status</Typography>
//           <EscrowStatusTimeline status={job.escrow_status} />
//         </Stack>
//       )}

//       <Divider sx={{ mb: 4 }} />

//       {isOwner ? (
//         <Stack direction="column" gap={2}>
//           <Typography variant="h2" sx={{ fontSize: 20 }}>
//             Bids ranked for you
//           </Typography>
//           {bids === null ? <Skeleton variant="rounded" height={160} /> : <BidList bids={bids} job={job} isInternational={false} />}
//         </Stack>
//       ) : (
//         <BidTicket job={job} isInternational={!!isInternational} onBidPlaced={load} />
//       )}

//       {user && (isOwner || job.assigned_worker?.id === user.id) && (
//         <Stack sx={{ mt: 4 }}>
//           <Button
//             variant="outlined"
//             startIcon={<MessageCircle size={16} />}
//             href={conversationId ? `/messages/${conversationId}` : "/messages"}
//           >
//             {conversationId ? "Open conversation" : "Messages"}
//           </Button>
//         </Stack>
//       )}
//     </Container>
//   );
// }
"use client";

/**
 * app/gigs/[id]/page.jsx — "/gigs/[id]"
 * Full job description + bid panel + ranked bid list (job owner) +
 * messaging entry point. Backend calls: GET /api/jobs/:id?populate=...,
 * GET /api/jobs/:id/rank-bids, POST /api/bids,
 * GET /api/conversations?filters[job][id]=:id
 */
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Alert, Button, Chip, Divider, Skeleton, Typography } from "@mui/material";
import { Globe, MapPin, MessageCircle } from "lucide-react";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import BidTicket from "@/components/gigs/BidTicket";
import BidList from "@/components/gigs/BidList";
import EscrowStatusTimeline from "@/components/wallet/EscrowStatusTimeline";
import DisputeFlagBanner from "@/components/shared/DisputeFlagBanner";
import VerifiedTag from "@/components/shared/VerifiedTag";
import TrustBadge from "@/components/shared/TrustBadge";
import { useAuth } from "@/lib/auth-context";
import { JobApi, MessagingApi } from "@/lib/endpoints";
import { formatMoney, timeAgo } from "@/lib/format";

export default function GigDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const jobRes = await JobApi.get(id);
      setJob(jobRes.data);

      const isOwner = user && jobRes.data?.owner?.documentId === user.documentId;
      if (isOwner) {
        const rank = await JobApi.rankBids(id);
        setBids(rank.data ?? []);
      }
    } catch (err) {
      // 404 when the job doesn't exist (or was deleted), 401/403 if it's
      // not visible to this viewer — show a friendly state instead of an
      // unhandled promise rejection.
      setLoadError(err.status === 404 ? "not_found" : err.message || "load_failed");
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user || !job) return;
    MessagingApi.mine().then((res) => {
      const conv = (res.data ?? []).find((c) => c.job?.documentId === job.documentId);
      setConversationId(conv?.documentId ?? null);
    });
  }, [user, job]);

  if (loadError) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h1" sx={{ fontSize: 24, mb: 1.5 }}>
          {loadError === "not_found" ? "This job doesn't exist" : "Couldn't load this job"}
        </Typography>
        <Alert severity={loadError === "not_found" ? "info" : "error"} variant="outlined" sx={{ display: "inline-flex", mb: 2 }}>
          {loadError === "not_found"
            ? "It may have been removed, or the link is out of date."
            : loadError}
        </Alert>
        <br />
        <Button component={Link} href="/gigs" variant="contained">
          Browse open gigs
        </Button>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container sx={{ py: 6 }}>
        <Skeleton variant="rounded" height={300} />
      </Container>
    );
  }

  const isOwner = user && job.owner?.documentId === user.documentId;
  const isInternational =
    user &&
    job.owner?.country?.documentId &&
    job.country?.documentId &&
    job.owner.country.documentId !== user.country?.documentId;
  const isGlobal = job.scope === "FOR_EVERYONE";

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      {job.job_status === "disputed" && (
        <Stack sx={{ mb: 3 }}>
          <DisputeFlagBanner />
        </Stack>
      )}

      <Stack justify="space-between" align="flex-start" wrap="wrap" gap={2} sx={{ mb: 1.5 }}>
        <Typography variant="h1" sx={{ fontSize: 26, maxWidth: 560 }}>
          {job.title}
        </Typography>
        <Chip
          icon={isGlobal ? <Globe size={14} /> : <MapPin size={14} />}
          label={isGlobal ? "Open to everyone" : job.target_city || "Local"}
        />
      </Stack>

      <Stack align="center" gap={2} sx={{ mb: 3 }} wrap="wrap">
        <Typography variant="h2" className="font-tabular" sx={{ color: "secondary.main", fontSize: 22 }}>
          {formatMoney(job.budget_amount, job.budget_currency)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Posted {timeAgo(job.createdAt)} by {job.owner?.username}
        </Typography>
        <VerifiedTag verified={job.owner?.is_verified_human} />
      </Stack>

      <Stack gap={0.75} wrap="wrap" sx={{ mb: 3 }}>
        {(job.skills_required ?? []).map((s) => (
          <Chip key={s.documentId} label={s.name} variant="outlined" size="small" />
        ))}
      </Stack>

      <Typography variant="body1" sx={{ mb: 4, whiteSpace: "pre-wrap" }}>
        {job.description?.replace(/<[^>]+>/g, "")}
      </Typography>

      {job.escrow_status !== "unfunded" && (
        <Stack direction="column" gap={1} sx={{ mb: 4 }}>
          <Typography variant="h3">Escrow status</Typography>
          <EscrowStatusTimeline status={job.escrow_status} />
        </Stack>
      )}

      <Divider sx={{ mb: 4 }} />

      {isOwner ? (
        <Stack direction="column" gap={2}>
          <Typography variant="h2" sx={{ fontSize: 20 }}>
            Bids ranked for you
          </Typography>
          {bids === null ? <Skeleton variant="rounded" height={160} /> : <BidList bids={bids} job={job} isInternational={false} />}
        </Stack>
      ) : (
        <BidTicket job={job} isInternational={!!isInternational} onBidPlaced={load} />
      )}

      {user && (isOwner || job.assigned_worker?.documentId === user.documentId) && (
        <Stack sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<MessageCircle size={16} />}
            href={conversationId ? `/messages/${conversationId}` : "/messages"}
          >
            {conversationId ? "Open conversation" : "Messages"}
          </Button>
        </Stack>
      )}
    </Container>
  );
}