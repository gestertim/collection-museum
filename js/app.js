/**
 * App Module: Application initialization, routing, and state management
 * Main entry point for the Collection Museum application
 */

import * as db from './db.js';
import * as items from './items.js';
import * as categories from './categories.js';
import * as exhibitions from './exhibitions.js';
import * as achievements from './achievements.js';
import * as ui from './ui.js';
import * as image from './image.js';

// Application state
const appState = {
    currentView: 'museum',
    currentItemId: null,
    currentExhibitionId: null,
    collectionFilter: 'all',
    isLoading: false,
    error: null,
    draft: null,
    data: {
        items: [],
        categories: [],
        exhibitions: []
    }
};

/**
 * Initialize the application
 */
export async function initApp() {
    try {
        // Initialize database
        await db.initDatabase();
        console.log('Database initialized');

        // Load initial data
        await reloadData();

        // Set up event listeners
        setupEventListeners();

        await renderCurrentView();

        console.log('App initialized successfully');
    } catch (error) {
        console.error('App initialization failed:', error);
        showError('Failed to initialize application');
    }
}

/**
 * Reload all data from database
 */
export async function reloadData() {
    try {
        appState.data.items = await db.getAll(db.STORE_NAMES.ITEMS);
        appState.data.categories = await db.getAll(db.STORE_NAMES.CATEGORIES);
        appState.data.exhibitions = await db.getAll(db.STORE_NAMES.EXHIBITIONS);
        appState.error = null;
    } catch (error) {
        console.error('Data reload failed:', error);
        showError('Failed to load data');
        throw error;
    }
}

/**
 * Set up event listeners for the application
 */
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.view);
        });
    });

    // Global error handling
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        showError('An unexpected error occurred');
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showError('An unexpected error occurred');
    });
}

/**
 * Handle route changes
 */
async function renderCurrentView() {
    try {
        // Update navigation active state
        updateActiveNav();

        // Show appropriate view
        hideAllViews();

        switch (appState.currentView) {
            case 'museum':
                await renderMuseumView();
                break;
            case 'collection':
                await renderCollectionView();
                break;
            case 'exhibits':
                await renderExhibitsView();
                break;
            case 'add-item':
                await renderAddItemView();
                break;
            case 'item':
                await renderItemDetailView();
                break;
            case 'exhibition':
                await renderExhibitionDetailView();
                break;
            default:
                await renderMuseumView();
        }
    } catch (error) {
        console.error('Route change failed:', error);
        showError('Failed to load view');
    }
}

async function navigateTo(view, id = null) {
    appState.currentView = view;
    appState.currentItemId = view === 'item' ? id : null;
    appState.currentExhibitionId = view === 'exhibition' ? id : null;
    await reloadData();
    await renderCurrentView();
}

/**
 * Update active navigation link
 */
function updateActiveNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-view="${appState.currentView}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * Hide all view sections
 */
function hideAllViews() {
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });
}

/**
 * Show view section
 */
function showView(viewId) {
    hideAllViews();
    const view = document.getElementById(viewId);
    if (view) {
        view.style.display = 'block';
    }
}

/**
 * Render museum home view
 */
