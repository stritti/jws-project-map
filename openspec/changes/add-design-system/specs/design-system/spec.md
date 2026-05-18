## Requirements

### Two-Layer Architecture

- SHALL use Bootstrap 5.3 SCSS as the base styling layer with custom overrides
- SHALL use CSS custom properties (design tokens) as the runtime styling layer
- SHALL import `style-config.scss` before `a11y.scss` in `main.ts`
- SHALL import `flag-icons/css/flag-icons.min.css` for country flag support
- SHALL disable Bootstrap utility class generation (`$utilities: ()`)

### Bootstrap Customization

- SHALL set the primary color to `#3d5e9e` (JWS Blue)
- SHALL set the primary RGB to `61, 94, 158` for rgba() usage
- SHALL use Roboto as the primary font family with system font fallbacks
- SHALL set base font size to 1rem (16px)
- SHALL set heading font weight to 700 with -0.02em letter spacing
- SHALL set border-radius to 0.5rem, border-radius-lg to 1rem
- SHALL include BootstrapVueNext CSS after Bootstrap SCSS

### Color System

- SHALL define Material Design 3-inspired color roles in `:root`:
  - Primary, secondary, tertiary with container, fixed, fixed-dim, on-* variants
  - Surface, background, outline, error with container and on-* variants
- SHALL provide RGB variants of key colors for use in `rgba()` functions
- SHALL use `--color-secondary` (#3c5d9d) as the primary interactive color
- SHALL use `--color-tertiary` (#10b981) as the success/accent color
- SHALL use `--color-error` (#ba1a1a) for error states

### Typography

- SHALL define a typography scale with named levels:
  - Headline LG (24px/700), Headline MD (20px/600)
  - Body LG (16px/400), Body MD (14px/400)
  - Label MD (12px/600), Label SM (11px/500)
- SHALL provide mobile variants for headline sizes
- SHALL use negative letter spacing for headlines (-0.02em, -0.01em)
- SHALL use positive letter spacing for labels (0.02em, 0.03em)
- SHALL enable font smoothing (`-webkit-font-smoothing: antialiased`)

### Spacing

- SHALL use 4px as the base spacing unit
- SHALL define named spacing tokens: gutter-xs (8px), gutter-md (16px), margin-sm (12px), margin-lg (24px)
- SHALL define sidebar-width token (320px)

### Shapes

- SHALL define a roundness scale: small (4px), default (8px), medium (12px), large (16px), xl (24px), full (9999px)
- SHALL use `--shape-round-full` for pill buttons and circular elements
- SHALL use `--shape-round-xl` for cards and large containers
- SHALL use `--shape-round-default` for inputs and small elements

### Shadows

- SHALL define a shadow scale: sm (subtle), md (medium), lg (elevated)
- SHALL use `--jws-shadow-sm` for cards and list items
- SHALL use `--jws-shadow-md` for elevated elements (hover states)
- SHALL use `--jws-shadow-lg` for modals and overlays

### Transitions

- SHALL use `--jws-transition` (all 0.3s cubic-bezier(0.4, 0, 0.2, 1)) as the default transition
- SHALL use shorter transitions (0.15s) for micro-interactions

### Responsive Design

- SHALL use 768px as the primary mobile/desktop breakpoint
- SHALL use `max-width: 767.98px` for mobile-specific styles
- SHALL use `min-width: 768px` for desktop-specific styles
- SHALL respect `env(safe-area-inset-*)` CSS environment variables for notched devices

### Accessibility Utilities

- SHALL provide `.sr-only` class for screen-reader-only content
- SHALL provide global `:focus-visible` styles for keyboard navigation (2px solid #3d5e9e, 2px offset)
- SHALL remove default focus outline for mouse users (`:focus:not(:focus-visible)`)
- SHALL provide `.skip-to-map` class for skip navigation links
- SHALL provide `.high-contrast-text` class for improved text contrast

### Body Styling

- SHALL set body background to `--jws-bg-subtle` (#f8fafc)
- SHALL set body text color to `--jws-text-main` (#1e293b)
- SHALL enable font smoothing for crisp text rendering
