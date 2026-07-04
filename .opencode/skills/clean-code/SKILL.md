---
name: clean-code
description: >-
  Clean Code principles, linting rules, and code review checklist for the JWS
  Project Map app. Use when reviewing code quality, suggesting refactorings, or
  implementing new features to ensure they meet Clean Code standards.
---

# Clean Code Skill — JWS Project Map

This skill defines **Clean Code standards** for this project. Use it as a
checklist during development and code review to catch common violations early.
Based on *Clean Code: A Handbook of Agile Software Craftsmanship* (Robert C.
Martin) adapted for this Vue 3 + TypeScript + Pinia stack.

---

## 🔴 Must-Fix (Blocking)

Violations in this category **must** be addressed before a PR is considered
review-ready.

### 1. DRY (Don't Repeat Yourself)

- **No duplicated logic** across stores, services, composables, or views.
- **Checklist:**
  - [ ] Same helper function defined in >1 file? → Extract to `src/utils/`.
  - [ ] Same computed / method logic in >1 component? → Extract to composable.
  - [ ] Same filter logic in HomeView and ProjectListView? → Use `useSearchFilters()`.
  - [ ] Same `currentLocale()` pattern? → Import from `src/utils/locale.ts`.

### 2. No Magic Strings

- All domain values **must** be defined as constants.
- **Project state values** (`"finished"`, `"planned"`, `"under construction"`)
  → use `PROJECT_STATES.*` from `src/constants/projectStates.ts`.
- **Route names** → use the router's named routes, not path strings.
- **Checklist:**
  - [ ] Every string literal that represents a domain concept is a constant.
  - [ ] `PROJECT_STATES.FINISHED` not `"finished"`.
  - [ ] No hardcoded locale keys like `"Name (de)"` — use helpers.

### 3. Type Safety (No `any`)

- `any` is only allowed as a last resort with an eslint-disable comment AND
  a justification.
- **Checklist:**
  - [ ] No `any` in function parameters or return types.
  - [ ] No `Record<string, unknown>` where a proper interface exists.
  - [ ] `removeFilter(filter: any)` → `removeFilter(filter: FilterChip)`.
  - [ ] No `as any` casts — prefer type guards or proper accessor functions.

### 4. Error Handling (No Silent Failures)

- Errors must be logged AND surfaced (throw, return error state, or set
  component error data).
- **Checklist:**
  - [ ] `catch` blocks do more than `console.error` — they propagate or handle.
  - [ ] Pinia stores only set `initialized = true` AFTER successful API call.
  - [ ] API services (`NocoDBService.list`) rethrow errors, not return `[]`.
  - [ ] Loading states are cleaned up in `finally` blocks, not only on success.

---

## 🟡 Should-Fix (Strongly Recommended)

These patterns degrade maintainability and should be fixed opportunistically.

### 5. Single Responsibility Principle (SRP)

- Functions and components should do **one thing**.
- **Checklist:**
  - [ ] Component > 300 lines? → Extract child components or composables.
  - [ ] Function > 30 lines? → Extract helper functions.
  - [ ] `processProjectData()` does field resolution, validation, locale
        field access, and notes sanitization → split into smaller functions.
  - [ ] A Pinia store action should only orchestrate; delegate transforms to
        service layer.

### 6. Consistent API Style

- All components must use the **same API style**.
- **Checklist:**
  - [ ] `<script setup lang="ts">` everywhere (no Options API / `defineComponent`).
  - [ ] Pinia stores consistent: either Options API (`defineStore('x', { ... })`)
        or Setup syntax (`defineStore('x', () => { ... })`), not both.
  - [ ] Naming: prefer `filter()` over `doFilter()`, `filterByState()` over `doStateFilter()`.
  - [ ] Consistent comment language (English only).

### 7. Function Naming

- Function names must reveal intent.
- **Checklist:**
  - [ ] Boolean-returning functions start with `is`, `has`, `should`, `can`.
  - [ ] Side-effect functions use verbs (`load`, `save`, `remove`, `navigate`).
  - [ ] No redundant prefixes like `doFilter` (just `filter`).
  - [ ] `postMessage` → rename to `sendToParent` / `postToParent` to avoid
        shadowing `window.postMessage`.

