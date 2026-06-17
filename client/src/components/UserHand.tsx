import type { Card, GameState } from "@/types";
import {
    canPlayCards,
    canSelectCard,
    PLAYABLE_COLORS,
    type PlayableColor,
} from "@/lib/cardValidation";
import React, { useEffect, useState } from "react";

const CARD_WIDTH_RATIO = 1 / 13.5;
const CARD_HEIGHT_RATIO = 1.5;
const HAND_MAX = 25;
const CARD_SPACING = 0.45;

const COLOR_ORDER = ["red", "yellow", "green", "blue", "wild"];

const cardImgPath = (card: Card) =>
    `${import.meta.env.BASE_URL}assets/Cards/individual/${card.color}/${
        card.value
    }_${card.color}.png`;

interface UserHandProps {
    hand: Card[];
    tableWidth: number;
    gameState: GameState;
    isYourTurn: boolean;
    onPlayCard?: (cards: Card[], chosenColor?: string) => void;
}

function sortByColor(a: Card, b: Card) {
    const colorA = COLOR_ORDER.indexOf(a.color);
    const colorB = COLOR_ORDER.indexOf(b.color);

    if (colorA !== colorB) return colorA - colorB;
    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
    return 0;
}

const UserHand: React.FC<UserHandProps> = ({
    hand,
    tableWidth,
    gameState,
    isYourTurn,
    onPlayCard,
}) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [selectedWildColor, setSelectedWildColor] =
        useState<PlayableColor | null>(null);
    const [validationHint, setValidationHint] = useState<string | null>(null);

    useEffect(() => {
        setSelectedWildColor(null);
        setValidationHint(null);
    }, [selectedIndices.join(",")]);

    if (!hand || hand.length === 0) {
        return null;
    }

    const cardWidth = Math.max(30, tableWidth * CARD_WIDTH_RATIO);
    const cardHeight = cardWidth * CARD_HEIGHT_RATIO;

    const sortedHand = [...hand].sort(sortByColor);

    const selectedCards = selectedIndices
        .map((idx) => sortedHand[idx])
        .filter(Boolean);

    const hasWild = selectedCards.some((c) => c.color === "wild");
    const hasSelection = selectedIndices.length > 0;

    const playValidation = canPlayCards(
        selectedCards,
        gameState,
        hasWild ? selectedWildColor ?? undefined : undefined,
    );

    const canPlay =
        isYourTurn &&
        selectedCards.length > 0 &&
        (!hasWild || selectedWildColor !== null) &&
        playValidation.valid;

    const maxHandWidth = tableWidth * 0.95;
    const totalWidth = Math.min(
        cardWidth + (HAND_MAX - 1) * cardWidth * CARD_SPACING,
        maxHandWidth,
    );
    const actualSpacing =
        sortedHand.length > 1
            ? (totalWidth - cardWidth) / (sortedHand.length - 1)
            : 0;

    const handlePlay = () => {
        if (!isYourTurn || selectedCards.length === 0) return;

        const chosenColor = hasWild ? selectedWildColor ?? undefined : undefined;
        const validation = canPlayCards(selectedCards, gameState, chosenColor);
        if (!validation.valid) {
            setValidationHint(validation.reason ?? "Invalid play");
            return;
        }

        onPlayCard?.(selectedCards, chosenColor);
        setSelectedIndices([]);
        setSelectedWildColor(null);
        setValidationHint(null);
    };

    const toggleSelect = (i: number) => {
        if (!isYourTurn) return;

        const card = sortedHand[i];
        if (selectedIndices.includes(i)) {
            setSelectedIndices(selectedIndices.filter((idx) => idx !== i));
            return;
        }

        if (!canSelectCard(card, selectedCards, gameState)) {
            return;
        }

        setSelectedIndices([...selectedIndices, i]);
        setValidationHint(null);
    };

    return (
        <div className="relative flex flex-col items-center justify-center pointer-events-none w-full py-8">
            {hasWild && hasSelection && (
                <div className="mb-3 pointer-events-auto flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-md border-2 border-purple-300">
                    <span className="text-sm font-semibold text-gray-800">
                        Wild card — choose a color to play:
                    </span>
                    <div className="flex gap-3">
                        {PLAYABLE_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                title={color}
                                onClick={() => setSelectedWildColor(color)}
                                className={`w-11 h-11 rounded-full border-3 transition-transform ${
                                    selectedWildColor === color
                                        ? "border-black scale-110 ring-2 ring-offset-2 ring-black"
                                        : "border-gray-400 hover:scale-105"
                                }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    {!selectedWildColor && (
                        <span className="text-xs text-amber-700">
                            Pick a color, then press Play
                        </span>
                    )}
                </div>
            )}

            <div className="mb-2 pointer-events-auto flex gap-2 items-center flex-wrap justify-center">
                <button
                    className="rounded px-2 py-1 border bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    onClick={() => {
                        setSelectedIndices([]);
                        setSelectedWildColor(null);
                        setValidationHint(null);
                    }}
                    disabled={!isYourTurn}
                >
                    Reset
                </button>
                <button
                    className="rounded px-2 py-1 border bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={handlePlay}
                    disabled={!canPlay}
                >
                    Play
                </button>
                {validationHint && (
                    <span className="text-xs text-red-600 max-w-[14rem]">
                        {validationHint}
                    </span>
                )}
                {hasWild && hasSelection && !selectedWildColor && (
                    <span className="text-xs text-amber-700">
                        Select a color above to enable Play
                    </span>
                )}
            </div>

            <div
                style={{
                    position: "relative",
                    height: `${cardHeight}px`,
                    width: `${totalWidth}px`,
                }}
            >
                {sortedHand.map((card, i) => {
                    const isSelected = selectedIndices.includes(i);
                    const selectable =
                        isYourTurn &&
                        (isSelected ||
                            canSelectCard(card, selectedCards, gameState));
                    const dimmed =
                        isYourTurn &&
                        hasSelection &&
                        !isSelected &&
                        !selectable;
                    const highlightWhenIdle =
                        isYourTurn &&
                        !hasSelection &&
                        canSelectCard(card, [], gameState);

                    return (
                        <img
                            key={`${card.color}-${card.value}-${i}`}
                            src={cardImgPath(card)}
                            alt={`${card.color} ${card.value}`}
                            style={{
                                position: "absolute",
                                left: i * actualSpacing,
                                width: `${cardWidth}px`,
                                height: `${cardHeight}px`,
                                zIndex: isSelected ? i + 100 : i,
                                cursor: isYourTurn
                                    ? selectable
                                        ? "pointer"
                                        : "not-allowed"
                                    : "not-allowed",
                                transition:
                                    "box-shadow 0.2s, transform 0.1s, opacity 0.2s, filter 0.2s",
                                boxShadow: isSelected
                                    ? "0 0 0 3px gold, 0 4px 12px rgba(0,0,0,0.25)"
                                    : highlightWhenIdle
                                      ? "0 0 0 2px rgba(34,197,94,0.6), 0 2px 8px rgba(0,0,0,0.15)"
                                      : "0 2px 8px rgba(0,0,0,0.15)",
                                pointerEvents: isYourTurn ? "auto" : "none",
                                border: "none",
                                background: "#fff",
                                opacity: dimmed ? 0.3 : isYourTurn ? 1 : 0.7,
                                filter: dimmed ? "grayscale(0.6)" : "none",
                                transform: isSelected ? "translateY(-8px)" : undefined,
                            }}
                            onClick={() => toggleSelect(i)}
                            onDoubleClick={() => {
                                if (!isYourTurn) return;
                                if (!selectedIndices.includes(i)) {
                                    if (
                                        !canSelectCard(
                                            card,
                                            selectedCards,
                                            gameState,
                                        )
                                    ) {
                                        return;
                                    }
                                    setSelectedIndices([
                                        ...selectedIndices,
                                        i,
                                    ]);
                                }
                                if (card.color !== "wild") {
                                    handlePlay();
                                }
                            }}
                            draggable={false}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default UserHand;
