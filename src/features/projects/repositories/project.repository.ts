import { NocoDBService } from "@/services/nocodb.service";

const tableId = "mdctuswlmsfvi8i";

const base = new NocoDBService(tableId);

// Raw shape coming from NocoDB
export interface RawProjectRecord {
  Id: number;
  Name: string;
  Latitude: number;
  Longitude: number;
  State?: string;
  Category?: unknown;
  Country?: unknown;
  TeaserImage?: unknown;
  Notes?: string;
  Link?: string;
  Since?: string;
  Gallery?: unknown;
}

const MINIMAL_FIELDS = [
  "Id",
  "Name",
  "Category",
  "Country",
  "Latitude",
  "Longitude",
  "State",
];

const FULL_FIELDS = [
  "Id",
  "Name",
  "TeaserImage",
  "Category",
  "Notes",
  "Country",
  "Latitude",
  "Longitude",
  "Link",
  "State",
  "Since",
  "Gallery",
];

export const projectRepository = {
  async fetchMinimal(): Promise<RawProjectRecord[]> {
    return base.list<RawProjectRecord>({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
      fields: MINIMAL_FIELDS,
    });
  },

  async fetchFull(): Promise<RawProjectRecord[]> {
    return base.list<RawProjectRecord>({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
      fields: FULL_FIELDS,
    });
  },

  async fetchById(id: number): Promise<RawProjectRecord> {
    return base.read(id, { fields: FULL_FIELDS }) as Promise<RawProjectRecord>;
  },
};
