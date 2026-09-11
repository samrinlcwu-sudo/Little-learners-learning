"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAiAudience } from "@/lib/ai/use-ai-audience";
import { useAiConversation } from "@/lib/ai/use-ai-conversation";
import { AI_DISCLOSURE_TEXT } from "@/lib/ai/guardrails";
import type { AiAudience } from "@/lib/ai/types";
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
  parent: ["What should we try next?", "How do I add another child?"],
  teacher: ["How do I publish a resource?", "What's still missing from my profile?"],
  child: [],
  admin: [],
};

/**
 * The one place the future AI Learning Assistant is actually rendered —
 * today, entirely against the development placeholder provider (see
 * docs/AI_ASSISTANT_ARCHITECTURE.md). Structured exactly like
 * site-search.tsx (a Radix Dialog wrapping the header, any number of
 * `AiAssistantTrigger`s inside as children) so it feels like the same kind
 * of built-in platform utility as search, not a bolted-on third-party
 * widget.
 */
export interface AiAssistantProps {
  children: React.ReactNode;
}

function AiAssistant({ children }: AiAssistantProps) {
  const [open, setOpen] = React.useState(false);
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
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      {children}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-surface shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out">
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

          <div ref={listRef} className="min-h-[220px] flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              AUDIENCE_PROMPTS[audience].length > 0 && (
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
              )
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

const AiAssistantTrigger = DialogPrimitive.Trigger;

export { AiAssistant, AiAssistantTrigger };
