import { NocoDBService } from './nocodb.service'
import type { Project } from "@/interfaces/Project"
import type { LatLng } from "leaflet"

const base = new NocoDBService('mdctuswlmsfvi8i')

// Optimierte Feldliste - nur die Felder, die wir wirklich brauchen
const REQUIRED_FIELDS = [
  'Id', 'Name', 'TeaserImage', 'Category_ID', 'Notes',
  'Country_ID', 'Latitude', 'Longitude', 'Link', 'State', 'Since', 'Gallery'
];

const projectService = {

  async getAll(): Promise<Array<Project>> {

    try {

      const response = await base
        .list({
          limit: 1000,
          offset: 0,
          sort: "Name",
          viewId: "vwlnl4t095iifqc9", // published
          fields: REQUIRED_FIELDS // Nur die benötigten Felder anfordern
        })

      // Verwende Web Workers für die Datenverarbeitung, wenn verfügbar
      if (window.Worker) {
        return new Promise<Array<Project>>((resolve) => {
          const worker = new Worker(new URL('./projectDataWorker.js', import.meta.url), { type: 'module' });

          worker.onmessage = (e) => {
            console.timeEnd('Data processing');
            const locations = e.data;

            resolve(locations);
            worker.terminate();
          };

          worker.postMessage(response);
        });
      } else {
        // Fallback für Browser ohne Web Worker Support
        const locations: Array<Project> = ((response as unknown) as { list: Record<string, unknown>[] })
          .list.map((record: Record<string, unknown>) => ({
          id: record.Id as number,
          name: record.Name as string,
          teaserImg: record?.TeaserImage as object[],
          category: record?.Category_ID as Array<number>,
          notes: record.Notes
            ? (record.Notes as string)
                .replaceAll('"<http', '"http')
                .replaceAll('>"', '"')
            : "",
          country: record?.Country_ID as number | undefined,
          latitude: record?.Latitude as number,
          longitude: record?.Longitude as number,
          link: record?.Link as string,
          state: record?.State as string,
          since: record.Since ? new Date(record.Since as string) : null,
          gallery: record?.Gallery as Array<object>,
        } as Project));
        console.timeEnd('Data processing');

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
