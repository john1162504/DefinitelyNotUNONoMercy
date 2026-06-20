import { Server, Socket } from "socket.io";
import { roomStates } from "./LobbyController";
import {
    GameState,
    PublicGameState,
    RoomState,
    Card,
    Player,
    GameEvent,
} from "../models/types";
import {
    createDeck,
    dealHands,
    getPlayerCardCounts,
    shuffle,
} from "../game/GameEngine";
import {
    clearTurnTimer,
    getTurnExpiresAt,
    startTurnTimer,
} from "../game/TurnTimer";

const gameStates: Record<string, GameState> = {};
const DRAW_CARD_VALUES = ["+2", "+4", "reverse+4", "+6", "+10"];
const DRAW_CARD_STRENGTH = {
    "+2": 2,
    "+4": 4,
    "reverse+4": 4,
    "+6": 6,
    "+10": 10,
};

const UNSTARTABLE_VALUES = new Set([
    "+2",
    "+4",
    "reverse+4",
    "+6",
    "+10",
    "colorRoulette",
    "skip",
    "skipAll",
    "reverse",
    "discardAll",
]);

const FUNCTION_CARD_VALUES = new Set([
    "skip",
    "skipAll",
    "reverse",
    "discardAll",
    "+2",
    "+4",
    "reverse+4",
    "+6",
    "+10",
    "colorRoulette",
]);

function emitGameEvent(io: Server, roomId: string, event: GameEvent) {
    io.to(roomId).emit("game_event", event);
}

/**
 * True once the game has ended (broadcastGameOver deletes the stored state).
 * Callers use this to short-circuit after a draw/play that triggered a win or
 * bust, so we never emit further events or mutate the deleted game state.
 */
function isGameOver(game: GameState, roomId: string): boolean {
    return gameStates[roomId] !== game;
}

function getRuleFlags(roomId: string) {
    const rule = roomStates[roomId]?.rule;
    const legacy = rule?.specialRulesIsEnabled ?? false;
    return {
        rotateHandsOnZero: rule?.rotateHandsOnZero ?? legacy,
        swapHandsOnSeven: rule?.swapHandsOnSeven ?? legacy,
    };
}

function isFunctionCardPlay(
    cards: Card[],
    rotateHandsOnZero: boolean,
    swapHandsOnSeven: boolean,
): boolean {
    if (cards.some((c) => FUNCTION_CARD_VALUES.has(c.value))) return true;
    if (rotateHandsOnZero && cards.some((c) => c.value === "0")) return true;
    if (swapHandsOnSeven && cards.some((c) => c.value === "7")) return true;
    return false;
}

function isFunctionCardValue(
    value: string,
    rotateHandsOnZero: boolean,
    swapHandsOnSeven: boolean,
): boolean {
    if (FUNCTION_CARD_VALUES.has(value)) return true;
    if (rotateHandsOnZero && value === "0") return true;
    if (swapHandsOnSeven && value === "7") return true;
    return false;
}

function rotateAllHands(game: GameState, times: number) {
    for (let t = 0; t < times; t++) {
        const hands = game.hands;
        const playerIds = game.players.map((p) => p.id);
        const newHands: Record<string, Card[]> = {};

        for (let i = 0; i < playerIds.length; i++) {
            const fromId = playerIds[i];
            const toIdx =
                (i + game.direction + playerIds.length) % playerIds.length;
            newHands[playerIds[toIdx]] = hands[fromId];
        }
        game.hands = newHands;
    }
}

function swapHands(game: GameState, playerA: string, playerB: string) {
    const temp = game.hands[playerA];
    game.hands[playerA] = game.hands[playerB];
    game.hands[playerB] = temp;
}

function completeTurnAfterPlay(
    io: Server,
    game: GameState,
    roomId: string,
    playerId: string,
    skipTurnRotation: boolean,
) {
    if (!game.pendingHandSwaps) {
        if (!skipTurnRotation) {
            rotateBy(game, 1);
        }

        const handAfter = game.hands[playerId];
        if (handAfter?.length === 1) {
            startUnoChallenge(game, playerId);
        }
    }

    finishTurn(io, game, roomId);
}

function syncCardCounters(game: GameState) {
    game.playerCardCounter = getPlayerCardCounts(game.hands);
}

