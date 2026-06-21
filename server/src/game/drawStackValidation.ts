import type { Card } from "../models/types";

export const DRAW_CARD_VALUES = [
    "+2",
    "+4",
    "reverse+4",
    "+6",
    "+10",
] as const;

export const DRAW_CARD_STRENGTH: Record<string, number> = {
    "+2": 2,
    "+4": 4,
    "reverse+4": 4,
    "+6": 6,
    "+10": 10,
};

export const COLOR_ROULETTE_VALUE = "colorRoulette" as const;

/** Color Roulette cannot stack on draw stacks or be played multiple at once. */
export function validateColorRoulettePlay(
    cards: Card[],
    pendingDrawCount?: number,
): boolean {
    const hasRoulette = cards.some((c) => c.value === COLOR_ROULETTE_VALUE);
    if (!hasRoulette) return true;
    if (cards.length > 1) return false;
    if (pendingDrawCount && pendingDrawCount > 0) return false;
    return true;
}

/**
 * Validates draw-stack responses. Equal-strength stacks on a wild reverse+4
 * (which always sets activeColor) must match that color; higher draw cards
 * may be played regardless of color.
 */
export function validateDrawStackResponse(
    cards: Card[],
    minimumDrawValue: string | undefined,
    activeColor: string | undefined,
    chosenColor?: string,
    options?: { requireChosenColorForWild?: boolean },
): boolean {
    if (!cards.every((c) => DRAW_CARD_VALUES.includes(c.value as typeof DRAW_CARD_VALUES[number]))) {
        return false;
    }

    if (!minimumDrawValue) {
        return true;
    }

    const minStrength = DRAW_CARD_STRENGTH[minimumDrawValue];
    if (
        !cards.every(
            (c) => (DRAW_CARD_STRENGTH[c.value] ?? 0) >= minStrength,
        )
    ) {
        return false;
    }

    if (minimumDrawValue === "reverse+4" && activeColor) {
        const allEqualStrength = cards.every(
            (c) => DRAW_CARD_STRENGTH[c.value] === minStrength,
        );
        if (allEqualStrength) {
            return cards.every((c) => {
                if (c.color === "wild") {
                    if (options?.requireChosenColorForWild) {
                        return chosenColor === activeColor;
                    }
                    return true;
                }
                return c.color === activeColor;
            });
        }
    }

    return true;
}
