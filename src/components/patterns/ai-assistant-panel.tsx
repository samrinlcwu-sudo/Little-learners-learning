"use client";

import * as React from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAiAudience } from "@/lib/ai/use-ai-audience";
import { useAiConversation } from "@/lib/ai/use-ai-conversation";
import { AI_DISCLOSURE_TEXT } from "@/lib/ai/guardrails";
import type { AiAudience } from "@/lib/ai/types";
import { getAllLearningCategories } from "@/config/learning-categories";
import { getAllTeacherAgeGroupOptions } from "@/config/teacher-options";
import { useChildProfiles } from "@/lib/accounts/use-child-profiles";
import { useProgressEvents } from "@/lib/progress/use-progress-events";
import { useTeacherProfile } from "@/lib/accounts/use-teacher-profile";
import { useTeacherResources } from "@/lib/resources/use-teacher-resources";
import { getChildProgressKnowledge } from "@/lib/ai/knowledge/progress-knowledge";
import { getTeacherResourceKnowledge } from "@/lib/ai/knowledge/teacher-knowledge";
import { cn } from "@/lib/utils/cn";

const AUDIENCE_GREETING: Record<AiAudience, string> = {
  public: "Ask about subjects, resources, games, or how Little Learners Learning works.",
  parent: "Ask about your child's learning journey, or find the right resource to try next.",
  teacher: "Ask for help planning activities or finding resources to share with families.",
  child: "",
  admin: "",
};

const AUDIENCE_PROMPTS: Record<AiAudience, string[]> = {
  public: ["What subjects do you cover?", "How do I find a worksheet for a 4-year-old?"],
  parent: [
    "What should we try next?",
    "Show me literacy resources",
    "What games are available?",
    "How is my child doing?",
  ],
  teacher: [
    "Find resources for preschool",
    "Show me mathematics resources",
    "How do I publish a resource?",
    "What age groups are supported?",
  ],
  child: [],
  admin: [],
};

const CHIP_LINK_CLASS =
  "rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30";

/**
 * The parent-only home view shown before any message is sent — real
 * learning areas (src/config/learning-categories.ts) to jump to directly,
 * and each real child's own recorded progress (src/lib/ai/knowledge/
 * progress-knowledge.ts, Prompt 47), never a guess. Nothing here is sent
 * through the chat/provider — these are plain links and read-only text, so
 * a child's progress never becomes part of a "message" that could later be
 * sent anywhere. See docs/AI_PARENT_ASSISTANT_ARCHITECTURE.md.
 */
