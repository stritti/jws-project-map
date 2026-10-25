import { NocoDBService } from "@/services/nocodb.service";

const tableId = "mdctuswlmsfvi8i";

const base = new NocoDBService(tableId);

// NocoDB record fields, shared between the flat record payload and the
// nested `fields` wrapper so each field only has to be declared once.
export interface RawProjectFields {
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
}

// Raw shape coming from NocoDB v2
export interface RawProjectRecord extends RawProjectFields {
  id: number;
  // NocoDB can return the primary key as "Id" in flat record payloads.
  Id?: number;
  fields?: RawProjectFields;
}

export const projectRepository = {
  async fetchMapData(): Promise<RawProjectRecord[]> {
    const result = await base.list<RawProjectRecord>({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
      fields: [
        "Name",
        "Name (de)",
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
    });
    return result?.list || [];
  },

  async fetchById(id: number): Promise<RawProjectRecord> {
    return base.read(id) as Promise<RawProjectRecord>;
  },

  async create(data: Record<string, unknown>[]): Promise<unknown> {
    return base.create(data);
  },
};
