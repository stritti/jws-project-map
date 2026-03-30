import { NocoDBService } from "./nocodb.service";
import type { Country } from "../interfaces/Country";

const base = new NocoDBService("mbh0s7sspgjlqvt");

const countryService = {
  async getAll(): Promise<Array<Country>> {
    try {
      const response = await base.list<{
        id: number;
        fields: { Name: string; Code: string };
      }>({
        sort: [{ direction: "asc", field: "Name" }],
        viewId: "vw0goq0zeuzgkmxw",
      });
      const countryList: Array<Country> = response.list.map(
        (record) =>
          ({
            id: record.id,
            name: record.fields.Name,
            code: record.fields.Code,
          }) as Country,
      );

      return countryList;
    } catch (error) {
      console.error("Error fetching Items:", error);
      throw error;
    }
  },
};

export default countryService;
