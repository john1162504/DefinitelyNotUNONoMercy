import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Color, Value } from "@/types";

const cardImgPath = (color: Color, value: Value) =>
    `${import.meta.env.BASE_URL}assets/Cards/individual/${color}/${value}_${color}.png`;

interface SectionCard {
    color: Color;
    value: Value;
}

interface RuleSection {
    title: string;
    cards?: SectionCard[];
    body: React.ReactNode;
}

const SECTIONS: RuleSection[] = [
    {
        title: "Goal",
        body: (
            <p>
                Be the first player to empty your hand. If you ever hold{" "}
                <strong>25 cards or more</strong> you are busted and out — UNO No
                Mercy has no upper draw limit.
            </p>
        ),
    },
    {
        title: "Turns",
        body: (
            <ul className="list-disc space-y-1 pl-5">
                <li>
                    On your turn, play valid card(s) from your hand or draw from
                    the deck.
                </li>
                <li>
                    Play passes clockwise or counter-clockwise based on the
                    current direction.
                </li>
                <li>Only the host can start the game (minimum 2 players).</li>
            </ul>
        ),
    },
    {
        title: "Matching cards",
        cards: [
            { color: "red", value: "7" },
            { color: "red", value: "+4" },
        ],
        body: (
            <ul className="list-disc space-y-1 pl-5">
                <li>
                    Match the top discard by <strong>color</strong>,{" "}
                    <strong>value</strong>, or play a <strong>wild</strong>.
                </li>
                <li>
                    If a wild set an active color, you must match that color
                    until a non-wild card clears it.
                </li>
                <li>
                    Multiple cards at once must all share the{" "}
                    <strong>same value</strong>.
                </li>
            </ul>
        ),
    },
    {
        title: "Wild cards",
        cards: [{ color: "wild", value: "colorRoulette" }],
        body: (
            <p>
                Wild cards require choosing red, green, blue, or yellow when
                played. The active color is shown in the UI and on the discard
                pile.
            </p>
        ),
    },
    {
        title: "Draw stack (+2 and higher)",
        cards: [
            { color: "red", value: "+2" },
            { color: "red", value: "+4" },
            { color: "wild", value: "+6" },
            { color: "wild", value: "+10" },
        ],
        body: (
            <>
                <p>
                    When a draw card (+2, +4, reverse+4, +6, +10) is on the pile,
                    the active player must either:
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>
                        <strong>Stack</strong> with a draw card of equal or
                        higher strength, or
                    </li>
                    <li>
                        <strong>Draw</strong> all accumulated cards from the
                        deck.
                    </li>
                </ul>
                <p className="mt-1">
                    Stack strength order: +2 → +4 / reverse+4 → +6 → +10. While a
                    stack is active, only draw cards may be played.
                </p>
            </>
        ),
    },
    {
        title: "Skip",
        cards: [{ color: "red", value: "skip" }],
        body: (
            <p>
                Skips the next player(s). Playing multiple skips skips additional
                players.
            </p>
        ),
    },
    {
        title: "Skip All",
        cards: [{ color: "red", value: "skipAll" }],
        body: (
            <p>
                The <strong>same player plays again</strong> — turn does not pass
                to anyone else.
            </p>
        ),
    },
    {
        title: "Reverse",
        cards: [{ color: "red", value: "reverse" }],
        body: (
            <ul className="list-disc space-y-1 pl-5">
                <li>
                    <strong>2 players:</strong> acts like Skip — the same player
                    plays again.
                </li>
                <li>
                    <strong>3+ players:</strong> reverses direction; turn passes
                    normally.
                </li>
            </ul>
        ),
    },
    {
        title: "Discard All",
        cards: [{ color: "red", value: "discardAll" }],
        body: (
            <p>
                After playing Discard All, all remaining cards in your hand of{" "}
                <strong>that color</strong> are also discarded. You can win if
                this empties your hand (subject to function-card win rules).
            </p>
        ),
    },
    {
        title: "Color Roulette",
        cards: [{ color: "wild", value: "colorRoulette" }],
        body: (
            <p>
                The next player draws until they draw the color you chose; then
                their turn ends. Everyone sees the cards revealed one-by-one.
            </p>
        ),
    },
    {
        title: "Special rule: 0 — Rotate hands",
        cards: [{ color: "red", value: "0" }],
        body: (
            <p>
                Optional room rule. Playing one or more <strong>0</strong> cards
                rotates every player's hand in turn order (following the current
                direction). Two 0s rotate twice, and so on. When enabled, 0
                counts as a function card.
            </p>
        ),
    },
    {
        title: "Special rule: 7 — Swap hands",
        cards: [{ color: "red", value: "7" }],
        body: (
            <p>
                Optional room rule. Playing <strong>7</strong> card(s) lets you
                swap hands with another player once per 7 played. Turn advances
                only after all swaps are resolved. When enabled, 7 counts as a
                function card.
            </p>
        ),
    },
    {
        title: "Function cards & winning",
        cards: [
            { color: "red", value: "skip" },
            { color: "wild", value: "reverse+4" },
            { color: "wild", value: "colorRoulette" },
        ],
        body: (
            <>
                <p>
                    Function / action cards include: skip, skipAll, reverse,
                    discardAll, +2, +4, reverse+4, +6, +10, colorRoulette — plus
                    0 and 7 when their optional rules are on.
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>
                        <strong>Allow winning on a function card — On:</strong>{" "}
                        emptying your hand wins, even on a function card.
                    </li>
                    <li>
                        <strong>Off:</strong> if your final play is a function
                        card you draw 2 instead of winning; effects still apply.
                    </li>
                    <li>
                        If you are down to one card and it is a function card,
                        you draw 2 immediately — before playing it.
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "UNO!",
        body: (
            <ul className="list-disc space-y-1 pl-5">
                <li>
                    When a player reaches 1 card, a UNO! button appears at a
                    random position on everyone's screen.
                </li>
                <li>
                    The 1-card player must tap UNO! before anyone else, or they
                    draw 2.
                </li>
            </ul>
        ),
    },
    {
        title: "Turn timer",
        body: (
            <p>
                If the host set seconds per round, a countdown shows on your
                turn. On expiry the server auto-draws (the full stack if one is
                active, otherwise 1 card) and passes the turn. The timer pauses
                while a hand swap (7) is pending.
            </p>
        ),
    },
];

