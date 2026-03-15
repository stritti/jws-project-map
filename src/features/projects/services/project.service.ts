import { LinkedRecord } from "@/interfaces/LinkedRecord";
import { projectRepository } from "@/features/projects/repositories/project.repository";
import type { Project } from "@/interfaces/Project";
import type { LatLng } from "leaflet";

// Optimierte Feldliste - nur die Felder, die wir wirklich brauchen

// In-Memory Cache mit Zeitstempel
interface CacheData {
  timestamp: number;
  data: Array<Project>;
  mapData?: Array<Project>;
}

// Cache-Gültigkeit (5 Minuten)
const CACHE_VALIDITY_MS = 5 * 60 * 1000;

// In-Memory Cache
let projectsCache: CacheData | null = null;

// Cache für die Datenverarbeitung
const processDataCache = new Map<string, Array<Project>>();

// Rohformat eines Projektdatensatzes aus NocoDB
import type { RawProjectRecord } from "@/features/projects/repositories/project.repository";

// Hilfsfunktion um verknüpfte Datensätze aus dem NocoDB-Format zu extrahieren
// NocoDB v2 liefert verknüpfte Felder entweder als Array (LTAR) oder als { list: T[] } (Links-Feldtyp)
function extractLinkedRecords<T>(value: unknown): T[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "object" && value !== null && "list" in (value as object)) {
    const list = (value as { list: unknown }).list;
    if (Array.isArray(list)) return list as T[];
  }
  return undefined;
}

// Hilfsfunktion zur Datenverarbeitung - optimiert für Leistung mit Memoization
function processProjectData(
  records: RawProjectRecord[],
  forMapOnly: boolean,
): Array<Project> {
  const list = records;

  const cacheKey = `${forMapOnly ? "map" : "full"}-${list.length}`;

  // Prüfe, ob wir bereits verarbeitete Daten im Cache haben
  if (processDataCache.has(cacheKey)) {
    return processDataCache.get(cacheKey)!;
  }

  const result: Project[] = [];
  const len = list.length;

  // Verwende eine for-Schleife statt map/filter für bessere Performance
  for (let i = 0; i < len; i++) {
    const record: RawProjectRecord = list[i];

    // Grundlegende Validierung
    if (typeof record.Id !== "number") {
      continue;
    }

    const project: Partial<Project> = {
      id: record.Id,
      name: record.Name as string,
      latitude: record.Latitude as number,
      longitude: record.Longitude as number,
      state: record.State as string,
    };

    // Nur die notwendigen Felder für die Kartenansicht
    const categoryRecords = extractLinkedRecords<LinkedRecord>(record.Category);
    if (categoryRecords && categoryRecords.length > 0) {
      project.category = categoryRecords;
    }

    const countryRecords = extractLinkedRecords<LinkedRecord>(record.Country);
    if (countryRecords && countryRecords.length > 0) {
      project.country = countryRecords[0];
    }

    // Nur die zusätzlichen Felder hinzufügen, wenn nicht nur für die Karte
    if (!forMapOnly) {
      if (record.TeaserImage) {
        project.teaserImg = record.TeaserImage as Project["teaserImg"];
      }

      if (record.Notes) {
        project.notes = (record.Notes as string)
          .replaceAll('"<http', '"http')
          .replaceAll('>"', '"');
      } else {
        project.notes = "";
      }

      if (record.Link) {
        project.link = record.Link as string;
      }

      if (record.Since) {
        project.since = new Date(record.Since as string);
      }

      if (record.Gallery) {
        project.gallery = record.Gallery as Project["gallery"];
      }
    }

    result.push(project as Project);
  }

  // Cache das Ergebnis
  processDataCache.set(cacheKey, result);

  return result;
}

const projectService = {
  // Schnelles Laden nur der Kartendaten
  async getMapData(): Promise<Array<Project>> {
    // Cache prüfen
    if (
      projectsCache?.mapData &&
      Date.now() - projectsCache.timestamp < CACHE_VALIDITY_MS
    ) {
      console.log("Using cached map data");
      return projectsCache.mapData;
    }

    try {
      // Nur die für die Karte notwendigen Felder laden
      const response = await projectRepository.fetchMinimal();

      const mapData = processProjectData(response, true);

      // Cache aktualisieren
      if (!projectsCache) {
        projectsCache = { timestamp: Date.now(), data: [], mapData };
      } else {
        projectsCache.mapData = mapData;
        projectsCache.timestamp = Date.now();
      }

      return mapData;
    } catch (error) {
      console.error("Error fetching map data:", error);
      return projectsCache?.mapData || [];
    }
  },

  async getAll(forMapOnly = false): Promise<Array<Project>> {
    // Wenn nur Kartendaten benötigt werden, die optimierte Methode verwenden
    if (forMapOnly) {
      return this.getMapData();
    }

    // Cache prüfen
    if (
      projectsCache?.data &&
      Date.now() - projectsCache.timestamp < CACHE_VALIDITY_MS
    ) {
      console.log("Using cached project data");
      return projectsCache.data;
    }

    try {
      // Alle benötigten Felder laden
      const response = await projectRepository.fetchFull();

      const projects = processProjectData(response, false);

      // Cache aktualisieren
      projectsCache = {
        timestamp: Date.now(),
        data: projects,
        mapData: projectsCache?.mapData || projects,
      };

      return projects;
    } catch (error) {
      console.error("Error fetching Items:", error);
      return projectsCache?.data || [];
    }
  },

  add(latLng: LatLng, name: string): Promise<unknown> {
    console.warn("add() not yet migrated to repository layer");
    return Promise.resolve({ latLng, name });
  },
};

export default projectService;
