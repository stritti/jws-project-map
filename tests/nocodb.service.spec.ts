import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const httpClientGet = vi.fn();

vi.mock("@/services/api/http.client", () => ({
  default: { get: (...args: unknown[]) => httpClientGet(...args) },
}));

import { NocoDBService } from "@/services/nocodb.service";

describe("NocoDBService.list", () => {
  beforeEach(() => {
    httpClientGet.mockReset();
    vi.stubEnv("VITE_APP_NOCODB_BASE_ID", "base-123");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns list for list-shaped responses", async () => {
    httpClientGet.mockResolvedValue({ data: { list: [{ id: 1 }] } });
    const service = new NocoDBService("table-1");
    const result = await service.list();
    expect(result.list).toEqual([{ id: 1 }]);
  });

  it("returns list for records-shaped responses", async () => {
    httpClientGet.mockResolvedValue({ data: { records: [{ id: 2 }] } });
    const service = new NocoDBService("table-1");
    const result = await service.list();
    expect(result.list).toEqual([{ id: 2 }]);
  });

  it("returns empty list for unexpected response structures", async () => {
    httpClientGet.mockResolvedValue({ data: { unexpected: true } });
    const service = new NocoDBService("table-1");
    const result = await service.list();
    expect(result.list).toEqual([]);
  });

  it("propagates errors instead of swallowing them", async () => {
    httpClientGet.mockRejectedValue(new Error("network down"));
    const service = new NocoDBService("table-1");
    await expect(service.list()).rejects.toThrow("network down");
  });
});
