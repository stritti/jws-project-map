import { NocoDBService } from "@/services/nocodb.service";
import type { Project } from "@/interfaces/Project";

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
  async fetchMinimal(): Promise<any> {
    return base.list({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
      fields: MINIMAL_FIELDS,
    });
  },

  async fetchFull(): Promise<any> {
    return base.list({
      limit: 1000,
      offset: 0,
      viewId: "vwlnl4t095iifqc9",
      fields: FULL_FIELDS,
    });
  },

  async fetchById(id: number): Promise<any> {
    return base.read(id, { fields: FULL_FIELDS });
  },
};
