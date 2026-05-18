## Two-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Design System Architecture                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Layer 1: Bootstrap SCSS Overrides (style-config.scss)               │
│  ─────────────────────────────────────────────────────────────────   │
│  Purpose: Customize Bootstrap at compile time                        │
│  Mechanism: SCSS variables + @use "bootstrap/scss/bootstrap" with()  │
│  Output: Compiled CSS with Bootstrap base styles                     │
│                                                                      │
│  Layer 2: CSS Custom Properties (design-tokens.scss)                 │
│  ─────────────────────────────────────────────────────────────────   │
│  Purpose: Runtime design tokens for component styling                │
│  Mechanism: :root { --token-name: value; }                           │
│  Output: CSS variables accessible in all components                  │
│  Import: @use "@/assets/design-tokens.scss" as *;                    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Import Order (main.ts)                                       │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  1. style-config.scss    → Bootstrap base + JWS overrides    │   │
│  │  2. flag-icons CSS       → Country flag icons                │   │
│  │  3. a11y.scss            → Accessibility utilities           │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Color System

```
┌──────────────────────────────────────────────────────────────────────┐
│  Bootstrap Layer (style-config.scss)                                  │
├──────────────────────────────────────────────────────────────────────┤
│  $primary: #3d5e9e              ← JWS Blue                           │
│  $primary-rgb: 61, 94, 158      ← For rgba() usage                   │
│  $jws-blue-dark: shade($primary, 24%)                                │
│  $jws-blue-light: tint($primary, 24%)                                │
│  $jws-bg-subtle: #f8fafc                                             │
│  $jws-text-main: #1e293b                                             │
│  $jws-text-muted: #64748b                                            │
│                                                                       │
│  CSS Variables (from style-config.scss):                              │
│    --jws-primary         → #3d5e9e                                    │
│    --jws-primary-dark    → shaded                                     │
│    --jws-primary-light   → tinted                                     │
│    --jws-bg-subtle       → #f8fafc                                    │
│    --jws-text-main       → #1e293b                                    │
│    --jws-text-muted      → #64748b                                    │
├──────────────────────────────────────────────────────────────────────┤
│  Design Tokens Layer (design-tokens.scss) — MD3-inspired              │
├──────────────────────────────────────────────────────────────────────┤
│  Primary:                                                             │
│    --color-primary              → #091426 (dark navy)                 │
│    --color-primary-container      → #1e293b                           │
│    --color-primary-fixed          → #d8e3fb                           │
│    --color-primary-fixed-dim      → #bcc7de                           │
│    --color-on-primary             → #ffffff                            │
│    --color-on-primary-container   → #8590a6                           │
│                                                                       │
│  Secondary:                                                           │
│    --color-secondary              → #3c5d9d (JWS Blue variant)        │
│    --color-secondary-container    → #98b8ff                           │
│    --color-secondary-fixed        → #d8e2ff                           │
│    --color-secondary-fixed-dim    → #aec6ff                           │
│    --color-on-secondary           → #ffffff                            │
│    --color-on-secondary-container → #244786                           │
│                                                                       │
│  Tertiary:                                                            │
│    --color-tertiary               → #10b981 (emerald green)           │
│    --color-tertiary-container      → #00301e                           │
│    --color-tertiary-fixed          → #6ffbbe                           │
│    --color-tertiary-fixed-dim      → #4edea3                           │
│    --color-on-tertiary             → #ffffff                            │
│                                                                       │
│  Surface / Background:                                                │
│    --color-background             → #f8f9fa                            │
│    --color-on-background          → #191c1d                            │
│    --color-surface                → #f8f9fa                            │
│    --color-on-surface             → #191c1d                            │
│    --color-surface-variant        → #e1e3e4                            │
│                                                                       │
│  Outline / Error:                                                     │
│    --color-outline                → #75777d                            │
│    --color-outline-variant        → #c5c6cd                            │
│    --color-error                  → #ba1a1a                            │
│    --color-error-container        → #ffdad6                            │
│                                                                       │
│  RGB Variants (for rgba() usage):                                     │
│    --color-surface-rgb            → 248, 249, 250                      │
│    --color-on-surface-rgb         → 25, 28, 29                         │
│    --color-secondary-rgb          → 61, 93, 157                        │
│    --color-tertiary-rgb           → 16, 185, 129                       │
│    --color-error-rgb              → 186, 26, 26                        │
│    --color-primary-rgb            → 9, 20, 38                          │
└──────────────────────────────────────────────────────────────────────┘
```

## Typography Scale

