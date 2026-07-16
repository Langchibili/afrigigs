"use client";

/**
 * app/profile/edit/page.jsx — "/profile/edit"
 * Skilled/Professional profile completion flow. Backend calls:
 * PUT /api/skilled-profiles/:id, PUT /api/professional-profiles/:id
 * (media upload via /api/upload).
 */
import { useEffect, useState } from "react";
import { Alert, Button, Chip, TextField, Typography } from "@mui/material";
import { Upload } from "lucide-react";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import ProfileCompletionRing from "@/components/shared/ProfileCompletionRing";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ProfileApi, SkillsApi } from "@/lib/endpoints";

export default function EditProfilePage() {
  const { user } = useRequireAuth();
  const isProfessional = !!user?.professional_profile;

  const [skills, setSkills] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [skilledForm, setSkilledForm] = useState({ description: "", skillIds: [] });
  const [proForm, setProForm] = useState({ experienceSummary: "" });

  useEffect(() => {
    SkillsApi.list().then((r) => setSkills(r.data ?? []));
  }, []);

  useEffect(() => {
    if (user?.skilled_profile) {
      setSkilledForm({
        description: user.skilled_profile.description ?? "",
        skillIds: (user.skilled_profile.skills ?? []).map((s) => s.id),
      });
    }
    if (user?.professional_profile) {
      setProForm({ experienceSummary: user.professional_profile.experience_summary ?? "" });
    }
  }, [user]);

  function toggleSkill(id) {
    setSkilledForm((f) => ({
      ...f,
      skillIds: f.skillIds.includes(id) ? f.skillIds.filter((i) => i !== id) : [...f.skillIds, id],
    }));
  }

  async function handleSave() {
    setError(null);
    try {
      if (isProfessional && user.professional_profile) {
        await ProfileApi.updateProfessional(user.professional_profile.id, {
          experience_summary: proForm.experienceSummary,
        });
      } else if (user?.skilled_profile) {
        await ProfileApi.updateSkilled(user.skilled_profile.id, {
          description: skilledForm.description,
          skills: skilledForm.skillIds,
        });
      }
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user) return null;

  const completion = isProfessional ? user.profile_completion_professional : user.profile_completion_skilled;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack justify="space-between" align="center" sx={{ mb: 3 }}>
        <Typography variant="h1" sx={{ fontSize: 26 }}>
          Edit your profile
        </Typography>
        <ProfileCompletionRing percent={completion} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Profile updated.</Alert>}

      {!isProfessional ? (
        <Stack direction="column" gap={2.5}>
          <TextField
            label="Description"
            multiline
            minRows={3}
            value={skilledForm.description}
            onChange={(e) => setSkilledForm((f) => ({ ...f, description: e.target.value }))}
          />
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
                  color={skilledForm.skillIds.includes(s.id) ? "primary" : "default"}
                  onClick={() => toggleSkill(s.id)}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      ) : (
        <Stack direction="column" gap={2.5}>
          <TextField
            label="Experience summary"
            multiline
            minRows={4}
            value={proForm.experienceSummary}
            onChange={(e) => setProForm({ experienceSummary: e.target.value })}
          />
          <Button variant="outlined" component="label" startIcon={<Upload size={16} />}>
            Upload resume
            <input hidden type="file" accept=".pdf,.doc,.docx" />
          </Button>
        </Stack>
      )}

      <Button variant="contained" size="large" sx={{ mt: 3 }} onClick={handleSave}>
        Save changes
      </Button>
    </Container>
  );
}
