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
    editingExhibitionId: null,
    exhibitionDraft: null,
    collectionFilter: 'all',
    categoryManagerOpen: false,
    addCategoryFormOpen: false,
    renamingCategoryId: null,
    categoryFormError: null,
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
            case 'create-exhibit':
                await renderCreateExhibitView();
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
    if (view === 'create-exhibit') {
        appState.editingExhibitionId = id;
        appState.exhibitionDraft = null;
    }
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

        <details class="category-manager" ${appState.categoryManagerOpen ? 'open' : ''}>
            <summary>Manage Categories</summary>
            ${appState.addCategoryFormOpen ? `
                <form id="add-category-form" class="category-inline-form">
                    <label for="new-category-name" class="form-label">Category name</label>
                    <input id="new-category-name" name="name" class="form-input" placeholder="e.g. Rocks" autocomplete="off">
                    ${appState.categoryFormError ? `<div class="form-error" role="alert">${ui.escapeHtml(appState.categoryFormError)}</div>` : ''}
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary cancel-add-category">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Category</button>
                    </div>
                </form>
            ` : ''}
            ${ui.createCategoryManagerList(appState.data.categories, appState.data.items, appState.renamingCategoryId)}
        </details>

        <div id="items-container" class="gallery">
    `;

    if (appState.data.items.length === 0) {
        html += ui.createEmptyState('📦', 'No Items Yet', 'Start adding items to your collection', 'Add Item');
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
            appState.categoryManagerOpen = true;
            appState.addCategoryFormOpen = true;
            appState.renamingCategoryId = null;
            appState.categoryFormError = null;
            renderCollectionView();
        });
    }

    const addCategoryForm = container.querySelector('#add-category-form');
    if (addCategoryForm) {
        addCategoryForm.querySelector('#new-category-name').focus();
        addCategoryForm.querySelector('.cancel-add-category').addEventListener('click', () => {
            appState.addCategoryFormOpen = false;
            appState.categoryFormError = null;
            renderCollectionView();
        });
        addCategoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = new FormData(addCategoryForm).get('name') || '';
            const result = categories.createCategory({ id: db.generateId(), name });
            if (result.error) {
                appState.categoryFormError = result.error;
                renderCollectionView();
                return;
            }
            const achievementsBefore = captureAchievementState();
            try {
                setLoading(true);
                await db.put(db.STORE_NAMES.CATEGORIES, result);
                appState.addCategoryFormOpen = false;
                appState.categoryFormError = null;
                await reloadData();
                checkAchievements(achievementsBefore);
                await renderCollectionView();
            } catch (error) {
                console.error('Category save failed:', error);
                appState.categoryFormError = "We couldn't save this category yet. Try again.";
                renderCollectionView();
            } finally {
                setLoading(false);
            }
        });
    }

    // Rename category handlers
    container.querySelectorAll('.rename-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            appState.categoryManagerOpen = true;
            appState.addCategoryFormOpen = false;
            appState.renamingCategoryId = btn.dataset.id;
            appState.categoryFormError = null;
            renderCollectionView();
        });
    });

    const renameForm = container.querySelector('#rename-category-form');
    if (renameForm) {
        renameForm.querySelector('input[name="name"]').focus();
        renameForm.querySelector('.cancel-rename-category').addEventListener('click', () => {
            appState.renamingCategoryId = null;
            renderCollectionView();
        });
        renameForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const categoryId = renameForm.dataset.id;
            const category = categories.getCategoryById(appState.data.categories, categoryId);
            if (!category) return;
            const name = new FormData(renameForm).get('name') || '';
            const result = categories.updateCategory(category, { name });
            if (result.error) {
                appState.categoryFormError = result.error;
                renderCollectionView();
                return;
            }
            const achievementsBefore = captureAchievementState();
            try {
                setLoading(true);
                await db.put(db.STORE_NAMES.CATEGORIES, result);
                appState.renamingCategoryId = null;
                appState.categoryFormError = null;
                await reloadData();
                checkAchievements(achievementsBefore);
                await renderCollectionView();
            } catch (error) {
                console.error('Category rename failed:', error);
                appState.categoryFormError = "We couldn't rename this category yet. Try again.";
                renderCollectionView();
            } finally {
                setLoading(false);
            }
        });
    }

    // Delete category handlers
    container.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const categoryId = btn.dataset.id;
            const category = categories.getCategoryById(appState.data.categories, categoryId);
            if (!category) return;
            if (!window.confirm(`Delete "${category.name}"? Items keep their other details and become Uncategorized.`)) return;
            const achievementsBefore = captureAchievementState();
            try {
                setLoading(true);
                const originalItems = appState.data.items;
                const updatedItems = categories.uncategorizeItems(originalItems, categoryId);
                await db.transaction([db.STORE_NAMES.CATEGORIES, db.STORE_NAMES.ITEMS], (stores) => {
                    stores[db.STORE_NAMES.CATEGORIES].delete(categoryId);
                    updatedItems.forEach((item, index) => {
                        if (item !== originalItems[index]) {
                            stores[db.STORE_NAMES.ITEMS].put(item);
                        }
                    });
                });
                if (appState.collectionFilter === categoryId) {
                    appState.collectionFilter = 'all';
                }
                await reloadData();
                checkAchievements(achievementsBefore);
                await renderCollectionView();
            } catch (error) {
                console.error('Category delete failed:', error);
                showError("We couldn't delete this category yet. Try again.");
            } finally {
                setLoading(false);
            }
        });
    });

    const emptyStateCTA = container.querySelector('[onclick*="empty-state-cta"]');
    if (emptyStateCTA) {
        emptyStateCTA.addEventListener('click', () => {
            navigateTo('add-item');
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
            '還沒有展覽。從你的收藏挑幾件寶物，打造第一個展覽。',
            '',
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
        createBtn.addEventListener('click', () => navigateTo('create-exhibit'));
    }

    const emptyStateCTA = container.querySelector('[onclick*="empty-state-cta"]');
    if (emptyStateCTA) {
        emptyStateCTA.addEventListener('click', () => navigateTo('create-exhibit'));
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
            const achievementsBefore = captureAchievementState();
            try {
                setLoading(true);
                await db.put(db.STORE_NAMES.ITEMS, result);
                appState.draft = null;
                await reloadData();
                checkAchievements(achievementsBefore);
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
        const achievementsBefore = captureAchievementState();
        try {
            setLoading(true);
            await db.put(db.STORE_NAMES.ITEMS, result);
            appState.draft = null;
            await reloadData();
            checkAchievements(achievementsBefore);
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
            const achievementsBefore = captureAchievementState();
            try {
                setLoading(true);
                const updatedExhibitions = items.removeItemFromExhibitions(appState.data.exhibitions, item.id);
                await db.transaction([db.STORE_NAMES.ITEMS, db.STORE_NAMES.EXHIBITIONS], (stores) => {
                    stores[db.STORE_NAMES.ITEMS].delete(item.id);
                    updatedExhibitions.forEach(exhibition => stores[db.STORE_NAMES.EXHIBITIONS].put(exhibition));
                });
                await reloadData();
                checkAchievements(achievementsBefore);
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
            appState.editingExhibitionId = null;
            appState.exhibitionDraft = { name: '', itemIds: [item.id], saveError: '' };
            appState.currentView = 'create-exhibit';
            reloadData().then(renderCurrentView);
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
                <button class="btn-back" id="back-to-exhibits">← Back</button>
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
    container.querySelector('#back-to-exhibits').addEventListener('click', () => navigateTo('exhibits'));

    container.querySelectorAll('.gallery-item').forEach(card => {
        card.addEventListener('click', () => {
            navigateTo('item', card.dataset.id);
        });
    });

    const editBtn = container.querySelector('.btn-edit');
    if (editBtn) {
        editBtn.addEventListener('click', () => navigateTo('create-exhibit', exhibition.id));
    }
}

/**
 * Render Create / Edit Exhibit view (Exhibition Builder)
 */
async function renderCreateExhibitView() {
    showView('view-create-exhibit');
    const container = document.getElementById('create-exhibit-content');

    const editingId = appState.editingExhibitionId;
    const existing = editingId ? appState.data.exhibitions.find(e => e.id === editingId) : null;

    if (editingId && !existing) {
        container.innerHTML = ui.createEmptyState('❌', 'Exhibition Not Found');
        return;
    }

    if (appState.data.items.length === 0) {
        container.innerHTML = ui.createEmptyState(
            '🖼',
            'Add some items first',
            'You need at least one collection item before you can build an exhibit.',
            'Add Item'
        );
        const cta = container.querySelector('[onclick*="empty-state-cta"]');
        if (cta) cta.addEventListener('click', () => navigateTo('add-item'));
        return;
    }

    const draft = appState.exhibitionDraft || {
        name: existing ? existing.name : '',
        itemIds: existing ? [...existing.itemIds] : [],
        saveError: ''
    };
    appState.exhibitionDraft = draft;

    const orderedItems = draft.itemIds
        .map(id => appState.data.items.find(i => i.id === id))
        .filter(Boolean);

    let checkboxesHtml = '';
    for (const item of appState.data.items) {
        const photoUrl = item.photo ? await image.blobToDataUrl(item.photo) : '';
        checkboxesHtml += ui.createExhibitionItemCheckbox(item, photoUrl, draft.itemIds.includes(item.id));
    }

    let orderHtml = '';
    for (let i = 0; i < orderedItems.length; i++) {
        const orderItem = orderedItems[i];
        const photoUrl = orderItem.photo ? await image.blobToDataUrl(orderItem.photo) : '';
        orderHtml += ui.createExhibitionOrderRow(orderItem, photoUrl, i, orderedItems.length);
    }

    const html = `
        <div class="create-exhibit-header">
            <button type="button" class="btn-back" id="cancel-create-exhibit">← Back</button>
            <h2>${editingId ? 'Edit Exhibit' : 'Create Exhibit'}</h2>
        </div>
        <form id="create-exhibit-form">
            <div class="form-group">
                <label for="exhibition-name" class="form-label">Exhibition Name *</label>
                <input id="exhibition-name" name="name" class="form-input" value="${ui.escapeHtml(draft.name)}" placeholder="Name your exhibition">
                ${draft.nameError ? `<div class="form-error">${ui.escapeHtml(draft.nameError)}</div>` : ''}
            </div>
            <div class="form-section">
                <h3>Select Items</h3>
                <div class="exhibit-select-list">${checkboxesHtml}</div>
                ${draft.itemsError ? `<div class="form-error">${ui.escapeHtml(draft.itemsError)}</div>` : ''}
            </div>
            <div class="form-section">
                <h3>Arrange Order</h3>
                ${orderedItems.length === 0
                    ? '<p class="empty-inline">Select items above to arrange their order.</p>'
                    : `<ul class="exhibit-order-list">${orderHtml}</ul>`}
            </div>
            ${draft.saveError ? `<div class="form-error save-error" role="alert">${ui.escapeHtml(draft.saveError)}</div>` : ''}
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-create-exhibit-2">Cancel</button>
                <button type="submit" class="btn btn-primary">${editingId ? 'Save Exhibition' : 'Open Exhibition'}</button>
            </div>
        </form>
    `;

    container.innerHTML = html;

    const form = container.querySelector('#create-exhibit-form');
    const goBack = () => {
        appState.exhibitionDraft = null;
        const targetId = appState.editingExhibitionId;
        appState.editingExhibitionId = null;
        navigateTo(targetId ? 'exhibition' : 'exhibits', targetId);
    };
    container.querySelector('#cancel-create-exhibit').addEventListener('click', goBack);
    form.querySelector('#cancel-create-exhibit-2').addEventListener('click', goBack);

    form.querySelector('#exhibition-name').addEventListener('input', (e) => {
        draft.name = e.target.value;
    });

    form.querySelectorAll('input[name="itemIds"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.value;
            if (e.target.checked) {
                if (!draft.itemIds.includes(id)) draft.itemIds.push(id);
            } else {
                draft.itemIds = draft.itemIds.filter(existingId => existingId !== id);
            }
            renderCreateExhibitView();
        });
    });

    form.querySelectorAll('.move-up-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = draft.itemIds.indexOf(btn.dataset.id);
            if (index > 0) {
                [draft.itemIds[index - 1], draft.itemIds[index]] = [draft.itemIds[index], draft.itemIds[index - 1]];
                renderCreateExhibitView();
            }
        });
    });

    form.querySelectorAll('.move-down-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = draft.itemIds.indexOf(btn.dataset.id);
            if (index >= 0 && index < draft.itemIds.length - 1) {
                [draft.itemIds[index + 1], draft.itemIds[index]] = [draft.itemIds[index], draft.itemIds[index + 1]];
                renderCreateExhibitView();
            }
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nameValidation = exhibitions.validateExhibitionName(draft.name);
        const itemsValidation = exhibitions.validateExhibitionItems(draft.itemIds, appState.data.items);
        draft.nameError = nameValidation.valid ? '' : 'Give this exhibition a name first.';
        draft.itemsError = itemsValidation.valid ? '' : 'Choose at least one item for this exhibition.';
        draft.saveError = '';

        if (!nameValidation.valid || !itemsValidation.valid) {
            await renderCreateExhibitView();
            return;
        }

        const result = editingId
            ? exhibitions.updateExhibition(existing, { name: draft.name, itemIds: draft.itemIds }, appState.data.items)
            : exhibitions.createExhibition({ id: db.generateId(), name: draft.name, itemIds: draft.itemIds }, appState.data.items);

        if (result.error) {
            draft.saveError = result.error;
            await renderCreateExhibitView();
            return;
        }

        const achievementsBefore = captureAchievementState();
        try {
            setLoading(true);
            await db.put(db.STORE_NAMES.EXHIBITIONS, result);
            appState.exhibitionDraft = null;
            appState.editingExhibitionId = null;
            await reloadData();
            checkAchievements(achievementsBefore);
            await navigateTo('exhibition', result.id);
        } catch (error) {
            console.error('Exhibition save failed:', error);
            draft.saveError = "We couldn't save this exhibition yet. Your selections are still here. Try again.";
            await renderCreateExhibitView();
        } finally {
            setLoading(false);
        }
    });
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

/**
 * Capture current achievement state to compare against after a mutation.
 * Only used around successful domain mutations; never on startup/reload alone.
 * @returns {Object} - Achievement state before the mutation
 */
function captureAchievementState() {
    return achievements.calculateAchievements(appState.data.items, appState.data.categories, appState.data.exhibitions);
}

/**
 * Compare achievement state before/after a successful mutation and show
 * feedback for any newly crossed (false -> true) achievement. Achievement
 * failures must never block the core save/delete flow that already committed.
 * @param {Object} beforeState - Achievement state captured before the mutation
 */
function checkAchievements(beforeState) {
    try {
        const afterState = achievements.calculateAchievements(appState.data.items, appState.data.categories, appState.data.exhibitions);
        const feedback = achievements.getUnlockedFeedback(beforeState, afterState);
        if (feedback.length > 0) {
            showAchievementFeedback(feedback);
        }
    } catch (error) {
        console.error('Achievement check failed:', error);
    }
}

/**
 * Render non-blocking private achievement feedback cards
 * @param {Array<Object>} feedbackList - Newly unlocked achievement feedback
 */
function showAchievementFeedback(feedbackList) {
    const container = document.getElementById('achievement-feedback-container');
    if (!container) return;

    feedbackList.forEach(feedback => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = ui.createAchievementCard(feedback).trim();
        const card = wrapper.firstElementChild;
        container.appendChild(card);

        const dismiss = () => {
            card.classList.add('achievement-card-hide');
            card.addEventListener('animationend', () => card.remove(), { once: true });
        };

        card.querySelector('.achievement-card-dismiss').addEventListener('click', dismiss);
        setTimeout(dismiss, 4000);
    });
}