function popStartableCard(deck: Card[]): Card {
    while (deck.length > 0) {
        const card = deck.pop()!;
        if (card.color !== "wild" && !UNSTARTABLE_VALUES.has(card.value)) {
            return card;
        }
        deck.unshift(card);
    }
    throw new Error("No startable card in deck");
}

function startGame(io: Server, roomState: RoomState, roomId: string) {
    const deck = createDeck(roomState.rule);
    const startCard = popStartableCard(deck);

    const winnerIdx = roomState.lastWinnerId
        ? roomState.players.findIndex((p) => p.id === roomState.lastWinnerId)
        : -1;
    const startingIndex = winnerIdx >= 0 ? winnerIdx : 0;

    roomState.isStarted = true;
    const [hands, remainingDeck] = dealHands(roomState.players, deck);

    const game: GameState = {
        players: roomState.players,
        deck: remainingDeck,
        deckCount: remainingDeck.length,
        discardPile: [startCard],
        currentPlayerIndex: startingIndex,
        direction: 1,
        playerCardCounter: getPlayerCardCounts(hands),
        activeColor: undefined,
        hands,
    };
    gameStates[roomId] = game;

    const turnExpiresAt = scheduleTurnTimer(io, roomId);
    const publicGameState = toPublicGameState(game);

    for (const player of roomState.players) {
        io.to(player.socketId).emit("game_started", {
            hand: hands[player.id],
            gameState: { ...publicGameState, turnExpiresAt },
            roomState: roomState,
        });
    }
}

/** Strip server-only fields (hands, raw deck) and expose only the deck count. */
function toPublicGameState(game: GameState): PublicGameState {
    const { hands: _hands, deck, ...rest } = game;
    return { ...rest, deckCount: deck.length };
}

function scheduleTurnTimer(io: Server, roomId: string): number | undefined {
    const roomState = roomStates[roomId];
    const game = gameStates[roomId];
    if (!roomState || !game) return undefined;

    const seconds = roomState.rule.secondsPerRound ?? 0;
    if (seconds <= 0) return undefined;

    startTurnTimer(roomId, seconds, (id) => handleTurnTimeout(io, id));
    return getTurnExpiresAt(roomId);
}

function handleTurnTimeout(io: Server, roomId: string) {
    const game = gameStates[roomId];
    if (!game) return;

    const currentPlayer = game.players[game.currentPlayerIndex];
    if (!currentPlayer) return;

    if (game.pendingDrawCount && game.pendingDrawCount > 0) {
        const drawnCards = drawCard(
            io,
            game,
            roomId,
            currentPlayer,
            game.pendingDrawCount,
        );
        if (isGameOver(game, roomId)) return;
        game.hands[currentPlayer.id].push(...drawnCards);
        game.pendingDrawCount = 0;
        game.minimumDrawValue = undefined;
    } else {
        const drawnCards = drawCard(io, game, roomId, currentPlayer, 1);
        if (isGameOver(game, roomId)) return;
        game.hands[currentPlayer.id].push(...drawnCards);
    }

    applyUnoChallengeSync(game);
    syncCardCounters(game);
    rotateBy(game, 1);
    finishTurn(io, game, roomId);
}

function startUnoChallenge(game: GameState, playerId: string) {
    game.unoChallenge = {
        playerId,
        xPercent: 12 + Math.random() * 76,
        yPercent: 18 + Math.random() * 64,
    };
}

function applyUnoChallengeSync(game: GameState) {
    if (!game.unoChallenge) return;
    const hand = game.hands[game.unoChallenge.playerId];
    if (!hand || hand.length !== 1) {
        game.unoChallenge = undefined;
    }
}

function resolveUnoCall(
    io: Server,
    game: GameState,
    roomId: string,
    callerId: string,
) {
    if (!game.unoChallenge) return;

    const targetId = game.unoChallenge.playerId;

    if (callerId === targetId) {
        game.unoChallenge = undefined;
        return;
    }

    const target = game.players.find((p) => p.id === targetId);
    if (target && game.hands[targetId]?.length === 1) {
        const penalty = drawCard(io, game, roomId, target, 2);
        game.hands[targetId].push(...penalty);
    }
    game.unoChallenge = undefined;
}

function finishTurn(io: Server, game: GameState, roomId: string) {
    applyUnoChallengeSync(game);
    syncCardCounters(game);
    broadcastGameState(io, game, roomId);
}

