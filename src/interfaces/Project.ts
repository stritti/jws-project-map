export interface Project {
  id: string;
  name: string;
  category: Array<string>;
  country: Array<string>;
  teaserImg: Array<any>;
  state: string;
  notes: string;
  latitude: number;
  longitude: number;
  link: string;
  since: Date;
  gallery: Array<object>;
}