### 8. Defensive Programming

- Functions must handle edge cases gracefully.
- **Checklist:**
  - [ ] `parseProjectId()` returns `NaN` for `"abc"` → return `null` and
        handle the `null` upstream.
  - [ ] Array access before `.length` / `.forEach` check.
  - [ ] `?.` optional chaining for nullable nested access.
  - [ ] Fallback values for all optional environment variables.

---

## 🟢 Nice-to-Have (When Touching the File)

Apply these when you're already modifying a file.

### 9. Small Functions

- The shorter a function, the easier to test and reason about.
- **Target:** most functions < 20 lines; no function > 50 lines.
- Extract early-exit guards (arrow pattern) to flatten nesting.

### 10. Favour Interfaces over Inline Types

- Define reusable interfaces in `src/interfaces/` or at the top of the file
  if used only there.
- Inline anonymous types like `{ id: string; type: string; name: string; value: any; category: string }[]`
  → extract to named interface.

### 11. Null vs Undefined Convention

- **`null`** = intentionally absent (set by business logic).
- **`undefined`** = not yet set / missing (should be handled by the caller).
- `Project.country` → `LinkedRecord | null` (not `| undefined`).
- `Project.notes` → always `string`, default `""`.

### 12. Comments

- Comments should explain **why**, not **what**.
- Delete commented-out code.
- Keep comments in English.

---

## 🔧 Project-Specific Reference

### Constants

```typescript
// src/constants/projectStates.ts
PROJECT_STATES.FINISHED               // "finished"
PROJECT_STATES.PLANNED                // "planned"
PROJECT_STATES.UNDER_CONSTRUCTION     // "under construction"
normaliseProjectState(raw: string)    // normalises NocoDB raw values
```

### Utilities

```typescript
// src/utils/locale.ts
currentLocale(): Locale               // current i18n locale ("de"|"en"|"fr")

// src/utils/slug.ts
slugify(text): string                 // "Hello World" → "hello-world"
projectRoute(project): string         // project {id, name} → "/project/slug-42"
parseProjectId(raw): number | null    // "slug-42" → 42 (returns null on invalid)
```

### Composable

```typescript
// src/composables/useSearchFilters.ts
useSearchFilters(searchQueryRef?) → {
  stateOptions, categoryList, countryList,
  activeFilters, activeFiltersCount,
  stateFilter, categoryFilter, countryFilter, filterVisible,
  removeFilter, clearAllFilters, handleStateFilterChange,
}

// FilterChip interface
interface FilterChip {
  id: string;
  type: string;
  name: string;
  value: string | number;
  category: "state" | "category" | "country";
}
```

### Store Pattern

```typescript
// ✅ Correct error handling
async load(): Promise<void> {
  if (this.initialized) return;
  try {
    const data = await service.getAll();
    this.items = data;
    this.initialized = true;       // only on success
  } catch (error) {
    console.error("load failed:", error);
    // Do NOT set initialized = true — permits retry
  }
}
```

---

## 📋 PR Review Checklist

Before approving a PR, verify:

- [ ] **DRY**: No duplicated helpers or logic (check `currentLocale`, filter views).
- [ ] **Magic Strings**: All domain strings use constants (`PROJECT_STATES.*`).
- [ ] **Type Safety**: No `any`, no `as any`, no `Record<string, unknown>` where avoidable.
- [ ] **Error Handling**: `catch` blocks propagate or handle; stores set `initialized` post-success.
- [ ] **Consistency**: `<script setup>` everywhere, consistent naming, English comments.
- [ ] **Defensive**: `parseProjectId` handles `NaN`, array bounds checked, optional chaining used.
- [ ] **Naming**: Functions reveal intent, no redundant prefixes.
- [ ] **Small Functions**: <50 lines, ideally <20 lines.
- [ ] **No Dead Code**: No commented-out code, no unused imports/variables.
- [ ] **Null Convention**: `null` = intentional absence, `undefined` = not yet set.
