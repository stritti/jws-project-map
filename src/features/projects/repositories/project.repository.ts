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

export const projectRepository = {
  async fetchMinimal(): Promise<RawProjectRecord[]> {
    const result = await base.list<RawProjectRecord>({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
      fields: [
        "id",
        "Id",
        "Name",
        "Name (de)",
        "Name (en)",
        "Name (fr)",
        "Latitude",
        "Longitude",
        "State",
        "Category",
        "Country",
      ],
    });
    return result?.list || [];
  },

  async fetchFull(): Promise<RawProjectRecord[]> {
    const result = await base.list<RawProjectRecord>({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
      fields: [
        "Id",
        "Name",
        "Name (de)",
        "Name (en)",
        "Name (fr)",
        "Latitude",
        "Longitude",
        "State",
        "Status",
        "Category",
        "Country",
        "TeaserImage",
        "Notes",
        "Notes (de)",
        "Notes (en)",
        "Notes (fr)",
        "Link",
        "Since",
        "Gallery",
      ],
    });
    return result?.list || [];
  },

  async fetchById(id: number): Promise<RawProjectRecord> {
    return base.read(id) as Promise<RawProjectRecord>;
  },
};
