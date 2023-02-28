import Airtable from "airtable";

export const base = new Airtable({
  apiKey: `${import.meta.env.VITE_APP_AIRTABLE_TOKEN}`,
}).base(`${import.meta.env.VITE_APP_AIRTABLE_BASE}`);

export default base;
