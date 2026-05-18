## Why

The application uses a two-layer design system: Bootstrap 5.3 SCSS customization (primary color, typography, border radii) combined with a comprehensive set of CSS custom properties (design tokens) for colors, typography, spacing, and shapes. This system ensures visual consistency across all components and views. The design system needs documentation to ensure future components follow established patterns and to guide theme modifications.

## What Changes

- Document the two-layer architecture: Bootstrap SCSS overrides + CSS custom properties (design tokens)
- Specify the color system: Material Design 3-inspired color roles, RGB variants for rgba()
- Document the typography scale: headline, body, and label sizes with responsive variants
- Specify the spacing system: 4px base unit with named spacing tokens
- Document the shape/roundness system: consistent border radius values
- Specify the shadow system: subtle, medium, and elevated shadow levels
- Document the responsive breakpoint strategy: mobile-first with 768px threshold

## Capabilities

### New Capabilities
- `design-system`: SCSS design tokens, Bootstrap customization, typography scale, spacing system, and responsive breakpoints

## Impact

- **Assets affected**: `design-tokens.scss`, `style-config.scss`, `a11y.scss`, `iframe.scss`
- **Components affected**: All components using CSS custom properties or SCSS variables
- **No breaking changes**: Documentation-only change
