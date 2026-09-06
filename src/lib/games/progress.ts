/**
 * Game-progress architecture for a future authenticated child profile.
 *
 * No child accounts exist yet, so nothing in this file talks to a real
 * database — `noopGameProgressStore` is the only implementation, and it
 * does nothing observable. This is deliberate: the brief is explicit that
 * building a fake backend would be worse than just defining the contract.
 * When child profiles exist, a Supabase-backed `GameProgressStore` slots
 * in here without any call site (or this file's other types) changing.
 *
 * Privacy: `childId` is an opaque future foreign key, never a name or any
 * other identifying detail — this file was designed to need nothing else.
 */

export interface GameProgressEvent {
  id: string;
  childId: string;
  gameId: string;
  gameSlug: string;
  category?: string;
  skill: string;
  attempts: number;
  correctAnswers: number;
  totalRounds: number;
  completed: boolean;
  playedAt: string;
}

/** What a future parent dashboard would read — see PARENTS_DASHBOARD note below. */
export interface ChildGameSummary {
  childId: string;
  gamesPlayed: number;
  gamesCompleted: number;
  categoriesExplored: string[];
  skillsPracticed: string[];
  lastPlayedAt?: string;
}

/** What a future teacher dashboard would read for one classroom. */
export interface ClassroomProgressSummary {
  classroomId: string;
  childSummaries: ChildGameSummary[];
  assignedGameSlugs: string[];
}

export interface GameProgressStore {
  recordEvent(event: GameProgressEvent): Promise<void>;
  getChildSummary(childId: string): Promise<ChildGameSummary | null>;
  getClassroomSummary(classroomId: string): Promise<ClassroomProgressSummary | null>;
}

/**
 * The only implementation today. Every method is a genuine no-op — no
 * in-memory array, no localStorage, nothing that could be mistaken for
 * real tracking. Swap this for a Supabase-backed store once child
 * profiles exist; nothing that imports `GameProgressStore` needs to change.
 */
export const noopGameProgressStore: GameProgressStore = {
  async recordEvent() {
    // Intentionally does nothing — no child profiles exist to record against.
  },
  async getChildSummary() {
    return null;
  },
  async getClassroomSummary() {
    return null;
  },
};
