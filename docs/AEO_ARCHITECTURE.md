# Answer Engine Optimization: FAQ & Structured Answer Architecture

Prompt 77. Read `docs/SEO_ARCHITECTURE.md` first — its "AEO: writing for
answer engines" section already established the underlying principle
("answer the obvious question in the first sentence or two under a
heading") and pointed to `/faq` as the existing example. This prompt adds
the piece that was missing: a **reusable** FAQ block other pages can adopt,
plus real, derived FAQ content on the one page type that genuinely needed
it and didn't have it — learning category pages.

## What already existed (confirmed, not rebuilt)

- `/faq` — 21 real, grouped questions with an accordion UI and `FAQPage`
  schema built from that exact same list.
- `/blog/[article]` — an optional, per-article `faq` field
  (`BlogArticle.faq`) already rendered as a definition list, with its own
  `FAQPage` schema when present.
- Both were already doing the one thing that matters for AEO: the visible
  content and the structured data come from the same array, so schema can
  never claim a question the page doesn't actually show.

The gap wasn't missing FAQ content — it was that every page rebuilt the
same `FAQPage` JSON-LD shape by hand, and no page type besides `/faq` and
blog articles had any FAQ content at all, despite category pages being the
most natural home for most of the brief's example questions ("What should
a preschool child learn?", "How can children learn numbers?", "How can I
teach life skills at home?" — each of these is really "what does
[category] cover", asked about a specific subject).

## The reusable architecture

1. **`src/lib/seo/faq-schema.ts`** — `buildFaqPageSchema(items)`. The one
   function that turns a plain `{question, answer}[]` into `FAQPage`
   JSON-LD. Returns `null` for an empty list — no page emits empty schema.
   `/faq` and `/blog/[article]` were both switched to call this instead of
   constructing the same object inline (same output, less duplication —
   confirmed via the existing test suite, no behavior change).
2. **`src/components/patterns/faq-section.tsx`** — `<FaqSection title
   items />`. Renders a heading, the existing `Accordion`/`AccordionItem`
   (native `<details>/<summary>`, so no new keyboard or screen-reader work
   was needed), and the matching schema script — all from the same `items`
   array. Renders nothing for an empty list.

Any future page that has genuine Q&A content reaches for this one
component rather than re-inventing the accordion-plus-schema pattern a
third time.

## Where it was actually used

- **`/learn/[category]`** (new): `src/lib/faq/category-faq.ts` —
  `buildCategoryFaq(category, journey, articleCount)`. Three questions,
  asked identically of every category, answered entirely from that
  category's own real fields:
  1. "What does [Category] cover?" — `category.description` plus its real
     `learningObjectives`.
  2. "What age is [Category] for?" — `category.ageRange`.
  3. "What resources, games, or activities are available for [Category]
     today?" — the real published counts from `getCategoryJourney()` plus
     the category's real article count. When all three are zero, the
     question becomes "Is there content available yet?" and the answer
     says so honestly ("Not yet... check back as the library grows") —
     the same voice this page's own `EmptyState` components already use
     for Games/Resources/Articles sections a few lines above.

  Nothing here is hand-written per category — the same three questions are
  asked of all 16, and the answer text is assembled from data, the same
  "derive, don't fabricate" technique `src/config/subtopics.ts` (Prompt 75)
  and `buildParentRows()` (Prompt 65) already established. This is also
  why it directly answers the brief's own example questions: "What should
  a preschool child learn?" is genuinely "what does Life Skills /
  Mathematics / English & Early Literacy cover" asked in general language —
  and that's exactly question 1, on every relevant category page.

- **`/about`** (new, but small and deliberately not `/faq` again): two
  questions — "What is Little Learners Learning?" and "What can children
  learn here?" (the second computed from the real category count and real
  group names, not typed as "16 subjects" by hand). Neither restates a
  question already on `/faq` ("Who is Little Learners Learning for?", "Is
  it free?", etc.) — the brief's own "do not place the same large FAQ
  block on every page" ruled out just copying `/faq`'s General Questions
  group here.

## Where it was deliberately not added

- **Resource and game detail pages**: both already answer every likely
  question directly, as labeled fields, not prose — "Learning objective",
  "Age group", "Resource type", a visible Free/Premium badge, and (for an
  unavailable download) an `Alert` stating exactly why. Wrapping that same
  information in question/answer sentences would restate what's already
  on the page in a weaker format — exactly the "schema simply for the sake
  of schema" the brief warns against. If a resource or game later needs a
  question its `dl` genuinely can't answer, `FaqSection` is ready to use
  without new plumbing.
- **`/support`**: already links straight to `/faq` from its own quick-links
  row; a second FAQ block on the page it's already pointing to would be
  redundant, not "reusable."
- **The homepage**: already states what the platform is and who it's for
  in the hero and "For Parents"/"For Teachers" sections, in the plain,
  direct sentences the AEO section of `docs/SEO_ARCHITECTURE.md` already
  asks for. Adding an accordion restating the same two sentences as
  question/answer pairs would be duplication, not new information.

## Entity clarity and information consistency

Checked the platform's own core facts — audience and age range — for
contradiction across the homepage, About, `/faq`, and every learning
category (`docs/LEARNING_ARCHITECTURE.md`'s categories collectively span
ages 2–8). `/faq` ("roughly ages 2 to 8") and the new About FAQ answer use
matching language; no page states a different age range or a different
description of who the platform is for. `Organization`/`WebSite` schema
(`src/components/patterns/site-structured-data.tsx`, unchanged) already
names the platform once, site-wide, so there's a single source of truth
for entity identity — this prompt didn't need to touch it.

## Testing

New unit tests: `src/lib/seo/faq-schema.test.ts` (null on empty, correct
shape), `src/lib/faq/category-faq.test.ts` (real-field answers, honest
empty-state answer, correct counting/pluralization), and
`src/lib/utils/join-with-and.test.ts` (the small list-to-prose helper
shared by the category FAQ and the About FAQ). Full suite: 289 tests
passing (was 279 before this prompt — 10 new, 0 changed). Typecheck,
lint, and a production build all pass. Live-verified: a category page
with real published content (Mathematics) shows three genuine questions
with real counts; a category with none shows the honest "Not yet"
variant; the About page's new two-question block renders directly below
"Our purpose" without a duplicate blank section; every new accordion is
keyboard-operable (native `<details>`) and each new page's `FAQPage`
JSON-LD was checked to contain exactly the questions visibly rendered,
never more.
