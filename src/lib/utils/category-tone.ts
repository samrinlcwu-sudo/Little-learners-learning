/**
 * The shared set of tones used to give each learning category (and
 * anything displaying one — resource cards, game cards, category grids)
 * a distinct, coordinated color identity (Prompt 91). `primary`/
 * `secondary`/`accent` are the existing premium brand hues; `blue`/
 * `green`/`purple`/`coral` are the additional palette added specifically
 * for this so 16 categories don't all read as the same color.
 */
export const CATEGORY_TONES = ["primary", "secondary", "accent", "blue", "green", "purple", "coral"] as const;
export type CategoryTone = (typeof CATEGORY_TONES)[number];

/** `bg-{tone}-100 text-{tone}-700`-shaped tile styles — icon tiles, small swatches. */
export const CATEGORY_TONE_TILE: Record<CategoryTone, string> = {
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  accent: "bg-accent-100 text-accent-800",
  blue: "bg-cat-blue-100 text-cat-blue-700",
  green: "bg-cat-green-100 text-cat-green-700",
  purple: "bg-cat-purple-100 text-cat-purple-700",
  coral: "bg-cat-coral-100 text-cat-coral-700",
};

/** Same hues, for a badge/pill (slightly stronger text weight already comes from Badge itself). */
export const CATEGORY_TONE_BADGE: Record<CategoryTone, string> = {
  primary: "bg-primary-100 text-primary-800",
  secondary: "bg-secondary-100 text-secondary-800",
  accent: "bg-accent-100 text-accent-800",
  blue: "bg-cat-blue-100 text-cat-blue-700",
  green: "bg-cat-green-100 text-cat-green-700",
  purple: "bg-cat-purple-100 text-cat-purple-700",
  coral: "bg-cat-coral-100 text-cat-coral-700",
};

/** A mid-strength swatch for a decorative shape or a hover border accent. */
export const CATEGORY_TONE_SOFT: Record<CategoryTone, string> = {
  primary: "text-primary-200",
  secondary: "text-secondary-200",
  accent: "text-accent-200",
  blue: "text-cat-blue-200",
  green: "text-cat-green-200",
  purple: "text-cat-purple-200",
  coral: "text-cat-coral-200",
};

export const CATEGORY_TONE_HOVER_BORDER: Record<CategoryTone, string> = {
  primary: "group-hover:border-primary-300",
  secondary: "group-hover:border-secondary-300",
  accent: "group-hover:border-accent-300",
  blue: "group-hover:border-cat-blue-200",
  green: "group-hover:border-cat-green-200",
  purple: "group-hover:border-cat-purple-200",
  coral: "group-hover:border-cat-coral-200",
};