function ParentHomeSections({ onNavigate }: { onNavigate: () => void }) {
  const { children, ready } = useChildProfiles();
  const { events, ready: eventsReady } = useProgressEvents();
  const categories = getAllLearningCategories();

  return (
    <div className="space-y-5 border-t border-neutral-100 pt-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Learning areas</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <Link key={category.slug} href={`/learn/${category.slug}`} onClick={onNavigate} className={CHIP_LINK_CLASS}>
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {ready && eventsReady && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Progress-related help</p>
          {children.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">
              Add a child profile from your dashboard to see progress-related help here.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {children.map((child) => {
                const knowledge = getChildProgressKnowledge(child.id, events);
                const subjectCount = knowledge.topicsExplored.length;
                return (
                  <li key={child.id} className="text-sm text-neutral-700">
                    <span className="font-medium text-ink">{child.name}:</span>{" "}
                    {subjectCount > 0
                      ? `${subjectCount} subject${subjectCount === 1 ? "" : "s"} explored so far`
                      : "no activity recorded yet"}
                    {knowledge.nextStep && <> — try &ldquo;{knowledge.nextStep.activityLabel}&rdquo; next</>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href="/resources" onClick={onNavigate} className="font-medium text-primary-700 underline-offset-4 hover:underline">
          Browse resources
        </Link>
        <Link href="/games" onClick={onNavigate} className="font-medium text-primary-700 underline-offset-4 hover:underline">
          Browse games
        </Link>
      </div>
    </div>
  );
}

/**
 * The teacher-only home view shown before any message is sent — real age
 * bands (the same TEACHER_AGE_GROUP_OPTIONS a teacher's own profile uses,
 * src/config/teacher-options.ts) and real learning areas to jump to
 * directly, plus a real count of this teacher's own resources by status
 * (src/lib/ai/knowledge/teacher-knowledge.ts, Prompt 47) — never another
 * teacher's data, since `resources` here is already scoped to this
 * browser's one teacher (src/lib/resources/local-teacher-resources.ts).
 * Nothing here is sent through the chat/provider. See
 * docs/AI_TEACHER_ASSISTANT_ARCHITECTURE.md.
 */
function TeacherHomeSections({ onNavigate }: { onNavigate: () => void }) {
  const { teacher } = useTeacherProfile();
  const { resources } = useTeacherResources();
  const categories = getAllLearningCategories();
  const ageGroups = getAllTeacherAgeGroupOptions();
  const ownResources = teacher ? getTeacherResourceKnowledge(teacher.id, resources) : [];
  const draftCount = ownResources.filter((r) => r.publicationStatus === "draft").length;
  const awaitingReviewCount = ownResources.filter((r) => r.publicationStatus === "published" && !r.visibleToPublic).length;
  const publishedCount = ownResources.filter((r) => r.visibleToPublic).length;

  return (
    <div className="space-y-5 border-t border-neutral-100 pt-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Explore by age group</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ageGroups.map((option) => (
            <Link
              key={option.id}
              href={`/resources?age=${option.ageRange.minYears}`}
              onClick={onNavigate}
              className={CHIP_LINK_CLASS}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Learning areas</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <Link key={category.slug} href={`/learn/${category.slug}`} onClick={onNavigate} className={CHIP_LINK_CLASS}>
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {teacher && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Your resources</p>
          <p className="mt-2 text-sm text-neutral-700">
            {ownResources.length === 0
              ? "You haven't created any resources yet."
              : `${draftCount} draft${draftCount === 1 ? "" : "s"} · ${awaitingReviewCount} awaiting review · ${publishedCount} published`}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href="/resources" onClick={onNavigate} className="font-medium text-primary-700 underline-offset-4 hover:underline">
          Browse the resource library
        </Link>
        <Link href="/teachers/dashboard" onClick={onNavigate} className="font-medium text-primary-700 underline-offset-4 hover:underline">
          Manage your resources
        </Link>
      </div>
    </div>
  );
}

export interface AiAssistantPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The assistant's actual dialog UI, split out of ai-assistant.tsx (Prompt 79
 * performance audit) so its code — this file plus its knowledge/hook
 * dependencies — ships only to a visitor who actually opens the assistant,
 * instead of being part of the shared JS every page loads. `AiAssistant`
 * loads this via `next/dynamic` once `open` first becomes true. No
 * behavior change: same Dialog, same hooks, same conversation state.
 */
function AiAssistantPanel({ open, onOpenChange }: AiAssistantPanelProps) {
  const [input, setInput] = React.useState("");
  const audience = useAiAudience();
  const { messages, sending, sendMessage, isDevelopmentPlaceholder } = useAiConversation(audience);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input;
    setInput("");
    void sendMessage(text);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-surface shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out">
          <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <DialogPrimitive.Title className="font-display text-base font-semibold text-ink">
                  Little Learners Assistant
                </DialogPrimitive.Title>
                <Badge variant="warning">Development preview</Badge>
              </div>
              <DialogPrimitive.Description className="mt-1 text-sm text-neutral-500">
                {AUDIENCE_GREETING[audience]}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Close assistant</span>
            </DialogPrimitive.Close>
          </div>

          <div
            ref={listRef}
            aria-live="polite"
            className="min-h-[220px] flex-1 space-y-3 overflow-y-auto px-5 py-4"
          >
            {messages.length === 0 ? (
              <div className="space-y-4">
                {AUDIENCE_PROMPTS[audience].length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {AUDIENCE_PROMPTS[audience].map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void sendMessage(prompt)}
                        className="rounded-full border border-neutral-200 px-3 py-1.5 text-left text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
                {audience === "parent" && <ParentHomeSections onNavigate={() => onOpenChange(false)} />}
                {audience === "teacher" && <TeacherHomeSections onNavigate={() => onOpenChange(false)} />}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <p
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                      message.role === "user" ? "bg-primary-600 text-white" : "bg-neutral-100 text-ink",
                    )}
                  >
                    {message.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-neutral-200 px-5 py-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <label htmlFor="ai-assistant-input" className="sr-only">
                Your question
              </label>
              <input
                id="ai-assistant-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question…"
                disabled={sending}
                className="h-11 w-full rounded-md border border-neutral-300 bg-surface px-3 text-sm text-ink outline-none placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary-600/30"
              />
              <Button type="submit" size="sm" disabled={sending || !input.trim()}>
                Send
              </Button>
            </form>
            {isDevelopmentPlaceholder && <p className="mt-3 text-xs text-neutral-500">{AI_DISCLOSURE_TEXT}</p>}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default AiAssistantPanel;
