# Definitely Not UNO No Mercy

Online multiplayer UNO No Mercy — browser client + Socket.IO server.

## Creating a room

When you create a room you can configure:

| Setting                              | Description                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| **+6 / +10 counts**                  | How many wild +6 and +10 cards are in the deck                                                               |
| **Seconds per round**                | Optional turn timer (min 5). On timeout the server auto-draws and passes turn                                |
| **0 — Rotate all hands**             | Optional. See [Special rule: 0](#special-rule-0--rotate-hands)                                               |
| **7 — Swap hands**                   | Optional. See [Special rule: 7](#special-rule-7--swap-hands)                                                 |
| **Allow winning on a function card** | On (default): you may win on your last play if it is a function card. Off: you draw 2 and the game continues |

Rules can be mixed independently (e.g. only 7 swap, or only 0 rotate).

---

## Core gameplay

### Turns

- On your turn, play valid card(s) from your hand or draw from the deck.
- Play passes clockwise or counter-clockwise based on game **direction**.
- Only the **host** can start the game (minimum 2 players).

### Matching cards

You may play a card that matches the top discard by **color**, **value**, or play a **wild**.

- If a wild set an **active color**, you must match that color until a non-wild card clears it.
- Multiple cards at once must share the **same value**.

### Wild cards

Wild cards require choosing red, green, blue, or yellow when played. The active color is shown in the UI and on the discard pile.

### Draw stack (+2 and higher)

When a draw card (+2, +4, reverse+4, +6, +10) is on the pile, the active player must either:

- **Stack** with a draw card of **equal or higher** strength, or
- **Draw** all accumulated cards from the deck.

Stack strength order: +2 → +4 / reverse+4 → +6 → +10.

While a stack is active, only draw cards may be played.

### Skip

Skips the next player(s). Playing multiple skips skips additional players.

### Skip All

The **same player plays again** — turn does not pass to anyone else.

### Reverse

- **2 players:** Acts like Skip — the same player plays again.
- **3+ players:** Reverses direction only; turn passes normally.

### Discard All

After playing Discard All, all remaining cards in your hand of **that color** are also discarded. You can win if this empties your hand (subject to function-card win rules).

### Color Roulette

The next player draws until they draw the color you chose; then their turn ends.

### Starting discard

The first card on the pile is always a **number card** (never wild or action).

---

## Special rule: 0 — Rotate hands

**Room option:** `0 — Rotate all hands`

When enabled, playing one or more **0** cards rotates every player's hand in **turn order** (follows current game direction):

- Clockwise: Player 1 → 2, Player 2 → 3, … last → 1
- Counter-clockwise: the opposite

Playing **two 0s** rotates twice, and so on.

When this rule is on, **0 counts as a function card** (see [Function cards & winning](#function-cards--winning)).

---

## Special rule: 7 — Swap hands

**Room option:** `7 — Swap hands`

When enabled, playing **7** card(s) lets you swap hands with another player **once per 7 played**:

1. You pick an opponent to swap with.
2. If you played multiple 7s, you may swap again with your **new** hand before turn passes.
3. Turn advances only after all swaps are resolved.

When this rule is on, **7 counts as a function card** (see below).

---

## Function cards & winning

**Function / action cards** include: skip, skipAll, reverse, discardAll, +2, +4, reverse+4, +6, +10, colorRoulette — plus **0** and **7** when their optional rules are enabled.

### Winning on your last card

Controlled by **Allow winning on a function card** at room create:

- **On (default):** Emptying your hand wins, even on a function card.
- **Off:** If your **final play** is a function card, you **draw 2** instead of winning; effects still apply and play continues.

### One card left in hand (before you play it)

If you are down to **one card** and it is a function card (including enabled 0/7), you **draw 2** immediately — before playing that card.

---

## UNO!

When a player reaches **1 card** after a play, a **UNO!** button appears at a **random position** on everyone's screen.

- The player with 1 card must tap **UNO!** before anyone else.
- If **another player** taps first, the 1-card player **draws 2**.
- If the **1-card player** taps first, no penalty.

---

## Turn timer

If the host set **seconds per round** when creating the room:

- A countdown shows on your turn.
- On expiry the server auto-draws (full stack if one is active, otherwise 1 card) and passes turn.
- Timer pauses while a hand swap (7) is pending.

---

## Leaving & reconnecting

- **Leave** is available in the lobby and during a game.
- Leaving mid-game removes you; if fewer than 2 players remain, the game ends.
- Refreshing reconnects via session id and restores room/game state when possible.

---

## Development

```bash
# Server
cd server && npm run dev

# Client
cd client && npm run dev
```

## Deploy / cold start

### Render (client static site)

| Setting           | Value                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------- |
| Root directory    | `client`                                                                                |
| Build command     | `npm install && npm run build`                                                          |
| Publish directory | `dist`                                                                                  |
| Environment       | `VITE_SERVER_URL` = your Render **server** URL (e.g. `https://uno-server.onrender.com`) |

After changing env vars, trigger a **manual redeploy** so Vite picks them up at build time.

For client-side routes (`/rules`, `/create`, `/room/1234`), enable **Rewrite all requests to index.html** in the Render static site settings (or use the included `public/_redirects` file).

### Render (server web service)

| Setting           | Value                                            |
| ----------------- | ------------------------------------------------ |
| Root directory    | `server`                                         |
| Build command     | `npm install && npm run build`                   |
| Start command     | `npm start`                                      |
| Health check path | `/health`                                        |
| Environment       | `CLIENT_URL` = your Render **client** URL (CORS) |

Free-tier servers sleep when idle. The client shows a startup overlay on game routes until `/health` responds (usually 30–60 seconds).
