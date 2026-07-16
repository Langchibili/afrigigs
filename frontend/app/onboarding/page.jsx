"use client";

/**
 * app/onboarding/page.jsx — "/onboarding"
 * Implements the blueprint's "Instant Onboarding" flow: register, add
 * country/skills/ID, immediately unlock browse/bid with an Unverified badge.
 * Backend calls: POST /api/auth/local/register, GET /api/countries,
 * GET /api/skills-catalogs, POST /api/skilled-profiles or
 * /api/professional-profiles, PUT /api/users/:id
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip,
  Alert,
} from "@mui/material";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import OnboardingStepper from "@/components/shared/OnboardingStepper";
import VerifiedTag from "@/components/shared/VerifiedTag";
import { useAuth } from "@/lib/auth-context";
import { CountryApi, ProfileApi, SkillsApi } from "@/lib/endpoints";

const STEPS = ["Account", "Country", "Profile type", "Skills", "ID", "Done"];

export default function OnboardingPage() {
  const router = useRouter();
  const { register, user } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    countryId: "",
    profileType: "skilled",
    skillsCategory: "Manual Trades",
    skillIds: [],
    nationalId: "",
  });

  const [countries, setCountries] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    CountryApi.list().then((r) => setCountries(r.data ?? [])).catch(() => {});
    SkillsApi.list().then((r) => setSkills(r.data ?? [])).catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleNext() {
    setError(null);

    if (step === 0) {
      if (!form.username || !form.email || form.password.length < 6) {
        setError("Please fill in a username, email, and a password of at least 6 characters.");
        return;
      }
      setSubmitting(true);
      try {
        await register(form.username, form.email, form.password);
        setStep(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (step === 1) {
      if (!form.countryId) return setError("Select your country.");
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      if (form.profileType === "skilled" && form.skillIds.length === 0) {
        return setError("Select at least one skill.");
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      if (form.profileType === "skilled" && !form.nationalId) {
        return setError("An ID number is required to unlock matches.");
      }
      setSubmitting(true);
      try {
        await ProfileApi.updateMe(user.id, { country: form.countryId });
        if (form.profileType === "skilled") {
          await ProfileApi.createSkilled({
            national_id_number: form.nationalId,
            skills_category: form.skillsCategory,
            skills: form.skillIds,
            user: user.id,
          });
        } else {
          await ProfileApi.createProfessional({ user: user.id });
        }
        setStep(5);
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
      <Typography variant="h1" sx={{ mb: 3, fontSize: 28 }}>
        Create your account
      </Typography>
      <OnboardingStepper steps={STEPS} activeIndex={step} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {step === 0 && (
        <Stack direction="column" gap={2}>
          <TextField label="Username" value={form.username} onChange={(e) => update("username", e.target.value)} />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            helperText="At least 6 characters"
          />
        </Stack>
      )}

      {step === 1 && (
        <TextField select label="Country" fullWidth value={form.countryId} onChange={(e) => update("countryId", e.target.value)}>
          {countries.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      {step === 2 && (
        <Stack direction="column" gap={1.5}>
          <Typography variant="body2" color="text.secondary">
            Skilled covers manual trades &amp; digital services. Professional covers white-collar
            services with a resume and certifications.
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={form.profileType}
            onChange={(_, v) => v && update("profileType", v)}
            fullWidth
          >
            <ToggleButton value="skilled">Skilled Worker</ToggleButton>
            <ToggleButton value="professional">Professional</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      )}

      {step === 3 && form.profileType === "skilled" && (
        <Stack direction="column" gap={2}>
          <TextField
            select
            label="Skills category"
            value={form.skillsCategory}
            onChange={(e) => update("skillsCategory", e.target.value)}
          >
            {[
              "Manual Trades",
              "Digital Services",
              "Domestic Services",
              "Transport & Logistics",
              "Creative & Media",
              "Professional Services",
            ].map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <Stack gap={1} wrap="wrap">
            {skills
              .filter((s) => s.category === form.skillsCategory)
              .map((s) => {
                const active = form.skillIds.includes(s.id);
                return (
                  <Chip
                    key={s.id}
                    label={s.name}
                    color={active ? "primary" : "default"}
                    onClick={() =>
                      update(
                        "skillIds",
                        active ? form.skillIds.filter((id) => id !== s.id) : [...form.skillIds, s.id]
                      )
                    }
                  />
                );
              })}
          </Stack>
        </Stack>
      )}
      {step === 3 && form.profileType === "professional" && (
        <Typography color="text.secondary">
          You can add your resume, education, and certifications after this — let's get you browsing first.
        </Typography>
      )}

      {step === 4 && (
        <Stack direction="column" gap={2}>
          {form.profileType === "skilled" ? (
            <TextField
              label="National ID number"
              value={form.nationalId}
              onChange={(e) => update("nationalId", e.target.value)}
              helperText="Required to unlock matches. Kept private and never shown publicly."
            />
          ) : (
            <Typography color="text.secondary">No ID required yet for professional profiles.</Typography>
          )}
        </Stack>
      )}

      {step === 5 && (
        <Stack direction="column" gap={2} align="flex-start">
          <VerifiedTag verified={false} />
          <Typography color="text.secondary">
            You're all set — you can browse and bid right away. Complete a quick video verification
            anytime to clear the Unverified badge and unlock more trust with job posters.
          </Typography>
          <Stack gap={1.5}>
            <Button variant="contained" onClick={() => router.push("/dashboard")}>
              Go to dashboard
            </Button>
            <Button variant="outlined" onClick={() => router.push("/verify")}>
              Verify now
            </Button>
          </Stack>
        </Stack>
      )}

      {step < 5 && (
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleNext} disabled={submitting}>
            {submitting ? "Please wait…" : step === 4 ? "Finish" : "Continue"}
          </Button>
        </Box>
      )}
    </Container>
  );
}
