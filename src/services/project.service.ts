import { NocoDBService } from './nocodb.service'
import type { Project } from "@/interfaces/Project"
import type { LatLng } from "leaflet"

const base = new NocoDBService('mdctuswlmsfvi8i')

const projectService = {
  async getAll(): Promise<Array<Project>> {
    try {
      console.time('API request');
      const response = await base
        .list({
          limit: 1000,
          offset: 0,
          sort: "Name",
          viewId: "vwlnl4t095iifqc9", // published
        })
      console.timeEnd('API request');

      console.time('Data processing');
      const locations: Array<Project> = ((response as unknown) as { list: Record<string, any>[] })
        .list.map((record: Record<string, any>) => ({
        id: record.Id as number,
        name: record.Name as string,
        teaserImg: record?.TeaserImage as object[],
        category: record?.Category_ID as Array<number>,
        notes: record.Notes
          ? (record.Notes as string)
              .replaceAll('"<http', '"http')
              .replaceAll('>"', '"')
          : "",
        country: record?.Country_ID ? record.Country_ID[0] : undefined as number | undefined,
        latitude: record?.Latitude as number,
        longitude: record?.Longitude as number,
        link: record?.Link as string,
        state: record?.State as string,
        since: record.Since ? new Date(record.Since as string) : null,
        gallery: record?.Gallery as Array<object>,
      } as Project));
      console.timeEnd('Data processing');

      return locations
    } catch (error) {
      console.error('Error fetching Items:', error);
      // Return empty array instead of throwing to prevent app from crashing
      return [];
    }
  },
  add(latLng: LatLng, name: string): any {
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
