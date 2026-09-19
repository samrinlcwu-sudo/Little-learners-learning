import { createClient } from "@/lib/supabase/client";
import type { ChildProfile } from "./types";
import type { Tables } from "@/lib/supabase/database.types";

/**
 * The real, Supabase-backed replacement for `local-children.ts` (Prompt
 * 110 — see docs/AUTHENTICATION_BACKEND_AUDIT.md). Every row is scoped to
 * `parent_id = auth.uid()` by Postgres Row Level Security
 * (`child_profiles` table policies) — not by anything this file does —
 * so there is no risk of a client-side bug leaking another parent's
 * children; a query for another parent's row simply returns nothing.
 */
type ChildProfileRow = Tables<"child_profiles">;

function toChildProfile(row: ChildProfileRow): ChildProfile {
  return {
    id: row.id,
    parentAccountId: row.parent_id,
    name: row.name,
    ageYears: row.age_years,
    avatar: row.avatar as ChildProfile["avatar"],
    favoriteCategory: row.favorite_category ?? undefined,
    createdAt: row.created_at,
    accountStatus: row.account_status as ChildProfile["accountStatus"],
  };
}

export type NewChildProfile = Pick<ChildProfile, "name" | "ageYears" | "avatar" | "favoriteCategory">;

export async function fetchChildProfiles(): Promise<ChildProfile[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("child_profiles").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(toChildProfile);
}

export async function addChildProfile(child: NewChildProfile): Promise<ChildProfile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data, error } = await supabase
    .from("child_profiles")
    .insert({
      parent_id: user.id,
      name: child.name,
      age_years: child.ageYears,
      avatar: child.avatar,
      favorite_category: child.favoriteCategory,
    })
    .select("*")
    .single();
  if (error) throw error;
  return toChildProfile(data);
}

export async function updateChildProfile(id: string, updates: NewChildProfile): Promise<ChildProfile> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("child_profiles")
    .update({
      name: updates.name,
      age_years: updates.ageYears,
      avatar: updates.avatar,
      favorite_category: updates.favoriteCategory,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return toChildProfile(data);
}
