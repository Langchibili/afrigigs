"use client";

/**
 * components/shared/DisputeFlagBanner.jsx
 * Shown on jobs auto-flagged by the hourly dispute cron
 * (job.status === 'disputed'). There is no in-app resolution page —
 * disputes are handled in the Strapi admin panel — so this only points
 * to a support/contact path.
 */
import { Alert, AlertTitle, Button } from "@mui/material";

export default function DisputeFlagBanner() {
  return (
    <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
      <AlertTitle>This job is under review</AlertTitle>
      The completion window passed without confirmation, so this job was automatically flagged for admin
      review. Funds remain safely held in escrow while this is resolved.
      <br />
      <Button size="small" href="mailto:support@afrigigs.example" sx={{ mt: 1, px: 0 }}>
        Contact support
      </Button>
    </Alert>
  );
}
