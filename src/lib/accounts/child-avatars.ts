import type { ChildAvatarId } from "./types";

export interface ChildAvatarOption {
  id: ChildAvatarId;
  emoji: string;
  label: string;
  bg: string;
}

/** Presentation for each avatar id in CHILD_AVATAR_IDS — one entry per id, same order. */
export const CHILD_AVATARS: ChildAvatarOption[] = [
  { id: "sun", emoji: "🌞", label: "Sun", bg: "bg-accent-100" },
  { id: "star", emoji: "⭐", label: "Star", bg: "bg-primary-100" },
  { id: "flower", emoji: "🌸", label: "Flower", bg: "bg-secondary-100" },
  { id: "rocket", emoji: "🚀", label: "Rocket", bg: "bg-primary-100" },
  { id: "dino", emoji: "🦕", label: "Dinosaur", bg: "bg-secondary-100" },
  { id: "butterfly", emoji: "🦋", label: "Butterfly", bg: "bg-accent-100" },
];

const AVATAR_BY_ID = new Map(CHILD_AVATARS.map((avatar) => [avatar.id, avatar]));

export function getChildAvatar(id: ChildAvatarId): ChildAvatarOption {
  return AVATAR_BY_ID.get(id) ?? CHILD_AVATARS[0];
}
