import type { StudiqueCatalogueFile, StudiqueSemesterMap } from "@/network-calls/types";

/**
 * Studique's notes catalogue, served as static files from /public - the same
 * snapshot Campus App bundles. It is a catalogue, not student data, so it
 * goes to this site rather than the API and carries no auth.
 */
const RESOURCES_PATH = "/data/studique/resources.json";
const SEMESTERS_PATH = "/data/studique/subject_semesters.json";

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, cache: "force-cache" });
  if (!response.ok) throw new Error(`Couldn't load ${path} (${response.status})`);
  return (await response.json()) as T;
}

/** GET /data/studique/resources.json */
export function getStudiqueResources(signal?: AbortSignal): Promise<StudiqueCatalogueFile> {
  return getJson<StudiqueCatalogueFile>(RESOURCES_PATH, signal);
}

/** GET /data/studique/subject_semesters.json - optional; missing means no semester filter. */
export function getStudiqueSemesters(signal?: AbortSignal): Promise<StudiqueSemesterMap> {
  return getJson<StudiqueSemesterMap>(SEMESTERS_PATH, signal).catch(() => ({}));
}
