/**
 * Image Module: Image validation, processing, and compression
 * Handles file validation, preview, resize, and blob conversion
 */

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
];

const MAX_DIMENSION = 1600; // Maximum pixel dimension after resize
const IMAGE_QUALITY = 0.8;  // Quality parameter for compression
const CANVAS_MIME_TYPES = {
    WEBP: 'image/webp',
    JPEG: 'image/jpeg'
};

/**
 * Validate image file
 * @param {File} file - File object from input
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateImageFile(file) {
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { valid: false, error: `Unsupported image format: ${file.type}` };
    }

    return { valid: true };
}

/**
 * Process image: decode, resize, compress
 * @param {File} file - Image file
 * @returns {Promise<Object>} - { success: boolean, blob?: Blob, error?: string }
 */
export async function processImage(file) {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }

    try {
        // Read file as blob
        const blob = new Blob([await file.arrayBuffer()], { type: file.type });

        // Decode image and get dimensions
        const image = await decodeImage(blob);
        if (!image) {
            return { success: false, error: 'Failed to decode image' };
        }

        // Resize if needed
        const resized = await resizeImage(image, MAX_DIMENSION);

        // Compress to WebP with JPEG fallback
        const compressed = await compressImage(resized);
        if (!compressed) {
            return { success: false, error: 'Failed to compress image' };
        }

        return { success: true, blob: compressed };
    } catch (error) {
        return { success: false, error: `Image processing failed: ${error.message}` };
    }
}

/**
 * Decode image from blob to canvas-ready format
 * @param {Blob} blob - Image blob
 * @returns {Promise<HTMLImageElement|null>}
 */
function decodeImage(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onerror = () => {
            resolve(null);
        };

        reader.onload = (event) => {
            const img = new Image();

            img.onerror = () => {
                resolve(null);
            };

            img.onload = () => {
                resolve(img);
            };

            img.src = event.target.result;
        };

        reader.readAsDataURL(blob);
    });
}

/**
 * Resize image if it exceeds maximum dimension
 * Maintains aspect ratio
 * @param {HTMLImageElement} image - Decoded image
 * @param {number} maxDimension - Maximum width or height
 * @returns {Promise<HTMLCanvasElement>}
 */
function resizeImage(image, maxDimension) {
    return new Promise((resolve) => {
        let { width, height } = image;

        // Calculate new dimensions (maintain aspect ratio)
        if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(null);
            return;
        }

        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas);
    });
}

/**
 * Compress image using Canvas toBlob
 * Try WebP first, fall back to JPEG
 * @param {HTMLCanvasElement} canvas - Resized canvas
 * @returns {Promise<Blob|null>}
 */
function compressImage(canvas) {
    return new Promise((resolve) => {
        // Try WebP first
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    // WebP failed, try JPEG
                    canvas.toBlob(
                        (jpegBlob) => {
                            resolve(jpegBlob || null);
                        },
                        CANVAS_MIME_TYPES.JPEG,
                        IMAGE_QUALITY
                    );
                }
            },
            CANVAS_MIME_TYPES.WEBP,
            IMAGE_QUALITY
        );
    });
}

/**
 * Create a preview URL from blob
 * @param {Blob} blob - Image blob
 * @returns {string} - Object URL
 */
export function createPreviewUrl(blob) {
    if (!blob) {
        return null;
    }
    return URL.createObjectURL(blob);
}

/**
 * Release preview URL
 * @param {string} url - Object URL from createPreviewUrl
 */
export function releasePreviewUrl(url) {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

/**
 * Convert blob to data URL
 * Useful for preview in img element
 * @param {Blob} blob - Image blob
 * @returns {Promise<string>} - Data URL
 */
export function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => {
            reject(new Error('Failed to read blob'));
        };

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.readAsDataURL(blob);
    });
}

/**
 * Calculate image dimensions
 * @param {Blob} blob - Image blob
 * @returns {Promise<{width: number, height: number}|null>}
 */
export function getImageDimensions(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onerror = () => {
            resolve(null);
        };

        reader.onload = (event) => {
            const img = new Image();

            img.onerror = () => {
                resolve(null);
            };

            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };

            img.src = event.target.result;
        };

        reader.readAsDataURL(blob);
    });
}
