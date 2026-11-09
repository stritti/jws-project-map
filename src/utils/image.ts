import type { Attachment } from "@/interfaces/Attachment";
import type { Project } from "@/interfaces/Project";

export const PLACEHOLDER_IMAGE = "/img/placeholder.png";

type ThumbnailSize = "tiny" | "small" | "card_cover";

/**
 * Resolve the best available teaser image URL for a project: the preferred
 * thumbnail size first, then any other generated thumbnail, then the original
 * signed URL, and finally the local placeholder when the project has no image
 * or the attachment carries no usable URL.
 */
export function teaserImageUrl(
  project: Project,
  preferredSize: ThumbnailSize = "card_cover",
): string {
  const image: Attachment | undefined = project.teaserImg?.[0];
  if (!image) return PLACEHOLDER_IMAGE;

  const thumbnails = image.thumbnails;
  return (
    thumbnails?.[preferredSize]?.signedUrl ||
    thumbnails?.card_cover?.signedUrl ||
    thumbnails?.small?.signedUrl ||
    thumbnails?.tiny?.signedUrl ||
    image.signedUrl ||
    PLACEHOLDER_IMAGE
  );
}
