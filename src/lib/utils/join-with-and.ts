/** "a" | "a and b" | "a, b, and c" — the one place a list of real items becomes readable prose, instead of each caller writing its own comma-join. */
export function joinWithAnd(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}
