"use client";

/**
 * app/profile/[id]/page.jsx — "/profile/[id]"
 * Shown when viewing a bidder/worker. Backend calls:
 * GET /api/users/:id?populate=skilled_profile,professional_profile,country
 * GET /api/reviews?filters[to_user][id]=:id&populate=from_user
 */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, Divider, Rating, Skeleton, Typography } from "@mui/material";
import Container from "@/components/layout/Container";
import Stack from "@/components/layout/Stack";
import GridBox from "@/components/layout/GridBox";
import TrustBadge from "@/components/shared/TrustBadge";
import VerifiedTag from "@/components/shared/VerifiedTag";
import ProfileCompletionRing from "@/components/shared/ProfileCompletionRing";
import { ProfileApi, ReviewApi } from "@/lib/endpoints";
import { initials, timeAgo } from "@/lib/format";

export default function PublicProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    ProfileApi.getUserPublic(id).then((r) => setUser(r.data ?? r));
    ReviewApi.listForUser(id).then((r) => setReviews(r.data ?? []));
  }, [id]);

  if (!user) {
    return (
      <Container sx={{ py: 6 }}>
        <Skeleton variant="rounded" height={200} />
      </Container>
    );
  }

  const isProfessional = !!user.professional_profile;
  const completion = isProfessional ? user.profile_completion_professional : user.profile_completion_skilled;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack align="center" gap={2.5} wrap="wrap" sx={{ mb: 3 }}>
        <Avatar sx={{ width: 64, height: 64, fontSize: 22, bgcolor: "primary.dark" }}>
          {initials(user.username)}
        </Avatar>
        <Stack direction="column" gap={0.5}>
          <Stack align="center" gap={1.5}>
            <Typography variant="h1" sx={{ fontSize: 24 }}>
              {user.username}
            </Typography>
            <VerifiedTag verified={user.is_verified_human} />
          </Stack>
          <Typography color="text.secondary">
            {user.country?.name} · {user.native_last_city ?? "Location not shared"}
          </Typography>
        </Stack>
        <Stack sx={{ ml: "auto" }} align="center" gap={2}>
          <TrustBadge trustScoreYes={user.trust_score_yes} />
          <ProfileCompletionRing percent={completion} label="Profile" size={54} />
        </Stack>
      </Stack>

      {user.skilled_profile && (
        <Stack direction="column" gap={1} sx={{ mb: 4 }}>
          <Typography variant="h3">{user.skilled_profile.skills_category}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.skilled_profile.description}
          </Typography>
          <Stack gap={0.75} wrap="wrap">
            {(user.skilled_profile.skills ?? []).map((s) => (
              <Typography
                key={s.id}
                variant="caption"
                sx={{ px: 1.25, py: 0.5, borderRadius: 999, border: (t) => `1px solid ${t.palette.divider}` }}
              >
                {s.name}
              </Typography>
            ))}
          </Stack>
        </Stack>
      )}

      {user.professional_profile && (
        <Stack direction="column" gap={1.5} sx={{ mb: 4 }}>
          <Typography variant="h3">Experience</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.professional_profile.experience_summary}
          </Typography>
          {(user.professional_profile.certifications ?? []).length > 0 && (
            <GridBox columns={{ xs: 1, sm: 2 }} gap={1.5}>
              {user.professional_profile.certifications.map((cert) => (
                <Stack
                  key={cert.id}
                  direction="column"
                  gap={0.25}
                  sx={{ p: 1.5, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {cert.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cert.issuing_body}
                  </Typography>
                </Stack>
              ))}
            </GridBox>
          )}
        </Stack>
      )}

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h2" sx={{ fontSize: 20, mb: 2 }}>
        Reviews
      </Typography>
      {reviews === null ? (
        <Skeleton variant="rounded" height={100} />
      ) : reviews.length === 0 ? (
        <Typography color="text.secondary">No reviews yet.</Typography>
      ) : (
        <Stack direction="column" gap={2}>
          {reviews.map((review) => (
            <Stack key={review.id} direction="column" gap={0.5}>
              <Stack align="center" gap={1}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {review.from_user?.username}
                </Typography>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">
                  {timeAgo(review.createdAt)}
                </Typography>
              </Stack>
              {review.comment && <Typography variant="body2">{review.comment}</Typography>}
            </Stack>
          ))}
        </Stack>
      )}
    </Container>
  );
}
