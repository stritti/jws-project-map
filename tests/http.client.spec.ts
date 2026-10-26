import { describe, expect, it } from "vitest";
import httpClient, { REQUEST_TIMEOUT_MS } from "@/services/api/http.client";

describe("http client", () => {
  it("aborts a stalled request instead of waiting forever", () => {
    expect(REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
    expect(httpClient.defaults.timeout).toBe(REQUEST_TIMEOUT_MS);
  });
});
