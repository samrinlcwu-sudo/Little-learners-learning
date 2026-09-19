import { createClient } from "@/lib/supabase/client";
import type { Application, ApplicationStatus, ApplicationStatusEvent } from "./types";
import type { Json, Tables } from "@/lib/supabase/database.types";

/**
 * The real, Supabase-backed replacement for `local-applications.ts`
 * (Prompt 110 — see docs/AUTHENTICATION_BACKEND_AUDIT.md). Every row is
 * scoped to `parent_id = auth.uid()` by Postgres Row Level Security
 * (`applications` table policies) — a query for another parent's
 * application simply returns nothing, the same real guarantee
 * `child_profiles` and `teacher_profiles` get. The reference number is
 * still just a human-readable label shown back to the family who created
 * it (see this table's own RLS policy — it's never a public lookup key).
 */
type ApplicationRow = Tables<"applications">;

function toApplication(row: ApplicationRow): Application {
  const hasApplicant = row.applicant_name || row.applicant_email || row.applicant_phone;
  return {
    id: row.id,
    parentAccountId: row.parent_id,
    applicant: hasApplicant
      ? {
          name: row.applicant_name ?? "",
          email: row.applicant_email ?? "",
          phone: row.applicant_phone ?? undefined,
        }
      : undefined,
    childId: row.child_id ?? undefined,
    learningInterests: row.learning_interests,
    message: row.message ?? undefined,
    status: row.status as ApplicationStatus,
    referenceNumber: row.reference_number ?? undefined,
    statusHistory: (row.status_history ?? []) as unknown as ApplicationStatusEvent[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at ?? undefined,
  };
}

export async function fetchApplications(): Promise<Application[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toApplication);
}

export type NewApplication = Partial<Pick<Application, "applicant" | "childId" | "learningInterests" | "message">>;

export async function createDraftApplication(input: NewApplication = {}): Promise<Application> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data, error } = await supabase
    .from("applications")
    .insert({
      parent_id: user.id,
      applicant_name: input.applicant?.name,
      applicant_email: input.applicant?.email,
      applicant_phone: input.applicant?.phone,
      child_id: input.childId,
      learning_interests: input.learningInterests ?? [],
      message: input.message,
      status: "draft",
      status_history: [{ status: "draft", occurredAt: new Date().toISOString() }] as unknown as Json,
    })
    .select("*")
    .single();
  if (error) throw error;
  return toApplication(data);
}

export type ApplicationUpdates = Partial<Pick<Application, "applicant" | "childId" | "learningInterests" | "message">>;

export async function updateDraftApplication(id: string, updates: ApplicationUpdates): Promise<Application> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({
      applicant_name: updates.applicant?.name,
      applicant_email: updates.applicant?.email,
      applicant_phone: updates.applicant?.phone,
      child_id: updates.childId,
      learning_interests: updates.learningInterests,
      message: updates.message,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return toApplication(data);
}

function generateReferenceNumber(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LLL-${random}`;
}

export async function submitApplication(id: string): Promise<Application | undefined> {
  const supabase = createClient();
  const { data: current, error: fetchError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!current || current.status !== "draft") return undefined;

  const now = new Date().toISOString();
  const statusHistory = [
    ...((current.status_history ?? []) as unknown as ApplicationStatusEvent[]),
    { status: "submitted" as ApplicationStatus, occurredAt: now },
  ];

  const { data, error } = await supabase
    .from("applications")
    .update({
      status: "submitted",
      reference_number: generateReferenceNumber(),
      submitted_at: now,
      updated_at: now,
      status_history: statusHistory as unknown as Json,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return toApplication(data);
}

export async function withdrawApplication(id: string): Promise<Application | undefined> {
  const supabase = createClient();
  const { data: current, error: fetchError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!current || (current.status !== "draft" && current.status !== "submitted")) return undefined;

  const now = new Date().toISOString();
  const statusHistory = [
    ...((current.status_history ?? []) as unknown as ApplicationStatusEvent[]),
    { status: "withdrawn" as ApplicationStatus, occurredAt: now },
  ];

  const { data, error } = await supabase
    .from("applications")
    .update({ status: "withdrawn", updated_at: now, status_history: statusHistory as unknown as Json })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return toApplication(data);
}

/** Only a draft may ever be deleted outright — also enforced server-side by the table's own delete policy. */
export async function deleteDraftApplication(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("applications").delete().eq("id", id).eq("status", "draft");
  if (error) throw error;
}
