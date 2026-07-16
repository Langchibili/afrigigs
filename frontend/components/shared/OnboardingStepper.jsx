"use client";

/**
 * components/shared/OnboardingStepper.jsx
 * Custom-built stepper (not MUI Stepper visuals, same a11y pattern:
 * ordered list, aria-current on the active step) matching the
 * blueprint's Instant Onboarding flow.
 */
import { Box, Typography } from "@mui/material";
import { Check } from "lucide-react";
import Stack from "@/components/layout/Stack";

export default function OnboardingStepper({ steps, activeIndex }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      gap={1}
      component="ol"
      sx={{ listStyle: "none", p: 0, m: 0, mb: 4 }}
    >
      {steps.map((step, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <Stack
            key={step}
            component="li"
            align="center"
            gap={1}
            aria-current={isActive ? "step" : undefined}
            sx={{ flex: 1 }}
          >
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: isDone ? "primary.main" : isActive ? "transparent" : "rgba(255,255,255,0.08)",
                border: isActive ? "2px solid #00BFA6" : "none",
                color: isDone ? "#0A0A0A" : "text.primary",
              }}
            >
              {isDone ? <Check size={14} /> : i + 1}
            </Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: isActive ? 700 : 500, color: isActive ? "text.primary" : "text.secondary" }}
            >
              {step}
            </Typography>
            {i < steps.length - 1 && (
              <Box
                sx={{
                  display: { xs: "none", sm: "block" },
                  flex: 1,
                  height: 2,
                  backgroundColor: isDone ? "primary.main" : "rgba(255,255,255,0.08)",
                }}
              />
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}
