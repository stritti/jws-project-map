export interface Project {
  id: string;
  name: string;
  category: Array<string> | null;
  country: Array<string>;
  teaserImg: Array<any> | null;
  state: string;
  notes: string | null;
  latitude: number;
  longitude: number;
  link: string | null;
  since: Date | null;
  gallery: Array<object>;
}
