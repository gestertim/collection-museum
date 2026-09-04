/**
 * Achievement Tests: threshold calculation and false -> true event crossing detection
 * Tests pure functions without DOM or IndexedDB dependency
 */

import * as achievementsModule from '../js/achievements.js';
import { test } from 'node:test';
import assert from 'node:assert';

const { ACHIEVEMENT_TYPES, calculateAchievements, getUnlockedAchievements, getUnlockedFeedback, isAchievementUnlocked } = achievementsModule;

function makeItems(count, storyCount = 0) {
    const items = [];
    for (let i = 0; i < count; i++) {
        items.push({
            id: `item-${i}`,
            name: `Item ${i}`,
            story: i < storyCount ? `Story for item ${i}` : '',
            location: '',
            rating: null,
            categoryId: null
        });
    }
    return items;
}

function makeCategories(count) {
    return Array.from({ length: count }, (_, i) => ({ id: `cat-${i}`, name: `Category ${i}` }));
}

function makeExhibitions(count) {
    return Array.from({ length: count }, (_, i) => ({ id: `ex-${i}`, name: `Exhibition ${i}`, itemIds: ['item-0'] }));
}

// ============================================
// A. First Item: 0 -> 1 triggers once
// ============================================

test('Achievement: First Item - 0 to 1 triggers', () => {
    const before = calculateAchievements(makeItems(0), makeCategories(0), makeExhibitions(0));
    const after = calculateAchievements(makeItems(1), makeCategories(0), makeExhibitions(0));
    const unlocked = getUnlockedAchievements(before, after);
    assert.ok(unlocked.includes(ACHIEVEMENT_TYPES.FIRST_ITEM_CATALOGED));
    assert.strictEqual(unlocked.length, 1);
});

// ============================================
// B. 10 Items: 9 -> 10 triggers
// ============================================

test('Achievement: 10 Items - 9 to 10 triggers', () => {
    const before = calculateAchievements(makeItems(9), makeCategories(0), makeExhibitions(0));
    const after = calculateAchievements(makeItems(10), makeCategories(0), makeExhibitions(0));
    const unlocked = getUnlockedAchievements(before, after);
    assert.ok(unlocked.includes(ACHIEVEMENT_TYPES.TEN_ITEMS_CATALOGED));
});

// ============================================
// C. Reload at 10: no replay (before === after, no diff)
// ============================================

test('Achievement: reload with existing 10 items does not replay', () => {
    // Startup/reload only computes current state once; it must not be diffed
    // against an empty "before" state the way a real mutation would be.
    const currentState = calculateAchievements(makeItems(10), makeCategories(0), makeExhibitions(0));
    const unlocked = getUnlockedAchievements(currentState, currentState);
    assert.strictEqual(unlocked.length, 0);
});

// ============================================
// D. true -> true: editing an item while already at 10 does not replay
// ============================================

test('Achievement: 10 Items - editing an existing item does not retrigger', () => {
    const before = calculateAchievements(makeItems(10), makeCategories(0), makeExhibitions(0));
    const after = calculateAchievements(makeItems(10), makeCategories(0), makeExhibitions(0));
    assert.strictEqual(isAchievementUnlocked(ACHIEVEMENT_TYPES.TEN_ITEMS_CATALOGED, before, after), false);
});

// ============================================
// E. true -> false: deleting down from 10 does not show feedback
// ============================================

test('Achievement: 10 Items - dropping to 9 shows no feedback', () => {
    const before = calculateAchievements(makeItems(10), makeCategories(0), makeExhibitions(0));
    const after = calculateAchievements(makeItems(9), makeCategories(0), makeExhibitions(0));
    const unlocked = getUnlockedAchievements(before, after);
    assert.strictEqual(unlocked.length, 0);
});

// ============================================
// F. re-cross: 10 -> 9 -> 10 can trigger again
// ============================================

test('Achievement: 10 Items - re-crossing after drop can trigger again', () => {
    const atTen = calculateAchievements(makeItems(10), makeCategories(0), makeExhibitions(0));
    const atNine = calculateAchievements(makeItems(9), makeCategories(0), makeExhibitions(0));

    // 10 -> 9: no feedback
    assert.strictEqual(isAchievementUnlocked(ACHIEVEMENT_TYPES.TEN_ITEMS_CATALOGED, atTen, atNine), false);

    // 9 -> 10 again: triggers
    assert.strictEqual(isAchievementUnlocked(ACHIEVEMENT_TYPES.TEN_ITEMS_CATALOGED, atNine, atTen), true);
});

