interface GqlError {
  extensions?: { contentful?: { code?: string } };
}

export interface ContentfulClient {
  query<T>(query: string, variables?: Record<string, unknown>): Promise<T>;
}

export interface ContentfulClientOptions {
  spaceId: string;
  accessToken: string;
  fetch?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
  random?: () => number;
}

const MAX_RETRIES = 6;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

const defaultSleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export function createContentfulClient({
  spaceId,
  accessToken,
  fetch: fetchImpl = fetch,
  sleep = defaultSleep,
  random = Math.random,
}: ContentfulClientOptions): ContentfulClient {
  if (!spaceId || !accessToken) {
    throw new Error("CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN must be set");
  }

  const url = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`;

  async function fetchWithRetry(body: string): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body,
        next: { tags: ["contentful"] },
      });
      if (
        response.ok ||
        !RETRYABLE_STATUSES.has(response.status) ||
        attempt >= MAX_RETRIES
      ) {
        return response;
      }

      const retryAfter = Number(response.headers.get("retry-after"));
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1_000
        : Math.min(2 ** attempt * 500, 15_000);
      await sleep(backoff + random() * 250);
    }
  }

  return {
    async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
      const response = await fetchWithRetry(JSON.stringify({ query, variables }));
      if (!response.ok) {
        throw new Error(`Contentful GraphQL error: ${response.status}`);
      }

      const { data, errors } = (await response.json()) as {
        data: T;
        errors?: GqlError[];
      };
      const fatalErrors = errors?.filter(
        (error) => error.extensions?.contentful?.code !== "UNRESOLVABLE_LINK",
      );
      if (fatalErrors?.length) {
        throw new Error(`GraphQL errors: ${JSON.stringify(fatalErrors)}`);
      }
      return data;
    },
  };
}