function tryGameOver(
    io: Server,
    game: GameState,
    roomId: string,
    player: Player,
    playerHand: Card[],
    playedCards: Card[],
): boolean {
    if (playerHand.length !== 0) return false;

    const allowWinOnFunctionCard =
        roomStates[roomId]?.rule.allowWinOnFunctionCard ?? true;
    const { rotateHandsOnZero, swapHandsOnSeven } = getRuleFlags(roomId);

    if (
        !allowWinOnFunctionCard &&
        isFunctionCardPlay(playedCards, rotateHandsOnZero, swapHandsOnSeven)
    ) {
        const penalty = drawCard(io, game, roomId, player, 2);
        game.hands[player.id].push(...penalty);
        return false;
    }

    broadcastGameOver({
        io,
        game,
        roomId,
        winner: player.name,
        winnerId: player.id,
    });
    return true;
}

function handleGameSockets(io: Server, socket: Socket) {
    socket.on(
        "play_card",
        ({
            roomId,
            cards,
            chosenColor,
        }: {
            roomId: string;
            cards: Card[];
            chosenColor?: "red" | "green" | "blue" | "yellow";
        }) => {
            const game = gameStates[roomId];

            if (!game) {
                socket.emit("error", { message: "Game not found." });
                return;
            }

            if (!cards || cards.length === 0) {
                socket.emit("error", { message: "No cards selected." });
                return;
            }

            const playerId = socket.data.sessionId;
            const currentPlayer = game.players[game.currentPlayerIndex];

            if (!currentPlayer) {
                socket.emit("error", { message: "Invalid game state." });
                return;
            }

            if (currentPlayer.id !== playerId) {
                socket.emit("error", { message: "Not your turn." });
                return;
            }

            const playerHand = game.hands[playerId];

            if (!playerHand) {
                socket.emit("error", { message: "Hand not found." });
                return;
            }

            const handCopy = [...playerHand];
            const isEveryCardInHand = cards.every((card) => {
                const index = handCopy.findIndex(
                    (c) => c.color === card.color && c.value === card.value,
                );
                if (index === -1) return false;
                handCopy.splice(index, 1);
                return true;
            });

            if (!isEveryCardInHand) {
                socket.emit("error", {
                    message: "Some cards are not in your hand.",
                });
                return;
            }

            if (
                cards.some((c) => c.color === "wild") &&
                chosenColor === undefined
            ) {
                socket.emit("error", {
                    message: "You need to chose a color!",
                });
                return;
            }

            const isValid = cardValidation(cards, game, chosenColor);
            if (!isValid) {
                socket.emit("error", { message: "Invalid card play." });
                return;
            }

            clearTurnTimer(roomId);

            const { rotateHandsOnZero, swapHandsOnSeven } =
                getRuleFlags(roomId);

            for (const card of cards) {
                const index = playerHand.findIndex(
                    (c) => c.color === card.color && c.value === card.value,
                );
                if (index !== -1) playerHand.splice(index, 1);
                game.discardPile.push(card);
            }

            game.lastPlayedCards = [...cards];

            if (playerHand.length === 1) {
                if (
                    isFunctionCardValue(
                        playerHand[0].value,
                        rotateHandsOnZero,
                        swapHandsOnSeven,
                    )
                ) {
                    const newCard = drawCard(
                        io,
                        game,
                        roomId,
                        currentPlayer,
                        2,
                    );
                    if (isGameOver(game, roomId)) return;
                    game.hands[currentPlayer.id].push(...newCard);
                }
            }

            if (
                tryGameOver(
                    io,
                    game,
                    roomId,
                    currentPlayer,
                    playerHand,
                    cards,
                )
            ) {
                return;
            }

            if (Object.keys(DRAW_CARD_STRENGTH).includes(cards[0].value)) {
                for (const card of cards) {
                    if (game.pendingDrawCount) {
                        game.pendingDrawCount +=
                            DRAW_CARD_STRENGTH[
                                card.value as keyof typeof DRAW_CARD_STRENGTH
                            ];
                    } else {
                        game.pendingDrawCount =
                            DRAW_CARD_STRENGTH[
                                card.value as keyof typeof DRAW_CARD_STRENGTH
                            ];
                    }
                }
                game.minimumDrawValue = cards[0].value as
                    | "+2"
                    | "+4"
                    | "reverse+4"
                    | "+6"
                    | "+10";

                emitGameEvent(io, roomId, {
                    type: "drawStack",
                    actorName: currentPlayer.name,
                    value: cards[0].value,
                    count: game.pendingDrawCount,
                });
            }

            let skipTurnRotation = false;

            if (cards[0].value === "skip") {
                rotateBy(game, cards.length + 1);
                skipTurnRotation = true;
                emitGameEvent(io, roomId, {
                    type: "skip",
                    actorName: currentPlayer.name,
                    count: cards.length,
                });
            }
            if (
                cards[0].value === "reverse" ||
                cards[0].value === "reverse+4"
            ) {
                const directionFlips = cards.length % 2 === 1;
                if (directionFlips) {
                    game.direction = (game.direction * -1) as 1 | -1;
                }
                if (
                    cards[0].value === "reverse" &&
                    game.players.length === 2
                ) {
                    skipTurnRotation = true;
                }
                // Announce the flip for both reverse and reverse+4 so the
                // direction change is never silent.
                if (directionFlips) {
                    emitGameEvent(io, roomId, {
                        type: "reverse",
                        actorName: currentPlayer.name,
                    });
                }
            }
            if (cards[0].value === "skipAll") {
                skipTurnRotation = true;
            }
            if (cards[0].value === "discardAll") {
                const discardColors = [
                    ...new Set(cards.map((c) => c.color)),
                ] as Array<"red" | "green" | "blue" | "yellow">;
                let totalDiscarded = 0;

                for (const color of discardColors) {
                    const discardCards = [...playerHand].filter(
                        (c) => c.color === color,
                    );
                    for (const card of discardCards) {
                        const index = playerHand.findIndex(
                            (c) =>
                                c.color === card.color &&
                                c.value === card.value,
                        );
                        if (index !== -1) playerHand.splice(index, 1);
                        game.discardPile.splice(
                            game.discardPile.length - 1,
                            0,
                            card,
                        );
                    }
                    totalDiscarded += discardCards.length;
                }

                emitGameEvent(io, roomId, {
                    type: "discardAll",
                    actorName: currentPlayer.name,
                    color:
                        discardColors.length === 1
                            ? discardColors[0]
                            : undefined,
                    count: totalDiscarded,
                });

                if (
                    tryGameOver(
                        io,
                        game,
                        roomId,
                        currentPlayer,
                        playerHand,
                        cards,
                    )
                ) {
                    return;
                }
            }
            if (cards[0].value === "colorRoulette") {
                rotateBy(game, 1);
                const roulettePlayer =
                    game.players[game.currentPlayerIndex];

                // Hard cap: a victim busts at 25 cards, so this can never
                // legitimately run more than ~25 iterations, but the cap
                // guards against an empty/cycling deck looping forever.
                const ROULETTE_DRAW_CAP = 30;
                const rouletteDrawn: Card[] = [];

                for (let i = 0; i < ROULETTE_DRAW_CAP; i++) {
                    const newCard = drawCard(
                        io,
                        game,
                        roomId,
                        roulettePlayer,
                        1,
                    )[0];

                    // drawCard triggers a bust game-over the moment the victim
                    // crosses 24 cards; stop immediately so we don't keep
                    // dealing cards or mutate the deleted game state.
                    if (isGameOver(game, roomId)) {
                        return;
                    }

                    if (!newCard) break;

                    game.hands[roulettePlayer.id].push(newCard);
                    rouletteDrawn.push(newCard);

                    if (newCard.color === chosenColor) {
                        break;
                    }
                }

                emitGameEvent(io, roomId, {
                    type: "colorRoulette",
                    actorName: currentPlayer.name,
                    targetName: roulettePlayer.name,
                    color: chosenColor,
                    drawnCards: rouletteDrawn,
                });
            }

            if (cards.some((c) => c.color === "wild")) {
                game.activeColor = chosenColor;
            } else if (game.activeColor) {
                game.activeColor = undefined;
            }

            if (rotateHandsOnZero && cards[0].value === "0") {
                rotateAllHands(game, cards.length);
                emitGameEvent(io, roomId, {
                    type: "rotateHands",
                    actorName: currentPlayer.name,
                    count: cards.length,
                });
            }

            if (swapHandsOnSeven && cards[0].value === "7") {
                const sevenCount = cards.filter((c) => c.value === "7").length;
                game.pendingHandSwaps = sevenCount;
                game.handSwapPlayerId = playerId;
                skipTurnRotation = true;
            }

            completeTurnAfterPlay(
                io,
                game,
                roomId,
                playerId,
                skipTurnRotation,
            );
        },
    );

    socket.on("call_uno", ({ roomId }: { roomId: string }) => {
        const game = gameStates[roomId];
        if (!game?.unoChallenge) return;

        const callerId = socket.data.sessionId;
        resolveUnoCall(io, game, roomId, callerId);
        if (isGameOver(game, roomId)) return;
        finishTurn(io, game, roomId);
    });

    socket.on(
        "swap_hands",
        ({
            roomId,
            targetPlayerId,
        }: {
            roomId: string;
            targetPlayerId: string;
        }) => {
            const game = gameStates[roomId];

            if (!game) {
                socket.emit("error", { message: "Game not found." });
                return;
            }

            if (!game.pendingHandSwaps || game.pendingHandSwaps <= 0) {
                socket.emit("error", { message: "No hand swap pending." });
                return;
            }

            const actorId = game.handSwapPlayerId;
            if (!actorId || actorId !== socket.data.sessionId) {
                socket.emit("error", {
                    message: "Only the player who played 7 can swap.",
                });
                return;
            }

            if (!game.hands[targetPlayerId]) {
                socket.emit("error", { message: "Invalid swap target." });
                return;
            }

            if (targetPlayerId === actorId) {
                socket.emit("error", {
                    message: "Choose another player to swap with.",
                });
                return;
            }

            const actorPlayer = game.players.find((p) => p.id === actorId);
            const targetPlayer = game.players.find(
                (p) => p.id === targetPlayerId,
            );
            swapHands(game, actorId, targetPlayerId);
            game.pendingHandSwaps -= 1;

            emitGameEvent(io, roomId, {
                type: "swapHands",
                actorName: actorPlayer?.name,
                targetName: targetPlayer?.name,
            });

            if (game.pendingHandSwaps <= 0) {
                game.pendingHandSwaps = undefined;
                game.handSwapPlayerId = undefined;
                rotateBy(game, 1);

                const handAfter = game.hands[actorId];
                if (handAfter?.length === 1) {
                    startUnoChallenge(game, actorId);
                }
            }

            finishTurn(io, game, roomId);
        },
    );

    socket.on(
        "take_draw",
        ({ roomId, count }: { roomId: string; count?: number }) => {
            const game = gameStates[roomId];

            if (!game) {
                socket.emit("error", { message: "Game not found." });
                return;
            }

            const playerId = socket.data.sessionId;
            const currentPlayer = game.players[game.currentPlayerIndex];

            if (!currentPlayer) {
                socket.emit("error", { message: "Invalid game state." });
                return;
            }

            if (currentPlayer.id !== playerId) {
                socket.emit("error", { message: "Not your turn." });
                return;
            }

            clearTurnTimer(roomId);

            if (game.pendingDrawCount) {
                const drawnCards = drawCard(
                    io,
                    game,
                    roomId,
                    currentPlayer,
                    game.pendingDrawCount,
                );
                if (isGameOver(game, roomId)) return;
                game.hands[playerId].push(...drawnCards);
                game.pendingDrawCount = 0;
                game.minimumDrawValue = undefined;
                rotateBy(game, 1);
            } else if (count && count > 0) {
                const drawnCards = drawCard(
                    io,
                    game,
                    roomId,
                    currentPlayer,
                    count,
                );
                if (isGameOver(game, roomId)) return;
                game.hands[playerId].push(...drawnCards);
                rotateBy(game, 1);
            } else {
                socket.emit("error", { message: "Invalid draw request." });
                return;
            }

            applyUnoChallengeSync(game);
            finishTurn(io, game, roomId);
        },
    );
}

