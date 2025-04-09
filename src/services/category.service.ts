import { NocoDBService } from './nocodb.service'
import type { Category } from "@/interfaces/Category"

const base = new NocoDBService('m4wto2nnf9c230g')

const categoryService = {
  async getAll(): Promise<Array<Category>> {
    try {
      const response = await base
        .list({
          sort: "Name",
          viewId: "vwoztb7dgc077xfd", // published
        })

      const categoryList: Array<Category> = ((response as unknown) as { list: Record<string, unknown>[] })
        .list.map((record: Record<string, unknown>) => ({
        id: record.Id as number,
        name: record.Name as string,
        color: record.Color as string,
      } as Category));
      return categoryList
    } catch (error) {
      console.error('Error fetching Items:', error);
      throw error;
    }
  }
};

export default categoryService;
