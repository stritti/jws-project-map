import Airtable from 'airtable'

export const base = new Airtable({
  apiKey: `${import.meta.env.VUE_APP_AIRTABLE_TOKEN}`
}).base(`${import.meta.env.VUE_APP_AIRTABLE_BASE}`)

export default base
