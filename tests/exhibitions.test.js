/**
 * Exhibition Tests: name/item validation, ordering, reference cleanup, and lifecycle
 * Tests pure functions without DOM or IndexedDB dependency
 */

import * as exhibitionsModule from '../js/exhibitions.js';
import { test } from 'node:test';
import assert from 'node:assert';

const items = [
    { id: 'item-a', name: 'A' },
    { id: 'item-b', name: 'B' },
    { id: 'item-c', name: 'C' }
];

// ============================================
// Exhibition Name Validation
// ============================================

test('Exhibition: validateExhibitionName - valid name', () => {
    const result = exhibitionsModule.validateExhibitionName('My Top 5 Weird Rocks');
    assert.strictEqual(result.valid, true);
});

test('Exhibition: validateExhibitionName - empty string', () => {
    const result = exhibitionsModule.validateExhibitionName('');
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /empty/i);
});

test('Exhibition: validateExhibitionName - whitespace only', () => {
    const result = exhibitionsModule.validateExhibitionName('   ');
    assert.strictEqual(result.valid, false);
});

// ============================================
// Create Exhibition - item count validation
// ============================================

test('Exhibition: createExhibition - zero items is invalid', () => {
    const result = exhibitionsModule.createExhibition({ id: 'ex-1', name: 'Empty Show', itemIds: [] }, items);
    assert.ok(result.error);
    assert.match(result.error, /at least one item/i);
});

test('Exhibition: createExhibition - at least one item is valid', () => {
    const result = exhibitionsModule.createExhibition({ id: 'ex-1', name: 'Rocks', itemIds: ['item-a'] }, items);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.itemIds, ['item-a']);
});

test('Exhibition: createExhibition - duplicate itemIds rejected', () => {
    const result = exhibitionsModule.createExhibition({ id: 'ex-1', name: 'Rocks', itemIds: ['item-a', 'item-a'] }, items);
    assert.ok(result.error);
    assert.match(result.error, /duplicate/i);
});

test('Exhibition: createExhibition - preserves ordered itemIds', () => {
    const result = exhibitionsModule.createExhibition(
        { id: 'ex-1', name: 'Rocks', itemIds: ['item-c', 'item-a', 'item-b'] },
        items
    );
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.itemIds, ['item-c', 'item-a', 'item-b']);
});

// ============================================
// Ordering: Move Up / Move Down
// ============================================

test('Exhibition: moveItemUp - swaps with previous item', () => {
    const exhibition = { id: 'ex-1', itemIds: ['item-a', 'item-b', 'item-c'] };
    const result = exhibitionsModule.moveItemUp(exhibition, 1);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.itemIds, ['item-b', 'item-a', 'item-c']);
});

test('Exhibition: moveItemDown - swaps with next item', () => {
    const exhibition = { id: 'ex-1', itemIds: ['item-a', 'item-b', 'item-c'] };
    const result = exhibitionsModule.moveItemDown(exhibition, 1);
    assert.strictEqual(result.error, undefined);
    assert.deepStrictEqual(result.itemIds, ['item-a', 'item-c', 'item-b']);
});

test('Exhibition: moveItemUp - first item boundary is a no-op error, order unchanged', () => {
    const exhibition = { id: 'ex-1', itemIds: ['item-a', 'item-b', 'item-c'] };
    const result = exhibitionsModule.moveItemUp(exhibition, 0);
    assert.ok(result.error);
    assert.deepStrictEqual(exhibition.itemIds, ['item-a', 'item-b', 'item-c']);
});

test('Exhibition: moveItemDown - last item boundary is a no-op error, order unchanged', () => {
    const exhibition = { id: 'ex-1', itemIds: ['item-a', 'item-b', 'item-c'] };
    const result = exhibitionsModule.moveItemDown(exhibition, 2);
    assert.ok(result.error);
    assert.deepStrictEqual(exhibition.itemIds, ['item-a', 'item-b', 'item-c']);
});

// ============================================
// Deleted Item Reference Cleanup
// ============================================

test('Exhibition: removeItemFromExhibition - removes reference, keeps remaining order', () => {
    const exhibition = { id: 'ex-1', itemIds: ['item-a', 'item-b', 'item-c'], updatedAt: '2024-01-01T00:00:00.000Z' };
    const result = exhibitionsModule.removeItemFromExhibition(exhibition, 'item-b');
    assert.deepStrictEqual(result.itemIds, ['item-a', 'item-c']);
});

test('Exhibition: cleanupStaleReferences - drops missing item ids, preserves remaining order', () => {
    const exhibition = { id: 'ex-1', itemIds: ['item-a', 'item-b', 'item-c'] };
    const remainingItems = [items[0], items[2]]; // item-b deleted
    const result = exhibitionsModule.cleanupStaleReferences(exhibition, remainingItems);
    assert.deepStrictEqual(result.itemIds, ['item-a', 'item-c']);
});

test('Exhibition: removeItemFromExhibition - deleting last item leaves empty array, not deleted', () => {
    const exhibition = { id: 'ex-1', itemIds: ['item-a'] };
    const result = exhibitionsModule.removeItemFromExhibition(exhibition, 'item-a');
    assert.deepStrictEqual(result.itemIds, []);
    assert.strictEqual(result.id, 'ex-1');
});

test('Exhibition: getExhibitionItems - empty existing exhibition reads safely', () => {
    const exhibition = { id: 'ex-1', itemIds: [] };
    const result = exhibitionsModule.getExhibitionItems(exhibition, items);
    assert.deepStrictEqual(result, []);
});

test('Exhibition: getExhibitionItems - filters out stale references without crashing', () => {
    const exhibition = { id: 'ex-1', itemIds: ['item-a', 'missing-item'] };
    const result = exhibitionsModule.getExhibitionItems(exhibition, items);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 'item-a');
});

// ============================================
// Timestamp Lifecycle
// ============================================

test('Exhibition: createExhibition - sets createdAt and updatedAt on first create', () => {
    const result = exhibitionsModule.createExhibition({ id: 'ex-1', name: 'Rocks', itemIds: ['item-a'] }, items);
    assert.ok(result.createdAt);
    assert.strictEqual(result.createdAt, result.updatedAt);
});

test('Exhibition: updateExhibition - keeps createdAt, refreshes updatedAt', () => {
    const original = exhibitionsModule.createExhibition({ id: 'ex-1', name: 'Rocks', itemIds: ['item-a'] }, items);
    const updated = exhibitionsModule.updateExhibition(original, { name: 'Renamed Rocks' }, items);
    assert.strictEqual(updated.error, undefined);
    assert.strictEqual(updated.createdAt, original.createdAt);
    assert.notStrictEqual(updated.updatedAt, undefined);
});

test('Exhibition: updateExhibition - rejects rename to empty name', () => {
    const original = exhibitionsModule.createExhibition({ id: 'ex-1', name: 'Rocks', itemIds: ['item-a'] }, items);
    const result = exhibitionsModule.updateExhibition(original, { name: '   ' }, items);
    assert.ok(result.error);
});

test('Exhibition: updateExhibition - rejects saving with zero items (empty existing exhibition re-save)', () => {
    const emptyExisting = { id: 'ex-1', name: 'Rocks', itemIds: [], createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' };
    const result = exhibitionsModule.updateExhibition(emptyExisting, { name: 'Rocks', itemIds: [] }, items);
    assert.ok(result.error);
    assert.match(result.error, /at least one item/i);
});
