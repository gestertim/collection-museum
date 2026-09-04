/**
 * Exhibitions Module: Exhibition domain logic and validation
 * Pure functions for exhibition creation, ordering, and management
 */

/**
 * Validate exhibition name
 * @param {string} name - The name to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateExhibitionName(name) {
    if (typeof name !== 'string') {
        return { valid: false, error: 'Name must be a string' };
    }

    const trimmed = name.trim();
    if (trimmed.length === 0) {
        return { valid: false, error: 'Exhibition name cannot be empty' };
    }

    return { valid: true };
}

/**
 * Validate exhibition itemIds
 * @param {Array<string>} itemIds - IDs to validate
 * @param {Array<Object>} availableItems - All available items
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateExhibitionItems(itemIds, availableItems) {
    if (!Array.isArray(itemIds)) {
        return { valid: false, error: 'itemIds must be an array' };
    }

    if (itemIds.length === 0) {
        return { valid: false, error: 'Exhibition must contain at least one item' };
    }

    // Check for duplicates
    if (new Set(itemIds).size !== itemIds.length) {
        return { valid: false, error: 'Duplicate item IDs not allowed' };
    }

    // Check if all items exist
    const itemIdSet = new Set(availableItems.map(item => item.id));
    for (const id of itemIds) {
        if (!itemIdSet.has(id)) {
            return { valid: false, error: `Item ${id} not found` };
        }
    }

    return { valid: true };
}

/**
 * Create a new exhibition
 * @param {Object} data - Exhibition data
 * @param {string} data.id - Unique identifier
 * @param {string} data.name - Exhibition name (required)
 * @param {Array<string>} data.itemIds - Item IDs to include (required, at least one)
 * @param {Array<Object>} availableItems - All available items for validation
 * @returns {Object|null} - Created exhibition or error object
 */
export function createExhibition(data, availableItems) {
    const nameValidation = validateExhibitionName(data.name);
    if (!nameValidation.valid) {
        return { error: nameValidation.error };
    }

    const itemsValidation = validateExhibitionItems(data.itemIds || [], availableItems);
    if (!itemsValidation.valid) {
        return { error: itemsValidation.error };
    }

    const now = new Date().toISOString();

    const exhibition = {
        id: data.id,
        name: data.name.trim(),
        itemIds: [...data.itemIds], // Copy array
        createdAt: data.createdAt || now,
        updatedAt: data.updatedAt || now
    };

    return exhibition;
}

/**
 * Update an existing exhibition
 * @param {Object} exhibition - Existing exhibition
 * @param {Object} updates - Fields to update
 * @param {Array<Object>} availableItems - All available items for validation
 * @returns {Object|null} - Updated exhibition or error object
 */
export function updateExhibition(exhibition, updates, availableItems) {
    if (!exhibition) {
        return { error: 'Exhibition not found' };
    }

    if ('name' in updates) {
        const nameValidation = validateExhibitionName(updates.name);
        if (!nameValidation.valid) {
            return { error: nameValidation.error };
        }
    }

    if ('itemIds' in updates) {
        const itemsValidation = validateExhibitionItems(updates.itemIds || [], availableItems);
        if (!itemsValidation.valid) {
            return { error: itemsValidation.error };
        }
    }

    const updated = {
        ...exhibition,
        name: 'name' in updates ? updates.name.trim() : exhibition.name,
        itemIds: 'itemIds' in updates ? [...updates.itemIds] : exhibition.itemIds,
        updatedAt: new Date().toISOString()
    };

    return updated;
}

/**
 * Remove item reference from exhibition after deletion
 * @param {Object} exhibition - Exhibition to update
 * @param {string} itemId - ID of deleted item
 * @returns {Object} - Updated exhibition
 */
export function removeItemFromExhibition(exhibition, itemId) {
    const itemIds = exhibition.itemIds.filter(id => id !== itemId);

    return {
        ...exhibition,
        itemIds: itemIds,
        updatedAt: new Date().toISOString()
    };
}

/**
 * Clean up stale item references (items that no longer exist)
 * @param {Object} exhibition - Exhibition to clean
 * @param {Array<Object>} items - All items
 * @returns {Object} - Exhibition with valid references only
 */
export function cleanupStaleReferences(exhibition, items) {
    const itemIdSet = new Set(items.map(item => item.id));
    const validItemIds = exhibition.itemIds.filter(id => itemIdSet.has(id));

    if (validItemIds.length === exhibition.itemIds.length) {
        return exhibition; // No changes needed
    }

    return {
        ...exhibition,
        itemIds: validItemIds
    };
}

/**
 * Reorder items in exhibition
 * @param {Object} exhibition - Exhibition
 * @param {number} fromIndex - Current position (0-based)
 * @param {number} toIndex - New position (0-based)
 * @returns {Object|null} - Updated exhibition or error object
 */
export function reorderItems(exhibition, fromIndex, toIndex) {
    if (fromIndex === toIndex) {
        return exhibition; // No change
    }

    if (fromIndex < 0 || toIndex < 0 || fromIndex >= exhibition.itemIds.length || toIndex >= exhibition.itemIds.length) {
        return { error: 'Invalid index' };
    }

    const itemIds = [...exhibition.itemIds];
    const [item] = itemIds.splice(fromIndex, 1);
    itemIds.splice(toIndex, 0, item);

    return {
        ...exhibition,
        itemIds: itemIds,
        updatedAt: new Date().toISOString()
    };
}

/**
 * Move item up in exhibition order
 * @param {Object} exhibition - Exhibition
 * @param {number} index - Current position (0-based)
 * @returns {Object|null} - Updated exhibition or error
 */
export function moveItemUp(exhibition, index) {
    if (index <= 0) {
        return { error: 'Cannot move item up' };
    }
    return reorderItems(exhibition, index, index - 1);
}

/**
 * Move item down in exhibition order
 * @param {Object} exhibition - Exhibition
 * @param {number} index - Current position (0-based)
 * @returns {Object|null} - Updated exhibition or error
 */
export function moveItemDown(exhibition, index) {
    if (index >= exhibition.itemIds.length - 1) {
        return { error: 'Cannot move item down' };
    }
    return reorderItems(exhibition, index, index + 1);
}

/**
 * Get exhibition items in order
 * @param {Object} exhibition - Exhibition
 * @param {Array<Object>} items - All items
 * @returns {Array<Object>} - Items in exhibition order, filtering out stale references
 */
export function getExhibitionItems(exhibition, items) {
    const itemMap = new Map(items.map(item => [item.id, item]));
    return exhibition.itemIds
        .map(id => itemMap.get(id))
        .filter(item => item !== undefined);
}
