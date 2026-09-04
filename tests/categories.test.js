/**
 * Category Tests: Category validation, CRUD transformation, assignment, and filtering
 * Tests pure functions without DOM or IndexedDB dependency
 */

import * as categoriesModule from '../js/categories.js';
import * as uiModule from '../js/ui.js';
import { test } from 'node:test';
import assert from 'node:assert';

// ============================================
// Category Name Validation
// ============================================

test('Category: validateCategoryName - valid name', () => {
    const result = categoriesModule.validateCategoryName('Rocks');
    assert.strictEqual(result.valid, true);
});

test('Category: validateCategoryName - empty string', () => {
    const result = categoriesModule.validateCategoryName('');
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /empty/i);
});

test('Category: validateCategoryName - whitespace only', () => {
    const result = categoriesModule.validateCategoryName('   ');
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /empty/i);
});

test('Category: validateCategoryName - non-string', () => {
    const result = categoriesModule.validateCategoryName(123);
    assert.strictEqual(result.valid, false);
});

// ============================================
// Create Category
// ============================================

test('Category: createCategory - valid data trims name and sets createdAt', () => {
    const result = categoriesModule.createCategory({ id: 'cat-1', name: '  Coins  ' });
    assert.strictEqual(result.error, undefined);
    assert.strictEqual(result.id, 'cat-1');
    assert.strictEqual(result.name, 'Coins');
    assert.ok(result.createdAt);
});

test('Category: createCategory - empty name returns error', () => {
    const result = categoriesModule.createCategory({ id: 'cat-1', name: '' });
    assert.ok(result.error);
});

// ============================================
// Rename Category
// ============================================

test('Category: updateCategory - rename updates name only', () => {
    const category = { id: 'cat-1', name: 'Coins', createdAt: '2024-01-01T00:00:00.000Z' };
    const result = categoriesModule.updateCategory(category, { name: 'Old Coins' });
    assert.strictEqual(result.error, undefined);
    assert.strictEqual(result.name, 'Old Coins');
    assert.strictEqual(result.id, 'cat-1');
    assert.strictEqual(result.createdAt, category.createdAt);
});

test('Category: updateCategory - rename with empty name returns error', () => {
    const category = { id: 'cat-1', name: 'Coins', createdAt: '2024-01-01T00:00:00.000Z' };
    const result = categoriesModule.updateCategory(category, { name: '   ' });
    assert.ok(result.error);
});

test('Category: updateCategory - missing category returns error', () => {
    const result = categoriesModule.updateCategory(null, { name: 'New Name' });
    assert.ok(result.error);
});

// ============================================
// Delete Category (list-level transformation)
// ============================================

test('Category: removeCategory - removes only the targeted category', () => {
    const categories = [
        { id: 'cat-1', name: 'Coins' },
        { id: 'cat-2', name: 'Rocks' }
    ];
    const result = categoriesModule.removeCategory(categories, 'cat-1');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 'cat-2');
});

// ============================================
// Single-category assignment
// ============================================

test('Category: assignItemToCategory - assigns single category, replacing previous', () => {
    const item = { id: 'item-1', name: 'Rock', categoryId: 'cat-1' };
    const result = categoriesModule.assignItemToCategory(item, 'cat-2');
    assert.strictEqual(result.categoryId, 'cat-2');
    assert.ok(result.updatedAt);
});

test('Category: assignItemToCategory - assigns Uncategorized (null)', () => {
    const item = { id: 'item-1', name: 'Rock', categoryId: 'cat-1' };
    const result = categoriesModule.assignItemToCategory(item, null);
    assert.strictEqual(result.categoryId, null);
});

// ============================================
// Delete Category does not delete Items
// ============================================

test('Category: uncategorizeItems - does not remove any items, only clears categoryId', () => {
    const items = [
        { id: 'item-1', name: 'Rock', categoryId: 'cat-1' },
        { id: 'item-2', name: 'Coin', categoryId: 'cat-2' },
        { id: 'item-3', name: 'Shell', categoryId: null }
    ];
    const result = categoriesModule.uncategorizeItems(items, 'cat-1');
    assert.strictEqual(result.length, items.length);
});

test('Category: uncategorizeItems - affected items become Uncategorized', () => {
    const items = [
        { id: 'item-1', name: 'Rock', categoryId: 'cat-1', story: 'Found in a river' }
    ];
    const result = categoriesModule.uncategorizeItems(items, 'cat-1');
    assert.strictEqual(result[0].categoryId, null);
    assert.strictEqual(result[0].name, 'Rock');
    assert.strictEqual(result[0].story, 'Found in a river');
});

test('Category: uncategorizeItems - unrelated items unchanged', () => {
    const items = [
        { id: 'item-1', name: 'Rock', categoryId: 'cat-1' },
        { id: 'item-2', name: 'Coin', categoryId: 'cat-2', rating: 4 }
    ];
    const result = categoriesModule.uncategorizeItems(items, 'cat-1');
    assert.strictEqual(result[1].categoryId, 'cat-2');
    assert.strictEqual(result[1].rating, 4);
    assert.strictEqual(result[1], items[1]); // unaffected item reference is unchanged
});

// ============================================
// Filtering: All / Category / Uncategorized
// ============================================

test('Filter: filterItemsByCategory - "all" returns every item', () => {
    const items = [
        { id: '1', categoryId: 'cat-1' },
        { id: '2', categoryId: null }
    ];
    const result = uiModule.filterItemsByCategory(items, 'all');
    assert.strictEqual(result.length, 2);
});

test('Filter: filterItemsByCategory - specific category returns only matching items', () => {
    const items = [
        { id: '1', categoryId: 'cat-1' },
        { id: '2', categoryId: 'cat-2' },
        { id: '3', categoryId: 'cat-1' }
    ];
    const result = uiModule.filterItemsByCategory(items, 'cat-1');
    assert.strictEqual(result.length, 2);
    assert.ok(result.every(item => item.categoryId === 'cat-1'));
});

test('Filter: filterItemsByCategory - "uncategorized" returns only items without a category', () => {
    const items = [
        { id: '1', categoryId: 'cat-1' },
        { id: '2', categoryId: null },
        { id: '3', categoryId: undefined }
    ];
    const result = uiModule.filterItemsByCategory(items, 'uncategorized');
    assert.strictEqual(result.length, 2);
});

// ============================================
// Invalid / missing category reference does not crash
// ============================================

test('Category: getCategoryById - missing categoryId returns null without throwing', () => {
    const categories = [{ id: 'cat-1', name: 'Coins' }];
    assert.doesNotThrow(() => {
        const result = categoriesModule.getCategoryById(categories, null);
        assert.strictEqual(result, null);
    });
});

test('Category: getCategoryById - stale/unknown categoryId returns undefined without throwing', () => {
    const categories = [{ id: 'cat-1', name: 'Coins' }];
    assert.doesNotThrow(() => {
        const result = categoriesModule.getCategoryById(categories, 'cat-deleted');
        assert.strictEqual(result, undefined);
    });
});

test('Filter: filterItemsByCategory - stale categoryId filter returns empty list without throwing', () => {
    const items = [{ id: '1', categoryId: 'cat-1' }];
    assert.doesNotThrow(() => {
        const result = uiModule.filterItemsByCategory(items, 'cat-deleted');
        assert.strictEqual(result.length, 0);
    });
});
