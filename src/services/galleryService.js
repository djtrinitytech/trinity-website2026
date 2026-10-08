import { supabase, isSupabaseConfigured } from "../lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

/**
 * Public: Fetch published items featured on homepage
 */
export async function getHomepageGallery() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error("Supabase is not configured yet") };
  }

  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("published", true)
      .eq("homepage_featured", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("Error fetching homepage gallery:", err);
    return { data: null, error: err };
  }
}

/**
 * Public: Fetch all published items for the dedicated /gallery archive page
 */
export async function getPublishedGallery() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error("Supabase is not configured yet") };
  }

  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("Error fetching published gallery:", err);
    return { data: null, error: err };
  }
}

/**
 * Admin: Fetch all gallery items
 */
export async function getAllGalleryItems() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error("Supabase is not configured yet") };
  }

  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error("Error fetching all gallery items:", err);
    return { data: [], error: err };
  }
}

/**
 * Validate an image file before upload
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format: ${file.type || "unknown"}. Only JPG, PNG, and WebP are allowed.`,
    };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB limit.`,
    };
  }
  return { valid: true, error: null };
}

/**
 * Admin: Upload image to Supabase Storage and create gallery_items DB record
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

  // 2. Upload file to 'gallery' bucket
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Storage upload failed:", uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // 3. Get Public URL
  const { data: urlData } = supabase.storage
    .from("gallery")
    .getPublicUrl(storagePath);

  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) {
    throw new Error("Failed to resolve public image URL from storage");
  }

  // 4. Insert record into gallery_items
  const record = {
    title: metadata.title?.trim() || file.name.replace(/\.[^/.]+$/, ""),
    description: metadata.description?.trim() || null,
    image_url: publicUrl,
    storage_path: storagePath,
    event_name: metadata.event_name?.trim() || "Trinity 2026",
    published: metadata.published !== undefined ? Boolean(metadata.published) : true,
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
    // If DB insert fails, clean up the uploaded storage file
    await supabase.storage.from("gallery").remove([storagePath]);
    throw dbError;
  }

  return dbData;
}

/**
 * Admin: Update gallery item metadata
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
 * Admin: Delete gallery item (DB record + Storage file)
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

  // 2. Delete file from Storage if storage_path is tracked
  if (storagePath) {
    try {
      await supabase.storage.from("gallery").remove([storagePath]);
    } catch (storageErr) {
      console.warn("Storage deletion warning (orphaned file ignored):", storageErr);
    }
  }

  return true;
}

/**
 * Admin: Toggle homepage featured status
 */
export async function toggleHomepageFeatured(id, currentStatus) {
  return updateGalleryItem(id, { homepage_featured: !currentStatus });
}

/**
 * Admin: Toggle publish status
 */
export async function togglePublishGalleryItem(id, currentStatus) {
  return updateGalleryItem(id, { published: !currentStatus });
}

/**
 * Admin: Batch reorder gallery items
 * Accepts an array of { id, display_order }
 */
export async function reorderGalleryItems(orderedItems) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase credentials not configured in .env");
  }

  // Sequential or Promise.all updates
  const promises = orderedItems.map((item, index) =>
    supabase
      .from("gallery_items")
      .update({
        display_order: index,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
  );

  const results = await Promise.all(promises);
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    throw failed.error;
  }
  return true;
}
