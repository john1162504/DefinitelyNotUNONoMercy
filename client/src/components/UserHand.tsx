import type { Card } from "@/types";
import React, { useState } from "react";

// Tweak these ratios as needed
const CARD_WIDTH_RATIO = 1 / 13.5;
const CARD_HEIGHT_RATIO = 1.5;
const HAND_MAX = 25;
const CARD_SPACING = 0.45; // as a fraction of card width

const COLOR_ORDER = ["red", "yellow", "green", "blue", "wild"];

const cardImgPath = (card: Card) =>
    `${import.meta.env.BASE_URL}assets/Cards/individual/${card.color}/${
        card.value
    }_${card.color}.png`;

interface UserHandProps {
    hand: Card[];
    tableWidth: number;
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
    onPlayCard,
}) => {
    // Responsive card sizing
    const cardWidth = Math.max(30, tableWidth * CARD_WIDTH_RATIO);
    const cardHeight = cardWidth * CARD_HEIGHT_RATIO;

    // Sorting
    const sortedHand = [...hand].sort(sortByColor);

    // Selected cards state
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const selectedCards = selectedIndices.map((idx) => sortedHand[idx]);

    // Color picker state
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Layout math
    const maxHandWidth = tableWidth * 0.95;
    const totalWidth = Math.min(
        cardWidth + (HAND_MAX - 1) * cardWidth * CARD_SPACING,
        maxHandWidth
    );
    const actualSpacing =
        sortedHand.length > 1
            ? (totalWidth - cardWidth) / (sortedHand.length - 1)
            : 0;

    // Helpers
    const hasWild = selectedCards.some((c) => c.color === "wild");

    // Handle play (with or without chosen color)
    const handlePlay = (chosenColor?: string) => {
        if (onPlayCard && selectedCards.length > 0) {
            onPlayCard(selectedCards, chosenColor);
            setSelectedIndices([]);
            setShowColorPicker(false);
        }
    };

    return (
        <>
            {/* Color Picker Modal */}
            {showColorPicker && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-2 items-center">
                        <span className="mb-2">Pick a color:</span>
                        <div className="flex gap-4">
                            {["red", "green", "blue", "yellow"].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => handlePlay(color)}
                                    className="w-10 h-10 rounded-full border-2 border-black"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <button
                            className="mt-3 text-xs underline"
                            onClick={() => setShowColorPicker(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="absolute bottom-1 z-30 flex flex-col items-center pointer-events-none w-full">
                {/* Action Buttons */}
                <div className="mb-2 pointer-events-auto flex gap-2">
                    <button
                        className="rounded px-2 py-1 border"
                        onClick={() => setSelectedIndices([])}
                    >
                        Reset
                    </button>
                    <button
                        className="rounded px-2 py-1 border"
                        onClick={() => {
                            if (hasWild) {
                                setShowColorPicker(true);
                            } else {
                                handlePlay();
                            }
                        }}
                        disabled={selectedIndices.length === 0}
                    >
                        Play
                    </button>
                </div>

                {/* Hand of cards */}
                <div
                    style={{
                        position: "relative",
                        height: `${cardHeight}px`,
                        width: `${totalWidth}px`,
                    }}
                >
                    {sortedHand.map((card, i) => (
                        <img
                            key={i}
                            src={cardImgPath(card)}
                            alt={`${card.color} ${card.value}`}
                            style={{
                                position: "absolute",
                                left: i * actualSpacing,
                                width: `${cardWidth}px`,
                                height: `${cardHeight}px`,
                                zIndex: i,
                                cursor: "pointer",
                                transition: "box-shadow 0.2s, transform 0.1s",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                pointerEvents: "auto",
                                border: selectedIndices.includes(i)
                                    ? "2px solid gold"
                                    : "none",
                                background: "#fff",
                            }}
                            onClick={() => {
                                if (selectedIndices.includes(i)) {
                                    setSelectedIndices(
                                        selectedIndices.filter(
                                            (idx) => idx !== i
                                        )
                                    );
                                } else {
                                    setSelectedIndices([...selectedIndices, i]);
                                }
                            }}
                            onDoubleClick={() => {
                                if (!selectedIndices.includes(i)) {
                                    setSelectedIndices([...selectedIndices, i]);
                                }
                                if (card.color === "wild") {
                                    setShowColorPicker(true);
                                } else {
                                    handlePlay();
                                }
                            }}
                            draggable={false}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default UserHand;
