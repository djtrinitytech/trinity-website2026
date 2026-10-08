import { supabase, isSupabaseConfigured } from "../lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const GALLERY_BUCKET = "gallery";
const HOMEPAGE_STORAGE_ROOT = "2026/trinity-2026";

/**
 * --------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------------
 */

function isImageFile(name = "") {
  const lower = name.toLowerCase();

  return (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp")
  );
}

function isPlaceholderFile(name = "") {
  return (
    name === ".emptyFolderPlaceholder" ||
    name.startsWith(".emptyFolderPlaceholder")
  );
}

function titleFromFilename(filename = "") {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/^\d+-/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStoragePublicUrl(storagePath) {
  const { data } = supabase.storage
    .from(GALLERY_BUCKET)
    .getPublicUrl(storagePath);

  return data?.publicUrl || "";
}

/**
 * --------------------------------------------------------------------------
 * Recursively discover images inside:
 *
 * gallery/
 *   2026/
 *     trinity-2026/
 *       freshers2026/
 *       tfs/
 *       ...
 *
 * We intentionally start at HOMEPAGE_STORAGE_ROOT instead of the bucket root
 * so announcement-banners and announcements_images are not included.
 * --------------------------------------------------------------------------
 */

async function getStorageGalleryImages() {
  const discoveredImages = [];

  const foldersToVisit = [HOMEPAGE_STORAGE_ROOT];
  const visitedFolders = new Set();

  while (foldersToVisit.length > 0) {
    const currentFolder = foldersToVisit.shift();

    if (visitedFolders.has(currentFolder)) {
      continue;
    }

    visitedFolders.add(currentFolder);

    const { data, error } = await supabase.storage
      .from(GALLERY_BUCKET)
      .list(currentFolder, {
        limit: 1000,
        offset: 0,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (error) {
      console.warn(
        `Could not read Supabase Storage folder "${currentFolder}":`,
        error,
      );

      continue;
    }

    if (!data || data.length === 0) {
      continue;
    }

    for (const item of data) {
      if (!item?.name || isPlaceholderFile(item.name)) {
        continue;
      }

      const fullPath = `${currentFolder}/${item.name}`;

      /**
       * Supabase Storage list() returns folders as entries without
       * file metadata such as mimetype/size.
       *
       * Therefore:
       * - image filename => treat as image
       * - non-image entry => treat as folder and visit it
       */

      if (isImageFile(item.name)) {
        const publicUrl = getStoragePublicUrl(fullPath);

        if (!publicUrl) {
          continue;
        }

        discoveredImages.push({
          id: `storage-${fullPath}`,
          title: titleFromFilename(item.name),
          image_url: publicUrl,
          storage_path: fullPath,

          /**
           * Storage's created_at is available for files.
           * Keep a fallback so sorting never breaks.
           */
          created_at:
            item.created_at || item.updated_at || new Date(0).toISOString(),

          source: "storage",
        });
      } else {
        /**
         * Likely a directory.
         *
         * We only traverse paths under our Trinity 2026 root,
         * so announcement-banners and announcements_images are
         * automatically excluded.
         */
        foldersToVisit.push(fullPath);
      }
    }
  }

  return discoveredImages;
}

/**
 * --------------------------------------------------------------------------
 * Public: Fetch published items featured on homepage
 *
 * Combines:
 *
 * 1. gallery_items database records
 * 2. Actual images currently present in Supabase Storage
 *
 * This means newly uploaded Storage images can appear on the homepage
 * without requiring a separate gallery_items database insert.
 * --------------------------------------------------------------------------
 */

export async function getHomepageGallery() {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: new Error("Supabase is not configured yet"),
    };
  }

  try {
    /**
     * ---------------------------------------------------------------
     * 1. Fetch manually curated gallery_items
     * ---------------------------------------------------------------
     */
    const { data: databaseItems, error: databaseError } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("published", true)
      .eq("homepage_featured", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (databaseError) {
      console.warn(
        "gallery_items query failed. Continuing with Storage:",
        databaseError,
      );
    }

    /**
     * ---------------------------------------------------------------
     * 2. Fetch actual images from Supabase Storage
     * ---------------------------------------------------------------
     */
    const storageItems = await getStorageGalleryImages();

    /**
     * ---------------------------------------------------------------
     * 3. Normalize database items
     * ---------------------------------------------------------------
     */
    const normalizedDatabaseItems = (databaseItems || [])
      .filter((item) => item?.image_url)
      .map((item) => ({
        ...item,
        source: "database",
      }));

    /**
     * ---------------------------------------------------------------
     * 4. Merge database + Storage
     *
     * Storage files that already have a database record should not
     * appear twice.
     * ---------------------------------------------------------------
     */

    const existingUrls = new Set(
      normalizedDatabaseItems.map((item) => item.image_url).filter(Boolean),
    );

    const uniqueStorageItems = storageItems.filter(
      (item) => !existingUrls.has(item.image_url),
    );

    const combined = [...normalizedDatabaseItems, ...uniqueStorageItems];

    /**
     * ---------------------------------------------------------------
     * 5. Sort newest first
     *
     * This is what makes recently uploaded photographs appear first
     * in the homepage carousel.
     * ---------------------------------------------------------------
     */

    combined.sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0).getTime();

      const dateB = new Date(b.created_at || b.updated_at || 0).getTime();

      return dateB - dateA;
    });

    /**
     * ---------------------------------------------------------------
     * 6. Limit homepage gallery
     *
     * Keep the homepage lightweight.
     *
     * The DNA carousel itself duplicates these visually to maintain
     * the continuous carousel effect.
     * ---------------------------------------------------------------
     */

    const homepageItems = combined.slice(0, 12);

    console.log(`[Homepage Gallery] ${homepageItems.length} images loaded`, {
      database: normalizedDatabaseItems.length,
      storage: uniqueStorageItems.length,
    });

    return {
      data: homepageItems,
      error: null,
    };
  } catch (err) {
    console.error("Error fetching homepage gallery:", err);

    return {
      data: null,
      error: err,
    };
  }
}

