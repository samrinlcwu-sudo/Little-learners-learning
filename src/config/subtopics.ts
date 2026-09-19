/**
 * The subtopic layer between a learning category and its real content
 * (Prompt 75) — Main Topic → Learning Category → Subtopic → Resource/
 * Game/Article. This is deliberately data, not a new route: no
 * `/learn/[category]/[subtopic]` page exists or is planned, because
 * "do not create hundreds of thin SEO pages" rules that out for a
 * catalog this size. A subtopic instead groups and links to real content
 * that already lives at its own real URL, inside the existing
 * `/learn/[category]` page — see the "Explore by subtopic" section in
 * `src/app/learn/[category]/page.tsx`.
 *
 * Every subtopic here is grounded in `tags`/`skill` values that already
 * exist on real content records (`SAMPLE_RESOURCES`, `SAMPLE_CONTENT`,
 * `SAMPLE_GAMES`, `SAMPLE_ARTICLES`) — this list was built by reading
 * that real data, not by brainstorming keywords first. A category with no
 * real tagged content simply has no entries here yet (true of Qur'an
 * Learning — Nazra and Foundational Qur'an Reading today, pending
 * qualified human review — see `docs/LEARNING_CONTENT_COMPLETION.md`) —
 * see `docs/TOPIC_ARCHITECTURE.md` for the full audit this was originally
 * derived from.
 * `matchTags` are the real, already-used tag strings (and — for a game's
 * free-text `skill` field — keyword fragments) that realize each
 * subtopic; nothing here invents a tag that isn't already on a real item.
 */
export interface LearningSubtopic {
  slug: string;
  name: string;
  /** A learning-category slug (src/config/learning-categories.ts). */
  category: string;
  description: string;
  matchTags: string[];
}

export const learningSubtopics: LearningSubtopic[] = [
  {
    slug: "letter-recognition-phonics",
    name: "Letter Recognition & Phonics",
    category: "english-early-literacy",
    description: "Recognizing letters and connecting them to their sounds.",
    matchTags: ["alphabet", "phonics", "letter-recognition", "letter recognition"],
  },
  {
    slug: "counting-numbers",
    name: "Counting & Numbers",
    category: "mathematics",
    description: "Counting objects and recognizing numbers.",
    matchTags: ["counting", "numbers", "number-recognition", "number recognition"],
  },
  {
    slug: "shape-recognition",
    name: "Shape Recognition",
    category: "mathematics",
    description: "Naming and recognizing basic shapes.",
    matchTags: ["shapes", "shape-recognition", "shape recognition"],
  },
  {
    slug: "pencil-control-pre-writing",
    name: "Pencil Control & Pre-Writing",
    category: "early-writing",
    description: "Building the hand control needed before letter writing.",
    matchTags: ["fine-motor", "pre-writing"],
  },
  {
    slug: "independence-daily-routines",
    name: "Independence & Daily Routines",
    category: "life-skills",
    description: "Everyday self-care steps a child can learn to do alone.",
    matchTags: ["independence", "routines"],
  },
  {
    slug: "shape-matching",
    name: "Shape Matching",
    category: "puzzles",
    description: "Matching everyday objects to their basic shape.",
    matchTags: ["shapes", "matching"],
  },
  {
    slug: "color-recognition",
    name: "Color Recognition",
    category: "creativity",
    description: "Naming and identifying colors.",
    matchTags: ["color-recognition", "color recognition"],
  },
  {
    slug: "arabic-letter-tracing",
    name: "Arabic Letter Tracing & Recognition",
    category: "arabic-letters",
    description: "Tracing and recognizing the first Arabic letters.",
    matchTags: ["arabic", "tracing", "arabic-letter-recognition", "arabic letter recognition"],
  },
  {
    slug: "weather-and-seasons",
    name: "Weather & Seasons",
    category: "world-around-us",
    description: "Observing and naming the weather and how the seasons change.",
    matchTags: ["weather", "seasons", "observation"],
  },
  {
    slug: "simple-experiments",
    name: "Simple Experiments",
    category: "science-discovery",
    description: "Hands-on, safe experiments exploring cause and effect.",
    matchTags: ["science", "experiment", "cause-and-effect"],
  },
  {
    slug: "naming-feelings",
    name: "Naming Feelings",
    category: "social-emotional-learning",
    description: "Identifying and talking about common feelings.",
    matchTags: ["emotions", "feelings"],
  },
  {
    slug: "sorting-and-classifying",
    name: "Sorting & Classifying",
    category: "educational-activities",
    description: "Hands-on practice grouping objects by a shared property.",
    matchTags: ["sorting", "hands-on"],
  },
  {
    slug: "first-mazes",
    name: "First Mazes",
    category: "mazes",
    description: "Simple, single-path mazes for a first maze-tracing experience.",
    matchTags: ["maze", "fine-motor", "focus"],
  },
  {
    slug: "color-naming",
    name: "Color Naming",
    category: "coloring",
    description: "Recognizing and naming colors through coloring and everyday objects.",
    matchTags: ["color-recognition", "colors", "coloring"],
  },
  {
    slug: "no-screen-learning-games",
    name: "No-Screen Learning Games",
    category: "learning-games",
    description: "Simple verbal and physical games that build learning skills without any equipment.",
    matchTags: ["no-screen", "verbal-games"],
  },
];

export function getSubtopicsForCategory(categorySlug: string): LearningSubtopic[] {
  return learningSubtopics.filter((subtopic) => subtopic.category === categorySlug);
}

/** For content that carries a real `tags: string[]` array (resources, learning content, blog articles) — exact, case-insensitive tag match. */
export function subtopicMatchesTags(subtopic: LearningSubtopic, tags: string[]): boolean {
  const lowerTags = tags.map((t) => t.toLowerCase());
  return subtopic.matchTags.some((match) => lowerTags.includes(match.toLowerCase()));
}

/** For a game, which has no `tags` array — its free-text `skill` field (e.g. "Counting to 5") is matched by keyword instead. */
export function subtopicMatchesSkill(subtopic: LearningSubtopic, skill: string): boolean {
  const lowerSkill = skill.toLowerCase();
  return subtopic.matchTags.some((match) => lowerSkill.includes(match.toLowerCase()));
}
