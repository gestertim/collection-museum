/**
 * UI Module: Render helpers and UI utilities
 * Pure functions for creating UI elements and helper methods
 */

/**
 * Get museum summary statistics
 * @param {Array<Object>} items - All items
 * @param {Array<Object>} categories - All categories
 * @param {Array<Object>} exhibitions - All exhibitions
 * @returns {Object} - { itemCount: number, categoryCount: number, exhibitionCount: number }
 */
export function getMuseumSummary(items, categories, exhibitions) {
    return {
        itemCount: items.length,
        categoryCount: categories.length,
        exhibitionCount: exhibitions.length
    };
}

/**
 * Get featured items for museum display
 * Sorted by createdAt (newest first), max 4 items
 * @param {Array<Object>} items - All items
 * @returns {Array<Object>} - Featured items
 */
export function getFeaturedItems(items) {
    const withTimestamp = items.map(item => ({
        ...item,
        _hasValidTimestamp: isValidTimestamp(item.createdAt)
    }));

    // Sort: valid timestamps by date desc, then by id asc
    const sorted = withTimestamp.sort((a, b) => {
        if (a._hasValidTimestamp && b._hasValidTimestamp) {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            if (dateA !== dateB) {
                return dateB - dateA; // Newest first
            }
            return a.id.localeCompare(b.id);
        }

        if (a._hasValidTimestamp) return -1;
        if (b._hasValidTimestamp) return 1;

        return a.id.localeCompare(b.id);
    });

    return sorted.slice(0, 4).map(({ _hasValidTimestamp, ...item }) => item);
}

/**
 * Filter collection items by the selected category control.
 * @param {Array<Object>} items - All items
 * @param {string} filter - all, uncategorized, or a category id
 * @returns {Array<Object>} - Matching items
 */
export function filterItemsByCategory(items, filter) {
    if (filter === 'all') return items;
    if (filter === 'uncategorized') {
        return items.filter(item => !item.categoryId);
    }
    return items.filter(item => item.categoryId === filter);
}

/**
 * Check if timestamp is valid ISO 8601
 * @param {string} timestamp
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
 * Format date for display
 * @param {string} isoString - ISO 8601 timestamp
 * @returns {string} - Formatted date
 */
export function formatDate(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return '';
    }
}

/**
 * Create loading spinner HTML
 * @returns {string} - HTML
 */
export function createLoadingSpinner() {
    return '<div class="loading"></div>';
}

/**
 * Create error message HTML
 * @param {string} message - Error message
 * @returns {string} - HTML
 */
export function createErrorMessage(message) {
    return `<div class="error-message">${escapeHtml(message)}</div>`;
}

/**
 * Create success message HTML
 * @param {string} message - Success message
 * @returns {string} - HTML
 */
export function createSuccessMessage(message) {
    return `<div class="success-message">${escapeHtml(message)}</div>`;
}

/**
 * Create empty state HTML
 * @param {string} icon - Emoji icon
 * @param {string} title - Empty state title
 * @param {string} [message] - Optional message
 * @param {string} [ctaText] - Optional CTA button text
 * @returns {string} - HTML
 */
