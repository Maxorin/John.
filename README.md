# John.
## 🔥 John

**A Telegram bot that roasts your friends in one sentence. Then waits for the next victim.**

Reply to someone's message, tag John, and he'll tell them exactly what he thinks of it: dry, deadpan, brutally short, and always under 20 words.

> ⚠️ **Content note:** John is built to be savage. Strong profanity and dark humour are part of the design. Add him only to friend groups where everyone is in on the joke.

---

## 👀 What it looks like

```
sam:   guys im starting the gym every day from monday
alex:  (replies to sam) @john_roaster_bot
John:  going to the gym or eating the gym LOL.
```

```
jo:    i think i aced that exam lol
sam:   (replies to jo) @john_roaster_bot too confident
John:  nahhhhh u reek of overconfidence
```

No reply to a message? John stays quiet. Reply to a photo with no text? He'll let you know he's waiting.

> *John is waiting for you to reply to a message. John.. is... waiting.*

---

## ⚡ How to use him

1. Add the bot to your Telegram group (or open a private chat with it).
2. **Reply** to the message you want roasted.
3. Tag the bot: `@john_roaster_bot`

That's the whole trick. For sharper roasts, give John more to work with:

| You want | Do this | Example |
|---|---|---|
| A roast with a reason | Add a short note after the tag | `@john_roaster_bot he said he'd study all week and posted a gaming clip at 2am` |
| A roast with a target | Say what to poke at | `@john_roaster_bot roast how he always cancels last minute` |
| A roast of one specific part | Highlight that text in Telegram, tap **Reply**, then tag the bot | *(highlight, reply, tag)* |

John only sees the one message you replied to, so the note is how you give him the backstory.

---

## 🧠 How it works

When someone pings John, a small chain of events runs in a second or two:

1. Telegram sends the message to John's **webhook** (a web address on Cloudflare).
2. John checks the request is genuine, using a shared secret password.
3. He ignores anything that isn't a reply that tags him.
4. He asks an AI model to first work out **why** the message deserves a roast, then write the roast.
5. Only the roast is posted back to the chat, as a reply to the original message.

### The recipe behind each roast

Every roast is assembled from a few ingredients, so John doesn't sound the same twice:

- **A random angle**, such as a fake compliment that turns into an insult, or reacting far too dramatically to one tiny detail.
- **A vulgarities list** (about 50% of roasts are offered a few words from it, used only if they fit).
- **Filler words** like *"nahhhh buddy"*, *"okayyyy buddy"* and *"son"* (about 60% of roasts), for that deadpan, condescending energy.
- **An occasional reference** to internet culture (about 40% of roasts, used only if it fits perfectly).
- **A banned phrases list** for the lines the AI keeps falling back on.
- **Example roasts** that teach the AI the style: short, specific, and ending on the sting.

### Guardrails

- One sentence, fewer than 20 words. If the AI runs long, John asks it once to rewrite shorter.
- If the AI fails, John replies with a fallback line instead of going silent: *"Don't bother. Not worth my time."*
- John never jokes about self-harm or suicide. If a message is about that, he answers gently instead of roasting.
- The AI is told that chat messages are data, not instructions, so people can't talk it into breaking its rules.

---

## 🛠️ Built with

