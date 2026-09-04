/**
 * Items Module: Item domain logic and validation
 * Pure functions for item creation, updating, deletion
 */

/**
 * Validate item name
 * @param {string} name - The name to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateItemName(name) {
    if (typeof name !== 'string') {
        return { valid: false, error: 'Name must be a string' };
    }

    const trimmed = name.trim();
    if (trimmed.length === 0) {
        return { valid: false, error: 'Name cannot be empty' };
    }

    return { valid: true };
}

/**
 * Validate item rating
 * @param {number|null} rating - The rating to validate (1-5 or null)
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateItemRating(rating) {
    if (rating === null || rating === undefined || rating === '') {
        return { valid: true }; // null/empty is allowed
    }

    if (!Number.isInteger(rating)) {
        return { valid: false, error: 'Rating must be an integer' };
    }

    if (rating < 1 || rating > 5) {
        return { valid: false, error: 'Rating must be between 1 and 5' };
    }

    return { valid: true };
}

/**
 * Create a new item
 * @param {Object} data - Item data
 * @param {string} data.id - Unique identifier
 * @param {string} data.name - Item name (required)
 * @param {Blob} [data.photo] - Photo blob (optional)
 * @param {string} [data.categoryId] - Category ID (optional)
 * @param {string} [data.location] - Location/Found At (optional)
 * @param {string} [data.story] - Why It Is Special (optional)
 * @param {number} [data.rating] - Rating 1-5 (optional)
 * @returns {Object|null} - Created item or null if validation fails
 */
export function createItem(data) {
    // Validate required fields
    const nameValidation = validateItemName(data.name);
    if (!nameValidation.valid) {
        return { error: nameValidation.error };
    }

    const ratingValidation = validateItemRating(data.rating);
    if (!ratingValidation.valid) {
        return { error: ratingValidation.error };
    }

    const now = new Date().toISOString();

    const item = {
        id: data.id,
        name: data.name.trim(),
        photo: data.photo || null,
        categoryId: data.categoryId || null,
        location: data.location ? data.location.trim() : null,
        story: data.story ? data.story.trim() : null,
        rating: data.rating || null,
        createdAt: data.createdAt || now,
        updatedAt: data.updatedAt || now
    };

    return item;
}

/**
 * Update an existing item
 * @param {Object} item - Existing item to update
 * @param {Object} updates - Fields to update
 * @returns {Object|null} - Updated item or error object
 */
export function updateItem(item, updates) {
    if (!item) {
        return { error: 'Item not found' };
    }

    // Validate updated fields
    if ('name' in updates) {
        const nameValidation = validateItemName(updates.name);
        if (!nameValidation.valid) {
            return { error: nameValidation.error };
        }
    }

    if ('rating' in updates) {
        const ratingValidation = validateItemRating(updates.rating);
        if (!ratingValidation.valid) {
            return { error: ratingValidation.error };
        }
    }

    let now = new Date();
    const previousUpdatedAt = new Date(item.updatedAt);
    if (!isNaN(previousUpdatedAt.getTime()) && now <= previousUpdatedAt) {
        now = new Date(previousUpdatedAt.getTime() + 1);
    }

    const updated = {
        ...item,
        name: 'name' in updates ? updates.name.trim() : item.name,
        photo: 'photo' in updates ? updates.photo : item.photo,
        categoryId: 'categoryId' in updates ? (updates.categoryId || null) : item.categoryId,
        location: 'location' in updates ? (updates.location ? updates.location.trim() : null) : item.location,
        story: 'story' in updates ? (updates.story ? updates.story.trim() : null) : item.story,
        rating: 'rating' in updates ? (updates.rating || null) : item.rating,
        createdAt: item.createdAt, // Never change createdAt
        updatedAt: now.toISOString()
    };

    return updated;
}

/**
 * Get items for display with optional filtering
 * @param {Array<Object>} items - All items
 * @param {Object} filters - Optional filters
 * @param {string} [filters.categoryId] - Filter by category
 * @param {boolean} [filters.includeUncategorized] - Include items without category
 * @returns {Array<Object>} - Filtered items
 */
export function getFilteredItems(items, filters = {}) {
    if (!filters || !filters.categoryId) {
        return items;
    }

    return items.filter(item => {
        if (filters.categoryId === 'uncategorized') {
            return !item.categoryId;
        }
        return item.categoryId === filters.categoryId;
    });
}

/**
 * Remove item reference from exhibitions after deletion
 * Used in cascade delete operations
 * @param {Array<Object>} exhibitions - All exhibitions
 * @param {string} itemId - ID of deleted item
 * @returns {Array<Object>} - Updated exhibitions
 */
export function removeItemFromExhibitions(exhibitions, itemId) {
    return exhibitions.map(exhibition => {
        if (exhibition.itemIds && exhibition.itemIds.includes(itemId)) {
            return {
                ...exhibition,
                itemIds: exhibition.itemIds.filter(id => id !== itemId),
                updatedAt: new Date().toISOString()
            };
        }
        return exhibition;
    });
}

/**
 * Calculate featured items for museum display
 * Sort by createdAt (newest first), with deterministic tie-breaking
 * @param {Array<Object>} items - All items with createdAt field
 * @param {number} [limit=4] - Max items to return
 * @returns {Array<Object>} - Featured items in display order
 */
export function getFeaturedItems(items, limit = 4) {
    const withTimestamp = items.map(item => ({
        ...item,
        _hasValidTimestamp: isValidTimestamp(item.createdAt)
    }));

    // Sort: valid timestamps by date desc, then by id asc for tie-break
    // Valid timestamps come before invalid
    const sorted = withTimestamp.sort((a, b) => {
        if (a._hasValidTimestamp && b._hasValidTimestamp) {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            if (dateA !== dateB) {
                return dateB - dateA; // Newest first
            }
            return a.id.localeCompare(b.id); // Tie-break by id
        }

        if (a._hasValidTimestamp) return -1; // Valid before invalid
        if (b._hasValidTimestamp) return 1;

        return a.id.localeCompare(b.id); // Both invalid: sort by id
    });

    return sorted.slice(0, limit).map(({ _hasValidTimestamp, ...item }) => item);
}

/**
 * Check if timestamp is valid ISO 8601
 * @param {string} timestamp - Timestamp to check
 * @returns {boolean}
 */
function isValidTimestamp(timestamp) {
    if (!timestamp || typeof timestamp !== 'string') {
        return false;
    }
    try {
        const date = new Date(timestamp);
        return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(timestamp);
    } catch {
        return false;
    }
}

/**
 * Count items with non-empty story (Why It Is Special)
 * Used for achievement calculation
 * @param {Array<Object>} items - All items
 * @returns {number}
 */
export function countItemsWithStory(items) {
    return items.filter(item => item.story && item.story.trim().length > 0).length;
}
