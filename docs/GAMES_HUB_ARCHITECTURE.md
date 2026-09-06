# Games Hub Architecture

Introduced in Prompt 13. Unlike the Resource Library (Prompts 9–12), games
aren't "content that needs a real file before it can be shown" — a game is
working software, so the honest move here isn't an empty state, it's
actually building one. `letter-match` is fully playable; two more are real,
unimplemented roadmap entries.

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
pattern). Only "matching" (and by extension multiple-choice/
identification/counting, which share the same "prompt + pick the right
option" shape) has a built-in engine so far — see below. Sorting/drag-drop/
sequencing/pattern games need their own state shape and aren't built yet;
adding them means writing a new hook alongside `useChoiceGame`, not
changing the `Game` model.

## Game engine — separated concerns

- **Game shell** (`src/components/games/game-shell.tsx`): the chrome every
  choice-style game shares — round counter, live score, and the completion
  screen. Knows nothing about any specific game's content.
- **Game instructions**: plain data (`game.instructions`), rendered by the
  detail page above the shell — not part of the engine itself.
- **Game state + logic** (`src/lib/games/use-choice-game.ts`):
  `useChoiceGame(rounds)` — a plain hook, no UI. Tracks round index,
  status, selection, feedback, and score.
- **Scoring**: a round only counts if answered correctly on the first
  try — wrong answers can be retried (no penalty, no failure state), which
  keeps the tone encouraging for young children while still measuring
  something meaningful.
- **Progress**: in-session only ("Round 3 of 6"), shown by the shell.
  Nothing is persisted anywhere — no accounts exist, and persisting a
  score without one would mean storing it against no one in particular.
- **Accessibility**: real `<button>` elements (keyboard-operable by
  default), `aria-live="polite"` on both the score and the feedback
  message, feedback that pairs an icon (check/X) with text — never color
  alone — and `motion-reduce:transition-none` on the only transition in
  the game.
- **Completion state**: the shell's second render branch — score summary
  and a "Play again" button that calls the hook's `reset()`.

## Playable vs. roadmap games

`src/lib/games/registry.ts` maps a slug to its real component
(`GAME_COMPONENTS`). `isGamePlayable(slug)` is the single honesty check —
`GameCard` and the detail page both use it: a registered slug gets a real
"Play now" link and renders the actual game; every other published `Game`
record still shows its full real metadata and instructions, just with a
"Coming soon" empty state instead of a fake Play button. Verified live for
`shape-sorter`.

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
collection of any kind — the game holds only in-memory React state
(current round, score) that's gone on page reload. No name prompt, no
"who's playing" step, nothing sent anywhere. This isn't a policy note
bolted on after the fact — there's simply no code path in this feature
that reads or stores anything about the child.

## Performance

Zero new dependencies. `useChoiceGame` and `GameShell` are plain React —
no game engine, no animation library, no canvas/WebGL. The only
transition (`transition-colors` on option buttons) is CSS, disabled under
`prefers-reduced-motion`.
