"use client";

/**
 * app/gigs/new/page.jsx — "/gigs/new"
 * Employer flow: create a job, choose Local vs For-Everyone scope, set
 * budget, fund escrow. Backend calls: POST /api/jobs,
 * POST /api/escrow-transactions (gateway checkout redirect handled
 * client-side per provider SDK — not yet wired, see backend docs D.6).
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { CountryApi, JobApi, SkillsApi, WalletApi } from "@/lib/endpoints";

const GATEWAYS = [
  { value: "paystack", label: "Paystack" },
  { value: "flutterwave", label: "Flutterwave" },
  { value: "dpo", label: "DPO Group" },
];

export default function PostJobPage() {
  const { user } = useRequireAuth();
  const router = useRouter();
  const [countries, setCountries] = useState([]);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    countryId: "",
    targetCity: "",
    scope: "LOCAL",
    skillIds: [],
    budgetAmount: "",
    gateway: "paystack",
  });

  useEffect(() => {
    CountryApi.list().then((r) => setCountries(r.data ?? []));
    SkillsApi.list().then((r) => setSkills(r.data ?? []));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const selectedCountry = countries.find((c) => c.id === form.countryId);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);
    try {
      const jobRes = await JobApi.create({
        title: form.title,
        description: form.description,
        owner: user.id,
        country: form.countryId,
        target_city: form.targetCity,
        scope: form.scope,
        budget_currency: selectedCountry?.currency?.id,
        budget_amount: Number(form.budgetAmount),
        skills_required: form.skillIds,
        status: "open",
      });

      const jobId = jobRes.data.id;

      // Fund escrow. Live gateway checkout isn't wired yet (see D.6) —
      // this stores a placeholder reference so the flow is testable end
      // to end once the webhook route ships.
      await WalletApi.fund({
        job: jobId,
        amount: Number(form.budgetAmount),
        currency: selectedCountry?.currency?.id,
        gateway: form.gateway,
        gateway_ref: `pending_${Date.now()}`,
      });

      router.push(`/gigs/${jobId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleSkill(id) {
    update("skillIds", form.skillIds.includes(id) ? form.skillIds.filter((i) => i !== id) : [...form.skillIds, id]);
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: 3, fontSize: 26 }}>
        Post a job
      </Typography>

      <Stack direction="column" gap={2.5} component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField label="Job title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          multiline
          minRows={4}
          required
        />

        <TextField select label="Country" value={form.countryId} onChange={(e) => update("countryId", e.target.value)} required>
          {countries.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        <ToggleButtonGroup exclusive value={form.scope} onChange={(_, v) => v && update("scope", v)} fullWidth>
          <ToggleButton value="LOCAL">Local only</ToggleButton>
          <ToggleButton value="FOR_EVERYONE">Open to everyone</ToggleButton>
        </ToggleButtonGroup>

        {form.scope === "LOCAL" && (
          <TextField
            select
            label="Target city"
            value={form.targetCity}
            onChange={(e) => update("targetCity", e.target.value)}
          >
            {(selectedCountry?.cities ?? []).map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Stack direction="column" gap={1}>
          <Typography variant="caption" color="text.secondary">
            Skills required
          </Typography>
          <Stack gap={0.75} wrap="wrap">
            {skills.map((s) => (
              <Chip
                key={s.id}
                label={s.name}
                size="small"
                color={form.skillIds.includes(s.id) ? "primary" : "default"}
                onClick={() => toggleSkill(s.id)}
              />
            ))}
          </Stack>
        </Stack>

        <TextField
          label={`Budget${selectedCountry?.currency ? ` (${selectedCountry.currency.symbol})` : ""}`}
          type="number"
          inputProps={{ step: "0.01", min: 0 }}
          value={form.budgetAmount}
          onChange={(e) => update("budgetAmount", e.target.value)}
          required
        />

        <TextField select label="Payment gateway" value={form.gateway} onChange={(e) => update("gateway", e.target.value)}>
          {GATEWAYS.map((g) => (
            <MenuItem key={g.value} value={g.value}>
              {g.label}
            </MenuItem>
          ))}
        </TextField>

        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? "Posting…" : "Post job & fund escrow"}
        </Button>
      </Stack>
    </Container>
  );
}
