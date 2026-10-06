import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { validateImageFile } from "./galleryService";

/**
 * Public: Fetch published announcements whose publish time has arrived
 */
export async function getPublishedAnnouncements() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error("Supabase is not configured yet") };
  }

  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("published", true)
      .or(`publish_at.is.null,publish_at.lte.${nowIso}`)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("Error fetching published announcements:", err);
    return { data: null, error: err };
  }
}

/**
 * Admin: Fetch all announcements (draft, published, scheduled) with sorting
 */
export async function getAllAnnouncements(sortBy = "priority", sortAsc = false) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error("Supabase is not configured yet") };
  }

  try {
    let query = supabase.from("announcements").select("*");

    if (sortBy === "priority") {
      query = query
        .order("priority", { ascending: sortAsc })
        .order("created_at", { ascending: false });
    } else {
      query = query.order(sortBy, { ascending: sortAsc });
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    console.error("Error fetching all announcements:", err);
    return { data: [], error: err };
  }
}

/**
 * Admin: Get single announcement by ID
 */
export async function getAnnouncementById(id) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error("Supabase is not configured yet") };
  }

  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("Error fetching announcement by id:", err);
    return { data: null, error: err };
  }
}

/**
 * Admin: Create announcement
 */
export async function createAnnouncement(payload) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase credentials not configured in .env");
  }

  if (!payload.title || !payload.title.trim()) {
    throw new Error("Announcement title is required");
  }

  const record = {
    title: payload.title.trim(),
    slug: payload.slug?.trim() || null,
    description: payload.description || "",
    image_url: payload.image_url || null,
    category: payload.category || "ALL ORDERS",
    link: payload.link || null,
    published: Boolean(payload.published),
    featured: Boolean(payload.featured),
    priority: Number.isInteger(Number(payload.priority)) ? Number(payload.priority) : 0,
    publish_at: payload.publish_at || null,
  };

  const { data, error } = await supabase
    .from("announcements")
    .insert([record])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Admin: Update announcement
 */
export async function updateAnnouncement(id, updates) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase credentials not configured in .env");
  }

  if (updates.title !== undefined && !updates.title.trim()) {
    throw new Error("Announcement title cannot be empty");
  }

  const { data, error } = await supabase
    .from("announcements")
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
 * Admin: Delete announcement
 */
export async function deleteAnnouncement(id) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase credentials not configured in .env");
  }

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

/**
 * Admin: Quick toggle publish status
 */
export async function togglePublishAnnouncement(id, currentStatus) {
  return updateAnnouncement(id, { published: !currentStatus });
}

/**
 * Admin: List existing banner images from gallery/announcement-banners/
 * Exact Supabase API:
 *   supabase.storage.from("gallery").list("announcement-banners", { limit: 100, offset: 0, sortBy: { column: "created_at", order: "desc" } })
 */
export async function listAnnouncementBannerImages() {
  if (!isSupabaseConfigured()) {
    const cfgErr = new Error("Supabase is not configured yet. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env");
    console.error("Storage list error:", cfgErr);
    return { data: null, error: cfgErr };
  }

  try {
    const { data, error } = await supabase.storage
      .from("gallery")
      .list("announcement-banners", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("Storage list error from Supabase storage.from('gallery').list('announcement-banners'):", error);
      return { data: null, error };
    }

    if (!data) {
      return { data: [], error: null };
    }

    // Filter out folders and only show actual image files: .png, .jpg, .jpeg, .webp, .gif
    const IMAGE_REGEX = /\.(png|jpe?g|webp|gif)$/i;
    const imageFiles = data.filter((file) => {
      if (!file || !file.name) return false;
      if (file.name.startsWith(".")) return false;
      return IMAGE_REGEX.test(file.name);
    });

    const items = imageFiles.map((file) => {
      const fileName = file.name;
      const storagePath = `announcement-banners/${fileName}`;

      const { data: urlData, error: urlError } = supabase.storage
        .from("gallery")
        .getPublicUrl(storagePath);

      if (urlError) {
        console.error("Public URL generation error for file:", fileName, urlError);
      }

      const publicUrl = urlData?.publicUrl || "";
      if (!publicUrl) {
        console.error("Public URL generation error: missing publicUrl for", fileName);
      }

      return {
        id: file.id || fileName,
        name: fileName,
        created_at: file.created_at,
        updated_at: file.updated_at,
        metadata: file.metadata,
        storagePath,
        publicUrl,
      };
    });

    return { data: items, error: null };
  } catch (err) {
    console.error("Storage list error (exception):", err);
    return { data: null, error: err };
  }
}

/**
 * Admin: Upload a new banner image to gallery/announcement-banners/<unique-file-name>
 */
export async function uploadAnnouncementBannerImage(file) {
  if (!isSupabaseConfigured()) {
    const cfgErr = new Error("Supabase credentials not configured in .env");
    console.error("Storage upload error:", cfgErr);
    throw cfgErr;
  }

  // Allowed image formats: .png, .jpg, .jpeg, .webp, .gif
  const IMAGE_REGEX = /\.(png|jpe?g|webp|gif)$/i;
  if (!file || !file.name || !IMAGE_REGEX.test(file.name)) {
    const err = new Error(`Unsupported image format. Only PNG, JPG, JPEG, WEBP, and GIF are allowed.`);
    console.error("Storage upload error:", err);
    throw err;
  }

  const ext = file.name.split(".").pop().toLowerCase();
  const rawBase = file.name.replace(/\.[^/.]+$/, "");
  const sanitizedBase = rawBase
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 40) || "banner";

  const uniqueFileName = `${Date.now()}-${sanitizedBase}.${ext}`;
  const storagePath = `announcement-banners/${uniqueFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    console.error("Storage upload error for", storagePath, uploadError);
    throw new Error(uploadError.message || "Failed to upload banner to storage");
  }

  const { data: urlData, error: urlError } = supabase.storage
    .from("gallery")
    .getPublicUrl(storagePath);

  if (urlError) {
    console.error("Public URL generation error for uploaded file:", uniqueFileName, urlError);
  }

  const publicUrl = urlData?.publicUrl;
  if (!publicUrl) {
    const err = new Error(`Failed to resolve public image URL from storage for ${uniqueFileName}`);
    console.error("Public URL generation error:", err);
    throw err;
  }

  return {
    storagePath,
    publicUrl,
    fileName: uniqueFileName,
    originalName: file.name,
  };
}

