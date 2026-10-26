/**
 * Colour contrast helpers.
 *
 * Category colours come from NocoDB and are not curated, so any text placed on
 * them has to pick its foreground by measured contrast instead of a guessed
 * brightness threshold.
 */

export type Rgb = readonly [number, number, number];

const HEX_PATTERN = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_PATTERN = /^rgba?\(([^)]+)\)$/i;

function parseHex(value: string): Rgb | null {
  const match = HEX_PATTERN.exec(value.trim());
  if (!match) return null;

  let hex = match[1];
  // Shorthand: #rgb / #rgba — every channel is one repeated digit.
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split("")
      .map((channel) => channel + channel)
      .join("");
  }
  // #rrggbbaa carries an alpha channel that does not affect contrast.
  hex = hex.slice(0, 6);

  const channels = [0, 2, 4].map((offset) =>
    parseInt(hex.slice(offset, offset + 2), 16),
  ) as unknown as Rgb;

  return channels.some((channel) => Number.isNaN(channel)) ? null : channels;
}

function parseRgbFunction(value: string): Rgb | null {
  const match = RGB_PATTERN.exec(value.trim());
  if (!match) return null;

  const parts = match[1].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;

  const channels = parts.slice(0, 3).map((part) => {
    const numeric = part.endsWith("%")
      ? (parseFloat(part) / 100) * 255
      : parseFloat(part);
    return Math.round(numeric);
  });

  if (channels.some((channel) => Number.isNaN(channel))) return null;
  return channels as unknown as Rgb;
}

/**
 * Parse a CSS colour into 0-255 channels. Understands `#rgb`, `#rgba`,
 * `#rrggbb`, `#rrggbbaa` (hash optional) and `rgb()`/`rgba()`.
 */
export function cssColorToRgb(value: string): Rgb | null {
  return parseHex(value) ?? parseRgbFunction(value);
}

/** WCAG relative luminance of a colour, or `null` for unparseable input. */
export function relativeLuminance(value: string): number | null {
  const rgb = cssColorToRgb(value);
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
 *
 * Note the guarantee is "the better of the two", not "at least 4.5:1". Around
 * a luminance of 0.217 both candidates land at ~3.9:1 — no foreground can do
 * better there without changing the background, which is the category's own
 * colour and not ours to change.
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
