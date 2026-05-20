## ADDED Requirements

### Requirement: Focus trap within modal dialogs
All modal dialogs (SearchModal, ProjectGalleryModal, AboutModal) SHALL trap keyboard focus within the modal when open. Tab and Shift+Tab MUST cycle through focusable elements inside the modal only. Focus MUST NOT escape to the background content.

#### Scenario: Tab cycles within modal
- **WHEN** a modal is open and the user presses Tab on the last focusable element
- **THEN** focus moves to the first focusable element inside the modal

#### Scenario: Shift+Tab cycles within modal
- **WHEN** a modal is open and the user presses Shift+Tab on the first focusable element
- **THEN** focus moves to the last focusable element inside the modal

### Requirement: Focus restore on modal close
When a modal dialog closes, focus SHALL return to the element that triggered the modal. This ensures keyboard users can continue navigation from their previous position.

#### Scenario: Focus returns to trigger element
- **WHEN** the user opens a modal from a button and then closes it
- **THEN** focus returns to the button that opened the modal

### Requirement: Escape key closes modals
All modal dialogs SHALL close when the user presses the Escape key. This behavior MUST be consistent across all modals.

#### Scenario: Escape closes search modal
- **WHEN** the SearchModal is open and the user presses Escape
- **THEN** the modal closes and focus returns to the trigger element

#### Scenario: Escape closes gallery modal
- **WHEN** the ProjectGalleryModal is open and the user presses Escape
- **THEN** the modal closes and focus returns to the trigger element

### Requirement: Modal has accessible title and close button
Every modal dialog SHALL have an accessible title (via `aria-labelledby` or `title` prop) and a close button with an `aria-label` that describes the action (e.g., "Close search", "Close gallery"). The close button MUST be the first focusable element or clearly reachable.

#### Scenario: Screen reader announces modal title
- **WHEN** a modal opens
- **THEN** a screen reader announces the modal title

#### Scenario: Close button is accessible
- **WHEN** a screen reader user navigates within a modal
- **THEN** they find a close button with a descriptive label

### Requirement: Background content is inert when modal is open
When a modal is open, the background content SHALL be marked as inert (using `aria-hidden="true"` on the main content wrapper) so that screen readers do not navigate to obscured content.

#### Scenario: Background is hidden from screen readers
- **WHEN** a modal is open
- **THEN** the main content wrapper has `aria-hidden="true"`

#### Scenario: Background is restored when modal closes
- **WHEN** the modal closes
- **THEN** the main content wrapper no longer has `aria-hidden="true"`