async function renderMuseumView() {
    showView('view-museum');
    const container = document.getElementById('museum-content');

    const summary = ui.getMuseumSummary(
        appState.data.items,
        appState.data.categories,
        appState.data.exhibitions
    );

    const featured = ui.getFeaturedItems(appState.data.items);

    let html = `
        <div class="museum-header">
            <h2>My Collection Museum</h2>
            <div class="museum-stats">
                <div class="stat">
                    <div class="stat-number">${summary.itemCount}</div>
                    <div class="stat-label">Items</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${summary.categoryCount}</div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${summary.exhibitionCount}</div>
                    <div class="stat-label">Exhibits</div>
                </div>
            </div>
        </div>
    `;

    if (appState.data.items.length === 0) {
        html += ui.createEmptyState(
            '🏛',
            'Your museum is waiting for its first treasure.',
            '',
            'Add My First Item'
        );
    } else {
        if (featured.length > 0) {
            html += '<section class="museum-featured"><h3>Featured Items</h3><div class="gallery">';
            for (const item of featured) {
                const category = categories.getCategoryById(appState.data.categories, item.categoryId);
                const photoUrl = item.photo ? await image.blobToDataUrl(item.photo) : '';
                html += ui.createGalleryCard(item, photoUrl, category?.name || '', true);
            }
            html += '</div></section>';
        }

        html += '<section class="museum-exhibits"><div class="section-heading"><h3>My Exhibits</h3><button class="btn btn-secondary" data-view-exhibits>View Exhibits</button></div>';
        if (appState.data.exhibitions.length === 0) {
            html += '<p class="empty-inline">No exhibits yet. Your saved exhibitions will appear here.</p>';
        } else {
            html += '<div class="exhibit-summary-list">';
            appState.data.exhibitions.forEach(exhibition => {
                html += `<button class="exhibit-summary" data-exhibition-id="${ui.escapeHtml(exhibition.id)}"><strong>${ui.escapeHtml(exhibition.name)}</strong><span>${exhibition.itemIds.length} item${exhibition.itemIds.length === 1 ? '' : 's'}</span></button>`;
            });
            html += '</div>';
        }
        html += '</section>';
    }

    container.innerHTML = html;

    // Attach event listeners
    container.querySelectorAll('.gallery-item').forEach(card => {
        card.addEventListener('click', () => {
            navigateTo('item', card.dataset.id);
        });
    });

    container.querySelectorAll('[data-exhibition-id]').forEach(card => {
        card.addEventListener('click', () => navigateTo('exhibition', card.dataset.exhibitionId));
    });
    container.querySelector('[data-view-exhibits]')?.addEventListener('click', () => navigateTo('exhibits'));

    const emptyStateCTA = container.querySelector('[onclick*="empty-state-cta"]');
    if (emptyStateCTA) {
        emptyStateCTA.addEventListener('click', () => {
            navigateTo('add-item');
        });
    }
}

/**
 * Render collection view
 */
async function renderCollectionView() {
    showView('view-collection');
    const container = document.getElementById('collection-content');

    let html = `
        <div class="collection-header">
            <h2>My Collection</h2>
        </div>

        <div class="collection-filters">
            <div class="filter-controls">
                <button class="btn btn-sm filter-btn ${appState.collectionFilter === 'all' ? 'active' : ''}" data-filter="all">All Items</button>
                <button class="btn btn-sm filter-btn ${appState.collectionFilter === 'uncategorized' ? 'active' : ''}" data-filter="uncategorized">Uncategorized</button>
    `;

    appState.data.categories.forEach(cat => {
        html += `<button class="btn btn-sm filter-btn ${appState.collectionFilter === cat.id ? 'active' : ''}" data-filter="${ui.escapeHtml(cat.id)}">${ui.escapeHtml(cat.name)}</button>`;
    });

    html += `
            </div>
            <button class="btn btn-primary add-category-btn">+ Add Category</button>
        </div>

        <div id="items-container" class="gallery">
    `;

    if (appState.data.items.length === 0) {
        html += ui.createEmptyState('📦', 'No Items Yet', 'Start adding items to your collection');
    } else {
        const filteredItems = ui.filterItemsByCategory(appState.data.items, appState.collectionFilter);
        if (filteredItems.length === 0) {
            html += ui.createEmptyState('🔎', 'No items in this category', 'Try another category or choose All Items.');
        }
        for (const item of filteredItems) {
            const cat = categories.getCategoryById(appState.data.categories, item.categoryId);
            const photoUrl = item.photo ? await image.blobToDataUrl(item.photo) : '';
            html += ui.createGalleryCard(item, photoUrl, cat?.name || '', true);
        }
    }

    html += '</div>';

    container.innerHTML = html;

    // Attach filter listeners
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            appState.collectionFilter = btn.dataset.filter;
            renderCollectionView();
        });
    });

    // Gallery items click handler
    container.querySelectorAll('.gallery-item').forEach(card => {
        card.addEventListener('click', () => {
            navigateTo('item', card.dataset.id);
        });
    });

    // Add category handler
    const addCatBtn = container.querySelector('.add-category-btn');
    if (addCatBtn) {
        addCatBtn.addEventListener('click', () => {
            addCatBtn.setAttribute('aria-label', 'Category management is available in a later phase');
        });
    }
}