function cardValidation(
    cards: Card[],
    game: PublicGameState,
    chosenColor?: "red" | "green" | "blue" | "yellow",
): boolean {
    const topCard = game.discardPile[game.discardPile.length - 1];
    const colorToMatch = game.activeColor || topCard.color;

    // Multiple cards must always share the same value.
    if (cards.length > 1) {
        const isSameValue = cards.every((c) => c.value === cards[0].value);
        if (!isSameValue) return false;
    }

    // While a draw stack is active, only the stack strength matters: ANY
    // equal-or-higher draw card may be stacked regardless of color/value
    // match (No Mercy rules). This check runs ahead of the first-card
    // color/value match below, which we deliberately skip during a stack.
    if (game.pendingDrawCount) {
        const allDrawCards = cards.every((c) =>
            DRAW_CARD_VALUES.includes(c.value),
        );
        if (!allDrawCards) return false;

        const minStrength =
            DRAW_CARD_STRENGTH[
                game.minimumDrawValue as keyof typeof DRAW_CARD_STRENGTH
            ];
        const isEqualOrHigher = cards.every(
            (c) =>
                DRAW_CARD_STRENGTH[
                    c.value as keyof typeof DRAW_CARD_STRENGTH
                ] >= minStrength,
        );
        return isEqualOrHigher;
    }

    // Normal play: match the active color, the top value, or play a wild.
    const isValidFirstCard =
        cards[0].color === colorToMatch ||
        cards[0].value === topCard.value ||
        cards[0].color === "wild";

    return isValidFirstCard;
}

