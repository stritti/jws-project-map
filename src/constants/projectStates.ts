/**
 * Shared constants for project lifecycle states.
 *
 * Centralises the "finished", "planned", "under construction" magic strings
 * that were previously scattered across stores, services, composables, views,
 * and components.  Using these constants instead of raw strings prevents
 * typos, enables autocompletion, and makes future renaming safe.
 */

export const PROJECT_STATES = {
  FINISHED: "finished" as const,
  UNDER_CONSTRUCTION: "under construction" as const,
  PLANNED: "planned" as const,
} as const;

/** Union type of all valid project states */
export type ProjectState = (typeof PROJECT_STATES)[keyof typeof PROJECT_STATES];

/** Array of all valid states — useful for iteration, validation, etc. */
export const ALL_PROJECT_STATES: readonly ProjectState[] = Object.values(
  PROJECT_STATES,
);

/**
 * Determine whether a raw value is a known project state.
 */
export function isValidProjectState(value: string): value is ProjectState {
  return ALL_PROJECT_STATES.includes(value as ProjectState);
}

/**
 * Normalise a raw state string from NocoDB into a canonical ProjectState.
 *
 * Accepts common variants (e.g. "under_construction", "construction") and
 * falls back to PROJECT_STATES.FINISHED for unknown values.
 */
export function normaliseProjectState(raw: string): ProjectState {
  const trimmed = raw.trim().toLowerCase();

  if (
    trimmed === PROJECT_STATES.UNDER_CONSTRUCTION ||
    trimmed === "under_construction" ||
    trimmed === "construction"
  ) {
    return PROJECT_STATES.UNDER_CONSTRUCTION;
  }

  if (trimmed === PROJECT_STATES.PLANNED) {
    return PROJECT_STATES.PLANNED;
  }

  return PROJECT_STATES.FINISHED;
}
