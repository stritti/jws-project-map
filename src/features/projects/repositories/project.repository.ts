import { NocoDBService } from "@/services/nocodb.service";

const tableId = "mdctuswlmsfvi8i";

const base = new NocoDBService(tableId);

// Raw shape coming from NocoDB v2
export interface RawProjectRecord {
  id: number;
  fields: {
    Name?: string;
    Title?: string;
    Latitude?: number;
    Longitude?: number;
    State?: string;
    Status?: string;
    Category?: unknown;
    Country?: unknown;
    TeaserImage?: unknown;
    Notes?: string;
    Link?: string;
    Since?: string;
    Gallery?: unknown;
  };
}

export const projectRepository = {
  async fetchMinimal(): Promise<RawProjectRecord[]> {
    const result = await base.list<RawProjectRecord>({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
    });
    return result?.list || [];
  },

  async fetchFull(): Promise<RawProjectRecord[]> {
    const result = await base.list<RawProjectRecord>({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
    });
    return result?.list || [];
  },

  async fetchById(id: number): Promise<RawProjectRecord> {
    return base.read(id) as Promise<RawProjectRecord>;
  },
};
