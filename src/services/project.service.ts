import { NocoDBService } from './nocodb.service'
import type { Project } from "@/interfaces/Project"
import type { LatLng } from "leaflet"

// Cache-Konstanten
const CACHE_KEY = 'project_data_cache';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 Stunde in Millisekunden

const base = new NocoDBService('mdctuswlmsfvi8i')

// Optimierte Feldliste - nur die Felder, die wir wirklich brauchen
const REQUIRED_FIELDS = [
  'Id', 'Name', 'TeaserImage', 'Category_ID', 'Notes', 
  'Country_ID', 'Latitude', 'Longitude', 'Link', 'State', 'Since', 'Gallery'
].join(',');

const projectService = {
  // Prüft, ob ein gültiger Cache vorhanden ist
  hasFreshCache(): boolean {
    try {
      const cacheData = localStorage.getItem(CACHE_KEY);
      if (!cacheData) return false;
      
      const { timestamp, version } = JSON.parse(cacheData);
      const now = Date.now();
      
      // Prüfe, ob der Cache noch frisch ist und die richtige Version hat
      return timestamp && (now - timestamp) < CACHE_EXPIRY && version === '1.0';
    } catch (e) {
      console.warn('Cache check failed:', e);
      return false;
    }
  },
  
  // Lädt Daten aus dem Cache
  getFromCache(): Array<Project> | null {
    try {
      const cacheData = localStorage.getItem(CACHE_KEY);
      if (!cacheData) return null;
      
      const { data } = JSON.parse(cacheData);
      return data;
    } catch (e) {
      console.warn('Failed to load from cache:', e);
      return null;
    }
  },
  
  // Speichert Daten im Cache
  saveToCache(data: Array<Project>): void {
    try {
      const cacheObject = {
        timestamp: Date.now(),
        version: '1.0',
        data
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    } catch (e) {
      console.warn('Failed to save to cache:', e);
    }
  },
  
  async getAll(): Promise<Array<Project>> {
    // Zuerst prüfen, ob wir einen gültigen Cache haben
    if (this.hasFreshCache()) {
      const cachedData = this.getFromCache();
      if (cachedData && cachedData.length > 0) {
        console.log('Using cached data');
        return cachedData;
      }
    }
    
    try {
      console.time('API request');
      // Da 'fields' nicht im Typ definiert ist, verwenden wir einen Typ-Cast
      const response = await base
        .list({
          limit: 1000,
          offset: 0,
          sort: "Name",
          viewId: "vwlnl4t095iifqc9", // published
          // @ts-expect-error - fields wird von der API unterstützt, ist aber nicht im Typ definiert
          fields: REQUIRED_FIELDS // Nur die benötigten Felder anfordern
        })
      console.timeEnd('API request');

      console.time('Data processing');
      
      // Verwende Web Workers für die Datenverarbeitung, wenn verfügbar
      if (window.Worker) {
        return new Promise<Array<Project>>((resolve) => {
          const worker = new Worker(new URL('./projectDataWorker.js', import.meta.url), { type: 'module' });
          
          worker.onmessage = (e) => {
            console.timeEnd('Data processing');
            const locations = e.data;
            
            // Cache the processed data
            this.saveToCache(locations);
            
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
          country: record?.Country_ID && Array.isArray(record.Country_ID) && record.Country_ID.length > 0 
            ? (record.Country_ID as unknown[])[0] as number 
            : undefined as number | undefined,
          latitude: record?.Latitude as number,
          longitude: record?.Longitude as number,
          link: record?.Link as string,
          state: record?.State as string,
          since: record.Since ? new Date(record.Since as string) : null,
          gallery: record?.Gallery as Array<object>,
        } as Project));
        console.timeEnd('Data processing');
        
        // Cache the processed data
        this.saveToCache(locations);
        
        return locations;
      }
    } catch (error) {
      console.error('Error fetching Items:', error);
      
      // Versuche, Daten aus dem Cache zu laden, auch wenn er abgelaufen ist
      const cachedData = this.getFromCache();
      if (cachedData && cachedData.length > 0) {
        console.log('Using expired cached data as fallback');
        return cachedData;
      }
      
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
