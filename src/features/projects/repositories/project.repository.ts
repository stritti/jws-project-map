import { NocoDBService } from "@/services/nocodb.service";

const tableId = "mdctuswlmsfvi8i";

const base = new NocoDBService(tableId);

// Raw shape coming from NocoDB v2
export interface RawProjectRecord {
  id: number;
  // NocoDB can return the primary key as "Id" in flat record payloads.
  Id?: number;
  Name?: string;
  Title?: string;
  Latitude?: number;
  Longitude?: number;
  State?: string;
  Category?: unknown;
  Country?: unknown;
  TeaserImage?: unknown;
  Notes?: string;
  Link?: string;
  Since?: string;
  Gallery?: unknown;
  "Name (de)"?: string;
  "Name (en)"?: string;
  "Name (fr)"?: string;
  "Notes (de)"?: string;
  "Notes (en)"?: string;
  "Notes (fr)"?: string;
  fields?: {
    Name?: string;
    Title?: string;
    Latitude?: number;
    Longitude?: number;
    State?: string;
    Category?: unknown;
    Country?: unknown;
    TeaserImage?: unknown;
    Notes?: string;
    Link?: string;
    Since?: string;
    Gallery?: unknown;
    "Name (de)"?: string;
    "Name (en)"?: string;
    "Name (fr)"?: string;
    "Notes (de)"?: string;
    "Notes (en)"?: string;
    "Notes (fr)"?: string;
  };
}

// Cache for full project list with timestamp
let fullProjectList: RawProjectRecord[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const projectRepository = {
  /**
   * Fetch all projects with caching
   * Uses a 5-minute cache to avoid repeated API calls
   */
  async fetchFull(): Promise<RawProjectRecord[]> {
    // Return cached data if still valid
    if (fullProjectList && Date.now() - lastFetchTime < CACHE_TTL) {
      console.log("[ProjectRepository] Returning cached projects");
      return fullProjectList;
    }

    console.log("[ProjectRepository] Fetching projects from API...");
    const startTime = Date.now();
    
    try {
      // Use a reasonable limit instead of 1000 to avoid timeout
      // NocoDB default limit is usually 25, but we can request more
      const result = await base.list<RawProjectRecord>({
        limit: 500, // Reduced from 1000 to 500 for better performance
        offset: 0,
        viewId: "vwlnl4t095iifqc9",
      });
      
      fullProjectList = result?.list || [];
      lastFetchTime = Date.now();
      
      const duration = Date.now() - startTime;
      console.log(`[ProjectRepository] Fetched ${fullProjectList.length} projects in ${duration}ms`);
      
      return fullProjectList;
    } catch (error) {
      console.error("[ProjectRepository] Error fetching projects:", error);
      // Return cached data if available, even if stale
      if (fullProjectList) {
        console.log("[ProjectRepository] Returning stale cached projects due to error");
        return fullProjectList;
      }
      return [];
    }
  },

  /**
   * Fetch projects with pagination for better initial load performance
   */
  async fetchPaginated(limit: number = 50, offset: number = 0): Promise<RawProjectRecord[]> {
    const result = await base.list<RawProjectRecord>({
      limit,
      offset,
      viewId: "vwlnl4t095iifqc9",
    });
    return result?.list || [];
  },

  async fetchById(id: number): Promise<RawProjectRecord> {
    return base.read(id) as Promise<RawProjectRecord>;
  },
};
