import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { PageHeader } from "@/components/patterns/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Little Learners Learning — for parents, teachers, and anyone exploring the platform.",
  alternates: { canonical: `${siteConfig.url}/faq` },
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  title: string;
  items: FaqItem[];
}

const faqGroups: FaqGroup[] = [
  {
    title: "Parents",
    items: [
      {
        question: "Do I need an account to use Little Learners Learning?",
        answer:
          "No. The Learning Hub, Resource Library, and Games are all usable today without an account. Sign-up exists, but no account is actually created yet, since no account backend is connected.",
      },
      {
        question: "Is the platform free to use?",
        answer:
          "Yes — everything available on the site today is free. Resources already show a Free, Premium, or Membership label for the future, but no payment system exists yet, so nothing beyond free content can currently be unlocked.",
      },
      {
        question: "Is the content appropriate for young children?",
        answer:
          "Everything is organized by age range, starting as young as 2 years, and built specifically for early-years learners rather than adapted down from older-kids material.",
      },
    ],
  },
  {
    title: "Learning Resources",
    items: [
      {
        question: "Can I download worksheets or ebooks?",
        answer:
          "Not yet for most items. The Resource Library is real, searchable, and filterable, but most entries today are sample records without an attached file. Every resource card and detail page clearly shows whether a download actually exists.",
      },
      {
        question: "What types of resources are available?",
        answer:
          "Worksheets, activities, ebooks, and dedicated parent and teacher resources, spanning subjects like early literacy, math, life skills, creativity, and Qur'an & Arabic foundations.",
      },
      {
        question: "How do I know what a resource actually teaches?",
        answer:
          "Every resource lists its learning objective, age range, and difficulty level up front, so you can tell if it's a fit before opening it.",
      },
    ],
  },
  {
    title: "Teachers",
    items: [
      {
        question: "Can teachers create a profile or account?",
        answer:
          "Not yet. Teacher registration and professional profiles are planned but haven't been built — the For Teachers page explains what's coming.",
      },
      {
        question: "Is there content built for classrooms?",
        answer:
          "A small number of sample teacher resources exist today, such as classroom routine ideas, with more planned as the library grows.",
      },
      {
        question: "Can I contribute my own resources?",
        answer:
          "Not yet — contributing resources is part of the planned teacher ecosystem, not something available today.",
      },
    ],
  },
  {
    title: "Games",
    items: [
      {
        question: "Are the games free?",
        answer: "Yes. Every game currently on the platform is free to play and doesn't require an account.",
      },
      {
        question: "What do the games actually teach?",
        answer:
          "Each one is built around a single specific skill — letter recognition, counting, shape matching, color matching, or memory matching — not open-ended entertainment.",
      },
      {
        question: "Will there be more games?",
        answer:
          "More are planned. A game without a working version yet is always labeled \"Coming soon\" rather than linking to something that doesn't work.",
      },
    ],
  },
  {
    title: "Accounts",
    items: [
      {
        question: "Can I sign up or log in?",
        answer:
          "You can fill in the sign-up and sign-in forms and see real validation — but no account is actually created or signed in yet, since no account backend is connected. Each form says so plainly before you submit.",
      },
      {
        question: "Will my activity or data be saved anywhere?",
        answer:
          "No. No account backend exists yet, so nothing you type into a form — or do anywhere else on the site — is saved or tied to an identity.",
      },
    ],
  },
  {
    title: "Future Features",
    items: [
      {
        question: "Will there be progress tracking for children?",
        answer:
          "It's planned — letting parents and teachers see what a child has completed — but it isn't built yet.",
      },
      {
        question: "Is there a mobile app?",
        answer:
          "No mobile app exists. The website itself is fully responsive and designed to work well on phones and tablets today.",
      },
      {
        question: "When will premium content be available?",
        answer:
          "There's no date yet. Resources already carry the labeling a future paid tier would need, but the payment system itself hasn't been built.",
      },
    ],
  },
  {
    title: "General Questions",
    items: [
      {
        question: "Who is Little Learners Learning for?",
        answer:
          "Parents and teachers guiding early-years learning, roughly ages 2 to 8 — the platform is built as a shared tool for the adults involved, not just something handed to a child alone.",
      },
      {
        question: "How is Qur'an and Arabic content handled?",
        answer:
          "Qur'an and Arabic-letters content is reviewed by a qualified person before it's published. It's never generated or shown automatically.",
      },
      {
        question: "Is the platform still being built?",
        answer:
          "Yes — it's under active development. Every page aims to be honest about what's live today versus what's still planned, rather than implying more than actually works.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
        eyebrow="Questions & Answers"
        title="Frequently Asked Questions"
        description="Straight answers about what's available today and what's still being built."
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl space-y-12">
          {faqGroups.map((group) => (
            <div key={group.title}>
              <Heading level="h4" as="h2" className="text-neutral-500">
                {group.title}
              </Heading>
              <Accordion className="mt-4">
                {group.items.map((item) => (
                  <AccordionItem key={item.question} question={item.question}>
                    {item.answer}
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </Container>
      </Section>
    </>
  );
}
