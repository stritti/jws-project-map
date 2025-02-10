export interface Project {
  id: number;
  name: string;
  category: Array<number>;
  country: number;
  teaserImg?: Array<{
    mimetype: string;
    signedUrl: string;
    name: string;
  }>;
  state: string;
  notes: string | undefined;
  latitude: number;
  longitude: number;
  link: string | undefined;
  since?: Date | null;
  gallery?: Array<{
    mimetype: string;
    signedUrl: string;
    thumbnails?: {
      card_cover?: {
        signedUrl: string;
      };
    };
    name: string;
  }> | undefined;
}
