export interface Project {
  id: string;
  name: string;
  category: Array<string>;
  country: Array<string>;
  teaserImg: Array<any> | undefined;
  state: string;
  notes: string | undefined;
  latitude: number;
  longitude: number;
  link: string | undefined;
  since: Date | null;
  gallery: Array<object>;
}
