import { NocoDBService } from "./nocodb.service";

export interface LocalizedLookup {
  name: string;
  name_de?: string;
  name_en?: string;
  name_fr?: string;
}

export interface RawLookupFields extends Record<string, unknown> {
  Name: string;
  "Name (de)"?: string;
  "Name (en)"?: string;
  "Name (fr)"?: string;
}

interface RawLookupRecord {
  id: number;
  fields: RawLookupFields;
}

/**
 * Shared fetch for the small lookup tables (categories, countries): sorted by
 * name from a dedicated view, with the localised "Name (<locale>)" fields
 * mapped onto the flat `name_<locale>` shape used by the interfaces.
 * `pickExtra` maps table-specific fields (e.g. Color, Code) onto the result.
 */
export async function fetchLocalizedLookup<T extends LocalizedLookup & { id: number }>(
  tableId: string,
  viewId: string,
  pickExtra: (fields: RawLookupFields) => Partial<T>,
): Promise<T[]> {
  try {
    const base = new NocoDBService(tableId);
    const response = await base.list<RawLookupRecord>({
      sort: [{ direction: "asc", field: "Name" }],
      viewId,
    });
    return response.list.map(
      (record) =>
        ({
          id: record.id,
          name: record.fields.Name,
          name_de: record.fields["Name (de)"] || undefined,
          name_en: record.fields["Name (en)"] || undefined,
          name_fr: record.fields["Name (fr)"] || undefined,
          ...pickExtra(record.fields),
        }) as T,
    );
  } catch (error) {
    console.error("Error fetching lookup records:", error);
    throw error;
  }
}
