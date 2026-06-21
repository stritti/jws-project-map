import { projectRepository } from "@/features/projects/repositories/project.repository";
import type { Project } from "@/interfaces/Project";
import type { LatLng } from "leaflet";
import type { RawProjectRecord } from "@/features/projects/repositories/project.repository";
import { i18n } from "@/plugins/i18n";

function resolveRecordFields(record: RawProjectRecord): Record<string, unknown> {
  if (record.fields && typeof record.fields === "object") {
    return record.fields as Record<string, unknown>;
  }
  return record as unknown as Record<string, unknown>;
}

function resolveProjectState(sourceFields: Record<string, unknown>): string {
  const rawState = String(sourceFields.State || sourceFields.Status || "")
    .trim()
    .toLowerCase();

  if (["under construction", "under_construction", "construction"].includes(rawState)) {
    return "under construction";
  }

  if (rawState === "planned") {
    return "planned";
  }

  return "finished";
}

function resolveNumericId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function resolveProjectId(
  record: RawProjectRecord,
  sourceFields: Record<string, unknown>,
): number | undefined {
  return (
    resolveNumericId(record.id) ??
    // Some NocoDB payloads expose the primary key as "Id" instead of "id".
    resolveNumericId(record.Id) ??
    resolveNumericId(sourceFields.id) ??
    resolveNumericId(sourceFields.Id)
  );
}

function currentLocale(): string {
  try {
    const loc = (i18n.global.locale as unknown as { value: string }).value;
    if (loc && typeof loc === "string") return loc;
  } catch {
    // ignore
  }
  return "en";
}

function processProjectData(records: RawProjectRecord[]): Array<Project> {
  const lc = currentLocale();
  const nameField = `Name (${lc})`;
  const notesField = `Notes (${lc})`;
  const list = Array.isArray(records) ? records : [];
  const result: Project[] = [];

  for (const record of list) {
    const sourceFields = resolveRecordFields(record);

    const id = resolveProjectId(record, sourceFields);
    const lat = sourceFields.Latitude;
    const lng = sourceFields.Longitude;

    if (id === undefined) {
      console.warn(`Skipping project due to missing ID. Record keys:`, Object.keys(record));
      continue;
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (isNaN(latNum) || isNaN(lngNum) || !lat || !lng) {
      console.warn(
        `Skipping project ${id} due to invalid coordinates. Raw record:`,
        JSON.stringify(record).substring(0, 300),
      );
      continue;
    }

    const project: Project = {
      id: Number(id),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: ((sourceFields as any)?.[nameField] || sourceFields?.Name || "Unbenannt") as string,
      latitude: latNum,
      longitude: lngNum,
      state: resolveProjectState(sourceFields),
      category: undefined,
      country: undefined,
      notes: undefined,
      link: undefined,
    };

    if (sourceFields?.Category && Array.isArray(sourceFields.Category)) {
      project.category = sourceFields.Category as Project["category"];
    }

    if (
      sourceFields?.Country &&
      Array.isArray(sourceFields.Country) &&
      sourceFields.Country.length > 0
    ) {
      project.country = sourceFields.Country[0] as Project["country"];
    }

    if (sourceFields?.TeaserImage) {
      project.teaserImg = sourceFields.TeaserImage as Project["teaserImg"];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawNotes = ((sourceFields as any)?.[notesField] || sourceFields?.Notes) as string | undefined;
    if (rawNotes) {
      project.notes = rawNotes
        .replaceAll('"<http', '"http')
        .replaceAll('>"', '"');
    } else {
      project.notes = "";
    }

    if (sourceFields?.Link) {
      project.link = sourceFields.Link as string;
    }

    if (sourceFields?.Since) {
      project.since = new Date(sourceFields.Since as string);
    }

    if (sourceFields?.Gallery) {
      project.gallery = sourceFields.Gallery as Project["gallery"];
    }

    result.push(project as Project);
  }

  return result;
}

const projectService = {
  async getAll(): Promise<Array<Project>> {
    const response = await projectRepository.fetchFull();
    return processProjectData(response);
  },

  async fetchPaginated(limit: number, offset: number): Promise<Array<Project>> {
    const response = await projectRepository.fetchPaginated(limit, offset);
    return processProjectData(response);
  },

  add(latLng: LatLng, name: string): Promise<unknown> {
    console.warn("add() not yet migrated to repository layer");
    return Promise.resolve({ latLng, name });
  },
};

export default projectService;
