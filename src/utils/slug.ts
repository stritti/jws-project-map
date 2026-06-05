/**
 * Slug utilities for descriptive project URLs.
 *
 * URL format:  /project/<slug>-<id>
 * Example:     /project/solar-powered-water-pump-42
 *
 * The trailing numeric ID ensures uniqueness and backwards compatibility:
 * old-style `/project/42` links still work because the parser extracts
 * the last number from the segment.
 */

/**
 * Convert any text into a URL-friendly slug.
 * Strips special chars, collapses whitespace, lowercases.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars (keep spaces and hyphens)
    .trim()
    .replace(/\s+/g, '-')        // spaces → hyphens
    .replace(/-+/g, '-')         // collapse multiple hyphens
    .replace(/^-|-$/g, '')       // trim leading/trailing hyphens
    .substring(0, 80);           // cap length
}

/**
 * Generate a descriptive route path for a project.
 * Falls back to plain `/project/<id>` when the project has no name.
 */
export function projectRoute(project: { id: number; name: string }): string {
  if (!project.name) return `/project/${project.id}`;
  const slug = slugify(project.name);
  return `/project/${slug}-${project.id}`;
}

/**
 * Extract the numeric project id from a route param.
 * Handles both old-style `/project/42` and new-style `/project/slug-42`.
 */
export function parseProjectId(raw: string): number {
  // Grab the trailing number: "solar-pump-42" → 42, "42" → 42
  const match = raw.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : parseInt(raw, 10);
}