/**
 * Render exhibits view
 */
async function renderExhibitsView() {
    showView('view-exhibits');
    const container = document.getElementById('exhibits-content');

    let html = `
        <div class="exhibits-header">
            <h2>My Exhibitions</h2>
            <button class="btn btn-primary create-exhibit-btn">+ Create Exhibit</button>
        </div>

        <div id="exhibits-container" class="gallery">
    `;

    if (appState.data.exhibitions.length === 0) {
        html += ui.createEmptyState(
            '🎭',
            'No Exhibitions Yet',
            'Curate your first exhibition from your collection items.',
            'Create Exhibit'
        );
    } else {
        for (const ex of appState.data.exhibitions) {
            const itemCount = ex.itemIds.length;
            const representativeItem = exhibitions.getExhibitionItems(ex, appState.data.items)[0];
            const photoUrl = representativeItem?.photo ? await image.blobToDataUrl(representativeItem.photo) : '';
            html += `
                <div class="gallery-item card exhibition-card" data-id="${ex.id}">
                    <div class="card-photo">${photoUrl
                        ? `<img src="${photoUrl}" alt="${ui.escapeHtml(representativeItem.name)}" class="card-image">`
                        : '<div class="photo-placeholder no-photo-fallback"><span aria-hidden="true">🏛</span><strong>No cover photo</strong></div>'}</div>
                    <div class="card-content">
                        <h3 class="card-title">${ui.escapeHtml(ex.name)}</h3>
                        <p class="card-meta">${itemCount} item${itemCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            `;
        }
    }

    html += '</div>';

    container.innerHTML = html;

    // Attach event listeners
    container.querySelectorAll('.exhibition-card').forEach(card => {
        card.addEventListener('click', () => {
            navigateTo('exhibition', card.dataset.id);
        });
    });

    const createBtn = container.querySelector('.create-exhibit-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            // Show create exhibition dialog (implementation would go here)
        });
    }

    const emptyStateCTA = container.querySelector('[onclick*="empty-state-cta"]');
    if (emptyStateCTA) {
        emptyStateCTA.addEventListener('click', () => {
            // Show create exhibition dialog
        });
    }
}

/**
 * Render add item view (form)
 */
