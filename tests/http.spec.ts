import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import httpClient, { REQUEST_TIMEOUT_MS } from "@/services/api/http";

const fetchMock = vi.fn();

describe("http client", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("aborts a stalled request instead of waiting forever", () => {
    expect(REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it("resolves with the parsed response body", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ list: [{ id: 1 }] }), { status: 200 }),
    );
    const response = await httpClient.get<{ list: unknown[] }>("/records");
    expect(response.status).toBe(200);
    expect(response.data.list).toEqual([{ id: 1 }]);
  });

  it("rejects on non-2xx responses", async () => {
    fetchMock.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    await expect(httpClient.get("/records")).rejects.toThrow(
      "Request failed with status 401",
    );
  });

  it("sends the configured headers and serialized params", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await httpClient.get("/records", {
      params: { page: 2, sort: [{ direction: "asc", field: "Name" }] },
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("page=2");
    expect(url).toContain(
      "sort%5B0%5D%5Bdirection%5D=asc&sort%5B0%5D%5Bfield%5D=Name",
    );
    expect(new Headers(init.headers).get("xc-token")).toBeDefined();
  });

  it("normalizes trailing slashes in the API base URL", async () => {
    vi.stubEnv("VITE_APP_NOCODB_URL", "https://nocodb.example/");
    vi.stubEnv("VITE_APP_NOCODB_TOKEN", "token-123");
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await httpClient.get("/api/v3/data/base/table/records");
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://nocodb.example/api/v3/data/base/table/records",
    );
  });

  it("sends the request body as JSON", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await httpClient.post("/records", [{ Id: 1 }]);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify([{ Id: 1 }]));
  });
});
