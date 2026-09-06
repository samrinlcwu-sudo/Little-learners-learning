# Games Hub Architecture

Introduced in Prompt 13; five real games built in Prompt 14. Unlike the
Resource Library (Prompts 9–12), games aren't "content that needs a real
file before it can be shown" — a game is working software, so the honest
move here isn't an empty state, it's actually building one.

## Data model

`src/lib/games/types.ts` — `Game`: id, slug, title, description, category
(optional learning-category slug), skill, age range, difficulty, game
type, instructions, thumbnail, estimated minutes, learning objective,
accessibility notes, featured/publication status. Reuses `AgeRange`,
`DifficultyLevel`, `PublicationStatus`, `ReligiousReviewStatus` from
`@/lib/content/types` rather than redefining them — same pattern as
`Resource`. `isGamePublished()` is the identical gate used everywhere
else: draft never shows, and a game whose category is religious-review-
required (Qur'an/Nazra/Arabic-letters) stays hidden until a person marks
it verified.

`arabic-letter-match` in the sample set is deliberately left
`religiousReview: "pending-review"` specifically to prove this — its
category (`arabic-letters`) is grouped under the same policy as Qur'an
content per Prompt 7, even though letter names are just linguistic facts.
Covered by `types.test.ts`; verified live (`/games/arabic-letter-match`
404s, and it's absent from both the hub listing and the sitemap).

## Game types

Ten, exactly as specified (matching, memory, sorting, drag-drop,
multiple-choice, sequencing, counting, identification, word-letter,
pattern). Two engines exist so far — see below. Sorting/drag-drop/
sequencing/pattern games need their own state shape and aren't built yet;
adding them means writing a new hook, not changing the `Game` model.

## Engine 1 — choice games (matching / counting / identification)

The shared shape for "show a prompt, pick the right option": `Letter
Match`, `Count the Fruits`, `Shape Match`, and `Color Match` all use it —
only how each renders its own prompt differs.

- **Game shell** (`src/components/games/game-shell.tsx`): round counter,
  live score, and the completion screen. Knows nothing about any
  specific game's content.
- **Choice player** (`src/components/games/choice-game-player.tsx`,
  added in Prompt 14): the options grid, feedback line, and Next button —
  extracted out of `LetterMatchGame` once three more games needed the
  exact same UI, so it's written once instead of four times. Takes a
  `renderPrompt(round)` function as its only per-game customization point.
- **Game state + logic** (`src/lib/games/use-choice-game.ts`):
  `useChoiceGame(rounds)` — a plain hook, no UI. Tracks round index,
  status, selection, feedback, and score.
- **Scoring**: a round only counts if answered correctly on the first
  try — wrong answers can be retried (no penalty, no failure state).
- **Progress**: in-session only ("Round 3 of 6"), shown by the shell.
  Nothing is persisted anywhere — no accounts exist.
- **Completion state**: the shell's second render branch — score summary
  and "Play again" (`reset()`).

Each specific game is now just: build a `ChoiceRound[]` and pass a
`renderPrompt`. E.g. `CountingGame` renders N Apple icons for prompt `"3"`;
`ShapeMatchGame` renders a hand-drawn shape (not an icon set, so all four
shapes share identical fill/weight) for prompt `"circle"`; `ColorMatchGame`
renders a swatch using real color hex values — not the brand palette,
since teaching "this is red" has to use an actual red.

## Engine 2 — memory games

A genuinely different interaction (flip, remember, match pairs), so it
gets its own hook rather than being forced into the choice-game shape.

- **State + logic** (`src/lib/games/use-memory-game.ts`):
  `useMemoryGame(concepts)` builds a shuffled deck (each concept appears
  twice), tracks which cards are face-up/matched, and counts moves.
  Deliberately un-timed: a non-matching pair stays face-up until the
  player clicks "Continue" — no `setTimeout` auto-flip-back, so nothing
  changes on screen without the player's own action.
- **UI** (`src/components/games/memory-game.tsx`): the card grid,
  mismatch-recovery button, and completion screen. Generic over
  `concepts: {id, label}[]` — `NumberMemoryGame` supplies the digits 1–4;
  a future shape- or letter-memory game would supply different concepts
  and reuse everything else.

## Playable vs. roadmap games

`src/lib/games/registry.ts` maps a slug to its real component
(`GAME_COMPONENTS`). `isGamePlayable(slug)` is the single honesty check —
`GameCard` and the detail page both use it. Five slugs are registered
(`letter-match`, `count-the-fruits`, `shape-match`, `color-match`,
`number-memory`) and fully playable, verified live end to end (correct
answers, incorrect-answer retry, completion, Play Again reset). Every
other published `Game` record still shows its full real metadata and
instructions, just with a "Coming soon" empty state instead of a fake
Play button.

## Routes

- `/games` — heading, intro, a Featured row, and `GamesBrowser` (search +
  category + age + difficulty, client-side — like the Learning Hub, not
  the Resource Library's server-driven pattern, because a hand-built game
  library grows far slower than a document library and won't need that
  scale for a long time).
- `/games/[game]` — `generateStaticParams` from published games only, full
  metadata/instructions/accessibility notes, the real game or the
  "Coming soon" state, and related games (same category or game type).
  Self-referencing canonical, `schema.org/Game` structured data.

## Child safety

No chat, no public profiles, no ads, no external links, and no data
collection of any kind — every game holds only in-memory React state
(current round/card flips, score, moves) that's gone on page reload. No
name prompt, no "who's playing" step, nothing sent anywhere, no
leaderboard. This isn't a policy note bolted on after the fact — there's
simply no code path in this feature that reads, stores, or displays
anything about the child.

## Accessibility

Both engines share the same commitments: real `<button>` elements
(keyboard-operable by default), `aria-live="polite"` on score/progress and
feedback, feedback that pairs an icon or state with text — never color
alone — large interaction targets (96px option buttons; memory cards scale
with the grid and stay well above the 44px minimum on mobile, verified at
375px), and `motion-reduce:transition-none` on every transition. Color
Match's one honest limitation is documented in its own `accessibilityNotes`
rather than glossed over: identifying a color swatch by sight is that
game's entire subject, so it isn't meaningfully playable without color
vision — there's no code fix for that, it's intrinsic to what the game
teaches.

## Performance

Zero new dependencies across both prompts. Every hook and component is
plain React — no game engine, no animation library, no canvas/WebGL. The
only transitions are CSS (`transition-colors`), disabled under
`prefers-reduced-motion`.
