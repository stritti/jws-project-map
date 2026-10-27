import { describe, expect, it } from "vitest";
import httpClient, { REQUEST_TIMEOUT_MS } from "@/services/api/http.client";

describe("http client", () => {
  it("applies its timeout to every request by default", () => {
    expect(httpClient.defaults.timeout).toBe(REQUEST_TIMEOUT_MS);
  });

  it("hands that timeout to the adapter that actually enforces it", async () => {
    // Axios only aborts a stalled request if the timeout reaches the adapter.
    // A per-request override or a `timeout: 0` would silently disable it, so
    // assert the value the adapter would receive.
    let received: number | undefined;

    await httpClient.get("/probe", {
      adapter: (config) => {
        received = config.timeout;
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        });
      },
    });

    expect(received).toBe(REQUEST_TIMEOUT_MS);
  });
});
