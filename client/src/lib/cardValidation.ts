import type { Card, GameState } from "../types";

const DRAW_CARD_VALUES = ["+2", "+4", "reverse+4", "+6", "+10"];
const DRAW_CARD_STRENGTH: Record<string, number> = {
    "+2": 2,
    "+4": 4,
    "reverse+4": 4,
    "+6": 6,
    "+10": 10,
};

export function canPlayCards(
    cards: Card[],
    gameState: GameState,
    chosenColor?: string,
): { valid: boolean; reason?: string } {
    if (!cards.length) {
        return { valid: false, reason: "No cards selected" };
    }

    const topCard = gameState.discardPile?.[gameState.discardPile.length - 1];
    if (!topCard) {
        return { valid: false, reason: "No top card" };
    }

    const colorToMatch = gameState.activeColor || topCard.color;

    if (cards.length > 1) {
        const isSameValue = cards.every((c) => c.value === cards[0].value);
        if (!isSameValue) {
            return { valid: false, reason: "Multiple cards must share a value" };
        }
    }

    // While a draw stack is active, any equal-or-higher draw card may be
    // stacked regardless of color/value match. Check strength first and skip
    // the normal first-card color/value match.
    if (gameState.pendingDrawCount) {
        if (!cards.every((c) => DRAW_CARD_VALUES.includes(c.value))) {
            return {
                valid: false,
                reason: "Must stack with a draw card (+2 or higher)",
            };
        }

        if (gameState.minimumDrawValue) {
            const minStrength = DRAW_CARD_STRENGTH[gameState.minimumDrawValue];
            const isHigher = cards.every(
                (c) => (DRAW_CARD_STRENGTH[c.value] ?? 0) >= minStrength,
            );
            if (!isHigher) {
                return {
                    valid: false,
                    reason: `Must play ${gameState.minimumDrawValue} or higher`,
                };
            }
        }

        if (cards.some((c) => c.color === "wild") && !chosenColor) {
            return { valid: false, reason: "Choose a color for wild cards" };
        }

        return { valid: true };
    }

    const isValidFirstCard =
        cards[0].color === colorToMatch ||
        cards[0].value === topCard.value ||
        cards[0].color === "wild";

    if (!isValidFirstCard) {
        return { valid: false, reason: "Must match color or value" };
    }

    if (cards.some((c) => c.color === "wild") && !chosenColor) {
        return { valid: false, reason: "Choose a color for wild cards" };
    }

    return { valid: true };
}

/** Like canPlayCards but ignores wild color — used for pre-select UI only. */
export function canSelectCards(
    cards: Card[],
    gameState: GameState,
): boolean {
    if (!cards.length) return false;

    const topCard = gameState.discardPile?.[gameState.discardPile.length - 1];
    if (!topCard) return false;

    const colorToMatch = gameState.activeColor || topCard.color;

    if (cards.length > 1) {
        if (!cards.every((c) => c.value === cards[0].value)) return false;
    }

    // Stacking only depends on draw-card strength, not color/value match.
    if (gameState.pendingDrawCount) {
        if (!cards.every((c) => DRAW_CARD_VALUES.includes(c.value))) {
            return false;
        }
        if (gameState.minimumDrawValue) {
            const minStrength = DRAW_CARD_STRENGTH[gameState.minimumDrawValue];
            return cards.every(
                (c) => (DRAW_CARD_STRENGTH[c.value] ?? 0) >= minStrength,
            );
        }
        return true;
    }

    const isValidFirstCard =
        cards[0].color === colorToMatch ||
        cards[0].value === topCard.value ||
        cards[0].color === "wild";

    return isValidFirstCard;
}

/** Whether a card may be selected given the current selection. */
export function canSelectCard(
    card: Card,
    selectedCards: Card[],
    gameState: GameState,
): boolean {
    if (selectedCards.length === 0) {
        return canSelectCards([card], gameState);
    }
    if (card.value !== selectedCards[0].value) {
        return false;
    }
    return canSelectCards([...selectedCards, card], gameState);
}

export function getDrawStackLabel(
    value: "+2" | "+4" | "reverse+4" | "+6" | "+10",
): string {
    return value;
}

export const PLAYABLE_COLORS = ["red", "green", "blue", "yellow"] as const;
export type PlayableColor = (typeof PLAYABLE_COLORS)[number];
