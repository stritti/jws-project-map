import { NocoDBService } from "./nocodb.service";
import type { Category } from "@/interfaces/Category";

const base = new NocoDBService("m4wto2nnf9c230g");

const categoryService = {
  async getAll(): Promise<Array<Category>> {
    try {
      const response = await base.list<{
        id: number;
        fields: { Name: string; Color: string };
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
