"use client";

/**
 * components/gigs/BidList.jsx
 * Ranked bid list shown to the job owner — pulled from
 * GET /api/jobs/:id/rank-bids (proximity → trust_score_yes →
 * profile_completion_skilled). Each row shows a TrustBadge + VerifiedTag.
 */
import { Avatar, Typography, Divider } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import Stack from "@/components/layout/Stack";
import TrustBadge from "@/components/shared/TrustBadge";
import VerifiedTag from "@/components/shared/VerifiedTag";
import { formatMoney, formatUsd, initials, timeAgo } from "@/lib/format";

export default function BidList({ bids, job, isInternational }) {
  if (!bids?.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No bids yet.
      </Typography>
    );
  }

  return (
    <Stack direction="column" gap={0} component={motion.ul} sx={{ listStyle: "none", p: 0, m: 0 }}>
      <AnimatePresence initial={false}>
        {bids.map((bid, i) => (
          <motion.li key={bid.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Stack justify="space-between" align="center" sx={{ py: 1.5 }}>
              <Stack align="center" gap={1.5}>
                <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: "primary.dark" }}>
                  {initials(bid.user?.username)}
                </Avatar>
                <Stack direction="column" gap={0.25}>
                  <Stack align="center" gap={1}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {bid.user?.username}
                    </Typography>
                    <VerifiedTag verified={bid.user?.is_verified_human} compact />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo(bid.createdAt)}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="column" align="flex-end" gap={0.5}>
                <Typography variant="subtitle1" className="font-tabular" sx={{ color: "secondary.main" }}>
                  {isInternational
                    ? formatUsd(bid.proposed_amount_usd)
                    : formatMoney(bid.proposed_amount_local, job.budget_currency)}
                </Typography>
                <TrustBadge trustScoreYes={bid.user?.trust_score_yes ?? 0} />
              </Stack>
            </Stack>
            {i < bids.length - 1 && <Divider />}
          </motion.li>
        ))}
      </AnimatePresence>
    </Stack>
  );
}
