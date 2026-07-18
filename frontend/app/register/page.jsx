"use client";

/**
 * app/register/page.jsx — "/register"
 * Account creation, split out from onboarding so the home page's
 * "Hire Someone" / "Find work" buttons can land here directly. Reads
 * ?intent=hire|work from the URL (set by the home page buttons or the
 * SwipeModeBar's current mode) and, on success:
 *   - intent=hire  -> straight to /dashboard (hire mode)
 *   - intent=work  -> /onboarding (to build a skilled/professional profile)
 * Backend call: POST /api/auth/local/register
 */
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Alert, Button, TextField, Typography } from "@mui/material";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import { useAuth } from "@/lib/auth-context";
import { useMode } from "@/lib/mode-context";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent") === "hire" ? "hire" : "work";

  const { register } = useAuth();
  const { setMode } = useMode();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.email || form.password.length < 6) {
      setError("Please fill in a username, email, and a password of at least 6 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await register(form.username, form.email, form.password);
      setMode(intent);
      router.push(intent === "hire" ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Typography variant="h1" sx={{ mb: 1, fontSize: 28 }}>
        {intent === "hire" ? "Create an account to start hiring" : "Create an account to find work"}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {intent === "hire"
          ? "You'll land straight in your dashboard, ready to post your first job."
          : "Next you'll set up your worker profile so you can start bidding."}
      </Typography>

      <Stack direction="column" gap={2} component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Username" value={form.username} onChange={(e) => update("username", e.target.value)} autoFocus />
        <TextField label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          helperText="At least 6 characters"
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? "Creating account…" : intent === "hire" ? "Create account & start hiring" : "Create account & find work"}
        </Button>
        <Typography variant="body2" color="text.secondary">
          Already have an account? <Link href="/login">Log in</Link>
        </Typography>
      </Stack>
    </Container>
  );
}
