"use client";

/**
 * app/gigs/page.jsx — "/gigs"
 * Search/filter open gigs. Backend call: GET /api/jobs?filters[status]=open
 * &filters[skills_required][name][$in]=...&filters[country][id]=...
 */
import { useEffect, useState } from "react";
import {
  Chip,
  MenuItem,
  Skeleton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import GridBox from "@/components/layout/GridBox";
import GigCard from "@/components/gigs/GigCard";
import OnboardingStepper from "@/components/shared/OnboardingStepper";
import { useAuth } from "@/lib/auth-context";
import { CountryApi, JobApi, SkillsApi } from "@/lib/endpoints";

export default function BrowseGigsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [countries, setCountries] = useState([]);
  const [skills, setSkills] = useState([]);

  const [countryId, setCountryId] = useState("");
  const [scope, setScope] = useState("all");
  const [skillIds, setSkillIds] = useState([]);

  useEffect(() => {
    CountryApi.list().then((r) => setCountries(r.data ?? []));
    SkillsApi.list().then((r) => setSkills(r.data ?? []));
  }, []);

  useEffect(() => {
    setJobs(null);
    JobApi.list({
      status: "open",
      countryId: countryId || undefined,
      scope: scope === "all" ? undefined : scope,
      skillIds: skillIds.length ? skillIds : undefined,
      pageSize: 24,
    })
      .then((r) => setJobs(r.data ?? []))
      .catch(() => setJobs([]));
  }, [countryId, scope, skillIds]);

  const localizedTerm =
    countries.find((c) => c.id === countryId)?.gig_local_term_plural ?? "Gigs";

  function toggleSkill(id) {
    setSkillIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  useEffect(() => {
    console.log('jobs', jobs)
  }, [jobs])
  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: 3, fontSize: 28 }}>
        Browse {localizedTerm}
      </Typography>

      {user && !user.is_verified_human && (
        <Stack
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            border: (t) => `1px solid ${t.palette.divider}`,
            backgroundColor: "rgba(255,193,7,0.06)",
          }}
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={1.5}
        >
          <Typography variant="body2">
            Verify your profile to be trusted by more job posters and rank higher in bid lists.
          </Typography>
          <Chip label="Verify now" component="a" href="/verify" clickable color="secondary" />
        </Stack>
      )}

      <Stack direction={{ xs: "column", md: "row" }} gap={3}>
        <Stack direction="column" gap={2.5} sx={{ width: { xs: "100%", md: 260 }, flexShrink: 0 }}>
          <TextField select label="Country" value={countryId} onChange={(e) => setCountryId(e.target.value)}>
            <MenuItem value="">All countries</MenuItem>
            {countries.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <ToggleButtonGroup exclusive value={scope} onChange={(_, v) => v && setScope(v)} fullWidth size="small">
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="LOCAL">Local</ToggleButton>
            <ToggleButton value="FOR_EVERYONE">Global</ToggleButton>
          </ToggleButtonGroup>

          <Stack direction="column" gap={1}>
            <Typography variant="caption" color="text.secondary">
              Skills
            </Typography>
            <Stack gap={0.75} wrap="wrap">
              {skills.map((s) => (
                <Chip
                  key={s.id}
                  label={s.name}
                  size="small"
                  color={skillIds.includes(s.id) ? "primary" : "default"}
                  onClick={() => toggleSkill(s.id)}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>

        <GridBox columns={{ xs: 1, sm: 2, lg: 3 }} gap={3} sx={{ flex: 1 }}>
          {jobs === null
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rounded" height={180} />)
            : jobs.map((job) => <GigCard key={job.id} job={job} variant="expanded" />)}
        </GridBox>
      </Stack>

      {jobs?.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          No open gigs match those filters yet.
        </Typography>
      )}
    </Container>
  );
}
