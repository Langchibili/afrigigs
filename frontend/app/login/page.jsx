"use client";

/**
 * app/login/page.jsx — "/login"
 * Standard auth entry. Backend call: POST /api/auth/local
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button, TextField, Typography } from "@mui/material";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(identifier, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Typography variant="h1" sx={{ mb: 3, fontSize: 28 }}>
        Welcome back
      </Typography>
      <Stack direction="column" gap={2} component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoFocus
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
        <Typography variant="body2" color="text.secondary">
          New here? <Link href="/onboarding">Create an account</Link>
        </Typography>
      </Stack>
    </Container>
  );
}
