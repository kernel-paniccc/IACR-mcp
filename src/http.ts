const USER_AGENT = "iacr-mcp/0.1 (+https://eprint.iacr.org/)";

export class IacrHttpClient {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async text(url: URL | string, accept = "text/html"): Promise<string> {
    const response = await this.fetchFn(url, {
      headers: { accept, "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw new Error(`IACR request failed (${response.status} ${response.statusText})`);
    }
    return response.text();
  }
}
