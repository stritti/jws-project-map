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

// In-Memory Cache
let projectsCache: Array<Project> | null = null;
let lastFetchTime = 0;
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 Minuten Cache-Gültigkeit

const projectService = {
  async getAll(forMapOnly = false): Promise<Array<Project>> {
    // Prüfen, ob wir einen gültigen Cache haben
    const now = Date.now();
    if (projectsCache && (now - lastFetchTime < CACHE_VALIDITY_MS)) {
      console.log("Using cached project data");
      return projectsCache;
    }

    try {
      // Wähle die Feldliste basierend auf dem Verwendungszweck
      const fields = forMapOnly ? MAP_VIEW_FIELDS : REQUIRED_FIELDS;
      
      // Für Kartendaten: Keine Sortierung und weniger Felder für schnelleres Laden
      const response = await base
        .list({
          limit: 1000,
          offset: 0,
          sort: forMapOnly ? undefined : "Name", // Keine Sortierung für Kartendaten
          viewId: "vwlnl4t095iifqc9", // published
          fields: fields
        });

      // Verwende Web Workers für die Datenverarbeitung, wenn verfügbar
      if (window.Worker) {
        const projects = await new Promise<Array<Project>>((resolve) => {
          const worker = new Worker(new URL('./projectDataWorker.js', import.meta.url), { type: 'module' });

          worker.onmessage = (e) => {
            const locations = e.data;
            resolve(locations);
            worker.terminate();
          };

          worker.postMessage({response, forMapOnly});
        });
        
        // Cache nur aktualisieren, wenn wir alle Felder geladen haben
        if (!forMapOnly) {
          projectsCache = projects;
          lastFetchTime = now;
        }
        
        return projects;
      } else {
        // Fallback für Browser ohne Web Worker Support
        const locations: Array<Project> = ((response as unknown) as { list: Record<string, unknown>[] })
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

        // Cache nur aktualisieren, wenn wir alle Felder geladen haben
        if (!forMapOnly) {
          projectsCache = locations;
          lastFetchTime = now;
        }
        
        return locations;
      }
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
