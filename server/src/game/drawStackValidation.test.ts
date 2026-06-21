import assert from "node:assert/strict";
import { test } from "node:test";
import type { Card } from "../models/types";
import {
    validateColorRoulettePlay,
    validateDrawStackResponse,
} from "./drawStackValidation";

const colorRoulette: Card = { color: "wild", value: "colorRoulette" };

const bluePlus4: Card = { color: "blue", value: "+4" };
const redPlus4: Card = { color: "red", value: "+4" };
const wildReverse4: Card = { color: "wild", value: "reverse+4" };
const wildPlus6: Card = { color: "wild", value: "+6" };
const redPlus2: Card = { color: "red", value: "+2" };

test("reverse+4 stack allows higher draw cards regardless of color", () => {
    assert.equal(
        validateDrawStackResponse(
            [wildPlus6],
            "reverse+4",
            "blue",
            "red",
            { requireChosenColorForWild: true },
        ),
        true,
    );
});

test("reverse+4 stack allows equal +4 matching active color", () => {
    assert.equal(
        validateDrawStackResponse([bluePlus4], "reverse+4", "blue"),
        true,
    );
});

test("reverse+4 stack rejects equal +4 of wrong color", () => {
    assert.equal(
        validateDrawStackResponse([redPlus4], "reverse+4", "blue"),
        false,
    );
});

test("reverse+4 stack rejects lower draw cards", () => {
    assert.equal(
        validateDrawStackResponse([redPlus2], "reverse+4", "blue"),
        false,
    );
});

test("reverse+4 stack allows wild equal card when color will match", () => {
    assert.equal(
        validateDrawStackResponse([wildReverse4], "reverse+4", "blue"),
        true,
    );
});

test("reverse+4 stack rejects wild equal card with wrong chosen color", () => {
    assert.equal(
        validateDrawStackResponse(
            [wildReverse4],
            "reverse+4",
            "blue",
            "red",
            { requireChosenColorForWild: true },
        ),
        false,
    );
});

test("other draw stacks still ignore color for equal strength", () => {
    assert.equal(
        validateDrawStackResponse([redPlus4], "+4", undefined),
        true,
    );
});

test("color roulette rejects multiple cards in one play", () => {
    assert.equal(
        validateColorRoulettePlay([colorRoulette, colorRoulette]),
        false,
    );
});

test("color roulette rejects play while draw stack is active", () => {
    assert.equal(validateColorRoulettePlay([colorRoulette], 4), false);
});

test("color roulette allows a single card with no draw stack", () => {
    assert.equal(validateColorRoulettePlay([colorRoulette]), true);
    assert.equal(validateColorRoulettePlay([colorRoulette], 0), true);
});

test("color roulette validation ignores non-roulette plays", () => {
    assert.equal(validateColorRoulettePlay([redPlus2]), true);
    assert.equal(validateColorRoulettePlay([redPlus2, redPlus2], 4), true);
});
