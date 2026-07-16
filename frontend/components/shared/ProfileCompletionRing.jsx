"use client";

/**
 * components/shared/ProfileCompletionRing.jsx
 * Animated SVG progress ring for profile_completion_skilled /
 * profile_completion_professional.
 */
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function ProfileCompletionRing({ percent = 0, size = 64, label }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
      <Box sx={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#00BFA6"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {percent}%
          </Typography>
        </Box>
      </Box>
      {label && (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
}
