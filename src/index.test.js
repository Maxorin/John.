import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "./index.js";

class MemoryD1 {
  rows = new Map();

  prepare(query) {
    let values = [];
    const statement = {
      bind: (...boundValues) => {
        values = boundValues;
        return statement;
      },
      run: async () => {
        const sql = query.trim().toUpperCase();
        if (sql.startsWith("INSERT OR IGNORE INTO REQUESTER_PREFERENCES")) {
          const [requesterKey, telegramUserId, telegramHandle, preferencesJson, updatedAt] = values;
          const inserted = !this.rows.has(requesterKey);
          if (inserted) {
            this.rows.set(requesterKey, {
              requester_key: requesterKey,
              telegram_user_id: telegramUserId,
              telegram_handle: telegramHandle,
              preferences_json: preferencesJson,
              updated_at: updatedAt,
            });
          }
          return { meta: { changes: inserted ? 1 : 0 } };
        }
        throw new Error("Unexpected D1 query: " + query);
      },
      first: async () => {
        const row = this.rows.get(values[0]);
        return row ? { preferences_json: row.preferences_json } : null;
      },
    };
    return statement;
  }
}

function createEnvironment(database) {
  const kv = new Map();
  const prompts = [];
  return {
    env: {
      BOT_TOKEN: "test-token",
      WEBHOOK_SECRET: "test-secret",
      BOT_KV: {
        get: async (key) => kv.get(key) || null,
        put: async (key, value) => kv.set(key, value),
      },
      PREFERENCES_DB: database,
      AI: {
        run: vi.fn(async (_model, { messages }) => {
          prompts.push(messages[0].content);
          return { response: JSON.stringify({ read: "test", roast: "test roast" }) };
        }),
      },
    },
    prompts,
  };
}

async function triggerBot(env, chatId, requester = { id: 2, username: "requester" }) {
  const pending = [];
  const response = await worker.fetch(
    new Request("https://example.com/johnroaster", {
      method: "POST",
      headers: {
        "X-Telegram-Bot-Api-Secret-Token": "test-secret",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          chat: { id: chatId, type: "supergroup" },
          from: requester,
          text: "@john_roaster_bot",
          entities: [{ type: "mention", offset: 0, length: 17 }],
          reply_to_message: {
            message_id: 3,
            from: { id: 1, username: "target" },
            text: "original message",
          },
        },
      }),
    }),
    env,
    { waitUntil: (promise) => pending.push(promise) }
  );

  await Promise.all(pending);
  return response;
}

describe("requester preferences", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a D1 record with defaults for a requester's first qualifying request", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const database = new MemoryD1();
    const { env, prompts } = createEnvironment(database);
    const chatId = "-10012345";

    const response = await triggerBot(env, chatId);

    expect(response.status).toBe(200);
    const saved = JSON.parse(database.rows.get("@requester").preferences_json);
    expect(saved.maxWords).toBe(20);
    expect(prompts[0]).toContain("fewer than 20 words");
    expect(env.AI.run).toHaveBeenCalledTimes(1);
  });

  it("uses saved preferences for that requester, regardless of which chat they use", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const database = new MemoryD1();
    database.rows.set("@requester", {
      requester_key: "@requester",
      telegram_user_id: "2",
      telegram_handle: "requester",
      preferences_json: JSON.stringify({
        maxWords: 8,
        roastAngles: ["use the custom chat angle"],
        bannedPhrases: "custom banned phrase",
      }),
      updated_at: new Date().toISOString(),
    });
    const { env, prompts } = createEnvironment(database);

    const response = await triggerBot(env, "-10012345");

    expect(response.status).toBe(200);
    expect(prompts[0]).toContain("fewer than 8 words");
    expect(prompts[0]).toContain("use the custom chat angle");
    expect(prompts[0]).toContain("custom banned phrase");
  });

  it("keeps different requesters in the same chat separate and falls back to user ID", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const database = new MemoryD1();
    const { env, prompts } = createEnvironment(database);

    await triggerBot(env, "-10012345", { id: 2, username: "requester" });
    const saved = database.rows.get("@requester");
    saved.preferences_json = JSON.stringify({ maxWords: 9 });
    await triggerBot(env, "-10012345", { id: 3, first_name: "No Handle" });
    await triggerBot(env, "-10054321", { id: 2, username: "requester" });

    expect(database.rows.has("@requester")).toBe(true);
    expect(database.rows.has("id:3")).toBe(true);
    expect(prompts[0]).toContain("fewer than 20 words");
    expect(prompts[1]).toContain("fewer than 20 words");
    expect(prompts[2]).toContain("fewer than 9 words");
  });
});
