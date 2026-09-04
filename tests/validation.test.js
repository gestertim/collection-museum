/**
 * Validation Tests: Item, Category, Exhibition validation logic
 * Tests pure functions without DOM or IndexedDB dependency
 */

import * as itemsModule from '../js/items.js';
import * as categoriesModule from '../js/categories.js';
import * as exhibitionsModule from '../js/exhibitions.js';
import { test } from 'node:test';
import assert from 'node:assert';

// ============================================
// Item Validation Tests
// ============================================

test('Item: validateItemName - valid name', () => {
    const result = itemsModule.validateItemName('My Item');
    assert.strictEqual(result.valid, true);
});

test('Item: validateItemName - empty string', () => {
    const result = itemsModule.validateItemName('');
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /empty/i);
});

test('Item: validateItemName - whitespace only', () => {
    const result = itemsModule.validateItemName('   ');
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /empty/i);
});

test('Item: validateItemName - non-string', () => {
    const result = itemsModule.validateItemName(123);
    assert.strictEqual(result.valid, false);
});

test('Item: validateItemRating - valid 1-5', () => {
    for (let i = 1; i <= 5; i++) {
        const result = itemsModule.validateItemRating(i);
        assert.strictEqual(result.valid, true, `Rating ${i} should be valid`);
    }
});

test('Item: validateItemRating - null/undefined', () => {
    let result = itemsModule.validateItemRating(null);
    assert.strictEqual(result.valid, true);

    result = itemsModule.validateItemRating(undefined);
    assert.strictEqual(result.valid, true);

    result = itemsModule.validateItemRating('');
    assert.strictEqual(result.valid, true);
});

test('Item: validateItemRating - invalid 0', () => {
    const result = itemsModule.validateItemRating(0);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /between 1 and 5/i);
});

test('Item: validateItemRating - invalid 6', () => {
    const result = itemsModule.validateItemRating(6);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /between 1 and 5/i);
});

test('Item: validateItemRating - non-integer', () => {
    const result = itemsModule.validateItemRating(3.5);
    assert.strictEqual(result.valid, false);
});

test('Item: createItem - success with minimal data', () => {
    const item = itemsModule.createItem({
        id: 'item1',
        name: 'Test Item'
    });

    assert.strictEqual(item.id, 'item1');
    assert.strictEqual(item.name, 'Test Item');
    assert.strictEqual(item.photo, null);
    assert.strictEqual(item.categoryId, null);
    assert.strictEqual(item.rating, null);
    assert.ok(item.createdAt);
    assert.ok(item.updatedAt);
});

test('Item: createItem - fail with empty name', () => {
    const result = itemsModule.createItem({
        id: 'item1',
        name: '   '
    });

    assert.ok(result.error);
    assert.match(result.error, /empty/i);
});

test('Item: createItem - trimmed name', () => {
    const item = itemsModule.createItem({
        id: 'item1',
        name: '  My Item  '
    });

    assert.strictEqual(item.name, 'My Item');
});

test('Item: updateItem - update name', () => {
    const original = itemsModule.createItem({
        id: 'item1',
        name: 'Original Name'
    });

    const updated = itemsModule.updateItem(original, { name: 'Updated Name' });

    assert.strictEqual(updated.name, 'Updated Name');
    assert.strictEqual(updated.createdAt, original.createdAt);
    assert.notStrictEqual(updated.updatedAt, original.updatedAt);
});

test('Item: updateItem - preserves createdAt and normalizes optional fields', () => {
    const original = itemsModule.createItem({
        id: 'item1',
        name: 'Original Name',
        createdAt: '2026-09-04T00:00:00.000Z'
    });

    const updated = itemsModule.updateItem(original, {
        name: '  Updated Name  ',
        location: '  Garden  ',
        story: '  A special find.  ',
        rating: 5
    });

    assert.strictEqual(updated.createdAt, '2026-09-04T00:00:00.000Z');
    assert.strictEqual(updated.name, 'Updated Name');
    assert.strictEqual(updated.location, 'Garden');
    assert.strictEqual(updated.story, 'A special find.');
    assert.strictEqual(updated.rating, 5);
    assert.notStrictEqual(updated.updatedAt, original.updatedAt);
});

test('Item: removeItemFromExhibitions - removes from affected exhibitions', () => {
    const exhibitions = [
        { id: 'ex1', itemIds: ['item1', 'item2', 'item3'] },
        { id: 'ex2', itemIds: ['item2', 'item3'] },
        { id: 'ex3', itemIds: ['item4'] }
    ];

    const result = itemsModule.removeItemFromExhibitions(exhibitions, 'item2');

    assert.deepStrictEqual(result[0].itemIds, ['item1', 'item3']);
    assert.deepStrictEqual(result[1].itemIds, ['item3']);
    assert.deepStrictEqual(result[2].itemIds, ['item4']);
});

test('Item: removeItemFromExhibitions - preserves exhibitions including empty result', () => {
    const exhibitions = [
        { id: 'ex1', name: 'One item', itemIds: ['item1'] },
        { id: 'ex2', name: 'Multiple items', itemIds: ['item1', 'item2'] },
        { id: 'ex3', name: 'Unrelated', itemIds: ['item3'] }
    ];

    const result = itemsModule.removeItemFromExhibitions(exhibitions, 'item1');

    assert.strictEqual(result.length, 3);
    assert.deepStrictEqual(result[0].itemIds, []);
    assert.deepStrictEqual(result[1].itemIds, ['item2']);
    assert.deepStrictEqual(result[2].itemIds, ['item3']);
});

