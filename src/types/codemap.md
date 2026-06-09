# src/types/

## Responsibility
Ambient type declarations for third-party modules without TypeScript definitions.

## Design
Single file: `idle-callback.d.ts`. Declares `requestIdleCallback` types for browsers/environments that don't have it in their standard lib.

## Integration
- Referenced by: `tsconfig.json` (included via `include` array)
- No runtime imports — purely ambient type augmentation
