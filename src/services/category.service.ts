import type { Category } from "@/interfaces/Category";
import { fetchLocalizedLookup } from "./lookup.service";

const categoryService = {
  getAll: (): Promise<Array<Category>> =>
    fetchLocalizedLookup<Category>(
      "m4wto2nnf9c230g",
      "vwoztb7dgc077xfd",
      (fields) => ({ color: String(fields.Color ?? "") }),
    ),
};

export default categoryService;