// ============================================
// Category Validation Tests
// ============================================

test('Category: validateCategoryName - valid', () => {
    const result = categoriesModule.validateCategoryName('Books');
    assert.strictEqual(result.valid, true);
});

test('Category: validateCategoryName - empty', () => {
    const result = categoriesModule.validateCategoryName('  ');
    assert.strictEqual(result.valid, false);
});

test('Category: createCategory - success', () => {
    const category = categoriesModule.createCategory({
        id: 'cat1',
        name: 'Books'
    });

    assert.strictEqual(category.id, 'cat1');
    assert.strictEqual(category.name, 'Books');
    assert.ok(category.createdAt);
});

test('Category: createCategory - fail with empty name', () => {
    const result = categoriesModule.createCategory({
        id: 'cat1',
        name: ''
    });

    assert.ok(result.error);
});

test('Category: uncategorizeItems - convert items to uncategorized', () => {
    const items = [
        { id: 'item1', categoryId: 'cat1', name: 'Item 1' },
        { id: 'item2', categoryId: 'cat1', name: 'Item 2' },
        { id: 'item3', categoryId: 'cat2', name: 'Item 3' }
    ];

    const result = categoriesModule.uncategorizeItems(items, 'cat1');

    assert.strictEqual(result[0].categoryId, null);
    assert.strictEqual(result[1].categoryId, null);
    assert.strictEqual(result[2].categoryId, 'cat2');
});

test('Category: assignItemToCategory - assign item to category', () => {
    const item = { id: 'item1', categoryId: null, name: 'Item 1' };
    const result = categoriesModule.assignItemToCategory(item, 'cat1');

    assert.strictEqual(result.categoryId, 'cat1');
});

test('Category: getItemsByCategory - filter items', () => {
    const items = [
        { id: 'item1', categoryId: 'cat1', name: 'Item 1' },
        { id: 'item2', categoryId: 'cat1', name: 'Item 2' },
        { id: 'item3', categoryId: 'cat2', name: 'Item 3' }
    ];

    const result = categoriesModule.getItemsByCategory(items, 'cat1');

    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].id, 'item1');
    assert.strictEqual(result[1].id, 'item2');
});

// ============================================
// Exhibition Validation Tests
// ============================================

test('Exhibition: validateExhibitionName - valid', () => {
    const result = exhibitionsModule.validateExhibitionName('Summer Collection');
    assert.strictEqual(result.valid, true);
});

test('Exhibition: validateExhibitionName - empty', () => {
    const result = exhibitionsModule.validateExhibitionName('  ');
    assert.strictEqual(result.valid, false);
});

test('Exhibition: validateExhibitionItems - valid', () => {
    const items = [
        { id: 'item1', name: 'Item 1' },
        { id: 'item2', name: 'Item 2' }
    ];

    const result = exhibitionsModule.validateExhibitionItems(['item1', 'item2'], items);
    assert.strictEqual(result.valid, true);
});

test('Exhibition: validateExhibitionItems - empty array', () => {
    const result = exhibitionsModule.validateExhibitionItems([], []);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /at least one/i);
});

test('Exhibition: validateExhibitionItems - duplicate IDs', () => {
    const items = [{ id: 'item1' }];
    const result = exhibitionsModule.validateExhibitionItems(['item1', 'item1'], items);
    assert.strictEqual(result.valid, false);
    assert.match(result.error, /duplicate/i);
});

test('Exhibition: createExhibition - success', () => {
    const items = [{ id: 'item1' }, { id: 'item2' }];
    const ex = exhibitionsModule.createExhibition({
        id: 'ex1',
        name: 'Gallery 1',
        itemIds: ['item1', 'item2']
    }, items);

    assert.strictEqual(ex.id, 'ex1');
    assert.strictEqual(ex.name, 'Gallery 1');
    assert.deepStrictEqual(ex.itemIds, ['item1', 'item2']);
    assert.ok(ex.createdAt);
});

test('Exhibition: createExhibition - fail with empty name', () => {
    const result = exhibitionsModule.createExhibition({
        id: 'ex1',
        name: '',
        itemIds: ['item1']
    }, [{ id: 'item1' }]);

    assert.ok(result.error);
});

test('Exhibition: moveItemUp - success', () => {
    const ex = { id: 'ex1', name: 'Gallery', itemIds: ['item1', 'item2', 'item3'] };
    const result = exhibitionsModule.moveItemUp(ex, 1);

    assert.deepStrictEqual(result.itemIds, ['item2', 'item1', 'item3']);
});

test('Exhibition: moveItemUp - cannot move first item up', () => {
    const ex = { id: 'ex1', name: 'Gallery', itemIds: ['item1', 'item2'] };
    const result = exhibitionsModule.moveItemUp(ex, 0);

    assert.ok(result.error);
});

test('Exhibition: moveItemDown - success', () => {
    const ex = { id: 'ex1', name: 'Gallery', itemIds: ['item1', 'item2', 'item3'] };
    const result = exhibitionsModule.moveItemDown(ex, 1);

    assert.deepStrictEqual(result.itemIds, ['item1', 'item3', 'item2']);
});

test('Exhibition: cleanupStaleReferences - remove missing items', () => {
    const ex = { id: 'ex1', itemIds: ['item1', 'item2', 'item3'] };
    const items = [{ id: 'item1' }, { id: 'item3' }];

    const result = exhibitionsModule.cleanupStaleReferences(ex, items);

    assert.deepStrictEqual(result.itemIds, ['item1', 'item3']);
});
