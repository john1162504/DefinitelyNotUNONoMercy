import type { Card, GameState } from "@/types";
import {
    canPlayCards,
    canSelectCard,
    PLAYABLE_COLORS,
    type PlayableColor,
} from "@/lib/cardValidation";
import { getCardInfo } from "@/lib/cardInfo";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
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
    tableHeight?: number;
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
    tableHeight,
    gameState,
    isYourTurn,
    onPlayCard,
}) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [selectedWildColor, setSelectedWildColor] =
        useState<PlayableColor | null>(null);
    const [validationHint, setValidationHint] = useState<string | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        setSelectedWildColor(null);
        setValidationHint(null);
    }, [selectedIndices.join(",")]);

    if (!hand || hand.length === 0) {
        return null;
    }

    let cardWidth = Math.max(22, tableWidth * CARD_WIDTH_RATIO);
    let cardHeight = cardWidth * CARD_HEIGHT_RATIO;

    // Cap card height so a large hand never pushes content off-screen or grows
    // disproportionately on short / mobile viewports.
    const viewportCap =
        typeof window !== "undefined" ? window.innerHeight * 0.22 : 140;
    const maxCardHeight = Math.min(
        140,
        tableHeight ? tableHeight * 0.45 : 140,
        viewportCap,
    );
    if (cardHeight > maxCardHeight) {
        cardHeight = maxCardHeight;
        cardWidth = cardHeight / CARD_HEIGHT_RATIO;
    }

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

    const selectRing = Math.max(2, Math.round(cardWidth * 0.08));
    const playableRing = Math.max(1, Math.round(cardWidth * 0.05));
    const cardShadowBlur = Math.max(4, Math.round(cardWidth * 0.12));
    const cardShadowY = Math.max(2, Math.round(cardWidth * 0.06));
    const selectLift = Math.max(4, Math.round(cardWidth * 0.12));

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

    const clearSelection = () => {
        setSelectedIndices([]);
        setSelectedWildColor(null);
        setValidationHint(null);
    };

    const actionHint =
        validationHint ??
        (hasWild && hasSelection && !selectedWildColor
            ? "Pick a wild color"
            : null);

    return (
        <div className="pointer-events-none relative flex w-full flex-col items-center justify-center py-1">
            {hasWild && hasSelection && (
                <div className="pointer-events-auto mb-1.5 flex items-center gap-1.5 rounded-lg border border-purple-300/80 bg-black/70 px-2 py-1 shadow-md backdrop-blur-sm sm:gap-2 sm:rounded-xl sm:px-2.5 sm:py-1.5">
                    <span className="text-[10px] font-semibold text-white sm:text-xs">
                        Wild:
                    </span>
                    <div className="flex gap-1 sm:gap-1.5">
                        {PLAYABLE_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                title={color}
                                onClick={() => setSelectedWildColor(color)}
                                className={`h-6 w-6 rounded-full border-2 transition-transform sm:h-7 sm:w-7 ${
                                    selectedWildColor === color
                                        ? "scale-110 border-white ring-1 ring-white ring-offset-1 ring-offset-black/70"
                                        : "border-white/40 hover:scale-105"
                                }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div
                style={{
                    position: "relative",
                    height: `${cardHeight}px`,
                    width: `${totalWidth}px`,
                }}
            >
                {sortedHand.map((card, i) => {
                    const isSelected = selectedIndices.includes(i);
                    const isHovered = hoveredIndex === i;
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
                    const info = getCardInfo(card.value);

                    return (
                        <div
                            key={`${card.color}-${card.value}-${i}`}
                            className="group"
                            style={{
                                position: "absolute",
                                left: i * actualSpacing,
                                width: `${cardWidth}px`,
                                height: `${cardHeight}px`,
                                zIndex: isHovered
                                    ? 500
                                    : isSelected
                                      ? i + 100
                                      : i,
                                pointerEvents: "auto",
                            }}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() =>
                                setHoveredIndex((prev) =>
                                    prev === i ? null : prev,
                                )
                            }
                        >
                            <img
                                src={cardImgPath(card)}
                                alt={`${card.color} ${card.value}`}
                                title={`${info.name} — ${info.description}`}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    height: "100%",
                                    cursor: isYourTurn
                                        ? selectable
                                            ? "pointer"
                                            : "not-allowed"
                                        : "default",
                                    transition:
                                        "box-shadow 0.2s, transform 0.1s, opacity 0.2s, filter 0.2s",
                                    boxShadow: isSelected
                                        ? `0 0 0 ${selectRing}px gold, 0 ${cardShadowY}px ${cardShadowBlur}px rgba(0,0,0,0.25)`
                                        : highlightWhenIdle
                                          ? `0 0 0 ${playableRing}px rgba(34,197,94,0.6), 0 ${cardShadowY}px ${cardShadowBlur * 0.67}px rgba(0,0,0,0.15)`
                                          : `0 ${cardShadowY}px ${cardShadowBlur}px rgba(0,0,0,0.15)`,
                                    border: "none",
                                    background: "#fff",
                                    opacity: dimmed
                                        ? 0.3
                                        : isYourTurn
                                          ? 1
                                          : 0.7,
                                    filter: dimmed ? "grayscale(0.6)" : "none",
                                    transform: isSelected
                                        ? `translateY(-${selectLift}px)`
                                        : undefined,
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
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-[600] mb-2 hidden w-44 -translate-x-1/2 rounded-lg bg-gray-900/95 px-3 py-2 text-left shadow-xl [@media(hover:hover)_and_(pointer:fine)]:block [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:transition-opacity [@media(hover:hover)_and_(pointer:fine)]:duration-150 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100">
                                <div className="text-xs font-bold text-white">
                                    {info.name}
                                </div>
                                <div className="mt-0.5 text-[11px] leading-snug text-gray-200">
                                    {info.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isYourTurn && (
                <div className="pointer-events-auto fixed bottom-2 right-2 z-[700] flex flex-col items-end gap-1 sm:bottom-3 sm:right-3">
                    {actionHint && (
                        <span
                            className={`max-w-[10rem] truncate rounded px-2 py-0.5 text-right text-[10px] font-medium shadow sm:max-w-[12rem] sm:text-xs ${
                                validationHint
                                    ? "bg-red-600/90 text-white"
                                    : "bg-amber-500/90 text-white"
                            }`}
                        >
                            {actionHint}
                        </span>
                    )}
                    <div className="flex items-center gap-2">
                        {hasSelection && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={clearSelection}
                                className="h-10 w-10 shrink-0 rounded-full border-white/25 bg-black/70 text-white hover:bg-black/90 sm:h-9 sm:w-9"
                                aria-label="Clear selection"
                                title="Clear selection"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            type="button"
                            size="sm"
                            onClick={handlePlay}
                            disabled={!canPlay}
                            className={`h-10 min-w-10 shrink-0 gap-1.5 rounded-full px-4 text-xs font-bold sm:h-9 sm:min-w-9 sm:px-3.5 ${
                                canPlay
                                    ? "bg-green-600 text-white hover:bg-green-500"
                                    : "bg-white/15 text-white/40"
                            }`}
                            aria-label={
                                selectedCards.length > 1
                                    ? `Play ${selectedCards.length} cards`
                                    : "Play selected card"
                            }
                        >
                            <Play className="h-4 w-4 fill-current" />
                            {selectedCards.length > 1
                                ? `×${selectedCards.length}`
                                : "Play"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserHand;
