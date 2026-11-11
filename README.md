# John.
john.

## Per-requester preferences

The Worker stores roast preferences in the `john_preferences` D1 database. Each requester has one row in `requester_preferences`, keyed by their lowercase Telegram handle (for example, `@alice`). If they do not have a Telegram handle, the key is their Telegram user ID prefixed with `id:`. The preference follows the handle, so changing a Telegram username results in a new default preference record. When someone makes their first qualifying request, the Worker creates their record with the current defaults.

An authorized administrator can list, edit, save, and delete records at the Cloudflare Access-protected `/johnroaster/admin/preferences` page. Different people in one group have separate preferences, and one person's settings follow them to other chats. The earlier `chat_preferences` table is left in place but is no longer used; chat-level records cannot be automatically assigned to individuals.

Apply schema migrations with Wrangler:

```powershell
npm.cmd exec -- wrangler d1 migrations apply john_preferences --local
npm.cmd exec -- wrangler d1 migrations apply john_preferences --remote
```

Deploy the Worker after applying the remote migration:

```powershell
npm.cmd run deploy
```

Deleting a requester record makes the bot recreate it with defaults on that person's next qualifying request. Preference keys and validation are defined in `src/index.js`.
