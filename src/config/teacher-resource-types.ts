import { RESOURCE_TYPE_LABELS, RESOURCE_TYPE_ICONS, type ResourceType } from "@/lib/resources/types";
import { getActiveOptions, type TaxonomyOption } from "@/lib/taxonomy/types";

/**
 * Prompt 28, Part 5: "prepare a consistent classification system for
 * resources created by teachers" — WITHOUT enabling publishing, since
 * that workflow doesn't exist yet (no submission form, no review queue,
 * no storage for an uploaded file). This is architecture, not a feature:
 * the moment a real "create a resource" form is built, its type picker
 * reads from `getAllTeacherResourceTypeOptions()` below instead of
 * inventing its own list.
 *
 * Deliberately reuses `ResourceType` (src/lib/resources/types.ts) rather
 * than declaring a second, parallel enum — Part 6 explicitly warns
 * against duplicate category names, and a teacher-authored worksheet is
 * the same *kind* of thing as a platform-authored one. `teacher-resource`
 * and `parent-resource` are excluded here: those describe who a resource
 * is *for* (an audience tag the platform applies), not the format a
 * teacher is choosing when they sit down to create something.
 *
 * "Game" is deliberately absent from this list. An interactive game is a
 * `Game` record (src/lib/games/types.ts), not a `Resource` — they're
 * already two distinct, non-overlapping content kinds in this codebase's
 * architecture, both of which already support teacher authorship via
 * `ContentAuthor.teacherId` (src/lib/content/types.ts). A future "create a
 * game" flow belongs next to the Games Hub's own authoring model, not
 * folded into this list.
 */
const TEACHER_RESOURCE_TYPE_IDS: ResourceType[] = [
  "worksheet",
  "activity",
  "lesson",
  "ebook",
  "puzzle",
  "maze",
  "coloring",
];

export type TeacherResourceTypeOption = TaxonomyOption<ResourceType>;

const TEACHER_RESOURCE_TYPE_OPTIONS: TeacherResourceTypeOption[] = TEACHER_RESOURCE_TYPE_IDS.map((id) => ({
  id,
  label: RESOURCE_TYPE_LABELS[id],
}));

export function getAllTeacherResourceTypeOptions(): TeacherResourceTypeOption[] {
  return getActiveOptions(TEACHER_RESOURCE_TYPE_OPTIONS);
}

export function getTeacherResourceTypeIcon(id: ResourceType) {
  return RESOURCE_TYPE_ICONS[id];
}
