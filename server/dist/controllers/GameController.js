"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameStates = void 0;
exports.handleGameSockets = handleGameSockets;
exports.startGame = startGame;
const LobbyController_1 = require("./LobbyController");
const GameEngine_1 = require("../game/GameEngine");
const gameStates = {};
exports.gameStates = gameStates;
const DRAW_CARD_VALUES = ["+2", "+4", "reverse+4", "+6", "+10"];
const DRAW_CARD_STRENGTH = {
    "+2": 2,
    "+4": 4,
    "reverse+4": 4,
    "+6": 6,
    "+10": 10,
};
function startGame(io, roomState, roomId) {
    const publicGameState = {
        players: roomState.players,
        deck: (0, GameEngine_1.createDeck)(roomState.rule),
        discardPile: [],
        currentPlayerIndex: 0,
        direction: 1,
        playerCardCounter: {},
        activeColor: undefined,
    };
    roomState.isStarted = true;
    const [hands, deck] = (0, GameEngine_1.dealHands)(roomState.players, publicGameState.deck);
    publicGameState.deck = deck;
    publicGameState.discardPile.push(deck.pop());
    publicGameState.playerCardCounter = (0, GameEngine_1.getPlayerCardCounts)(hands);
    gameStates[roomId] = { hands, ...publicGameState };
    for (const player of roomState.players) {
        const playerHand = hands[player.id];
        io.to(player.id).emit("game_started", {
            hand: playerHand,
            gameState: publicGameState,
        });
    }
}
function handleGameSockets(io, socket) {
    socket.on("play_card", ({ roomId, cards, chosenColor, }) => {
        const game = gameStates[roomId];
        if (!game || cards.length === 0)
            return;
        const playerId = socket.id;
        const currentPlayer = game.players[game.currentPlayerIndex];
        if (currentPlayer.id !== playerId) {
            socket.emit("error", { message: "Not your turn." });
            return;
        }
        const playerHand = game.hands[playerId];
        // Make sure all cards exist in hand
        const isEveryCardInHand = cards.every((card) => playerHand.some((c) => c.color === card.color && c.value === card.value));
        if (!isEveryCardInHand) {
            socket.emit("error", {
                message: "Some cards are not in your hand.",
            });
            return;
        }
        if (cards.some((c) => c.color === "wild") &&
            chosenColor === undefined) {
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
        // Remove cards from hand
        for (const card of cards) {
            const index = playerHand.findIndex((c) => c.color === card.color && c.value === card.value);
            if (index !== -1)
                playerHand.splice(index, 1);
            game.discardPile.push(card); // push each card to discard pile
        }
        // Player draws two cards when last card is a function card
        if (playerHand.length === 1) {
            if ([
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
                //...(game.enableHandsRotate ? ["0"] : []),
                //...(game.enableHandsSwap) ? ["7"] : [])
            ].includes(playerHand[0].value)) {
                const newCard = drawCard(io, game, roomId, currentPlayer, 2);
                game.hands[currentPlayer.id].push(...newCard);
            }
            // Todo: Add a call last card logic
        }
        // Boardcast winner
        if (playerHand.length === 0) {
            broadcastGameOver({
                io,
                game,
                roomId,
                winner: currentPlayer.name,
            });
        }
        // Handle playing draw cards
        if (Object.keys(DRAW_CARD_STRENGTH).includes(cards[0].value)) {
            for (const card of cards) {
                if (game.pendingDrawCount) {
                    game.pendingDrawCount +=
                        DRAW_CARD_STRENGTH[card.value];
                }
                else {
                    game.pendingDrawCount =
                        DRAW_CARD_STRENGTH[card.value];
                }
            }
            game.miniumDrawValue = cards[0].value;
        }
        // Handle card effects (skip, draw, etc.)
        if (cards[0].value === "skip") {
            rotateBy(game, cards.length + 1);
        }
        else if (cards[0].value === "reverse" ||
            cards[0].value === "reverse+4") {
            if (cards.length % 2 === 1) {
                game.direction = (game.direction * -1);
            }
        }
        else if (cards[0].value === "skipAll") {
            //Do nothing - player take antoehr turn
        }
        else if (cards[0].value === "discardAll") {
            const discardCards = [...playerHand].filter((c) => c.color === cards[0].color);
            for (const card of discardCards) {
                const index = playerHand.findIndex((c) => c.color === card.color && c.value === card.value);
                if (index !== -1)
                    playerHand.splice(index, 1);
                game.discardPile.splice(game.discardPile.length - 1, 0, card);
            }
        }
        else if (cards[0].value === "colorRoulette") {
            rotateBy(game, 1);
            const currentPlayer = game.players[game.currentPlayerIndex];
            let drawnCards = [];
            while (true) {
                const newCard = drawCard(io, game, roomId, currentPlayer, 1)[0];
                if (!newCard)
                    break;
                game.hands[currentPlayer.id].push(newCard);
                drawnCards.push(newCard);
                if (newCard.color === chosenColor) {
                    break;
                }
            }
        }
        if (cards.some((c) => c.color === "wild")) {
            game.activeColor = chosenColor;
        }
        else if (game.activeColor) {
            // If a non-wild was played, clear activeColor
            game.activeColor = undefined;
        }
        // Rotate turn (you might want to skip this based on card effects)
        if (cards[0].value !== "skip" && cards[0].value !== "skipAll") {
            rotateBy(game, 1);
        }
        // Update the game state for all players
        game.playerCardCounter[playerId] = playerHand.length;
        broadcastGameState(io, game);
    });
    socket.on("take_draw", ({ roomId, count }) => {
        const game = gameStates[roomId];
        if (!game)
            return;
        const playerId = socket.id;
        const currentPlayer = game.players[game.currentPlayerIndex];
        if (currentPlayer.id !== playerId) {
            socket.emit("error", { message: "Not your turn." });
            return;
        }
        if (game.pendingDrawCount) {
            // Draw cards depends on the pending draw count
            const drawnCards = drawCard(io, game, roomId, currentPlayer, game.pendingDrawCount);
            game.hands[playerId].push(...drawnCards);
            game.playerCardCounter[playerId] += drawnCards.length;
            game.pendingDrawCount = 0;
            game.miniumDrawValue = undefined;
            rotateBy(game, 1);
        }
        else if (count) {
            // Draw cards depends on the count
            const drawnCards = drawCard(io, game, roomId, currentPlayer, count);
            game.hands[playerId].push(...drawnCards);
            game.playerCardCounter[playerId] += drawnCards.length;
            rotateBy(game, 1);
        }
        else {
            socket.emit("error", { message: "Invalid draw request." });
            return;
        }
        // Update the game state for all players
        broadcastGameState(io, game);
    });
}
/**
 * Validates whether the selected cards can be legally played based on the current game state.
 *
 * Rules enforced:
 * - All cards must match the top discard card in color, value, or be a wild.
 * - If playing multiple cards, all must have the same value.
 * - If the top card is a draw card (+2, +4, etc.), the played card must be a draw card
 *   of equal or higher strength.
 *
 * @param cards - The cards the player is attempting to play.
 * @param game - The current public game state (excluding player hands).
 * @returns true if the play is valid, false otherwise.
 */
function cardValidation(cards, game, chosenColor) {
    const topCard = game.discardPile[game.discardPile.length - 1];
    // Use active color if present
    const colorToMatch = game.activeColor || topCard.color;
    const isValidFirstCard = cards[0].color === colorToMatch ||
        cards[0].value === topCard.value ||
        cards[0].color === "wild";
    if (!isValidFirstCard) {
        return false;
    }
    if (game.pendingDrawCount &&
        !cards.every((c) => DRAW_CARD_VALUES.includes(c.value))) {
        return false;
    }
    // All cards must have same value if playing multiple at once
    if (cards.length > 1) {
        const isSameValue = cards.every((c) => c.value === cards[0].value);
        if (!isSameValue)
            return false;
    }
    // Check if there is a pending draw and validate the played cards values need to be higher than the top card
    if (game.pendingDrawCount) {
        const isHigherThanTopCard = cards.every((c) => DRAW_CARD_STRENGTH[c.value] >=
            DRAW_CARD_STRENGTH[game.miniumDrawValue]);
        if (!isHigherThanTopCard) {
            return false;
        }
    }
    return true;
}
function rotateBy(game, steps) {
    game.currentPlayerIndex =
        (game.currentPlayerIndex +
            steps * game.direction +
            game.players.length) %
            game.players.length;
}
/**
 *
 * CARD MUST ONLY BE DRAW USING THIS FUNCTION
 *
 * Draws a specified number of cards from the game's deck for a player.
 * If the deck is empty during drawing, the discard pile (except the top card)
 * is reshuffled into the deck to continue drawing.
 *
 * @param game - The current public game state containing the deck and discard pile.
 * @param numCards - The number of cards to draw.
 * @returns An array of cards drawn from the deck.
 */
function drawCard(io, game, roomId, player, numCards) {
    const drawnCards = [];
    for (let i = 0; i < numCards; i++) {
        if (game.deck.length === 0) {
            game.deck = (0, GameEngine_1.shuffle)(game.discardPile.slice(0, -1));
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
function broadcastGameState(io, game) {
    const { hands, ...publicGameState } = game;
    for (const player of game.players) {
        io.to(player.id).emit("game_update", {
            hand: hands[player.id],
            gameState: publicGameState,
        });
    }
}
function broadcastGameOver({ io, game, roomId, winner, loser, }) {
    const payload = {
        roomId: roomId,
        ...(winner && { winner }),
        ...(loser && { loser }),
    };
    for (const player of game.players) {
        io.to(player.id).emit("game_over", payload);
    }
    delete gameStates[roomId];
    // ADD THIS: reset roomState.isStarted to false
    if (LobbyController_1.roomStates[roomId]) {
        LobbyController_1.roomStates[roomId].isStarted = false;
    }
}
