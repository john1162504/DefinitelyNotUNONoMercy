import React from "react";

const CARD_WIDTH_RATIO = 1 / 16; // Card width = tableWidth * ratio
const CARD_HEIGHT_RATIO = 1.3; // Card height = cardWidth * ratio
const ARC_RADIUS_RATIO = 0.05; // Arc radius = tableWidth * ratio
const DEFAULT_MARGIN_RATIO = 0.05; // Margin between icon and hand, as tableWidth * ratio
const MAX_CARDS = 25;
const CARD_BACK_PATH = "/assets/Cards/individual/card back/card_back.png";

interface FannedHandProps {
    numCards: number;
    xPercent: number; // 0-100, seat position
    yPercent: number; // 0-100, seat position
    tableWidth: number; // in px
    marginRatio?: number; // Optional, for tuning margin size
}

function radiansToDegrees(r: number) {
    return r * (180 / Math.PI);
}
function degreesToRadians(d: number) {
    return d * (Math.PI / 180);
}

const FannedHand: React.FC<FannedHandProps> = ({
    numCards,
    xPercent,
    yPercent,
    tableWidth,
    marginRatio = DEFAULT_MARGIN_RATIO,
}) => {
    // Responsive sizes
    const cardWidth = Math.max(24, tableWidth * CARD_WIDTH_RATIO);
    const cardHeight = cardWidth * CARD_HEIGHT_RATIO;
    const arcRadius = tableWidth * ARC_RADIUS_RATIO;
    const marginPx = tableWidth * marginRatio;

    // Angle to centre
    const dx = 50 - xPercent;
    const dy = 50 - yPercent;
    const angleToCenterRad = Math.atan2(dy, dx);
    const angleToCenterDeg = radiansToDegrees(angleToCenterRad);

    // Fan points toward center
    const fanAngle = angleToCenterDeg;

    // Fan geometry
    const anglePerCard = 310 / (MAX_CARDS - 1);

    const startAngle = fanAngle - 0.5 * anglePerCard * (numCards - 1);

    const cards = Array.from({ length: numCards }).map((_, i) => {
        const deg = startAngle + anglePerCard * i;
        const rad = degreesToRadians(deg);
        return {
            x: Math.cos(rad) * arcRadius,
            y: Math.sin(rad) * arcRadius,
            angle: deg + 90,
        };
    });

    // Find the base of the hand (middle card)
    const baseIdx = Math.floor(numCards / 2);
    const baseX = cards[baseIdx].x;
    const baseY = cards[baseIdx].y;

    // Bounding box for hand container
    const minX = Math.min(...cards.map((c) => c.x));
    const maxX = Math.max(...cards.map((c) => c.x));
    const minY = Math.min(...cards.map((c) => c.y));
    const maxY = Math.max(...cards.map((c) => c.y));

    // Margin offset toward center
    const offsetX = Math.cos(angleToCenterRad) * marginPx;
    const offsetY = Math.sin(angleToCenterRad) * marginPx;

    return (
        <div
            style={{
                position: "absolute",
                left: `calc(${xPercent}% + ${offsetX}px)`,
                top: `calc(${yPercent}% + ${offsetY}px)`,
                transform: "translate(-50%, -50%)",
                width: `${Math.abs(maxX - minX) + cardWidth}px`,
                height: `${Math.abs(maxY - minY) + cardHeight}px`,
                pointerEvents: "none",
                zIndex: 10,
            }}
        >
            {cards.map((c, i) => (
                <img
                    key={i}
                    src={CARD_BACK_PATH}
                    draggable={false}
                    alt="Card"
                    style={{
                        position: "absolute",
                        left: `calc(50% + ${c.x - baseX - cardWidth / 2}px)`,
                        top: `calc(50% + ${c.y - baseY - cardHeight}px)`,
                        width: `${cardWidth}px`,
                        height: `${cardHeight}px`,
                        transform: `rotate(${c.angle}deg)`,
                        transformOrigin: `50% 100%`,
                        zIndex: i,
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                />
            ))}
        </div>
    );
};

export default FannedHand;
