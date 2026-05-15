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
import { i18n } from "@/plugins/i18n";





function currentLocale(): string {
  try {
    const loc = (i18n.global.locale as unknown as { value: string }).value;
    if (loc && typeof loc === "string") return loc;
  } catch {
    // ignore
  }
  return "en";
}

// Hilfsfunktion zur Datenverarbeitung - optimiert für Leistung mit Memoization
function processProjectData(
  records: RawProjectRecord[],
  forMapOnly: boolean,
  locale?: string,
): Array<Project> {
  // Determine locale-aware field suffixes
  const lc = locale || "en";
  const nameField = `Name (${lc})`;
  const notesField = `Notes (${lc})`;
  // Defensive Programmierung: Sicherstellen, dass records existiert und ein Array ist
  const list = Array.isArray(records) ? records : [];

  const cacheKey = `${locale || "default"}-${forMapOnly ? "map" : "full"}-${list.length}`;

  // Prüfe, ob wir bereits verarbeitete Daten im Cache haben
  if (processDataCache.has(cacheKey)) {
    return processDataCache.get(cacheKey)!;
  }

  const result: Project[] = [];
  const len = list.length;

  // Verwende eine for-Schleife statt map/filter für bessere Performance
  for (let i = 0; i < len; i++) {
    const record = list[i];

    // Grundlegende Validierung - wir brauchen mindestens eine ID und Koordinaten
    const id = record.id;
    const lat = record.fields?.Latitude;
    const lng = record.fields?.Longitude;

    if (!id) {
      console.warn(
        `Skipping project due to missing ID. Record keys:`,
        Object.keys(record),
      );
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
      name: ((record.fields as any)?.[nameField] || record.fields?.Name || "Unbenannt") as string,
      latitude: latNum,
      longitude: lngNum,
      state: (record.fields?.State || "finished") as string,
      category: undefined,
      country: undefined,
      notes: undefined,
      link: undefined,
    };

    // Nur die notwendigen Felder für die Kartenansicht
    if (record.fields?.Category && Array.isArray(record.fields.Category)) {
      project.category = record.fields.Category;
    }

    if (
      record.fields?.Country &&
      Array.isArray(record.fields.Country) &&
      record.fields.Country.length > 0
    ) {
      project.country = record.fields.Country[0];
    }

    // Nur die zusätzlichen Felder hinzufügen, wenn nicht nur für die Karte
    if (!forMapOnly) {
      if (record.fields?.TeaserImage) {
        project.teaserImg = record.fields.TeaserImage as Project["teaserImg"];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawNotes = ((record.fields as any)?.[notesField] || record.fields?.Notes) as string | undefined;
      if (rawNotes) {
        project.notes = rawNotes
          .replaceAll('"<http', '"http')
          .replaceAll('>"', '"');
      } else {
        project.notes = "";
      }

      if (record.fields?.Link) {
        project.link = record.fields.Link as string;
      }

      if (record.fields?.Since) {
        project.since = new Date(record.fields.Since as string);
      }

      if (record.fields?.Gallery) {
        project.gallery = record.fields.Gallery as Project["gallery"];
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

      const loc = currentLocale();
      const mapData = processProjectData(response, true, loc);

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

      const loc = currentLocale();
      const projects = processProjectData(response, false, loc);

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
