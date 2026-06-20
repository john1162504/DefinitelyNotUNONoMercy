type Color = "red" | "green" | "blue" | "yellow" | "wild";

type Value =
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "skip"
    | "skipAll"
    | "reverse"
    | "discardAll"
    | "+2"
    | "+4"
    | "reverse+4"
    | "+6"
    | "+10"
    | "colorRoulette";

interface Card {
    color: Color;
    value: Value;
}

interface Player {
    id: string;
    socketId: string;
    name: string;
}

interface GameRule {
    numOfDrawSix: number;
    numOfDrawTen: number;
    secondsPerRound: number;
    specialRulesIsEnabled?: boolean;
    rotateHandsOnZero: boolean;
    swapHandsOnSeven: boolean;
    allowWinOnFunctionCard: boolean;
}

interface RoomState {
    host: string;
    players: Player[];
    rule: GameRule;
    isStarted: boolean;
    lastWinnerId?: string;
}

type GameEventType =
    | "colorRoulette"
    | "swapHands"
    | "rotateHands"
    | "skip"
    | "reverse"
    | "drawStack"
    | "discardAll";

interface GameEvent {
    type: GameEventType;
    actorName?: string;
    targetName?: string;
    color?: "red" | "green" | "blue" | "yellow";
    drawnCards?: Card[];
    count?: number;
    value?: Value;
}

interface GameState {
    players: Player[];
    deckCount: number;
    discardPile: Card[];
    currentPlayerIndex: number;
    playerCardCounter: Record<string, number>;
    direction: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
    pendingDrawCount?: number;
    minimumDrawValue?: "+2" | "+4" | "reverse+4" | "+6" | "+10";
    activeColor?: "red" | "green" | "blue" | "yellow";
    unoChallenge?: {
        playerId: string;
        xPercent: number;
        yPercent: number;
    };
    pendingHandSwaps?: number;
    handSwapPlayerId?: string;
    turnExpiresAt?: number;
    lastPlayedCards?: Card[];
}

export type {
    Color,
    Value,
    Card,
    Player,
    RoomState,
    GameRule,
    GameState,
    GameEvent,
    GameEventType,
};