async function renderAddItemView() {
    showView('view-add-item');
    const container = document.getElementById('add-item-content');
    const draft = appState.draft || {
        name: '',
        location: '',
        story: '',
        categoryId: null,
        rating: null,
        photo: null,
        photoError: '',
        saveError: ''
    };
    appState.draft = draft;

    const html = `
        <div class="add-item-header">
            <h2>Add Item to Collection</h2>
        </div>

        <form id="add-item-form" class="add-item-form">
            <div class="form-steps" aria-label="Add item steps">
                <strong>1. Photograph</strong><span>2. Museum Label</span><span>3. Add to Museum</span>
            </div>
            <div class="form-section">
                <h3>Photograph</h3>
                <div class="photo-upload">
                    <input type="file" id="photo-input" name="photo" accept="image/*" class="form-input">
                    <div id="photo-preview">${draft.photo ? '<p>Photo ready to save.</p>' : '<p>No photo selected. You can continue without one.</p>'}</div>
                    <div id="photo-error" class="form-error">${ui.escapeHtml(draft.photoError || '')}</div>
                    <button type="button" id="continue-without-photo" class="btn btn-secondary">Continue without photo</button>
                </div>
            </div>

            <div class="form-section">
                <h3>Museum Label</h3>
                ${ui.createFormField({
                    name: 'name',
                    label: 'Name *',
                    placeholder: 'What is it?',
                    required: false,
                    value: draft.name
                })}

                <div class="form-group"><label for="location" class="form-label">Found / Got It At</label><input id="location" name="location" class="form-input" value="${ui.escapeHtml(draft.location)}" placeholder="Where did you find it?"></div>
                <div class="form-group"><label for="story" class="form-label">Why It Is Special</label><textarea id="story" name="story" class="form-input" placeholder="Tell the story...">${ui.escapeHtml(draft.story)}</textarea></div>
                ${ui.createCategorySelector(appState.data.categories, draft.categoryId)}
                ${ui.createRatingSelector(draft.rating)}
            </div>

            ${draft.saveError ? `<div class="form-error save-error" role="alert">${ui.escapeHtml(draft.saveError)}</div>` : ''}

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-add-item">Cancel</button>
                <button type="submit" class="btn btn-primary">Add to Museum</button>
            </div>
        </form>
    `;

    container.innerHTML = html;

    // Form handlers
    const form = container.querySelector('#add-item-form');
    if (form) {
        const syncDraft = () => {
            const formData = new FormData(form);
            Object.assign(draft, {
                name: formData.get('name') || '',
                location: formData.get('location') || '',
                story: formData.get('story') || '',
                categoryId: formData.get('categoryId') || null,
                rating: formData.get('rating') ? Number(formData.get('rating')) : null
            });
        };
        form.querySelectorAll('input[name], textarea[name], select[name]').forEach(field => {
            field.addEventListener('input', syncDraft);
            field.addEventListener('change', syncDraft);
        });
        form.querySelector('#photo-input').addEventListener('change', async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            draft.photoError = '';
            const result = await image.processImage(file);
            if (!result.success) {
                draft.photo = null;
                draft.photoError = result.error || 'We could not use that photo. Try another one or continue without a photo.';
            } else {
                draft.photo = result.blob;
            }
            await renderAddItemView();
        });

        form.querySelector('#continue-without-photo').addEventListener('click', async () => {
            draft.photo = null;
            draft.photoError = '';
            await renderAddItemView();
        });

        form.querySelector('#cancel-add-item').addEventListener('click', () => navigateTo('collection'));
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            Object.assign(draft, {
                name: formData.get('name') || '',
                location: formData.get('location') || '',
                story: formData.get('story') || '',
                categoryId: formData.get('categoryId') || null,
                rating: formData.get('rating') ? Number(formData.get('rating')) : null
            });
            const result = items.createItem({ id: db.generateId(), ...draft });
            if (result.error) {
                draft.saveError = result.error === 'Name cannot be empty' ? 'Give this item a name first.' : result.error;
                await renderAddItemView();
                return;
            }
            try {
                setLoading(true);
                await db.put(db.STORE_NAMES.ITEMS, result);
                appState.draft = null;
                await reloadData();
                container.innerHTML = `<div class="success-state"><h2>Added to your museum!</h2><div class="form-actions"><button type="button" class="btn btn-primary" id="view-new-item">View Item</button><button type="button" class="btn btn-secondary" id="add-another-item">Add Another</button></div></div>`;
                container.querySelector('#view-new-item').addEventListener('click', () => navigateTo('item', result.id));
                container.querySelector('#add-another-item').addEventListener('click', () => { appState.draft = null; renderAddItemView(); });
            } catch (error) {
                console.error('Item save failed:', error);
                draft.saveError = "We couldn't save this item yet. Your work is still here. Try again.";
                await renderAddItemView();
            } finally {
                setLoading(false);
            }
        });
    }
}

