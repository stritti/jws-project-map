## ADDED Requirements

### Requirement: All content images have meaningful alt text
All images that convey information (project teaser images, gallery images, project thumbnails) SHALL have descriptive `alt` text. The alt text SHALL describe the image content or, at minimum, include the project name.

#### Scenario: Project teaser image has alt text
- **WHEN** a project teaser image renders in the search results or list view
- **THEN** the `alt` attribute contains the project name

#### Scenario: Gallery image has alt text
- **WHEN** a project gallery image renders
- **THEN** the `alt` attribute contains the project name and, if available, the image caption

### Requirement: Decorative images and icons are hidden from screen readers
All purely decorative images, icons, and visual embellishments SHALL have `aria-hidden="true"` or `alt=""` (empty alt for `<img>`). This includes: navigation icons, chevron arrows, decorative dividers, and flag icons when accompanied by text.

#### Scenario: Navigation icons are hidden
- **WHEN** a screen reader navigates the main menu
- **THEN** it does not announce the map/list icons (they have `aria-hidden="true"`)

#### Scenario: Flag icons with text labels are hidden
- **WHEN** a screen reader navigates the language switcher
- **THEN** it announces the language name but not the flag icon

### Requirement: Country flags have text alternatives when standalone
When a country flag icon appears without accompanying text (e.g., in compact list views), it SHALL have an `alt` or `aria-label` with the country name.

#### Scenario: Standalone flag announces country
- **WHEN** a country flag renders without text in a compact view
- **THEN** a screen reader announces the country name

### Requirement: Image gallery is keyboard navigable
The project image gallery (ProjectGallery and ProjectGalleryModal) SHALL allow keyboard navigation between images using arrow keys (Left/Right). The current image position SHALL be announced (e.g., "Image 3 of 8").

#### Scenario: Arrow keys navigate gallery
- **WHEN** the gallery modal is open and the user presses Right Arrow
- **THEN** the next image is displayed

#### Scenario: Image position is announced
- **WHEN** the gallery displays image 3 of 8
- **THEN** a screen reader announces "Image 3 of 8"

### Requirement: Broken or missing images have fallback
When an image fails to load or is missing, a fallback placeholder SHALL be displayed with `alt` text indicating the image is unavailable. The fallback SHALL not be announced as an error by screen readers.

#### Scenario: Missing image shows placeholder
- **WHEN** a project teaser image URL returns 404
- **THEN** a placeholder icon is displayed with alt text "Image not available"

### Requirement: Color is not the sole means of conveying information
Information SHALL NOT be conveyed by color alone. Where color is used to indicate state (e.g., project status badges: green=finished, yellow=under construction, blue=planned), the state text label SHALL always be present and readable by screen readers.

#### Scenario: Status badge conveys state via text
- **WHEN** a screen reader encounters a project status badge
- **THEN** it announces the state text (e.g., "Finished", "Under construction") regardless of color
