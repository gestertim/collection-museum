/**
 * Achievements Module: Achievement logic and detection
 * Calculates derived achievements based on collection state
 */

/**
 * Achievement types
 */
export const ACHIEVEMENT_TYPES = {
    FIRST_ITEM_CATALOGED: 'first-item-cataloged',
    TEN_ITEMS_CATALOGED: 'ten-items-cataloged',
    FIRST_EXHIBIT_CREATED: 'first-exhibit-created',
    THREE_CATEGORIES_CREATED: 'three-categories-created',
    FIVE_ITEM_STORIES_TOLD: 'five-item-stories-told'
};

/**
 * Get achievement definitions
 */
export const ACHIEVEMENT_DEFINITIONS = {
    [ACHIEVEMENT_TYPES.FIRST_ITEM_CATALOGED]: {
        id: 'first-item-cataloged',
        type: 'threshold',
        title: '🎉 第一件收藏！',
        description: '第一件收藏加入博物館了！',
        condition: 'items >= 1'
    },
    [ACHIEVEMENT_TYPES.TEN_ITEMS_CATALOGED]: {
        id: 'ten-items-cataloged',
        type: 'threshold',
        title: '🌟 收藏漸豐',
        description: '你的博物館已經收藏 10 件寶物！',
        condition: 'items >= 10'
    },
    [ACHIEVEMENT_TYPES.FIRST_EXHIBIT_CREATED]: {
        id: 'first-exhibit-created',
        type: 'threshold',
        title: '🎨 策展初體驗',
        description: '第一個展覽完成了！',
        condition: 'exhibitions >= 1'
    },
    [ACHIEVEMENT_TYPES.THREE_CATEGORIES_CREATED]: {
        id: 'three-categories-created',
        type: 'threshold',
        title: '📚 分類達人',
        description: '你已經建立 3 個收藏分類！',
        condition: 'categories >= 3'
    },
    [ACHIEVEMENT_TYPES.FIVE_ITEM_STORIES_TOLD]: {
        id: 'five-item-stories-told',
        type: 'threshold',
        title: '📖 說故事的人',
        description: '你已經記錄 5 個收藏故事！',
        condition: 'items with story >= 5'
    }
};

/**
 * Calculate current achievement state
 * @param {Array<Object>} items - All items
 * @param {Array<Object>} categories - All categories
 * @param {Array<Object>} exhibitions - All exhibitions
 * @returns {Object} - Achievement state { achievementId: boolean }
 */
export function calculateAchievements(items, categories, exhibitions) {
    const state = {};

    state[ACHIEVEMENT_TYPES.FIRST_ITEM_CATALOGED] = items.length >= 1;
    state[ACHIEVEMENT_TYPES.TEN_ITEMS_CATALOGED] = items.length >= 10;
    state[ACHIEVEMENT_TYPES.FIRST_EXHIBIT_CREATED] = exhibitions.length >= 1;
    state[ACHIEVEMENT_TYPES.THREE_CATEGORIES_CREATED] = categories.length >= 3;

    // Count items with non-empty story
    const itemsWithStory = items.filter(item => 
        item.story && item.story.trim().length > 0
    ).length;
    state[ACHIEVEMENT_TYPES.FIVE_ITEM_STORIES_TOLD] = itemsWithStory >= 5;

    return state;
}

/**
 * Check if achievement was newly unlocked
 * @param {string} achievementId - Achievement ID
 * @param {Object} beforeState - Achievement state before mutation
 * @param {Object} afterState - Achievement state after mutation
 * @returns {boolean} - True if false → true transition
 */
export function isAchievementUnlocked(achievementId, beforeState, afterState) {
    return beforeState[achievementId] === false && afterState[achievementId] === true;
}

/**
 * Get newly unlocked achievements
 * @param {Object} beforeState - Achievement state before mutation
 * @param {Object} afterState - Achievement state after mutation
 * @returns {Array<string>} - Array of newly unlocked achievement IDs
 */
export function getUnlockedAchievements(beforeState, afterState) {
    return Object.keys(afterState).filter(
        achievementId => isAchievementUnlocked(achievementId, beforeState, afterState)
    );
}

/**
 * Create achievement feedback data
 * @param {string} achievementId - Achievement ID
 * @returns {Object} - Feedback data { id, title, description, icon }
 */
export function getAchievementFeedback(achievementId) {
    const definition = ACHIEVEMENT_DEFINITIONS[achievementId];
    if (!definition) {
        return null;
    }

    return {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        timestamp: new Date().toISOString()
    };
}

/**
 * Create feedback data for all newly unlocked achievements
 * @param {Object} beforeState - Achievement state before mutation
 * @param {Object} afterState - Achievement state after mutation
 * @returns {Array<Object>} - Array of feedback data
 */
export function getUnlockedFeedback(beforeState, afterState) {
    const unlocked = getUnlockedAchievements(beforeState, afterState);
    return unlocked.map(id => getAchievementFeedback(id)).filter(f => f !== null);
}

/**
 * Calculate state deltas for achievement detection
 * @param {Object} beforeCounts - { items: number, categories: number, exhibitions: number, itemsWithStory: number }
 * @param {Object} afterCounts - Same structure
 * @returns {Object} - Changes { items: -1|0|1, categories: -1|0|1, ... }
 */
export function calculateDeltas(beforeCounts, afterCounts) {
    return {
        items: afterCounts.items - beforeCounts.items,
        categories: afterCounts.categories - beforeCounts.categories,
        exhibitions: afterCounts.exhibitions - beforeCounts.exhibitions,
        itemsWithStory: afterCounts.itemsWithStory - beforeCounts.itemsWithStory
    };
}

/**
 * Get achievement state before and after for a mutation
 * Used to detect achievement unlocking
 * @param {Array<Object>} itemsBefore
 * @param {Array<Object>} categoriesBefore
 * @param {Array<Object>} exhibitionsBefore
 * @param {Array<Object>} itemsAfter
 * @param {Array<Object>} categoriesAfter
 * @param {Array<Object>} exhibitionsAfter
 * @returns {Object} - { before: {...}, after: {...} }
 */
export function compareAchievementStates(
    itemsBefore, categoriesBefore, exhibitionsBefore,
    itemsAfter, categoriesAfter, exhibitionsAfter
) {
    const before = calculateAchievements(itemsBefore, categoriesBefore, exhibitionsBefore);
    const after = calculateAchievements(itemsAfter, categoriesAfter, exhibitionsAfter);

    return { before, after };
}