export default function RulesPage() {
    return (
        <main className="min-h-screen w-full overflow-y-auto px-4 py-8">
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-white drop-shadow">
                        How to Play
                    </h1>
                    <Link to="/">
                        <Button variant="outline">Back</Button>
                    </Link>
                </div>

                <p className="rounded-xl bg-white/90 p-4 text-sm text-gray-700 shadow">
                    Definitely Not UNO No Mercy — a faster, more brutal take on
                    UNO. Tip: hover any card in your hand during a game to see
                    what it does.
                </p>

                <div className="space-y-4">
                    {SECTIONS.map((section) => (
                        <section
                            key={section.title}
                            className="flex flex-col gap-4 rounded-xl bg-white/95 p-5 shadow sm:flex-row sm:items-start"
                        >
                            {section.cards && section.cards.length > 0 && (
                                <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                                    {section.cards.map((card, i) => (
                                        <img
                                            key={`${card.color}-${card.value}-${i}`}
                                            src={cardImgPath(
                                                card.color,
                                                card.value,
                                            )}
                                            alt={`${card.color} ${card.value}`}
                                            draggable={false}
                                            className="h-24 w-auto rounded-md bg-white shadow"
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <h2 className="mb-2 text-lg font-semibold text-gray-900">
                                    {section.title}
                                </h2>
                                <div className="text-sm leading-relaxed text-gray-700">
                                    {section.body}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                <div className="flex justify-center pb-4">
                    <Link to="/">
                        <Button>Back to Home</Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
