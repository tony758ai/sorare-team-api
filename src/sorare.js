// Sorare GraphQL API client (public data).
// Docs: https://github.com/sorare/api · Playground: https://api.sorare.com/graphql/playground

const SORARE_GRAPHQL_URL = "https://api.sorare.com/graphql";

class SorareClient {
  constructor({ apiKey, token, jwtAud, endpoint = SORARE_GRAPHQL_URL } = {}) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.token = token;
    this.jwtAud = jwtAud;
  }

  async request(query, variables = {}) {
    const headers = { "content-type": "application/json" };
    if (this.apiKey) headers["APIKEY"] = this.apiKey;
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
      if (this.jwtAud) headers["JWT-AUD"] = this.jwtAud;
    }

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get("retry-after") ?? "unknown";
      throw new Error(`Rate limit exceeded (429). Retry after ${retryAfter}s.`);
    }
    if (!res.ok) throw new Error(`Sorare API error: HTTP ${res.status}`);

    const body = await res.json();
    if (body.errors?.length) {
      throw new Error("GraphQL errors: " + body.errors.map((e) => e.message).join("; "));
    }
    return body.data;
  }

  /** Fetch cards by their slugs, e.g. ["erling-haaland-20000721-2024-limited-1"] */
  async getCardsBySlugs(slugs) {
    const data = await this.request(
      `query GetCardsBySlugs($slugs: [String!]) {
         anyCards(slugs: $slugs) {
           assetId
           slug
           name
           rarityTyped
           seasonYear
           serialNumber
           anyPositions
           anyTeam { name }
           anyPlayer { displayName }
         }
       }`,
      { slugs }
    );
    return data.anyCards;
  }

  /** Fetch all cards of a user (public collection), with cursor pagination. */
  async getUserCards(slug, { limit = Infinity } = {}) {
    const cards = [];
    let cursor = null;
    while (cards.length < limit) {
      const data = await this.request(
        `query UserCards($slug: String!, $cursor: String) {
           user(slug: $slug) {
             paginatedCards(after: $cursor) {
               nodes {
                 assetId
                 slug
                 name
                 rarityTyped
                 seasonYear
                 serialNumber
                 anyPositions
                 anyTeam { name }
                 anyPlayer { displayName }
               }
               pageInfo { endCursor hasNextPage }
             }
           }
         }`,
        { slug, cursor }
      );
      const page = data?.user?.paginatedCards;
      if (!page) break;
      cards.push(...page.nodes);
      const { endCursor, hasNextPage } = page.pageInfo;
      if (!hasNextPage || !endCursor) break;
      cursor = endCursor;
    }
    return cards;
  }

  /** Latest live auctions on the transfer market. */
  async getLiveAuctions(last = 10) {
    const data = await this.request(
      `query ListLastEnglishAuctions($last: Int) {
         tokens {
           liveAuctions(last: $last) {
             nodes {
               slug
               currentPrice
               endDate
               minNextBid
               anyCards {
                 slug
                 name
                 rarityTyped
                 seasonYear
                 serialNumber
                 anyPlayer { displayName }
               }
             }
           }
         }
       }`,
      { last }
    );
    return data?.tokens?.liveAuctions?.nodes ?? [];
  }
}

export { SorareClient, SORARE_GRAPHQL_URL };