async function renderEditItemForm(item) {
    const container = document.getElementById('item-detail-content');
    const draft = appState.draft || { ...item, saveError: '' };
    appState.draft = draft;
    container.innerHTML = `
        <div class="item-detail">
            <div class="item-header"><button type="button" class="btn-back" id="cancel-edit">← Back</button><h2>Edit Museum Label</h2></div>
            <form id="edit-item-form" class="add-item-form">
                ${ui.createFormField({ name: 'name', label: 'Name *', value: draft.name, required: false })}
                <div class="form-group"><label for="edit-location" class="form-label">Found / Got It At</label><input id="edit-location" name="location" class="form-input" value="${ui.escapeHtml(draft.location || '')}"></div>
                <div class="form-group"><label for="edit-story" class="form-label">Why It Is Special</label><textarea id="edit-story" name="story" class="form-input">${ui.escapeHtml(draft.story || '')}</textarea></div>
                ${ui.createCategorySelector(appState.data.categories, draft.categoryId)}
                ${ui.createRatingSelector(draft.rating)}
                <div class="form-group"><label for="edit-photo" class="form-label">Replace Photo</label><input type="file" id="edit-photo" accept="image/*" class="form-input"><div id="edit-photo-error" class="form-error"></div></div>
                ${draft.saveError ? `<div class="form-error save-error" role="alert">${ui.escapeHtml(draft.saveError)}</div>` : ''}
                <div class="form-actions"><button type="button" class="btn btn-secondary" id="cancel-edit-form">Cancel</button><button type="submit" class="btn btn-primary">Save Label</button></div>
            </form>
        </div>`;

    const form = container.querySelector('#edit-item-form');
    const updateDraft = () => {
        const formData = new FormData(form);
        Object.assign(draft, {
            name: formData.get('name') || '',
            location: formData.get('location') || '',
            story: formData.get('story') || '',
            categoryId: formData.get('categoryId') || null,
            rating: formData.get('rating') ? Number(formData.get('rating')) : null
        });
    };
    const cancel = () => { appState.draft = null; renderItemDetailView(); };
    container.querySelector('#cancel-edit').addEventListener('click', cancel);
    container.querySelector('#cancel-edit-form').addEventListener('click', cancel);
    container.querySelector('#edit-photo').addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const result = await image.processImage(file);
        if (result.success) draft.photo = result.blob;
        else container.querySelector('#edit-photo-error').textContent = result.error || 'We could not use that photo. Try another one.';
    });
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        updateDraft();
        const result = items.updateItem(item, draft);
        if (result.error) {
            draft.saveError = result.error === 'Name cannot be empty' ? 'Give this item a name first.' : result.error;
            await renderEditItemForm(item);
            return;
        }
        try {
            setLoading(true);
            await db.put(db.STORE_NAMES.ITEMS, result);
            appState.draft = null;
            await reloadData();
            await renderItemDetailView();
        } catch (error) {
            console.error('Item edit failed:', error);
            draft.saveError = "We couldn't save this item yet. Your work is still here. Try again.";
            await renderEditItemForm(item);
        } finally {
            setLoading(false);
        }
    });
}

/**
 * Render item detail view
 */
