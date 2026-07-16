"use client";

/**
 * hooks/useRequireAuth.js
 * Redirects to /login if there's no signed-in user once the auth check
 * has settled. Returns { user, isLoading } for pages to gate their render.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  return { user, isLoading };
}
