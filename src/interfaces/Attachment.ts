export interface Attachment {
  id: string;
  mimetype: string;
  url: string;
  title: string;
  size: number;
  width: number;
  height: number;
  signedUrl: string;
  name: string;
  thumbnails?: {
    tiny?: {
      signedUrl: string;
    };
    small?: {
      signedUrl: string;
    };
    card_cover?: {
      signedUrl: string;
    };
  };
}
