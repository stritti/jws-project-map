# src/services/api/

## Responsibility
HTTP client configuration for all API communication. Creates and exports a pre-configured Axios instance.

## Design
Single file: `http.client.ts`. Creates an Axios instance with:
- `baseURL` from `VITE_APP_NOCODB_URL` env var
- `xc-token` header from `VITE_APP_NOCODB_TOKEN` env var
- Default `Content-Type: application/json`

No interceptors configured — plain transport layer.

## Integration
- Consumed by: all service layer files (`nocodb.service.ts`, `category.service.ts`, `country.service.ts`)
- Environment: requires `VITE_APP_NOCODB_URL` and `VITE_APP_NOCODB_TOKEN` at build time