| Piece | What it does |
|---|---|
| [Cloudflare Workers](https://workers.cloudflare.com/) | Runs the bot, no server to manage |
| [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) | The AI model that writes the roasts (Llama 3.3 70B) |
| Cloudflare KV | A tiny database for the activity stats |
| Cloudflare Access | Optional login gate for the admin page |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | Cloudflare's tool for testing and deploying |
| Telegram Bot API | How the bot talks to Telegram |

---

## 📁 What's in this repo

| File | Purpose |
|---|---|
| `src/index.js` | The whole bot: all the logic, prompts and lists |
| `wrangler.jsonc` | Settings: the bot's name, storage, AI connection |
| `package.json` | The project's list of tools |
| `package-lock.json` | An auto-generated record of the exact tool versions. Don't edit it by hand |

---

## 🚀 Set it up yourself

You need a free [Cloudflare account](https://dash.cloudflare.com/sign-up), [Node.js](https://nodejs.org/) (version 22 or newer), and a bot token from Telegram's [@BotFather](https://t.me/BotFather) (send it `/newbot`).

**1. Get the code and install the tools**

```bash
git clone https://github.com/Maxorin/John.git
cd John
npm install
```

**2. Log in to Cloudflare**

```bash
npx wrangler login
```

**3. Create the storage**

```bash
npx wrangler kv namespace create BOT_KV
```

It prints an ID. Paste it into `wrangler.jsonc` as the ID of the `BOT_KV` storage.

**4. Check the bot's username**

At the top of `src/index.js`, make sure `BOT_USERNAME` matches your bot's Telegram username exactly (without the `@`).

**5. Save your secrets**

These are passwords. **Never** put them in the code or on GitHub.

```bash
npx wrangler secret put BOT_TOKEN        # the token from BotFather
npx wrangler secret put WEBHOOK_SECRET   # any long random password: letters, numbers, _ and - only
```

**6. Deploy**

```bash
npx wrangler deploy
```

It prints your bot's web address.

**7. Tell Telegram where to send messages**

Open this in your browser, replacing the three parts in capitals:

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=YOUR_WORKER_URL/johnroaster&secret_token=YOUR_WEBHOOK_SECRET
```

If you see `"ok":true`, you're live. Add the bot to a group and give it a reply.

---

## 🎛️ Make John yours

Everything you're likely to tweak sits as plain-text settings in `src/index.js`:

| Setting | What it controls |
|---|---|
| `MAX_WORDS` | Maximum roast length (currently under 20 words) |
| `VULGARITIES` and `VULGARITY_CHANCE` | The word list, and how often it's offered |
| `FILLER_WORDS` and `FILLER_CHANCE` | The deadpan filler list, and how often it's offered |
| `REFERENCE_POOL` and `REFERENCE_CHANCE` | Internet-culture references, and how often they're offered |
| `ROAST_ANGLES` | The different ways John can approach a roast |
| `BANNED_PHRASES` | Lines John must never use |
| `FEW_SHOT` | The example roasts that teach John his style |
| `FALLBACK_REPLY` and `NO_TEXT_REPLY` | What John says when things go wrong |
| `MODEL` | Which AI model writes the roasts |

To edit a list, add or remove words in quotes, separated by commas. To switch off a feature, set its chance to `0`.

> 💡 The best way to improve the roasts is to improve the examples in `FEW_SHOT`. John copies what they show him.

---

## 📊 The admin page

At `/johnroaster/admin`, John has a private status page showing:

- whether his secrets and storage are connected
- when he was last pinged, plus roasts today and in total
- the last 20 requests (who asked, whose message, whether it worked)
- the last 10 errors

It's hidden from everyone except people signed in through Cloudflare Access (set `TEAM_DOMAIN` and `POLICY_AUD` in `wrangler.jsonc`). Anyone else just sees "Not found".

**Privacy:** John never stores message text. The stats and logs only hold names, times and results.

---

## 🩺 Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| John only sends the fallback line | Open the admin page's error list. The latest entry says why (see below) |
| Error mentions a *deprecated* model | Cloudflare retired the model. Pick a replacement from the [model catalog](https://developers.cloudflare.com/workers-ai/models/) and update `MODEL` |
| Error mentions a missing AI connection | The `ai` binding is missing from `wrangler.jsonc`, or it hasn't been deployed |
| Roasts stop until the next morning | The free daily AI allowance ran out. It resets at 00:00 UTC |
| John never replies | Check the webhook is set, the secret matches, and you replied to a message while tagging the bot |
| You see `[object Object]` | An old bug where the AI's reply wasn't converted to text. Update to the latest `extractText` function |

---

## 💸 Cost

John runs comfortably on Cloudflare's free plan. Workers AI includes a daily free allowance, and a roast uses a small slice of it. Limits and prices change, so check [Cloudflare's pricing page](https://developers.cloudflare.com/workers-ai/platform/pricing/) before you rely on a number. If the allowance runs out, requests fail until the next reset, and John sends his fallback line.

---

## 🗺️ Ideas for later

- 🖼️ **Meme mode:** reply with a generated reaction meme (an AI image plus a "my reaction:" caption), with a daily cap to protect the allowance
- 🧾 A usage counter on the admin page
- 🧠 Remembering recent chat messages for richer roasts (a privacy trade-off, so it's off by default)

---

<p align="center"><i>John has taken over, and only John will prevail.</i></p>
