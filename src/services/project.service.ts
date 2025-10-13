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

// In-Memory Cache - Vereinfacht
let projectsCache: Array<Project> | null = null;

// Hilfsfunktion zur Datenverarbeitung (als Fallback, wenn der Worker fehlschlägt)
function processProjectData(response: any, forMapOnly: boolean): Array<Project> {
  return ((response as unknown) as { list: Record<string, unknown>[] })
    .list.map((record: Record<string, unknown>) => {
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
    });
}

const projectService = {
  async getAll(forMapOnly = false): Promise<Array<Project>> {
    // Wenn wir einen Cache haben, diesen sofort zurückgeben
    if (projectsCache) {
      console.log("Using cached project data");
      return projectsCache;
    }

    try {
      // Immer alle Felder laden, um mehrfache Anfragen zu vermeiden
      const response = await base
        .list({
          limit: 1000,
          offset: 0,
          viewId: "vwlnl4t095iifqc9", // published
          fields: REQUIRED_FIELDS
        });

      // Direkte Verarbeitung ohne Web Worker für schnelleres initiales Laden
      const projects = processProjectData(response, forMapOnly);
      
      // Immer cachen
      projectsCache = projects;
      
      return projects;
    } catch (error) {
      console.error('Error fetching Items:', error);
      // Return empty array instead of throwing to prevent app from crashing
      return [];
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
    return result;
  }
};

export default projectService;
