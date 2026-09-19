"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./client";

export interface SupabaseUserState {
  user: User | null;
  /** False until the first real check (either a cached session or a confirmed absence of one) has completed. */
  ready: boolean;
}

/**
 * The one place every client component reads "who is signed in" from.
 * Subscribes to Supabase's own `onAuthStateChange` so a sign-in, sign-out,
 * or token refresh happening anywhere (another tab included) is reflected
 * here immediately — never a stale, cached answer.
 */
export function useSupabaseUser(): SupabaseUserState {
  const [state, setState] = React.useState<SupabaseUserState>({ user: null, ready: false });

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setState({ user: data.user, ready: true });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ user: session?.user ?? null, ready: true });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
