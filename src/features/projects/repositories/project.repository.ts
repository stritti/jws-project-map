import { NocoDBService } from "@/services/nocodb.service";

const tableId = "mdctuswlmsfvi8i";

const base = new NocoDBService(tableId);

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
  async fetchMinimal(): Promise<unknown> {
    return base.list({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
      fields: MINIMAL_FIELDS,
    });
  },

  async fetchFull(): Promise<unknown> {
    return base.list({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
      fields: FULL_FIELDS,
    });
  },

  async fetchById(id: number): Promise<unknown> {
    return base.read(id, { fields: FULL_FIELDS });
  },
};
