"use client";

/**
 * components/gigs/BidTicket.jsx
 * Bid amount input + submit. The server (Bid.beforeCreate lifecycle) is
 * the source of truth for the floor check — this form surfaces its
 * rejection message inline rather than trusting only client-side checks.
 */
import { useState } from "react";
import { Alert, Button, TextField, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Stack from "@/components/layout/Stack";
import { BidApi } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth-context";

export default function BidTicket({ job, isInternational, onBidPlaced }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currencySymbol = job.budget_currency?.symbol ?? "";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setError("Log in to place a bid.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        job: job.id,
        user: user.id,
        message,
        ...(isInternational
          ? { proposed_amount_usd: Number(amount) }
          : { proposed_amount_local: Number(amount) }),
      };
      await BidApi.create(payload);
      setSuccess(true);
      setAmount("");
      setMessage("");
      onBidPlaced?.();
    } catch (err) {
      // Server error messages are written to be shown directly, e.g.
      // "Bid rejected. The domestic floor limit for this area is ZK50."
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (job.status !== "open") {
    return (
      <Alert severity="info" variant="outlined">
        This job is no longer accepting bids.
      </Alert>
    );
  }

  return (
    <Stack direction="column" gap={1.5} component="form" onSubmit={handleSubmit}>
      <Typography variant="h3">Place a bid</Typography>
      <TextField
        label={`Your bid (${isInternational ? "USD" : currencySymbol})`}
        type="number"
        inputProps={{ step: "0.01", min: 0 }}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <TextField
        label="Message to the job poster (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        multiline
        minRows={2}
      />

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Alert severity="error">{error}</Alert>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Alert severity="success" icon={<CheckCircle2 size={18} />}>
              Bid submitted!
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={submitting}
        sx={{
          "&:active": { transform: "scale(0.97)" },
          transition: "transform 0.1s ease",
        }}
      >
        {submitting ? "Submitting…" : "Submit bid"}
      </Button>
    </Stack>
  );
}