/**
 * --------------------------------------------------------------------------
 * Public: Fetch all published items for the dedicated /gallery archive page
 * --------------------------------------------------------------------------
 */

export async function getPublishedGallery() {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: new Error("Supabase is not configured yet"),
    };
  }

  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      error: null,
    };
  } catch (err) {
    console.error("Error fetching published gallery:", err);

    return {
      data: null,
      error: err,
    };
  }
}

/**
 * --------------------------------------------------------------------------
 * Admin: Fetch all gallery items
 * --------------------------------------------------------------------------
 */

export async function getAllGalleryItems() {
  if (!isSupabaseConfigured()) {
    return {
      data: [],
      error: new Error("Supabase is not configured yet"),
    };
  }

  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      error: null,
    };
  } catch (err) {
    console.error("Error fetching all gallery items:", err);

    return {
      data: [],
      error: err,
    };
  }
}

/**
 * --------------------------------------------------------------------------
 * Validate an image file before upload
 * --------------------------------------------------------------------------
 */

export function validateImageFile(file) {
  if (!file) {
    return {
      valid: false,
      error: "No file provided",
    };
  }

  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format: ${
        file.type || "unknown"
      }. Only JPG, PNG, and WebP are allowed.`,
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(
        0,
      )}MB limit.`,
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * --------------------------------------------------------------------------
 * Admin: Upload image to Supabase Storage and create gallery_items DB record
 * --------------------------------------------------------------------------
 */

export async function uploadGalleryImage(file, metadata = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase credentials not configured in .env");
  }

  const validation = validateImageFile(file);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 1. Sanitize file name and construct path
  const ext = file.name.split(".").pop().toLowerCase();

  const baseName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 40);

  const eventSlug = (metadata.event_name || "general")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-");

  const storagePath = `2026/${eventSlug}/${Date.now()}-${baseName}.${ext}`;

  // 2. Upload file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Storage upload failed:", uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Prevent unused variable warnings
  void uploadData;

  // 3. Get public URL
  const { data: urlData } = supabase.storage
    .from(GALLERY_BUCKET)
    .getPublicUrl(storagePath);

  const publicUrl = urlData?.publicUrl;

  if (!publicUrl) {
    throw new Error("Failed to resolve public image URL from storage");
  }

  // 4. Insert database record
  const record = {
    title: metadata.title?.trim() || file.name.replace(/\.[^/.]+$/, ""),

    description: metadata.description?.trim() || null,

    image_url: publicUrl,

    storage_path: storagePath,

    event_name: metadata.event_name?.trim() || "Trinity 2026",

    published:
      metadata.published !== undefined ? Boolean(metadata.published) : true,

    homepage_featured: Boolean(metadata.homepage_featured),

    display_order: Number.isInteger(Number(metadata.display_order))
      ? Number(metadata.display_order)
      : 0,
  };

  const { data: dbData, error: dbError } = await supabase
    .from("gallery_items")
    .insert([record])
    .select()
    .single();

  if (dbError) {
    // Roll back Storage upload if DB insert fails
    await supabase.storage.from(GALLERY_BUCKET).remove([storagePath]);

    throw dbError;
  }

  return dbData;
}

/**
 * --------------------------------------------------------------------------
 * Admin: Update gallery item metadata
 * --------------------------------------------------------------------------
 */

export async function updateGalleryItem(id, updates) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase credentials not configured in .env");
  }

  const { data, error } = await supabase
    .from("gallery_items")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * --------------------------------------------------------------------------
 * Admin: Delete gallery item
 * --------------------------------------------------------------------------
 */

export async function deleteGalleryItem(id, storagePath) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase credentials not configured in .env");
  }

  // 1. Delete DB record
  const { error: dbError } = await supabase
    .from("gallery_items")
    .delete()
    .eq("id", id);

  if (dbError) throw dbError;

  // 2. Delete Storage file if tracked
  if (storagePath) {
    try {
      await supabase.storage.from(GALLERY_BUCKET).remove([storagePath]);
    } catch (storageErr) {
      console.warn(
        "Storage deletion warning (orphaned file ignored):",
        storageErr,
      );
    }
  }

  return true;
}

/**
 * --------------------------------------------------------------------------
 * Admin: Toggle homepage featured status
 * --------------------------------------------------------------------------
 */

export async function toggleHomepageFeatured(id, currentStatus) {
  return updateGalleryItem(id, {
    homepage_featured: !currentStatus,
  });
}

/**
 * --------------------------------------------------------------------------
 * Admin: Toggle publish status
 * --------------------------------------------------------------------------
 */

export async function togglePublishGalleryItem(id, currentStatus) {
  return updateGalleryItem(id, {
    published: !currentStatus,
  });
}

/**
 * --------------------------------------------------------------------------
 * Admin: Batch reorder gallery items
 * --------------------------------------------------------------------------
 */

export async function reorderGalleryItems(orderedItems) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase credentials not configured in .env");
  }

  const promises = orderedItems.map((item, index) =>
    supabase
      .from("gallery_items")
      .update({
        display_order: index,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id),
  );

  const results = await Promise.all(promises);

  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw failed.error;
  }

  return true;
}
