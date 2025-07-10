"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeck = createDeck;
exports.dealHands = dealHands;
exports.getPlayerCardCounts = getPlayerCardCounts;
exports.shuffle = shuffle;
function createDeck(gameRule) {
    const deck = [];
    const standardColors = ["red", "green", "blue", "yellow"];
    // Numbered cards: 0–9 (2 of each per color)
    const numberValues = [
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
    const wildCards = [
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
function dealHands(players, deck) {
    const hands = {};
    for (const player of players) {
        hands[player.id] = deck.splice(0, 7);
    }
    return [hands, deck];
}
// Basic shuffle
function shuffle(array) {
    return array
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}
function getPlayerCardCounts(hands) {
    const counts = {};
    for (const playerId in hands) {
        counts[playerId] = hands[playerId].length;
    }
    return counts;
}
