import { NocoDBService } from "./nocodb.service";
import type { Category } from "@/interfaces/Category";

const base = new NocoDBService("m4wto2nnf9c230g");

const categoryService = {
  async getAll(): Promise<Array<Category>> {
    try {
      const response = await base.list<{
        id: number;
        fields: { Name: string; Color: string; "Name (de)": string; "Name (en)": string; "Name (fr)": string };
      }>({
        sort: [{ direction: "asc", field: "Name" }],
        viewId: "vwoztb7dgc077xfd",
      });

      const categoryList: Array<Category> = response.list.map(
        (record) =>
          ({
            id: record.id,
            name: record.fields.Name,
            color: record.fields.Color,
            name_de: record.fields["Name (de)"] || undefined,
            name_en: record.fields["Name (en)"] || undefined,
            name_fr: record.fields["Name (fr)"] || undefined,
          }) as Category,
      );
      return categoryList;
    } catch (error) {
      console.error("Error fetching Items:", error);
      throw error;
    }
  },
};

export default categoryService;
