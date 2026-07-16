"use client";

/**
 * components/wallet/EscrowStatusTimeline.jsx
 * Visual funded → held → released timeline for a job's escrow_status.
 */
import { Box, Typography } from "@mui/material";
import { Lock, CheckCircle2, Banknote, CircleDashed } from "lucide-react";
import Stack from "@/components/layout/Stack";

const STAGES = [
  { key: "unfunded", label: "Unfunded", icon: CircleDashed },
  { key: "funded", label: "Funded", icon: Banknote },
  { key: "held", label: "Held in escrow", icon: Lock },
  { key: "released", label: "Released", icon: CheckCircle2 },
];

export default function EscrowStatusTimeline({ status }) {
  const activeIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <Stack gap={0} align="center">
      {STAGES.map((stage, i) => {
        const Icon = stage.icon;
        const isDone = i <= activeIndex;
        return (
          <Stack key={stage.key} align="center" sx={{ flex: i < STAGES.length - 1 ? 1 : "0 0 auto" }}>
            <Stack direction="column" align="center" gap={0.5}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDone ? "primary.main" : "rgba(255,255,255,0.06)",
                  color: isDone ? "#0A0A0A" : "text.secondary",
                }}
              >
                <Icon size={16} />
              </Box>
              <Typography variant="caption" color={isDone ? "text.primary" : "text.secondary"}>
                {stage.label}
              </Typography>
            </Stack>
            {i < STAGES.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  mx: 1,
                  mb: 2.5,
                  backgroundColor: i < activeIndex ? "primary.main" : "rgba(255,255,255,0.08)",
                }}
              />
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}
