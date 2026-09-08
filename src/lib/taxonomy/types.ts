/**
 * The shared shape every selectable taxonomy list in this codebase uses —
 * learning categories, teacher age groups, languages, teaching interests,
 * resource types. One consistent contract so a future admin tool can
 * eventually add, rename, or deactivate an option in any of these lists
 * without redesigning each one differently. See docs/TAXONOMY_ARCHITECTURE.md.
 */
export interface TaxonomyOption<Id extends string = string> {
  id: Id;
  label: string;
  /**
   * Omitted (or true) means active. No admin UI sets this yet — there's
   * nothing to manage it with — but every `getAll...()` accessor across
   * this codebase already filters through `isActive()`, so deactivating
   * an option later is a one-line data change, not a rewrite of whatever
   * renders the list.
   */
  active?: boolean;
}

/**
 * Deliberately typed to just `{ active?: boolean }` rather than the full
 * `TaxonomyOption` — `LearningCategory` (src/config/learning-categories.ts)
 * follows the same deactivation convention without adopting `id`/`label`
 * naming, since it predates this shared type and is used by its own
 * `slug`/`name` fields everywhere already.
 */
export function isActive(option: { active?: boolean }): boolean {
  return option.active !== false;
}

/** The filter every taxonomy accessor applies before returning its list — see the `active` field above. */
export function getActiveOptions<T extends { active?: boolean }>(options: T[]): T[] {
  return options.filter(isActive);
}
