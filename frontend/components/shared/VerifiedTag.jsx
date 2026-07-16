"use client";

/**
 * components/shared/VerifiedTag.jsx
 * "✓ Verified" / "⚠ Unverified" caution badge per the blueprint's
 * verification concept. Unverified state gets a subtle looping gradient
 * shimmer (prefers-reduced-motion respected); Verified is a solid check.
 */
import { Box, Chip } from "@mui/material";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function VerifiedTag({ verified, compact = false }) {
  if (verified) {
    return (
      <Chip
        size="small"
        icon={<CheckCircle2 size={14} />}
        label={compact ? undefined : "Verified"}
        sx={{
          color: "#0A0A0A",
          backgroundImage: (t) => t.custom.gradients.verifiedSheen,
          fontWeight: 700,
          "& .MuiChip-icon": { color: "#0A0A0A" },
          px: compact ? 0.5 : undefined,
        }}
      />
    );
  }

  return (
    <Chip
      size="small"
      icon={<AlertTriangle size={14} />}
      label={compact ? undefined : "Unverified"}
      sx={{
        color: "error.main",
        backgroundColor: "rgba(239,83,80,0.12)",
        border: "1px solid rgba(239,83,80,0.35)",
        "& .MuiChip-icon": { color: "error.main" },
        position: "relative",
        overflow: "hidden",
        "@media (prefers-reduced-motion: no-preference)": {
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg, transparent 30%, rgba(239,83,80,0.25) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.6s linear infinite",
          },
        },
        "@keyframes shimmer": {
          "0%": { backgroundPosition: "150% 0" },
          "100%": { backgroundPosition: "-50% 0" },
        },
      }}
    />
  );
}
