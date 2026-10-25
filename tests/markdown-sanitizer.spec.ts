import { describe, expect, it } from "vitest";
import DOMPurify from "dompurify";
import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

function renderMarkdown(text: string | null | undefined): string {
  if (!text) return "";
  const html = marked.parse(text);
  return typeof html === "string" ? DOMPurify.sanitize(html) : "";
}

describe("markdown sanitization (MarkdownText)", () => {
  it("renders standard markdown features", () => {
    const result = renderMarkdown("# Heading\n\n**bold** and [link](https://example.com)");
    expect(result).toContain("<h1>Heading</h1>");
    expect(result).toContain("<strong>bold</strong>");
    expect(result).toContain('href="https://example.com"');
  });

  it("keeps images", () => {
    const result = renderMarkdown("![alt](https://example.com/img.png)");
    expect(result).toContain("<img");
    expect(result).toContain('src="https://example.com/img.png"');
  });

  it("strips script tags", () => {
    const result = renderMarkdown("<script>alert('xss')</script>");
    expect(result).not.toContain("script");
    expect(result).not.toContain("alert");
  });

  it("strips inline event handlers", () => {
    const result = renderMarkdown('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain("onerror");
  });

  it("strips javascript: URLs", () => {
    const result = renderMarkdown("[click](javascript:alert(1))");
    expect(result).not.toContain("javascript:");
  });

  it("returns empty string for empty input", () => {
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown(null)).toBe("");
    expect(renderMarkdown(undefined)).toBe("");
  });
});
