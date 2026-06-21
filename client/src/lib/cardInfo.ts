import type { Value } from "../types";

export interface CardInfo {
    name: string;
    description: string;
}

export const CARD_INFO: Record<Value, CardInfo> = {
    "0": {
        name: "Zero",
        description:
            "A normal number card. With the optional 0 rule, playing 0 rotates every player's hand in turn order.",
    },
    "1": { name: "One", description: "A normal number card." },
    "2": { name: "Two", description: "A normal number card." },
    "3": { name: "Three", description: "A normal number card." },
    "4": { name: "Four", description: "A normal number card." },
    "5": { name: "Five", description: "A normal number card." },
    "6": { name: "Six", description: "A normal number card." },
    "7": {
        name: "Seven",
        description:
            "A normal number card. With the optional 7 rule, playing 7 lets you swap hands with another player.",
    },
    "8": { name: "Eight", description: "A normal number card." },
    "9": { name: "Nine", description: "A normal number card." },
    skip: {
        name: "Skip",
        description:
            "Skips the next player. Playing multiple skips at once skips additional players.",
    },
    skipAll: {
        name: "Skip All",
        description: "Everyone else is skipped — you immediately play again.",
    },
    reverse: {
        name: "Reverse",
        description:
            "Reverses the direction of play. With 2 players it acts like a Skip, so you play again.",
    },
    discardAll: {
        name: "Discard All",
        description:
            "Discards every other card of this color from your hand along with this one.",
    },
    "+2": {
        name: "Draw 2",
        description:
            "The next player draws 2 — unless they stack another draw card of equal or higher strength.",
    },
    "+4": {
        name: "Draw 4",
        description:
            "The next player draws 4 unless they stack a draw card of equal or higher strength.",
    },
    "reverse+4": {
        name: "Reverse Draw 4",
        description:
            "Reverses direction and forces the next player to draw 4 (stackable). Choose a color when played.",
    },
    "+6": {
        name: "Wild Draw 6",
        description:
            "Choose a color; the next player draws 6 unless they stack a draw card of equal or higher strength.",
    },
    "+10": {
        name: "Wild Draw 10",
        description:
            "Choose a color; the next player draws 10 unless they stack an equal-or-higher draw card (the strongest stack).",
    },
    colorRoulette: {
        name: "Color Roulette",
        description:
            "Choose a color; the next player keeps drawing cards until they draw that color, then their turn ends. Only one may be played at a time and it cannot respond to a draw stack.",
    },
};

export function getCardInfo(value: Value): CardInfo {
    return (
        CARD_INFO[value] ?? {
            name: String(value),
            description: "",
        }
    );
}
