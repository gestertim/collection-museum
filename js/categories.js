/**
 * Categories Module: Category domain logic and validation
 * Pure functions for category management
 */

/**
 * Validate category name
 * @param {string} name - The name to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateCategoryName(name) {
    if (typeof name !== 'string') {
        return { valid: false, error: 'Name must be a string' };
    }

    const trimmed = name.trim();
    if (trimmed.length === 0) {
        return { valid: false, error: 'Category name cannot be empty' };
    }

    return { valid: true };
}

/**
 * Create a new category
 * @param {Object} data - Category data
 * @param {string} data.id - Unique identifier
 * @param {string} data.name - Category name (required)
 * @returns {Object|null} - Created category or error object
 */
export function createCategory(data) {
    const nameValidation = validateCategoryName(data.name);
    if (!nameValidation.valid) {
        return { error: nameValidation.error };
    }

    const now = new Date().toISOString();

    const category = {
        id: data.id,
        name: data.name.trim(),
        createdAt: data.createdAt || now
    };

    return category;
}

/**
 * Update an existing category (mainly for rename)
 * @param {Object} category - Existing category
 * @param {Object} updates - Fields to update
 * @returns {Object|null} - Updated category or error object
 */
export function updateCategory(category, updates) {
    if (!category) {
        return { error: 'Category not found' };
    }

    if ('name' in updates) {
        const nameValidation = validateCategoryName(updates.name);
        if (!nameValidation.valid) {
            return { error: nameValidation.error };
        }
    }

    const updated = {
        ...category,
        name: 'name' in updates ? updates.name.trim() : category.name
    };

    return updated;
}

/**
 * Remove a category from the category list (does not touch items)
 * @param {Array<Object>} categories - All categories
 * @param {string} categoryId - ID of category to remove
 * @returns {Array<Object>} - Updated category list without the removed category
 */
export function removeCategory(categories, categoryId) {
    return categories.filter(category => category.id !== categoryId);
}

/**
 * Handle category deletion - convert affected items to uncategorized
 * @param {Array<Object>} items - All items
 * @param {string} categoryId - ID of deleted category
 * @returns {Array<Object>} - Updated items with categoryId set to null
 */
export function uncategorizeItems(items, categoryId) {
    return items.map(item => {
        if (item.categoryId === categoryId) {
            return {
                ...item,
                categoryId: null,
                updatedAt: new Date().toISOString()
            };
        }
        return item;
    });
}

/**
 * Assign item to category (single category per item)
 * @param {Object} item - Item to assign
 * @param {string} categoryId - Category ID to assign (or null for uncategorized)
 * @returns {Object} - Updated item
 */
export function assignItemToCategory(item, categoryId) {
    return {
        ...item,
        categoryId: categoryId || null,
        updatedAt: new Date().toISOString()
    };
}

/**
 * Filter items by category
 * @param {Array<Object>} items - All items
 * @param {string} categoryId - Category ID to filter by (null for uncategorized)
 * @returns {Array<Object>} - Filtered items
 */
export function getItemsByCategory(items, categoryId) {
    if (categoryId === null || categoryId === 'uncategorized') {
        return items.filter(item => !item.categoryId);
    }
    return items.filter(item => item.categoryId === categoryId);
}

/**
 * Count items in a category (excluding deleted/uncategorized)
 * @param {Array<Object>} items - All items
 * @param {string} categoryId - Category ID
 * @returns {number}
 */
export function countItemsInCategory(items, categoryId) {
    return items.filter(item => item.categoryId === categoryId).length;
}

/**
 * Get item category info
 * @param {Array<Object>} categories - All categories
 * @param {string|null} categoryId - Category ID
 * @returns {Object|null} - Category object or null if uncategorized
 */
export function getCategoryById(categories, categoryId) {
    if (!categoryId) {
        return null;
    }
    return categories.find(c => c.id === categoryId);
}

/**
 * Get uncategorized count
 * @param {Array<Object>} items - All items
 * @returns {number}
 */
export function getUncategorizedCount(items) {
    return items.filter(item => !item.categoryId).length;
}