// ============================================
// G. First Exhibition: 0 -> 1 triggers
// ============================================

test('Achievement: First Exhibition - 0 to 1 triggers', () => {
    const before = calculateAchievements(makeItems(1), makeCategories(0), makeExhibitions(0));
    const after = calculateAchievements(makeItems(1), makeCategories(0), makeExhibitions(1));
    const unlocked = getUnlockedAchievements(before, after);
    assert.ok(unlocked.includes(ACHIEVEMENT_TYPES.FIRST_EXHIBIT_CREATED));
});

// ============================================
// H. 3 Categories: 2 -> 3 triggers
// ============================================

test('Achievement: 3 Categories - 2 to 3 triggers', () => {
    const before = calculateAchievements(makeItems(0), makeCategories(2), makeExhibitions(0));
    const after = calculateAchievements(makeItems(0), makeCategories(3), makeExhibitions(0));
    const unlocked = getUnlockedAchievements(before, after);
    assert.ok(unlocked.includes(ACHIEVEMENT_TYPES.THREE_CATEGORIES_CREATED));
});

// ============================================
// I. 5 Item Stories Told: 4 -> 5 triggers
// ============================================

test('Achievement: 5 Item Stories Told - 4 to 5 non-empty stories triggers', () => {
    const before = calculateAchievements(makeItems(5, 4), makeCategories(0), makeExhibitions(0));
    const after = calculateAchievements(makeItems(5, 5), makeCategories(0), makeExhibitions(0));
    const unlocked = getUnlockedAchievements(before, after);
    assert.ok(unlocked.includes(ACHIEVEMENT_TYPES.FIVE_ITEM_STORIES_TOLD));
});

// ============================================
// J. Non-story edit does not falsely cross the story threshold
// ============================================

test('Achievement: editing name/location/rating does not affect story count', () => {
    const items = makeItems(5, 4);
    const before = calculateAchievements(items, makeCategories(0), makeExhibitions(0));

    const editedItems = items.map((item, index) =>
        index === 0 ? { ...item, name: 'Renamed', location: 'Attic', rating: 5 } : item
    );
    const after = calculateAchievements(editedItems, makeCategories(0), makeExhibitions(0));

    assert.strictEqual(isAchievementUnlocked(ACHIEVEMENT_TYPES.FIVE_ITEM_STORIES_TOLD, before, after), false);
});

// ============================================
// K. Empty / whitespace story is not counted
// ============================================

test('Achievement: whitespace-only story is not counted toward story threshold', () => {
    const items = makeItems(5, 4);
    items[4].story = '   ';
    const state = calculateAchievements(items, makeCategories(0), makeExhibitions(0));
    assert.strictEqual(state[ACHIEVEMENT_TYPES.FIVE_ITEM_STORIES_TOLD], false);
});

// ============================================
// L. Multiple achievements unlocked by the same mutation
// ============================================

test('Achievement: multiple thresholds crossed in one mutation are all returned', () => {
    const before = calculateAchievements(makeItems(0), makeCategories(0), makeExhibitions(0));
    const after = calculateAchievements(makeItems(10), makeCategories(0), makeExhibitions(0));
    const unlocked = getUnlockedAchievements(before, after);
    assert.ok(unlocked.includes(ACHIEVEMENT_TYPES.FIRST_ITEM_CATALOGED));
    assert.ok(unlocked.includes(ACHIEVEMENT_TYPES.TEN_ITEMS_CATALOGED));
    assert.strictEqual(unlocked.length, 2);

    const feedback = getUnlockedFeedback(before, after);
    assert.strictEqual(feedback.length, 2);
});

// ============================================
// M. Pure logic does not depend on persisted displayed state
// ============================================

test('Achievement: calculation is pure and does not reference storage globals', () => {
    assert.strictEqual(typeof globalThis.localStorage, 'undefined');
    const state = calculateAchievements(makeItems(1), makeCategories(0), makeExhibitions(0));
    assert.deepStrictEqual(Object.keys(state).sort(), Object.values(ACHIEVEMENT_TYPES).sort());
});
