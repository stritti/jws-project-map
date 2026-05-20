## ADDED Requirements

### Requirement: Skip-to-map link for keyboard users
The home view SHALL provide a "Skip to Map" link that appears when focused via keyboard (similar to the existing skip-to-content link). Activating this link SHALL move focus to the map container.

#### Scenario: Skip-to-map link appears on Tab
- **WHEN** a keyboard user presses Tab from the skip-to-content link
- **THEN** the "Skip to Map" link becomes visible

#### Scenario: Skip-to-map focuses map container
- **WHEN** the user activates the "Skip to Map" link
- **THEN** focus moves to the Leaflet map container

### Requirement: Map container is keyboard-focusable
The Leaflet map container SHALL have `tabindex="0"` so it can receive keyboard focus. When focused, the map SHALL display a visible focus indicator.

#### Scenario: Map receives focus via Tab
- **WHEN** a keyboard user tabs to the map container
- **THEN** the map container receives focus and shows a focus ring

### Requirement: Keyboard instructions for map interaction
When the map container receives focus, a brief instruction SHALL be announced to screen readers explaining that arrow keys pan the map and +/- keys zoom (if supported), or that the project list provides an accessible alternative.

#### Scenario: Map focus announces instructions
- **WHEN** the map container receives focus
- **THEN** a screen reader announces "Map: Use arrow keys to pan, plus and minus to zoom. Or press Tab to skip to the project list."

### Requirement: Accessible map controls
Any overlay controls on the map (zoom buttons, layer toggles, project markers) SHALL be implemented as focusable `<button>` elements with descriptive `aria-label` attributes. Icon-only buttons MUST have `aria-label` or `aria-labelledby`.

#### Scenario: Zoom buttons are accessible
- **WHEN** a keyboard user navigates to map zoom controls
- **THEN** each zoom button has a descriptive label (e.g., "Zoom in", "Zoom out")

#### Scenario: Project markers on map are accessible
- **WHEN** a screen reader navigates map markers
- **THEN** each marker announces the project name and category

### Requirement: Project list as accessible map alternative
The project list view SHALL provide a complete, keyboard-accessible alternative to the map for discovering and navigating to projects. Each project list item SHALL be a focusable element with the project name, category, and country announced by screen readers.

#### Scenario: List items are keyboard navigable
- **WHEN** a keyboard user tabs through the project list
- **THEN** each project item receives focus and announces its name, category, and country
