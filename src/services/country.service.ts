import type { Country } from "@/interfaces/Country";
import { fetchLocalizedLookup } from "./lookup.service";

const countryService = {
  getAll: (): Promise<Array<Country>> =>
    fetchLocalizedLookup<Country>(
      "mbh0s7sspgjlqvt",
      "vw0goq0zeuzgkmxw",
      (fields) => ({ code: String(fields.Code ?? "") }),
    ),
};

export default countryService;
