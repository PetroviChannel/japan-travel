# Shared budget on two phones

The static website keeps working locally without Supabase. This optional database lets two phones share purchase status, amounts, promo codes, notes, and booking links. It uses PostgreSQL and REST RPCs; no paid add-on or separate server is required.

## Set up

1. Create a Supabase project and open its **SQL Editor**. Run the entire [`schema.sql`](./schema.sql) as the default `postgres` role. The script can be reapplied without deleting rooms.
2. Keep the **Data API** enabled with `public` exposed. **Do not expose `trip_private`.** Do not add table policies or client table grants; access is through the three RPCs.
3. Copy the project URL and **publishable key** (`sb_publishable_…`) from the project connection/API key settings into the website's shared-budget setup. The URL and publishable key may appear in the public site. Never use an `sb_secret_…` or `service_role` key in the browser, repository, or GitHub Pages build.
4. Create a shared room on the first phone. The browser generates 32 random bytes using `crypto.getRandomValues` and encodes them as 64 hexadecimal characters. Adopt the returned purchase snapshot. Creation preserves valid past purchase timestamps, including `0` for untouched rows; it uses server time for missing timestamps and caps future timestamps at server time.
5. Open the resulting invitation link on the second phone. The room secret belongs in the URL **fragment** and local browser storage, never the path, query string, source code, or build configuration. Anyone with the full invitation can read and edit this budget.

For a single private trip, you can disable new room creation after the first room exists:

```sql
revoke execute on function public.trip_create(text, jsonb) from anon, authenticated;
```

Existing room reads and saves continue working. To create another room later, rerun `schema.sql` or explicitly regrant that function.

## REST contract

Always use HTTPS **POST** to `${SUPABASE_URL}/rest/v1/rpc/<function>`, with `Content-Type: application/json` and `apikey: <publishable key>`. A publishable key is not a JWT: do not put it in `Authorization: Bearer`. These calls do not require a Supabase user account or sign-in. The room secret is sent only in the POST body.

| RPC | JSON arguments | Result |
| --- | --- | --- |
| `trip_create` | `{p_secret, p_purchases}` | `{room, revision, purchases}` |
| `trip_read` | `{p_room, p_secret}` | `{room, revision, purchases}` |
| `trip_save` | `{p_room, p_secret, p_purchase, p_expected_updated_at}` | `{room, revision, purchases, conflict}` |

`p_purchases` and returned `purchases` are objects keyed by purchase ID. Each purchase has `id`, `paid`, `plan`, `actual`, `coupon`, `note`, `customUrl`, and `updatedAt`. The first room revision is `1`.

To save an existing purchase, pass its `updatedAt` from the last server snapshot as `p_expected_updated_at`. For a missing purchase, pass `0`. A successful save changes only that purchase and returns `conflict: false`. A stale edit returns `conflict: true` with the authoritative snapshot and makes **no write**. Preserve the user's draft, show the newer values, and let them reapply deliberately; never silently retry a stale draft over the new snapshot. A failed network response may arrive after a committed save: read the room before deciding whether to retry.

Use the returned snapshot's `updatedAt` for every subsequent comparison. Room creation accepts historical timestamps only as bootstrap versions: an explicit integer from `0` through server time is preserved, a future integer is capped at server time, and a missing timestamp becomes server time. Every subsequent `trip_save` ignores the purchase's input timestamp and assigns a strictly increasing server timestamp. Revisions increase per successful save. Row locks merge simultaneous edits to different purchases; simultaneous edits to the same purchase require resolving the conflict.

Preserving bootstrap history lets a real backup restore an untouched row (`updatedAt: 0`) even if the backup predates room creation. It also keeps a newer historical backup eligible when the first phone seeds an older local edit. The client still compares backup and current timestamps, then sends the current server version as `p_expected_updated_at`; the save rejects a change made by the other phone after that comparison. A successful restore receives a new server timestamp.

Bootstrap timestamps are supplied by the room creator, so they indicate claimed edit history rather than verified chronology. A wrong phone clock can affect automatic backup selection, and SQL cannot verify that a row marked `0` matches the app's default values. There is no change to secret-based access or save conflict checks. Reapplying this script does **not** retimestamp existing rooms: rooms created by the earlier all-server-time version keep those values because their original history cannot be inferred safely. For those rooms, restore into local state before creating a replacement room, or deliberately reapply individual purchases through the normal editor.

## Limits and storage

- Maximum 300 purchases and 1 MiB of normalized JSON per room; maximum 16 KiB of input JSON per purchase.
- IDs: 1–128 ASCII letters/digits plus `.`, `_`, `:`, `-`, beginning with a letter/digit; reserved object-property names are rejected. Map keys must equal the corresponding ID.
- `paid` is boolean; amounts are numbers from 0 to 10,000,000, rounded to two decimal places. `actual` may be null; a paid purchase with a null actual amount uses its planned amount.
- `coupon` is text up to 100 characters; `note` and `customUrl` are text up to 2,000 characters. Links must be empty or absolute HTTP(S), without credentials, whitespace, or backslashes. ASCII/punycode hosts and IPv6 literals are supported.
- Unknown fields and invalid values are rejected. Wrong, missing, or malformed room secrets and unknown rooms return the same `Access denied` database error.

The database stores only a SHA-256 hash of the high-entropy room secret. Purchases themselves are stored normally in the database, so project administrators can access them. Browser scripts on the site's origin can access its local storage; keep third-party scripts out of the budget app and do not paste the invitation into analytics or error reports.

This small two-person design has no account recovery, participant identities, per-person access removal, audit history, room deletion RPC, or end-to-end encryption. If the invitation is lost, there is no in-app recovery. If it is shared too broadly, create a new room and have the project owner remove the old row. Export a local backup before a trip. The backend does not impose rate limits or room-creation quotas; disabling room creation after setup reduces that public surface. Availability, inactivity pausing, and usage limits depend on the selected Supabase plan. Refresh on focus and poll at a modest interval while the shared budget is open.

## Verification

The SQL was executed and reapplied in PGlite 0.5.8 (embedded PostgreSQL), with 23 checks covering role privileges, RLS, secret rejection, normalization, bootstrap timestamps, restoring older backups into untouched rows, conflict/no-write behavior, edits to separate purchases, and input limits.

On 8 September 2026, the deployed Supabase project passed 7 live REST checks using two separate HTTPS clients: room creation, matching reads, concurrent writes to different purchases, a same-purchase race with exactly one winner and one conflict, generic denial for incorrect secrets and nonexistent rooms, blocked direct private-table reads, and final convergence without changes from denied requests. No service-role key or database password was used by either client.

Official references: [Supabase function privileges and fixed search paths](https://supabase.com/docs/guides/database/functions), [API grants and RLS](https://supabase.com/docs/guides/api/securing-your-api), [publishable keys and request headers](https://supabase.com/docs/guides/getting-started/api-keys), [built-in UUID generation](https://supabase.com/docs/guides/database/extensions/uuid-ossp), and [PostgreSQL SHA-256](https://www.postgresql.org/docs/17/functions-binarystring.html).
