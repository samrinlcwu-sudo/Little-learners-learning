import type { BlogArticle } from "./types";

/**
 * A small number of real, platform-authored articles — not stock or
 * placeholder text, but genuinely written to the same bar every other real
 * page on this site already holds itself to: no invented statistics, no
 * named experts or credentials that don't exist, no testimonials, no
 * claims this platform can't stand behind. Author is always "Little
 * Learners Learning" (the platform), the same as every SAMPLE_RESOURCES
 * and SAMPLE_GAMES entry — never a fabricated person. See
 * docs/BLOG_ARCHITECTURE.md for why a small real set exists here rather
 * than either zero articles or a large auto-generated batch.
 *
 * Two articles deliberately cross-link to resources that already exist in
 * `SAMPLE_RESOURCES` (`classroom-circle-time-ideas`,
 * `screen-time-conversation-starters`) — real internal linking, not an
 * invented connection.
 *
 * `introducing-nazra-reading-at-home` is deliberately left
 * `religiousReview: "pending-review"` — its topic (quran-nazra-guidance)
 * requires human verification before publishing, the same policy Prompt 7
 * established for children's content, extended here to adult-facing
 * guidance about the same subject. See types.test.ts.
 */
export const SAMPLE_ARTICLES: BlogArticle[] = [
  {
    id: "article-1",
    slug: "what-is-early-childhood-education",
    title: "What Is Early Childhood Education, and Why Does It Matter?",
    excerpt:
      "A plain-language look at what early childhood education actually covers, and why the first years of learning matter so much for what comes later.",
    topic: "early-childhood-education",
    tags: ["early-childhood-education", "getting-started"],
    audience: ["parents", "teachers"],
    sections: [
      {
        heading: "What early childhood education actually means",
        paragraphs: [
          "Early childhood education covers the learning that happens roughly between birth and around age eight — the years before and during the first few years of formal schooling.",
          "It isn't only about getting ready for school. It also includes language, movement, social skills, emotional regulation, and curiosity about the world — skills that develop through everyday interaction, not just structured lessons.",
        ],
      },
      {
        heading: "Why the early years matter",
        paragraphs: [
          "Young children learn constantly, whether or not anyone is deliberately teaching them. The habits, vocabulary, and confidence a child builds in these years become the foundation the rest of their learning is built on.",
          "This is part of why play, conversation, and repetition matter so much in early education — they're not a break from learning, they're often how the deepest learning happens at this age.",
        ],
      },
      {
        heading: "What this looks like day to day",
        paragraphs: [
          "In practice, early childhood education can look like a structured preschool classroom, a parent reading and talking with a child at home, or a mix of both. What matters most is consistency, warmth, and giving a child real chances to practice new skills.",
        ],
      },
    ],
    practicalExamples: [
      "Naming objects and feelings out loud during everyday routines, like getting dressed or eating a snack.",
      "Reading the same favorite book several times — repetition helps new vocabulary stick.",
      "Letting a child help with simple real tasks (sorting laundry by color, setting the table) as a form of hands-on learning.",
    ],
    faq: [
      {
        question: "At what age does early childhood education start?",
        answer:
          "There's no single fixed starting age — learning begins from birth. Most definitions of \"early childhood education\" cover roughly birth through age eight, spanning infancy, toddlerhood, preschool, and the earliest years of primary school.",
      },
      {
        question: "Is play-based learning as valuable as structured lessons at this age?",
        answer:
          "For young children, play and structure aren't opposites — a lot of genuine learning happens through play, especially when an adult is nearby to extend it (asking questions, naming what's happening, adding a new small challenge).",
      },
      {
        question: "Do I need a formal curriculum to support early learning at home?",
        answer:
          "No. Consistent daily routines, conversation, and hands-on activities go a long way. A curriculum can help organize ideas, but it isn't the only way to support a young child's learning.",
      },
    ],
    author: { name: "Little Learners Learning", role: "platform" },
    featured: true,
    publicationStatus: "published",
    religiousReview: "not-applicable",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },
  {
    id: "article-2",
    slug: "counting-through-everyday-play",
    title: "Counting Through Everyday Play: Simple Ideas for Home",
    excerpt: "Counting doesn't need a worksheet to start — these everyday moments already have real counting practice built in.",
    topic: "learning-through-play",
    category: "mathematics",
    tags: ["counting", "math-at-home"],
    audience: ["parents"],
    ageRange: { minYears: 2, maxYears: 5 },
    sections: [
      {
        heading: "Why everyday counting works",
        paragraphs: [
          "Young children build number sense gradually, through repeated, low-pressure practice — not by memorizing numbers in the abstract.",
          "Counting real objects during ordinary moments gives a child that repetition without it feeling like a lesson.",
        ],
      },
      {
        heading: "Simple ways to count together",
        paragraphs: [
          "Counting can be folded into almost any part of the day — climbing stairs, setting the table, or tidying up toys. The goal isn't speed or getting the exact number right every time; it's practicing the process of counting one object at a time.",
        ],
      },
    ],
    practicalExamples: [
      "Count the steps out loud as you climb the stairs together.",
      "Count out plates, cups, or napkins while setting the table.",
      "Count toys as you put them away, one at a time, into a basket.",
      "Count snacks, like crackers or grapes, before eating them.",
    ],
    relatedResourceSlugs: ["counting-animals-worksheet"],
    author: { name: "Little Learners Learning", role: "platform" },
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
    createdAt: "2026-03-03",
    updatedAt: "2026-03-03",
  },
  {
    id: "article-3",
    slug: "building-a-calm-morning-routine",
    title: "Building a Calm Morning Routine in an Early-Years Classroom",
    excerpt: "A predictable start to the day helps young children settle in — here's a simple, repeatable structure to try.",
    topic: "classroom-ideas",
    tags: ["routines", "classroom-management"],
    audience: ["teachers"],
    ageRange: { minYears: 3, maxYears: 6 },
    sections: [
      {
        heading: "Why routine matters at drop-off",
        paragraphs: [
          "The first few minutes of the day can set the tone for everything after it. A predictable morning routine helps children know what to expect, which lowers anxiety for children who find transitions hard.",
          "It doesn't need to be elaborate — the value comes from repeating the same simple structure every day.",
        ],
      },
      {
        heading: "A simple structure to try",
        paragraphs: [
          "A calm morning routine can be as short as ten minutes: a greeting, a quiet settling activity, and a short circle-time moment before the day's activities begin.",
        ],
      },
    ],
    practicalExamples: [
      "Greet each child by name at the door, at their eye level.",
      "Offer one quiet activity, like a puzzle or a coloring page, while the rest of the class arrives, rather than starting group activities right away.",
      "Use the same short song or phrase every day to signal that circle time is starting.",
    ],
    relatedResourceSlugs: ["classroom-circle-time-ideas"],
    author: { name: "Little Learners Learning", role: "platform" },
    featured: true,
    publicationStatus: "published",
    religiousReview: "not-applicable",
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  {
    id: "article-4",
    slug: "talking-with-your-child-about-screen-time",
    title: "Talking With Your Child About Screen Time",
    excerpt: "A calm, judgment-free way to start a conversation about screens with a young child.",
    topic: "parent-guidance",
    tags: ["screen-time", "parenting"],
    audience: ["parents"],
    ageRange: { minYears: 3, maxYears: 7 },
    sections: [
      {
        heading: "Why the conversation matters, not just the rules",
        paragraphs: [
          "Screen time is easy to turn into a rule — \"no tablet after dinner\" — without ever talking about why. Involving a child in a simple conversation, even a short one, helps them understand the reasoning, not just follow an instruction.",
          "This doesn't need to be a big, one-time talk. Short, repeated conversations tend to land better than a single long one.",
        ],
      },
      {
        heading: "How to start",
        paragraphs: [
          "Keep the tone curious rather than corrective. Ask what they were watching or playing, and what they liked about it, before moving into any conversation about limits.",
        ],
      },
    ],
    practicalExamples: [
      "Ask \"What was your favorite part of that show or game?\" before talking about time limits.",
      "Agree together on one simple, visual signal for \"almost done\" — a timer, or a specific song.",
      "Offer a clear next activity, so stopping the screen doesn't feel like the day just got worse.",
    ],
    relatedResourceSlugs: ["screen-time-conversation-starters"],
    author: { name: "Little Learners Learning", role: "platform" },
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
    createdAt: "2026-03-07",
    updatedAt: "2026-03-07",
  },
  {
    id: "article-5",
    slug: "introducing-nazra-reading-at-home",
    title: "Introducing Nazra Reading at Home: A Gentle Starting Guide",
    excerpt: "A short starting point for families beginning Nazra reading practice at home.",
    topic: "quran-nazra-guidance",
    tags: ["nazra", "quran"],
    audience: ["parents"],
    sections: [
      {
        heading: "Getting started",
        paragraphs: ["Keep early sessions short and consistent, and celebrate small steps rather than aiming for long sessions right away."],
      },
    ],
    author: { name: "Little Learners Learning", role: "platform" },
    featured: false,
    publicationStatus: "published",
    // Not yet reviewed — isArticlePublished() must hide this from every
    // public listing until a qualified person marks it "verified".
    religiousReview: "pending-review",
    createdAt: "2026-03-08",
    updatedAt: "2026-03-08",
  },
];
