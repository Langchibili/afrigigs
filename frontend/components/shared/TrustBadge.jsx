"use client";

/**
 * components/shared/TrustBadge.jsx
 * Color-coded chip driven by trust_score_yes. Colors map to
 * theme.custom.trustHigh/Medium/Low (shield-check icon).
 */
import { Chip, useTheme } from "@mui/material";
import { ShieldCheck } from "lucide-react";
import { trustLevel } from "@/lib/format";

export default function TrustBadge({ trustScoreYes = 0, size = "small" }) {
  const theme = useTheme();
  const level = trustLevel(trustScoreYes);
  const color =
    level === "high" ? theme.custom.trustHigh : level === "medium" ? theme.custom.trustMedium : theme.custom.trustLow;

  return (
    <Chip
      size={size}
      icon={<ShieldCheck size={14} color={color} />}
      label={`${trustScoreYes} trust pts`}
      sx={{
        color,
        backgroundColor: `${color}1A`,
        border: `1px solid ${color}40`,
        "& .MuiChip-icon": { color },
      }}
    />
  );
}
