import type { Category } from './Category'
import type { Country } from './Country';

export interface Project {
    id: string
    name: string
    category: Array<Category>
    country: Array<Country>
    teaserImg: Array<object>
    state:  string
    notes: string
    latitude: number
    longitude: number
    link: string
    since: Date
    gallery: Array<object>
  }