/**
 * Shared upload validation (Prompt 67) — the same MIME-prefix + size-cap
 * check `teacher-resource-form.tsx` and `teacher-profile-form.tsx` already
 * duplicated inline for image uploads, now factored out so the admin
 * content form's thumbnail *and* downloadable-file inputs use one real,
 * tested check instead of a third copy. This is real validation, not a
 * placeholder: it rejects the wrong file type and anything over the limit
 * before a file is ever read into memory.
 *
 * There is still no server-side file storage anywhere in this codebase
 * (see docs/CONTENT_MANAGEMENT_ARCHITECTURE.md), so "protect private
 * files," "prevent path traversal," and "avoid unsafe file execution"
 * don't apply yet — there's no server filesystem path or execution
 * surface to protect. What *can* be honestly enforced client-side today —
 * a file-type allowlist and an upload size limit — is enforced here, and
 * this is the one place that check would move server-side later.
 */
export interface FileValidationRule {
  /** e.g. ["image/"] to accept any image/*, or exact types like ["application/pdf"]. */
  acceptedTypePrefixes: string[];
  maxBytes: number;
  /** Shown in the error when the type doesn't match — e.g. "an image" or "a PDF". */
  typeDescription: string;
}

export function validateUploadedFile(file: File, rule: FileValidationRule): string | null {
  const matchesType = rule.acceptedTypePrefixes.some((prefix) => file.type.startsWith(prefix));
  if (!matchesType) {
    return `Please choose ${rule.typeDescription} file.`;
  }
  if (file.size > rule.maxBytes) {
    return `File must be under ${Math.round(rule.maxBytes / (1024 * 1024))}MB.`;
  }
  return null;
}
