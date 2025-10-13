import { LinkedRecord } from '@/interfaces/LinkedRecord';
import { NocoDBService } from './nocodb.service'
import type { Project } from "@/interfaces/Project"
import type { LatLng } from "leaflet"

const base = new NocoDBService('mdctuswlmsfvi8i')

// Optimierte Feldliste - nur die Felder, die wir wirklich brauchen
const REQUIRED_FIELDS = [
  'Id', 'Name', 'TeaserImage', 'Category', 'Notes',
  'Country', 'Latitude', 'Longitude', 'Link', 'State', 'Since', 'Gallery'
];

// Minimale Feldliste für die Kartenansicht - für schnelleres initiales Laden
const MAP_VIEW_FIELDS = [
  'Id', 'Name', 'Category', 'Country', 'Latitude', 'Longitude', 'State'
];

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

// Hilfsfunktion zur Datenverarbeitung
function processProjectData(response: any, forMapOnly: boolean): Array<Project> {
  if (!response || !response.list || !Array.isArray(response.list)) {
    console.error('Invalid response format:', response);
    return [];
  }

  return ((response as unknown) as { list: Record<string, unknown>[] })
    .list.map((record: Record<string, unknown>) => {
      // Grundlegende Validierung
      if (!record || typeof record.Id !== 'number') {
        return null;
      }

      const project: Partial<Project> = {
        id: record.Id as number,
        name: record.Name as string,
        category: record?.Category as Array<LinkedRecord>,
        country: (record?.Country as Array<LinkedRecord>)?.[0] || null,
        latitude: record?.Latitude as number,
        longitude: record?.Longitude as number,
        state: record?.State as string,
      };
      
      // Nur die zusätzlichen Felder hinzufügen, wenn nicht nur für die Karte
      if (!forMapOnly) {
        project.teaserImg = record?.TeaserImage as object[];
        project.notes = record.Notes
          ? (record.Notes as string)
              .replaceAll('"<http', '"http')
              .replaceAll('>"', '"')
          : "";
        project.link = record?.Link as string;
        project.since = record.Since ? new Date(record.Since as string) : null;
        project.gallery = record?.Gallery as Array<object>;
      }
      
      return project as Project;
    })
    .filter(Boolean) as Array<Project>; // Entferne null-Werte
}

const projectService = {
  // Schnelles Laden nur der Kartendaten
  async getMapData(): Promise<Array<Project>> {
    // Cache prüfen
    if (projectsCache?.mapData && 
        (Date.now() - projectsCache.timestamp) < CACHE_VALIDITY_MS) {
      console.log("Using cached map data");
      return projectsCache.mapData;
    }

    try {
      // Nur die für die Karte notwendigen Felder laden
      const response = await base
        .list({
          limit: 1000,
          offset: 0,
          viewId: "vwlnl4t095iifqc9", // published
          fields: MAP_VIEW_FIELDS
        });

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
      console.error('Error fetching map data:', error);
      return projectsCache?.mapData || [];
    }
  },

  async getAll(forMapOnly = false): Promise<Array<Project>> {
    // Wenn nur Kartendaten benötigt werden, die optimierte Methode verwenden
    if (forMapOnly) {
      return this.getMapData();
    }

    // Cache prüfen
    if (projectsCache?.data && 
        (Date.now() - projectsCache.timestamp) < CACHE_VALIDITY_MS) {
      console.log("Using cached project data");
      return projectsCache.data;
    }

    try {
      // Alle benötigten Felder laden
      const response = await base
        .list({
          limit: 1000,
          offset: 0,
          viewId: "vwlnl4t095iifqc9", // published
          fields: REQUIRED_FIELDS
        });

      const projects = processProjectData(response, false);
      
      // Cache aktualisieren
      projectsCache = { 
        timestamp: Date.now(), 
        data: projects,
        mapData: projectsCache?.mapData || projects
      };
      
      return projects;
    } catch (error) {
      console.error('Error fetching Items:', error);
      return projectsCache?.data || [];
    }
  },

  add(latLng: LatLng, name: string): Promise<unknown> {
    const result = base.create([
      {
        Name: name,
        Published: "draft",
        Longitude: latLng.lng,
        Latitude: latLng.lat,
      },
    ]);
    // Cache invalidieren
    projectsCache = null;
    return result;
  }
};

export default projectService;
