import { Attachment } from "./Attachment";

export interface Project {
  id: number;
  name: string;
  category: Array<number>;
  country: number;
  teaserImg?: Array<Attachment> | undefined;
  state: string;
  notes: string | undefined;
  latitude: number;
  longitude: number;
  link: string | undefined;
  since?: Date | null;
  gallery?: Array<Attachment> | undefined;
}
