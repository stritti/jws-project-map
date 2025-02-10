import { NocoDBService } from './nocodb.service'
import type { Country } from "../interfaces/Country"

const base = new NocoDBService('mbh0s7sspgjlqvt')

const countryService = {
  async getAll(): Promise<Array<Country>> {
    try {
      const response = await base
        .list({
          sort: "Name",
          viewId: "vw0goq0zeuzgkmxw",
        })
      const countryList: Array<Country> = ((response as unknown) as { list: Record<string, any>[] })
        .list.map((record: Record<string, any>) => ({
        id: record.Id as number,
        name: record.Name as string,
        code: record.Code as string,
      }) as Country)

      return countryList
    } catch (error) {
      console.error('Error fetching Items:', error)
      throw error
    }
  }
}

export default countryService