function rotateBy(game: PublicGameState, steps: number) {
    game.currentPlayerIndex =
        (game.currentPlayerIndex +
            steps * game.direction +
            game.players.length) %
        game.players.length;
}

function drawCard(
    io: Server,
    game: GameState,
    roomId: string,
    player: Player,
    numCards: number,
): Card[] {
    const drawnCards: Card[] = [];
    for (let i = 0; i < numCards; i++) {
        if (game.deck.length === 0) {
            game.deck = shuffle(game.discardPile.slice(0, -1));
            game.discardPile = [game.discardPile[game.discardPile.length - 1]];
        }
        const card = game.deck.pop();
        if (card) {
            drawnCards.push(card);
        }
    }

    if (game.hands[player.id].length + drawnCards.length > 24) {
        broadcastGameOver({ io, game, roomId, loser: player.name });
    }
    return drawnCards;
}

function broadcastGameState(io: Server, game: GameState, roomId: string) {
    syncCardCounters(game);
    clearTurnTimer(roomId);

    const turnExpiresAt =
        game.pendingHandSwaps && game.pendingHandSwaps > 0
            ? undefined
            : scheduleTurnTimer(io, roomId);

    const publicGameState = toPublicGameState(game);

    for (const player of game.players) {
        io.to(player.socketId).emit("game_update", {
            hand: game.hands[player.id],
            gameState: { ...publicGameState, turnExpiresAt },
        });
    }
}

