/**
 * Shared API response types.
 *
 * Add endpoint-specific types here (or in sibling files) as the API surface
 * grows. Keep these in sync with the actual API signatures.
 */

/** GET /sem — semester & campus info for the current user. */
export interface SemAndCampus {
  sem: string;
  campus: string;
}
