---
name: Precision Map Logic
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#45474c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#3c5d9d'
  on-secondary: '#ffffff'
  secondary-container: '#98b8ff'
  on-secondary-container: '#244786'
  tertiary: '#00190e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00301e'
  on-tertiary-container: '#00a472'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#aec6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#214584'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter-xs: 8px
  gutter-md: 16px
  margin-sm: 12px
  margin-lg: 24px
  sidebar-width: 320px
---

## Brand & Style

This design system is engineered for professional geospatial utility, emphasizing clarity, structural integrity, and executive aesthetics. The brand personality is authoritative yet accessible, designed to transform complex project data into an intuitive visual narrative. 

The aesthetic follows a **Corporate Modern** approach. It prioritizes high information density without sacrificing whitespace, ensuring that even when embedded in constrained iFrame environments, the interface remains breathable. Key stylistic hallmarks include meticulous alignment, a restrained color palette, and subtle depth cues that guide the user's focus toward the map and its interactive layers.

## Colors

The palette is anchored by a professional Slate primary color, providing a sophisticated foundation for navigational elements and typography. The secondary color, a Corporate Blue derived from the brand profile, is reserved for interactive states and primary markers to maintain visual continuity with the existing brand.

A Tertiary Emerald (#10b981) is introduced specifically for "Success" states and "Active" project markers, offering a vibrant contrast to the deep blue base. The neutral background ensures the map remains the focal point, while the high-contrast slate text guarantees legibility in small-scale viewing contexts like sidebars.

## Typography

This design system utilizes **Inter** for its exceptional performance in UI environments. The typeface's tall x-height and open counters ensure that project names and coordinates remain legible even at the smallest label sizes.

The hierarchy is intentionally compact to accommodate iFrame constraints. Letter spacing is slightly tightened on headlines for a more "locked-in" professional feel and slightly loosened on labels to prevent characters from blurring on lower-resolution map overlays.

## Layout & Spacing

The system employs a **Fluid Grid** with a strict 8px rhythmic scale. For iFrame and sidebar implementations, the layout utilizes a "Stack" model where project cards and filters are vertically oriented to maximize the horizontal map area. 

On mobile and full-screen views, the layout shifts to a "Drawer" model. The project cards transition from fixed sidebar elements to floating bottom sheets or full-screen overlays depending on the depth of information. All interactive elements maintain a minimum 44px hit target, regardless of their visual size, to ensure accessibility on touch devices.

## Elevation & Depth

Visual hierarchy is established using **Tonal Layers** supplemented by **Ambient Shadows**. 

1.  **Level 0 (Base):** The map canvas itself.
2.  **Level 1 (Sub-surface):** Floating search bars and map controls use a subtle 1px border (#e2e8f0) and a soft, low-opacity shadow to appear separate from the map.
3.  **Level 2 (Active Surface):** Selected project cards or expanded filters use a more pronounced shadow with a 12% opacity of the Primary color to create a "lifted" effect.
4.  **Level 3 (Overlay):** Modals and full-screen mobile menus use a backdrop blur (12px) to maintain the context of the map while focusing user attention on specific data.

## Shapes

The shape language is consistently **Rounded**, using an 8px (0.5rem) radius as the standard for buttons, input fields, and markers. This softens the "industrial" feel of map data, making the application feel modern and user-friendly.

Larger containers, such as project detail cards and search panels, utilize a 12px or 16px radius (`rounded-lg` or `rounded-xl`) to clearly differentiate them from smaller interactive UI components.

## Components

### Map Markers
Markers should be designed as "Pins" with a circular core. Use the Primary color for standard pins and the Secondary or Tertiary color for "Selected" or "Featured" projects. Markers must include a 2px white halo to ensure visibility against varied map terrains.

### Project Cards
Cards feature a high-contrast title in `headline-md` and a metadata row using `label-sm`. Images should have an 8px corner radius. Include a "Quick Action" footer with icon buttons for "Directions" and "Details."

### Search & Filters
The search bar is a single persistent unit with an integrated filter icon. When tapped, filters should expand as a horizontal scroll of chips (Selected: Secondary Color; Unselected: Neutral Color with 1px border).

### Buttons & CTAs
Primary buttons use the Secondary color with white text. Secondary buttons are "Ghost" style (transparent background, 1px border in Primary Slate). All buttons use `label-md` for text to maintain a crisp, professional appearance.

### Progress Indicators
For projects in development, use a thin linear progress bar at the bottom of the card using the Tertiary Emerald color to denote completion status.