```
┌──────────────────────────────────────────────────────────────────────┐
│  Bootstrap Layer (style-config.scss)                                  │
├──────────────────────────────────────────────────────────────────────┤
│  $font-family-sans-serif: "Roboto", -apple-system, BlinkMacSystemFont│
│  $font-size-base: 1rem (16px)                                        │
│  $h1-font-size: 3rem (48px)                                          │
│  $h2-font-size: 2.25rem (36px)                                       │
│  $h3-font-size: 1.75rem (28px)                                       │
│  $h4-font-size: 1.5rem (24px)                                        │
│  $headings-font-weight: 700                                          │
│  $headings-letter-spacing: -0.02em                                   │
├──────────────────────────────────────────────────────────────────────┤
│  Design Tokens Layer (design-tokens.scss)                             │
├──────────────────────────────────────────────────────────────────────┤
│  Headline LG:    24px / 700 / 32px / -0.02em                         │
│  Headline MD:    20px / 600 / 28px / -0.01em                         │
│  Body LG:        16px / 400 / 24px                                   │
│  Body MD:        14px / 400 / 20px                                   │
│  Label MD:       12px / 600 / 16px / 0.02em                          │
│  Label SM:       11px / 500 / 14px / 0.03em                          │
│                                                                       │
│  Mobile Variants:                                                     │
│  Headline LG Mobile: 20px / 700 / 28px                                │
└──────────────────────────────────────────────────────────────────────┘
```

## Spacing System

```
┌──────────────────────────────────────────────────────────────────────┐
│  Base Unit: 4px                                                       │
├──────────────────────────────────────────────────────────────────────┤
│  --spacing-unit:          4px                                         │
│  --spacing-gutter-xs:     8px   (2 units)                             │
│  --spacing-gutter-md:    16px   (4 units)                             │
│  --spacing-margin-sm:    12px   (3 units)                             │
│  --spacing-margin-lg:    24px   (6 units)                             │
│  --spacing-sidebar-width: 320px                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## Shape System

```
┌──────────────────────────────────────────────────────────────────────┐
│  Bootstrap Layer:                                                     │
│    $border-radius:     0.5rem  (8px)                                  │
│    $border-radius-lg:  1rem    (16px)                                 │
│    $border-radius-xl:  1.5rem  (24px)                                 │
├──────────────────────────────────────────────────────────────────────┤
│  Design Tokens Layer:                                                 │
│    --shape-round-small:    0.25rem  (4px)                             │
│    --shape-round-default:  0.5rem   (8px)                             │
│    --shape-round-medium:   0.75rem  (12px)                            │
│    --shape-round-large:    1rem     (16px)                            │
│    --shape-round-xl:       1.5rem   (24px)                            │
│    --shape-round-full:     9999px   (circle/pill)                     │
└──────────────────────────────────────────────────────────────────────┘
```

## Shadow System

```
┌──────────────────────────────────────────────────────────────────────┐
│  Bootstrap Layer (style-config.scss):                                 │
│    $box-shadow-subtle:    0 10px 30px rgba(0,0,0,0.04)               │
│    $box-shadow-elevated:  0 20px 50px rgba(0,0,0,0.08)               │
├──────────────────────────────────────────────────────────────────────┤
│  Design Tokens Layer (style-config.scss → :root):                     │
│    --jws-shadow-sm:  0 4px 12px rgba(0,0,0,0.05)                     │
│    --jws-shadow-md:  0 10px 30px rgba(0,0,0,0.04)                    │
│    --jws-shadow-lg:  0 20px 50px rgba(0,0,0,0.08)                    │
│                                                                       │
│  Transition:                                                          │
│    --jws-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)           │
└──────────────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

```
┌──────────────────────────────────────────────────────────────────────┐
│  Primary Threshold: 768px (Bootstrap md)                              │
├──────────────────────────────────────────────────────────────────────┤
│  Mobile:    max-width: 767.98px                                       │
│  Desktop:   min-width: 768px                                          │
│                                                                       │
│  Additional Bootstrap breakpoints available:                          │
│    sm:  576px   (small devices)                                       │
│    md:  768px   (tablets)                                             │
│    lg:  992px   (small laptops)                                       │
│    xl:  1200px  (desktops)                                            │
│    xxl: 1400px  (large desktops)                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Usage Pattern

```scss
// In any component:
@use "@/assets/design-tokens.scss" as *;

.component {
  // Colors
  background: var(--color-surface);
  color: var(--color-on-surface);
  border: 1px solid var(--color-outline-variant);

  // Typography
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-label-md);

  // Spacing
  padding: var(--spacing-gutter-md);
  margin: var(--spacing-margin-lg) 0;

  // Shapes
  border-radius: var(--shape-round-xl);

  // Shadows
  box-shadow: var(--jws-shadow-sm);

  // Transitions
  transition: var(--jws-transition);

  // Responsive
  @media (max-width: 767.98px) {
    font-size: var(--font-size-headline-lg-mobile);
  }
}
```
