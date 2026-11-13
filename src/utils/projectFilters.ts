import type { Project } from "@/interfaces/Project";

/**
 * Single predicate for the state/category/country filters, shared by the
 * project store (`filter()`) and the map view's filtered list.
 */
export function matchesProjectFilters(
  project: Project,
  stateFilter: string[],
  categoryFilter: number[],
  countryFilter: number[],
): boolean {
  return (
    (stateFilter.length === 0 || stateFilter.includes(project.state)) &&
    (categoryFilter.length === 0 ||
      (project.category?.some((cat) => categoryFilter.includes(cat.id)) ??
        false)) &&
    (countryFilter.length === 0 ||
      (project.country !== undefined && countryFilter.includes(project.country.id)))
  );
}
