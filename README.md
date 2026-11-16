# sorare-team-api

Client (Bibliothek + CLI) für die öffentliche [Sorare GraphQL API](https://github.com/sorare/api).

- **Karten abrufen** per Slug (`anyCards`)
- **Alle öffentlichen Karten eines Users** abrufen, inkl. Cursor-Pagination
- **Laufende Auktionen** des Transfermarkts

Kein Login nötig: alle drei Funktionen nutzen nur öffentliche Daten. Für private Daten (eigenes Konto) siehe unten.

## Voraussetzungen

- Node.js >= 18 (`fetch` ist eingebaut, keine npm-Abhängigkeiten)

## Nutzung als CLI

```bash
# Karte(n) per Slug
node src/cli.js card erling-haaland-20000721-2024-limited-1

# Alle öffentlichen Karten eines Users
node src/cli.js user soraredata

# Letzte 10 Live-Auktionen
node src/cli.js auctions 10
```

## Nutzung als Bibliothek

```js
import { SorareClient } from "./src/sorare.js";

const client = new SorareClient({ apiKey: process.env.SORARE_API_KEY });

const cards = await client.getCardsBySlugs(["erling-haaland-20000721-2024-limited-1"]);
const userCards = await client.getUserCards("soraredata");
const auctions = await client.getLiveAuctions(10);
```

## Optionale Konfiguration (Umgebungsvariablen)

| Variable | Bedeutung |
| --- | --- |
| `SORARE_API_KEY` | API-Key von [sorare.com/settings/developer](https://sorare.com/settings/developer), erhöht die Rate-Limits (20 -> 200 Anfragen/Min.) |
| `SORARE_JWT_TOKEN` | JWT-Token für authentifizierte Calls (60 Anfragen/Min.) |
| `SORARE_JWT_AUD` | Der `aud`-Wert, mit dem das JWT ausgestellt wurde |

## Rate-Limits (ohne API-Key)

- Ohne Auth: 20 Calls/Minute, Complexity-Limit 500
- Mit JWT/OAuth: 60 Calls/Minute
- Mit API-Key: 200 Calls/Minute

Bei 429 liefert die API einen `Retry-After`-Header; der Client wirft in dem Fall einen passenden Fehler.

## Private Daten (eigenes Konto)

Dafür ist ein Login per `signIn`-Mutation nötig (E-Mail + bcrypt-gehashtes Passwort, JWT, ggf. 2FA). Details: [offizielle Sorare-API-Doku](https://github.com/sorare/api#user-authentication).

## Links

- GraphQL Playground: https://api.sorare.com/graphql/playground
- Offizielle Doku: https://github.com/sorare/api