async function renderItemDetailView() {
    showView('view-item-detail');
    const container = document.getElementById('item-detail-content');

    const item = appState.data.items.find(i => i.id === appState.currentItemId);
    if (!item) {
        container.innerHTML = ui.createEmptyState('❌', 'Item Not Found');
        return;
    }

    const category = categories.getCategoryById(appState.data.categories, item.categoryId);

    const photoMarkup = item.photo
        ? `<img src="${await image.blobToDataUrl(item.photo)}" alt="${ui.escapeHtml(item.name)}" id="item-photo">`
        : `<div class="photo-placeholder no-photo-fallback"><span aria-hidden="true">🏛</span><strong>${ui.escapeHtml(item.name)}</strong></div>`;
    const html = `
        <div class="item-detail">
            <div class="item-header">
                <button class="btn-back" id="back-to-collection">← Back</button>
                <h2>${ui.escapeHtml(item.name)}</h2>
                <button class="btn-delete">Delete</button>
            </div>

            <div class="item-photo">
                ${photoMarkup}
            </div>

            <div class="item-details">
                <p><strong>Category:</strong> ${ui.escapeHtml(category?.name || 'Uncategorized')}</p>
                ${item.location ? `<p><strong>Location:</strong> ${ui.escapeHtml(item.location)}</p>` : ''}
                ${item.story ? `<p><strong>Story:</strong> ${ui.escapeHtml(item.story)}</p>` : ''}
                <p><strong>Rating:</strong> ${item.rating ? `${'⭐'.repeat(item.rating)} (${item.rating}/5)` : 'Not rated'}</p>
                <p><small>Added: ${ui.formatDate(item.createdAt)}</small></p>
            </div>

            <div class="item-actions">
                <button class="btn btn-primary edit-btn">Edit Label</button>
                <button class="btn btn-secondary add-exhibit-btn">Add to Exhibit</button>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Attach event listeners
    const deleteBtn = container.querySelector('.btn-delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!window.confirm('Remove this item from your museum?')) return;
            try {
                setLoading(true);
                const updatedExhibitions = items.removeItemFromExhibitions(appState.data.exhibitions, item.id);
                await db.transaction([db.STORE_NAMES.ITEMS, db.STORE_NAMES.EXHIBITIONS], (stores) => {
                    stores[db.STORE_NAMES.ITEMS].delete(item.id);
                    updatedExhibitions.forEach(exhibition => stores[db.STORE_NAMES.EXHIBITIONS].put(exhibition));
                });
                await navigateTo('collection');
            } catch (error) {
                showError('We could not remove this item yet. Your item is still here.');
            } finally {
                setLoading(false);
            }
        });
    }

    container.querySelector('#back-to-collection').addEventListener('click', () => navigateTo('collection'));

    const editBtn = container.querySelector('.edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            renderEditItemForm(item);
        });
    }

    const exhibitBtn = container.querySelector('.add-exhibit-btn');
    if (exhibitBtn) {
        exhibitBtn.addEventListener('click', () => {
            // Handle add to exhibit
        });
    }
}

/**
 * Render exhibition detail view
 */
async function renderExhibitionDetailView() {
    showView('view-exhibition-detail');
    const container = document.getElementById('exhibition-detail-content');

    const exhibition = appState.data.exhibitions.find(e => e.id === appState.currentExhibitionId);
    if (!exhibition) {
        container.innerHTML = ui.createEmptyState('❌', 'Exhibition Not Found');
        return;
    }

    const exhibitionItems = exhibitions.getExhibitionItems(exhibition, appState.data.items);

    let html = `
        <div class="exhibition-detail">
            <div class="exhibition-header">
                <button class="btn-back" onclick="window.history.back()">← Back</button>
                <h2>${ui.escapeHtml(exhibition.name)}</h2>
                <button class="btn-edit">Edit</button>
            </div>

            <div class="exhibition-items gallery">
    `;

    if (exhibitionItems.length === 0) {
        html += ui.createEmptyState('📭', 'No Items in This Exhibition');
    } else {
        for (const item of exhibitionItems) {
            const photoUrl = item.photo ? await image.blobToDataUrl(item.photo) : '';
            html += ui.createGalleryCard(item, photoUrl, '', false);
        }
    }

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Attach event listeners
    container.querySelectorAll('.gallery-item').forEach(card => {
        card.addEventListener('click', () => {
            navigateTo('item', card.dataset.id);
        });
    });

    const editBtn = container.querySelector('.btn-edit');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            // Handle edit exhibition
        });
    }
}

/**
 * Show error message
 */
function showError(message) {
    appState.error = message;
    console.error(message);

    // Show error in main content or as alert
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        mainContent.insertBefore(errorDiv, mainContent.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

/**
 * Show loading state
 */
function setLoading(isLoading) {
    appState.isLoading = isLoading;
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
        indicator.style.display = isLoading ? 'block' : 'none';
    }
}
