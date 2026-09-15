"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const AiAssistantPanel = dynamic(() => import("./ai-assistant-panel"), { ssr: false });

/**
 * `AiAssistant` now wraps the whole page (src/app/layout.tsx), sitting
 * above other Radix Dialogs like `SiteSearch` in the tree — but a Radix
 * `Dialog.Trigger` binds to the *nearest* `Dialog.Root` context ancestor,
 * regardless of which `Root` variable it was imported from. Nesting this
 * assistant's `Dialog.Root` around content that also contains an unrelated
 * dialog's `Root` (or vice versa) would silently steal every `Trigger`
 * inside the innermost one — exactly the bug this custom context avoids: a
 * plain React context carries only "open the assistant," independent of
 * Radix's own Dialog context, so any `AiAssistantTrigger` anywhere in the
 * tree opens this dialog and nothing else's trigger is affected.
 */
const AiAssistantOpenContext = React.createContext<(() => void) | null>(null);

/**
 * The one place the future AI Learning Assistant is actually rendered —
 * today, entirely against the development placeholder provider (see
 * docs/AI_ASSISTANT_ARCHITECTURE.md). Mounted once in the root layout so
 * any `AiAssistantTrigger` — in the header, on the parent dashboard,
 * wherever — opens this same shared dialog.
 *
 * The actual dialog UI lives in `ai-assistant-panel.tsx` and is loaded via
 * `next/dynamic` only once `hasOpened` first becomes true (Prompt 79
 * performance audit) — before that, this component is just a tiny context
 * provider, so the assistant's chat UI, its knowledge-lookup hooks, and
 * their transitive imports never ship to a visitor who never opens it.
 * Once opened, the panel stays mounted (never unmounted again) so its
 * conversation state and close animation behave exactly as before.
 */
export interface AiAssistantProps {
  children: React.ReactNode;
}

function AiAssistant({ children }: AiAssistantProps) {
  const [open, setOpen] = React.useState(false);
  const [hasOpened, setHasOpened] = React.useState(false);
  const openAssistant = React.useCallback(() => {
    setHasOpened(true);
    setOpen(true);
  }, []);

  return (
    <AiAssistantOpenContext.Provider value={openAssistant}>
      {children}
      {hasOpened && <AiAssistantPanel open={open} onOpenChange={setOpen} />}
    </AiAssistantOpenContext.Provider>
  );
}

export interface AiAssistantTriggerProps {
  asChild?: boolean;
  children: React.ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
}

/**
 * Deliberately not `DialogPrimitive.Trigger` — see the comment on
 * `AiAssistantOpenContext` above for why. `asChild` mirrors Radix's own
 * convention (clone the single child instead of wrapping it in a button)
 * so every existing call site works unchanged.
 */
function AiAssistantTrigger({ asChild, children }: AiAssistantTriggerProps) {
  const openAssistant = React.useContext(AiAssistantOpenContext);

  function handleClick(event: React.MouseEvent) {
    children.props.onClick?.(event);
    openAssistant?.();
  }

  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick });
  }
  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

/**
 * For call sites that already manage their own clickable element (e.g. the
 * Teacher Dashboard's `QuickAction` array, which renders every action as
 * `<button onClick={action.onClick}>`) rather than wrapping a child with
 * `AiAssistantTrigger`. Returns `null` outside an `<AiAssistant>` tree.
 */
function useOpenAiAssistant(): (() => void) | null {
  return React.useContext(AiAssistantOpenContext);
}

export { AiAssistant, AiAssistantTrigger, useOpenAiAssistant };