function broadcastGameOver({
    io,
    game,
    roomId,
    winner,
    winnerId,
    loser,
}: {
    io: Server;
    game: GameState;
    roomId: string;
    winner?: string;
    winnerId?: string;
    loser?: string;
}) {
    clearTurnTimer(roomId);

    const payload: {
        roomId: string;
        winner?: string;
        loser?: string;
    } = {
        roomId: roomId,
        ...(winner && { winner }),
        ...(loser && { loser }),
    };

    io.to(roomId).emit("game_over", payload);

    delete gameStates[roomId];

    if (roomStates[roomId]) {
        roomStates[roomId].isStarted = false;
        if (winnerId) {
            roomStates[roomId].lastWinnerId = winnerId;
        }
        io.to(roomId).emit("room_update", roomStates[roomId]);
    }
}

function handlePlayerLeaveMidGame(
    io: Server,
    roomId: string,
    sessionId: string,
) {
    const game = gameStates[roomId];
    const roomState = roomStates[roomId];
    if (!game || !roomState) return;

    clearTurnTimer(roomId);

    const leaveIdx = game.players.findIndex((p) => p.id === sessionId);
    if (leaveIdx === -1) return;

    delete game.hands[sessionId];
    game.players = game.players.filter((p) => p.id !== sessionId);

    if (game.players.length < 2) {
        broadcastGameOver({
            io,
            game,
            roomId,
            winner: game.players[0]?.name,
            winnerId: game.players[0]?.id,
        });
        return;
    }

    if (game.currentPlayerIndex >= game.players.length) {
        game.currentPlayerIndex = 0;
    } else if (leaveIdx < game.currentPlayerIndex) {
        game.currentPlayerIndex = Math.max(0, game.currentPlayerIndex - 1);
    } else if (leaveIdx === game.currentPlayerIndex) {
        game.currentPlayerIndex = game.currentPlayerIndex % game.players.length;
    }

    syncCardCounters(game);
    broadcastGameState(io, game, roomId);
}

export {
    handleGameSockets,
    startGame,
    gameStates,
    handlePlayerLeaveMidGame,
    toPublicGameState,
};
