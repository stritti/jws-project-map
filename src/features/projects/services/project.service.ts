import { projectRepository } from "@/features/projects/repositories/project.repository";
import type { Project } from "@/interfaces/Project";
import type { LatLng } from "leaflet";
import type { RawProjectRecord } from "@/features/projects/repositories/project.repository";
import { currentLocale } from "@/utils/locale";
import { normaliseProjectState } from "@/constants/projectStates";
import { i18n } from "@/plugins/i18n";

type SourceFields = Record<string, unknown>;

function resolveRecordFields(record: RawProjectRecord): SourceFields {
  if (record.fields && typeof record.fields === "object") {
    return record.fields as SourceFields;
  }
  return record as unknown as SourceFields;
}

function readString(fields: SourceFields, key: string): string | undefined {
  const value = fields[key];
  return typeof value === "string" ? value : undefined;
}

function resolveProjectState(sourceFields: SourceFields): string {
  const rawState = String(sourceFields.State || sourceFields.Status || "").trim();
  return normaliseProjectState(rawState);
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
  sourceFields: SourceFields,
): number | undefined {
  return (
    resolveNumericId(record.id) ??
    // Some NocoDB payloads expose the primary key as "Id" instead of "id".
    resolveNumericId(record.Id) ??
    resolveNumericId(sourceFields.id) ??
    resolveNumericId(sourceFields.Id)
  );
}

function resolveCoordinates(
  sourceFields: SourceFields,
): { latitude: number; longitude: number } | undefined {
  const lat = sourceFields.Latitude;
  const lng = sourceFields.Longitude;
  if (!lat || !lng) {
    return undefined;
  }
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return undefined;
  }
  return { latitude, longitude };
}

function resolveProjectName(
  sourceFields: SourceFields,
  localeField: string,
): string {
  return (
    readString(sourceFields, localeField) ??
    readString(sourceFields, "Name") ??
    i18n.global.t("project.unnamed")
  );
}

function resolveProjectNotes(
  sourceFields: SourceFields,
  localeField: string,
): string {
  const rawNotes = readString(sourceFields, localeField) ?? readString(sourceFields, "Notes");
  if (!rawNotes) {
    return "";
  }
  return rawNotes
    .replaceAll('"<http', '"http')
    .replaceAll('>"', '"');
}

function applyOptionalFields(project: Project, sourceFields: SourceFields): void {
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
  if (sourceFields?.Link) {
    project.link = sourceFields.Link as string;
  }
  if (sourceFields?.Since) {
    project.since = new Date(sourceFields.Since as string);
  }
  if (sourceFields?.Gallery) {
    project.gallery = sourceFields.Gallery as Project["gallery"];
  }
}

function buildProject(
  record: RawProjectRecord,
  nameField: string,
  notesField: string,
): Project | undefined {
  const sourceFields = resolveRecordFields(record);
  const id = resolveProjectId(record, sourceFields);
  if (id === undefined) {
    console.warn(`Skipping project due to missing ID. Record keys:`, Object.keys(record));
    return undefined;
  }
  const coordinates = resolveCoordinates(sourceFields);
  if (!coordinates) {
    console.warn(
      `Skipping project ${id} due to invalid coordinates. Raw record:`,
      JSON.stringify(record).substring(0, 300),
    );
    return undefined;
  }
  const project: Project = {
    id,
    name: resolveProjectName(sourceFields, nameField),
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    state: resolveProjectState(sourceFields),
    category: undefined,
    country: undefined,
    notes: resolveProjectNotes(sourceFields, notesField),
    link: undefined,
  };
  applyOptionalFields(project, sourceFields);
  return project;
}

function processProjectData(records: RawProjectRecord[]): Array<Project> {
  const lc = currentLocale();
  const nameField = `Name (${lc})`;
  const notesField = `Notes (${lc})`;
  const list = Array.isArray(records) ? records : [];
  const result: Project[] = [];
  for (const record of list) {
    const project = buildProject(record, nameField, notesField);
    if (project) {
      result.push(project);
    }
  }
  return result;
}

const projectService = {
  async getMapData(): Promise<Array<Project>> {
    const response = await projectRepository.fetchMapData();
    return processProjectData(response);
  },
  async getAll(): Promise<Array<Project>> {
    const response = await projectRepository.fetchFull();
    return processProjectData(response);
  },
  async add(latLng: LatLng, name: string): Promise<RawProjectRecord[]> {
    const payload = [
      {
        Name: name,
        Latitude: latLng.lat,
        Longitude: latLng.lng,
      },
    ];
    return projectRepository.create(payload) as Promise<RawProjectRecord[]>;
  },
};

export default projectService;
