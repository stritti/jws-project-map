## ADDED Requirements

### Requirement: HTML lang attribute tracks active locale
The `<html>` element SHALL have a `lang` attribute that reflects the current i18n locale (de, en, or fr). The attribute MUST update whenever the user switches languages.

#### Scenario: Initial page load
- **WHEN** the application loads with default locale "de"
- **THEN** the `<html>` element has `lang="de"`

#### Scenario: Language switch
- **WHEN** the user switches from German to English via the language switcher
- **THEN** the `<html>` element updates to `lang="en"`

### Requirement: Page title updates on route navigation
The document `<title>` SHALL update on every route change to reflect the current view and context. The title format MUST be: `[View Name] — JWS Project Map` for top-level views, and `[Project Name] — JWS Project Map` for project detail views.

#### Scenario: Navigate to home view
- **WHEN** the user navigates to the home route `/`
- **THEN** the document title is "Home — JWS Project Map" (or localized equivalent)

#### Scenario: Navigate to project detail
- **WHEN** the user navigates to a project detail page for "Project Alpha"
- **THEN** the document title is "Project Alpha — JWS Project Map"

### Requirement: ARIA landmarks define page structure
The application SHALL use ARIA landmark roles to define the page structure: `banner` for the header area, `navigation` for the main menu, `main` for the primary content, `complementary` for side panels (filter panel), and `contentinfo` for the footer.

#### Scenario: Screen reader navigation via landmarks
- **WHEN** a screen reader user navigates by landmarks
- **THEN** they can identify and jump to banner, navigation, main, complementary, and contentinfo regions

### Requirement: Global focus-visible styles for keyboard navigation
All interactive elements (links, buttons, inputs, checkboxes, router-links) SHALL display a visible focus indicator when focused via keyboard. The focus indicator MUST NOT appear on mouse click. The focus ring MUST meet a minimum contrast ratio of 3:1 against the background.

#### Scenario: Tab navigation shows focus ring
- **WHEN** a keyboard user presses Tab to move focus to a button
- **THEN** a visible focus ring appears around the button

#### Scenario: Mouse click does not show focus ring
- **WHEN** a mouse user clicks a button
- **THEN** no focus ring is visible (only the button's active/hover state)

### Requirement: Heading hierarchy is consistent across views
Each view SHALL have exactly one `<h1>` element as the page heading. Subsections SHALL use `<h2>`, and sub-subsections SHALL use `<h3>`. Heading levels SHALL NOT be skipped (e.g., h1 → h3 without h2 is not allowed).

#### Scenario: Home view heading structure
- **WHEN** the home view renders
- **THEN** it contains one `<h1>` for the page title and `<h2>` elements for section headings

#### Scenario: Project detail view heading structure
- **WHEN** a project detail view renders
- **THEN** the project name is an `<h1>`, and sections like "Description", "Gallery", "Links" are `<h2>` elements

### Requirement: Screen reader announcements for dynamic state changes
The application SHALL announce significant state changes to screen readers via `aria-live` regions. This includes: loading completion, filter result count changes, and navigation confirmations. Announcements MUST use `aria-live="polite"` to avoid interrupting current speech.

#### Scenario: Filter results update announcement
- **WHEN** the user changes a filter and the result count changes
- **THEN** a screen reader announces the new result count (e.g., "12 results found")

#### Scenario: Loading completion announcement
- **WHEN** project data finishes loading after initial page load
- **THEN** a screen reader announces "Projects loaded" (or localized equivalent)
