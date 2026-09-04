/**
 * UI Tests: Museum summary, featured items, and UI helper functions
 * Tests pure functions without DOM dependency
 */

import * as uiModule from '../js/ui.js';
import { test } from 'node:test';
import assert from 'node:assert';

// ============================================
// Museum Summary Tests
// ============================================

test('UI: getMuseumSummary - correct counts', () => {
    const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
    ];
    const categories = [
        { id: 'cat1', name: 'Books' },
        { id: 'cat2', name: 'Toys' }
    ];
    const exhibitions = [
        { id: 'ex1', name: 'Gallery 1' }
    ];

    const summary = uiModule.getMuseumSummary(items, categories, exhibitions);

    assert.strictEqual(summary.itemCount, 2);
    assert.strictEqual(summary.categoryCount, 2);
    assert.strictEqual(summary.exhibitionCount, 1);
});

test('UI: getMuseumSummary - empty data', () => {
    const summary = uiModule.getMuseumSummary([], [], []);

    assert.strictEqual(summary.itemCount, 0);
    assert.strictEqual(summary.categoryCount, 0);
    assert.strictEqual(summary.exhibitionCount, 0);
});

// ============================================
// Featured Items Tests
// ============================================

test('UI: getFeaturedItems - sort by createdAt descending', () => {
    const items = [
        { id: '1', name: 'Item 1', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', name: 'Item 2', createdAt: '2024-01-03T00:00:00Z' },
        { id: '3', name: 'Item 3', createdAt: '2024-01-02T00:00:00Z' }
    ];

    const featured = uiModule.getFeaturedItems(items);

    assert.strictEqual(featured.length, 3);
    assert.strictEqual(featured[0].id, '2'); // Newest
    assert.strictEqual(featured[1].id, '3');
    assert.strictEqual(featured[2].id, '1'); // Oldest
});

test('UI: getFeaturedItems - limit to 4', () => {
    const items = Array(6).fill(null).map((_, i) => ({
        id: String(i),
        name: `Item ${i}`,
        createdAt: new Date(2024, 0, 6 - i).toISOString()
    }));

    const featured = uiModule.getFeaturedItems(items);

    assert.strictEqual(featured.length, 4);
});

test('UI: getFeaturedItems - handle invalid timestamps', () => {
    const items = [
        { id: '1', name: 'Item 1', createdAt: 'invalid' },
        { id: '2', name: 'Item 2', createdAt: '2024-01-01T00:00:00Z' },
        { id: '3', name: 'Item 3', createdAt: null }
    ];

    const featured = uiModule.getFeaturedItems(items);

    // Valid timestamp should come first
    assert.strictEqual(featured[0].id, '2');
    // Invalid timestamps sorted by id
    assert.ok(featured.slice(1).every(item => item.id === '1' || item.id === '3'));
});

test('UI: getFeaturedItems - same timestamp tie-break by id', () => {
    const items = [
        { id: 'c', name: 'Item C', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'a', name: 'Item A', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'b', name: 'Item B', createdAt: '2024-01-01T00:00:00Z' }
    ];

    const featured = uiModule.getFeaturedItems(items);

    assert.strictEqual(featured[0].id, 'a');
    assert.strictEqual(featured[1].id, 'b');
    assert.strictEqual(featured[2].id, 'c');
});

test('UI: getFeaturedItems - empty collection hides featured items', () => {
    assert.deepStrictEqual(uiModule.getFeaturedItems([]), []);
});

test('UI: getFeaturedItems - invalid timestamps follow valid items deterministically', () => {
    const items = [
        { id: 'z-invalid', createdAt: 'not-a-date' },
        { id: 'b-valid', createdAt: '2024-01-02T00:00:00Z' },
        { id: 'a-missing' },
        { id: 'a-valid', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'm-invalid', createdAt: null }
    ];

    const featured = uiModule.getFeaturedItems(items);

    assert.deepStrictEqual(featured.map(item => item.id), [
        'b-valid', 'a-valid', 'a-missing', 'm-invalid', 'z-invalid'
    ].slice(0, 4));
    assert.deepStrictEqual(
        uiModule.getFeaturedItems([...items].reverse()).map(item => item.id),
        featured.map(item => item.id)
    );
});

test('UI: filterItemsByCategory - filters all, category, and uncategorized items', () => {
    const items = [
        { id: 'one', categoryId: 'books' },
        { id: 'two', categoryId: null },
        { id: 'three', categoryId: 'toys' }
    ];

    assert.deepStrictEqual(uiModule.filterItemsByCategory(items, 'all'), items);
    assert.deepStrictEqual(uiModule.filterItemsByCategory(items, 'books'), [items[0]]);
    assert.deepStrictEqual(uiModule.filterItemsByCategory(items, 'uncategorized'), [items[1]]);
});

// ============================================
// Date Formatting Tests
// ============================================

test('UI: formatDate - valid ISO string', () => {
    const formatted = uiModule.formatDate('2024-01-15T10:30:00Z');
    assert.match(formatted, /Jan 15/);
});

test('UI: formatDate - invalid string', () => {
    const formatted = uiModule.formatDate('invalid');
    assert.strictEqual(formatted, '');
});

test('UI: formatDate - null/undefined', () => {
    let formatted = uiModule.formatDate(null);
    assert.strictEqual(formatted, '');

    formatted = uiModule.formatDate(undefined);
    assert.strictEqual(formatted, '');
});

// ============================================
// HTML Escaping Tests
// ============================================

test('UI: escapeHtml - escape special characters', () => {
    const input = '<script>alert("xss")</script>';
    const output = uiModule.escapeHtml(input);

    assert.ok(!output.includes('<'));
    assert.ok(!output.includes('>'));
    assert.ok(output.includes('&lt;'));
    assert.ok(output.includes('&gt;'));
});

test('UI: escapeHtml - escape quotes', () => {
    const input = 'He said "Hello" and it\'s fine';
    const output = uiModule.escapeHtml(input);

    assert.ok(output.includes('&quot;'));
    assert.ok(output.includes('&#039;'));
});

test('UI: escapeHtml - escape ampersand', () => {
    const input = 'AT&T';
    const output = uiModule.escapeHtml(input);

    assert.ok(output.includes('&amp;'));
});

test('UI: escapeHtml - non-string input', () => {
    const output = uiModule.escapeHtml(123);
    assert.strictEqual(output, '');
});

// ============================================
// Message Creation Tests
// ============================================

test('UI: createErrorMessage - contains error class', () => {
    const html = uiModule.createErrorMessage('Test error');
    assert.ok(html.includes('error-message'));
    assert.ok(html.includes('Test error'));
});

test('UI: createSuccessMessage - contains success class', () => {
    const html = uiModule.createSuccessMessage('Success!');
    assert.ok(html.includes('success-message'));
    assert.ok(html.includes('Success!'));
});

test('UI: createEmptyState - contains empty-state class', () => {
    const html = uiModule.createEmptyState('📦', 'Empty', 'No items');
    assert.ok(html.includes('empty-state'));
    assert.ok(html.includes('📦'));
    assert.ok(html.includes('Empty'));
});

// ============================================
// Debounce Tests
// ============================================

test('UI: debounce - calls function after delay', async () => {
    let callCount = 0;
    const func = () => callCount++;
    const debounced = uiModule.debounce(func, 50);

    debounced();
    debounced();
    debounced();

    assert.strictEqual(callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 100));

    assert.strictEqual(callCount, 1);
});

test('UI: debounce - resets on new call', async () => {
    let callCount = 0;
    const func = () => callCount++;
    const debounced = uiModule.debounce(func, 100);

    debounced();
    await new Promise(resolve => setTimeout(resolve, 50));
    debounced(); // Reset timer

    await new Promise(resolve => setTimeout(resolve, 60));
    assert.strictEqual(callCount, 0);

    await new Promise(resolve => setTimeout(resolve, 60));
    assert.strictEqual(callCount, 1);
});
