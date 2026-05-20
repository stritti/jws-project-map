## ADDED Requirements

### Requirement: FilterPanel checkbox groups have accessible labels
Each checkbox group in the FilterPanel (status, categories, countries) SHALL have an associated label that is programmatically linked via `aria-labelledby` or `fieldset`/`legend`. The group title (e.g., "Status", "Categories") SHALL serve as the label.

#### Scenario: Status group has accessible label
- **WHEN** a screen reader navigates to the status checkbox group
- **THEN** it announces "Status" as the group label before reading individual checkboxes

#### Scenario: Category group has accessible label
- **WHEN** a screen reader navigates to the categories checkbox group
- **THEN** it announces "Categories" as the group label

### Requirement: Individual checkboxes have descriptive labels
Each checkbox SHALL have a label that is programmatically associated via the `for`/`id` attribute pair or by wrapping the label text. The label text SHALL include the option name and, where applicable, the current selection state.

#### Scenario: Checkbox label is announced
- **WHEN** a screen reader focuses a checkbox in the filter panel
- **THEN** it announces the checkbox label (e.g., "Finished, unchecked")

### Requirement: SearchBar input has accessible label
The search input in SearchBar SHALL have an associated `<label>` element (visually hidden if needed) or `aria-label` attribute that describes the input's purpose.

#### Scenario: Search input has label
- **WHEN** a screen reader focuses the search input
- **THEN** it announces "Search projects" (or localized equivalent)

### Requirement: Filter result count is announced live
When filters change and the result count updates, the new count SHALL be announced via an `aria-live="polite"` region. The announcement format SHALL be: "[N] results found" (localized).

#### Scenario: Filter change announces new count
- **WHEN** the user selects a category filter and results update to 8 items
- **THEN** a screen reader announces "8 results found"

### Requirement: FilterPanel close button is accessible
The close button in FilterPanel SHALL have an `aria-label` with the localized "Close" text. It SHALL be reachable via keyboard as the first or last focusable element in the panel.

#### Scenario: Close button is labeled and reachable
- **WHEN** a keyboard user opens the filter panel
- **THEN** they can reach the close button via Tab and it announces "Close"

### Requirement: Form inputs have visible focus indicators
All form inputs (search input, checkboxes) SHALL display a visible focus indicator when focused via keyboard, consistent with the global focus-visible styles defined in a11y-core.

#### Scenario: Search input shows focus ring
- **WHEN** a keyboard user focuses the search input
- **THEN** a visible focus ring appears around the input