export function createEmptyState(icon, title, message = '', ctaText = '') {
    const ctaButton = ctaText 
        ? `<button class="btn btn-primary" onclick="document.dispatchEvent(new CustomEvent('empty-state-cta'))">${escapeHtml(ctaText)}</button>`
        : '';

    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <h2 class="empty-state-text">${escapeHtml(title)}</h2>
            ${message ? `<p>${escapeHtml(message)}</p>` : ''}
            ${ctaButton}
        </div>
    `;
}

/**
 * Create gallery grid item card
 * @param {Object} item - Item data
 * @param {string} [photoUrl] - Photo URL (optional)
 * @param {string} [categoryName] - Category name (optional)
 * @param {boolean} [includeMeta] - Include metadata like rating
 * @returns {string} - HTML
 */
export function createGalleryCard(item, photoUrl = '', categoryName = '', includeMeta = false) {
    const photo = photoUrl 
        ? `<img src="${photoUrl}" alt="${escapeHtml(item.name)}" class="card-image">`
        : `<div class="photo-placeholder no-photo-fallback"><span aria-hidden="true">🏛</span><strong>${escapeHtml(item.name)}</strong></div>`;

    const category = categoryName 
        ? `<span class="category-chip">${escapeHtml(categoryName)}</span>`
        : `<span class="category-chip uncategorized">Uncategorized</span>`;

    const rating = item.rating 
        ? `<span class="rating-display">⭐ ${item.rating}/5</span>`
        : `<span class="rating-display placeholder">Rating...</span>`;

    const metadata = includeMeta ? `<div class="card-meta">${category} ${rating}</div>` : '';

    return `
        <div class="gallery-item card" data-id="${item.id}">
            <div class="card-photo">${photo}</div>
            <div class="card-content">
                <h3 class="card-title">${escapeHtml(item.name)}</h3>
                ${metadata}
            </div>
        </div>
    `;
}

/**
 * Create confirmation dialog HTML
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {Object} options - { confirmText, cancelText, isDangerous }
 * @returns {string} - HTML
 */
export function createConfirmationDialog(title, message, options = {}) {
    const {
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        isDangerous = false
    } = options;

    const confirmButtonClass = isDangerous ? 'btn btn-danger' : 'btn btn-primary';

    return `
        <div class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${escapeHtml(title)}</h2>
                    <button class="modal-close" aria-label="Close">×</button>
                </div>
                <div class="modal-body">
                    <p>${escapeHtml(message)}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-btn">${escapeHtml(cancelText)}</button>
                    <button class="${confirmButtonClass} confirm-btn">${escapeHtml(confirmText)}</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create form field with label and error state
 * @param {Object} options - { name, label, type, value, error, required, placeholder }
 * @returns {string} - HTML
 */
export function createFormField(options) {
    const {
        name,
        label,
        type = 'text',
        value = '',
        error = '',
        required = false,
        placeholder = ''
    } = options;

    const requiredAttr = required ? 'required' : '';
    const errorClass = error ? 'has-error' : '';
    const errorMsg = error ? `<div class="form-error">${escapeHtml(error)}</div>` : '';

    return `
        <div class="form-group ${errorClass}">
            <label for="${name}" class="form-label">${escapeHtml(label)}${required ? ' *' : ''}</label>
            <input 
                type="${type}" 
                id="${name}" 
                name="${name}" 
                value="${escapeHtml(String(value))}" 
                placeholder="${escapeHtml(placeholder)}"
                ${requiredAttr}
                class="form-input"
            >
            ${errorMsg}
        </div>
    `;
}

/**
 * Create rating selector (1-5 stars)
 * @param {number} currentRating - Current rating (1-5 or null)
 * @param {string} [name='rating'] - Input name
 * @returns {string} - HTML
 */
export function createRatingSelector(currentRating = null, name = 'rating') {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const checked = i === currentRating ? 'checked' : '';
        const label = Array(i + 1).join('⭐');
        stars.push(`
            <label class="rating-option">
                <input type="radio" name="${name}" value="${i}" ${checked}>
                <span class="rating-label">${label}</span>
            </label>
        `);
    }

    return `
        <div class="rating-selector">
            ${stars.join('')}
            <label class="rating-option">
                <input type="radio" name="${name}" value="" ${!currentRating ? 'checked' : ''}>
                <span class="rating-label">No Rating</span>
            </label>
        </div>
    `;
}

/**
 * Create category selector
 * @param {Array<Object>} categories - Category list
 * @param {string} currentCategoryId - Current category ID (or null for uncategorized)
 * @param {string} [name='categoryId'] - Input name
 * @returns {string} - HTML
 */
export function createCategorySelector(categories, currentCategoryId = null, name = 'categoryId') {
    const options = [
        `<option value="" ${!currentCategoryId ? 'selected' : ''}>Uncategorized</option>`
    ];

    categories.forEach(category => {
        const selected = category.id === currentCategoryId ? 'selected' : '';
        options.push(`<option value="${category.id}" ${selected}>${escapeHtml(category.name)}</option>`);
    });

    return `
        <div class="form-group">
            <label for="${name}" class="form-label">Category</label>
            <select id="${name}" name="${name}" class="form-input">
                ${options.join('')}
            </select>
        </div>
    `;
}

/**
 * Escape HTML special characters
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
    if (typeof text !== 'string') {
        return '';
    }
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait - Wait time in ms
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
