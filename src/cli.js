#!/usr/bin/env node
// CLI: node src/cli.js <command> [args]
// Commands:
//   card <slug> [slug2 ...]   Fetch card(s) by slug
//   user <userSlug>           List all public cards of a user
//   auctions [count]          Latest live auctions (default 10)
import { SorareClient } from "./sorare.js";

const args = process.argv.slice(2);
const [command, ...rest] = args;

function print(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

async function main() {
  const client = new SorareClient({
    apiKey: process.env.SORARE_API_KEY, // optional, raises rate limits
    token: process.env.SORARE_JWT_TOKEN, // optional, for private data later
    jwtAud: process.env.SORARE_JWT_AUD,
  });

  switch (command) {
    case "card": {
      if (!rest.length) throw new Error("Usage: card <slug> [slug2 ...]");
      print(await client.getCardsBySlugs(rest));
      break;
    }
    case "user": {
      if (!rest[0]) throw new Error("Usage: user <userSlug>");
      print(await client.getUserCards(rest[0]));
      break;
    }
    case "auctions": {
      print(await client.getLiveAuctions(Number(rest[0]) || 10));
      break;
    }
    default:
      console.log(`sorare-team-api CLI

Usage:
  node src/cli.js card <slug> [slug2 ...]   Fetch card(s) by slug
  node src/cli.js user <userSlug>          All public cards of a user
  node src/cli.js auctions [count]         Latest live auctions

Optional environment variables:
  SORARE_API_KEY    API key from sorare.com/settings/developer (higher rate limits)
  SORARE_JWT_TOKEN  JWT token for authenticated calls
  SORARE_JWT_AUD    The "aud" value used when the JWT was issued`);
      process.exitCode = command ? 1 : 0;
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
