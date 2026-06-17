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
    numOfDraWSix: number;
    numOfDrawTen: number;
    /** @deprecated use secondsPerRound */
    secondPerRound: number;
    secondsPerRound: number;
    /** @deprecated use rotateHandsOnZero / swapHandsOnSeven */
    specialRulesIsEnabled?: boolean;
    rotateHandsOnZero: boolean;
    swapHandsOnSeven: boolean;
    /** When false, emptying your hand on a function card draws 2 instead of winning. */
    allowWinOnFunctionCard: boolean;
}

interface RoomState {
    host: string;
    players: Player[];
    rule: GameRule;
    isStarted: boolean;
}

interface PublicGameState {
    players: Player[];
    deck: Card[];
    discardPile: Card[];
    currentPlayerIndex: number;
    playerCardCounter: Record<string, number>;
    direction: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
    pendingDrawCount?: number;
    miniumDrawValue?: "+2" | "+4" | "reverse+4" | "+6" | "+10";
    activeColor?: "red" | "green" | "blue" | "yellow";
    unoChallenge?: {
        playerId: string;
        xPercent: number;
        yPercent: number;
    };
    /** Remaining hand swaps after playing 7(s) — special rules only */
    pendingHandSwaps?: number;
    handSwapPlayerId?: string;
    turnExpiresAt?: number;
}

interface GameState extends PublicGameState {
    hands: Record<string, Card[]>;
}

export {
    Color,
    Value,
    Card,
    Player,
    RoomState,
    GameRule,
    GameState,
    PublicGameState,
};
