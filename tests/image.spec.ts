import { describe, expect, it } from "vitest";
import { PLACEHOLDER_IMAGE, teaserImageUrl } from "@/utils/image";
import type { Attachment } from "@/interfaces/Attachment";
import type { Project } from "@/interfaces/Project";

function makeAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: "att-1",
    mimetype: "image/jpeg",
    url: "https://example.com/raw.jpg",
    title: "teaser",
    size: 1234,
    width: 800,
    height: 600,
    signedUrl: "https://example.com/signed.jpg",
    name: "teaser.jpg",
    ...overrides,
  };
}

function makeProject(teaserImg?: Attachment[]): Project {
  return {
    id: 1,
    name: "School Building",
    latitude: 1,
    longitude: 2,
    state: "finished",
    category: undefined,
    country: undefined,
    notes: "",
    link: undefined,
    teaserImg,
  };
}

describe("teaserImageUrl", () => {
  it("returns the placeholder when the project has no teaser image", () => {
    expect(teaserImageUrl(makeProject(undefined))).toBe(PLACEHOLDER_IMAGE);
    expect(teaserImageUrl(makeProject([]))).toBe(PLACEHOLDER_IMAGE);
  });

  it("prefers the requested thumbnail size", () => {
    const image = makeAttachment({
      thumbnails: {
        small: { signedUrl: "https://example.com/small.jpg" },
        card_cover: { signedUrl: "https://example.com/card.jpg" },
      },
    });
    expect(teaserImageUrl(makeProject([image]), "small")).toBe("https://example.com/small.jpg");
    expect(teaserImageUrl(makeProject([image]), "card_cover")).toBe("https://example.com/card.jpg");
  });

  it("falls back to another thumbnail when the preferred size is missing", () => {
    const image = makeAttachment({
      thumbnails: {
        small: { signedUrl: "https://example.com/small.jpg" },
      },
    });
    expect(teaserImageUrl(makeProject([image]), "card_cover")).toBe("https://example.com/small.jpg");
  });

  it("falls back to the signed URL when no thumbnails exist", () => {
    expect(teaserImageUrl(makeProject([makeAttachment()]))).toBe("https://example.com/signed.jpg");
  });

  it("returns the placeholder when the attachment has no usable URL", () => {
    const image = makeAttachment({ signedUrl: "" });
    expect(teaserImageUrl(makeProject([image]))).toBe(PLACEHOLDER_IMAGE);
  });
});
