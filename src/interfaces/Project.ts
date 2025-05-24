import { Attachment } from "./Attachment";
import { LinkedRecord } from "./LinkedRecord";

export interface Project {
  id: number;
  name: string;
  category: Array<LinkedRecord> | undefined;
  country: LinkedRecord | undefined;
  teaserImg?: Array<Attachment> | undefined;
  state: string;
  notes: string | undefined;
  latitude: number;
  longitude: number;
  link: string | undefined;
  since?: Date | null;
  gallery?: Array<Attachment> | undefined;
}
