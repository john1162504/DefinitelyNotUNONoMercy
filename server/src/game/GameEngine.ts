import type { Card, Color, GameRule, Value, Player } from "../models/types";

function createDeck(gameRule: GameRule): Card[] {
    const deck: Card[] = [];

    const standardColors: Color[] = ["red", "green", "blue", "yellow"];

    // Numbered cards: 0–9 (2 of each per color)
    const numberValues: Value[] = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
    ];
    for (const color of standardColors) {
        for (const value of numberValues) {
            deck.push({ color, value }, { color, value });
        }
    }

    // Action cards
    for (const color of standardColors) {
        // Skip: 3 of each
        for (let i = 0; i < 3; i++) {
            deck.push({ color, value: "skip" });
        }

        // Skip All: 2 of each
        for (let i = 0; i < 2; i++) {
            deck.push({ color, value: "skipAll" });
        }

        // Reverse: 3 of each
        for (let i = 0; i < 3; i++) {
            deck.push({ color, value: "reverse" });
        }

        // +2: 2 of each
        for (let i = 0; i < 2; i++) {
            deck.push({ color, value: "+2" });
        }

        // +4: 2 of each
        for (let i = 0; i < 2; i++) {
            deck.push({ color, value: "+4" });
        }

        // Discard All of Color: 3 of each
        for (let i = 0; i < 3; i++) {
            deck.push({ color, value: "discardAll" });
        }
    }

    // Wild cards (color: "wild")
    const wildCards: [Value, number][] = [
        ["reverse+4", 8],
        ["+6", gameRule.numOfDraWSix],
        ["+10", gameRule.numOfDrawTen],
        ["colorRoulette", 8],
    ];

    for (const [value, count] of wildCards) {
        for (let i = 0; i < count; i++) {
            deck.push({ color: "wild", value });
        }
    }

    return shuffle(deck);
}

// Deal seven cards to each player using player's ID as key
function dealHands(
    players: Player[],
    deck: Card[]
): [Record<string, Card[]>, Card[]] {
    const hands: Record<string, Card[]> = {};
    for (const player of players) {
        hands[player.id] = deck.splice(0, 7);
    }
    return [hands, deck];
}

// Basic shuffle
function shuffle<T>(array: T[]): T[] {
    return array
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

function getPlayerCardCounts(
    hands: Record<string, Card[]>
): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const playerId in hands) {
        counts[playerId] = hands[playerId].length;
    }
    return counts;
}

export { createDeck, dealHands, getPlayerCardCounts, shuffle };
