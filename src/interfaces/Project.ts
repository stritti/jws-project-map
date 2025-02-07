export interface Project {
  id: number;
  name: string;
  category: Array<number>;
  country: number;
  teaserImg: Array<any> | undefined;
  state: string;
  notes: string | undefined;
  latitude: number;
  longitude: number;
  link: string | undefined;
  since?: Date | null;
  gallery: Array<object>;
}
