/**
 * Colour contrast helpers.
 *
 * Category colours come from NocoDB and are not curated, so any text placed on
 * them has to pick its foreground by measured contrast instead of a guessed
 * brightness threshold.
 */

export type Rgb = readonly [number, number, number];

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Parse `#rgb` or `#rrggbb` (with or without `#`) into 0-255 channels. */
export function hexToRgb(value: string): Rgb | null {
  const match = HEX_PATTERN.exec(value.trim());
  if (!match) return null;

  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((channel) => channel + channel)
          .join("")
      : match[1];

  const channels = [0, 2, 4].map((offset) =>
    parseInt(hex.slice(offset, offset + 2), 16),
  ) as unknown as Rgb;

  return channels.some((channel) => Number.isNaN(channel)) ? null : channels;
}

/** WCAG relative luminance of a colour, or `null` for unparseable input. */
export function relativeLuminance(value: string): number | null {
  const rgb = hexToRgb(value);
  if (!rgb) return null;

  const [r, g, b] = rgb.map((channel) => {
    const ratio = channel / 255;
    return ratio <= 0.03928
      ? ratio / 12.92
      : Math.pow((ratio + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours, or `null` for unparseable input. */
export function contrastRatio(a: string, b: string): number | null {
  const luminanceA = relativeLuminance(a);
  const luminanceB = relativeLuminance(b);
  if (luminanceA === null || luminanceB === null) return null;

  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Pick whichever of the two candidate foregrounds is more readable on
 * `background`. Falls back to the light foreground when the background cannot
 * be parsed, which matches the previous behaviour for missing colours.
 */
export function readableTextColor(
  background: string,
  light = "#ffffff",
  dark = "#212529",
): string {
  const onLight = contrastRatio(light, background);
  const onDark = contrastRatio(dark, background);
  if (onLight === null || onDark === null) return light;

  return onDark >= onLight ? dark : light;
}
