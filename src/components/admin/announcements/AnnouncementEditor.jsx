import React, { useState, useEffect, useRef } from "react";
import {
  listAnnouncementBannerImages,
  uploadAnnouncementBannerImage,
} from "../../../services/announcementService";
import { useAdminUI } from "../AdminLayout";

export default function AnnouncementEditor({
  item,
  isOpen,
  onClose,
  onSave,
  saving,
}) {
  const { showToast } = useAdminUI();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("All Departments");
  const [featured, setFeatured] = useState(false);

  // Storage Image Selector State
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setSlug(item.slug || "");
      setDesc(item.description || "");
      setImageUrl(item.image_url || "");
      setCategory(item.category || "All Departments");
      setFeatured(Boolean(item.featured));
    } else {
      setTitle("");
      setSlug("");
      setDesc("");
      setImageUrl("");
      setCategory("All Departments");
      setFeatured(false);
    }

    // Reset library drawer & uploading when modal opens/closes
    setShowLibrary(false);
    setUploading(false);
    setLibraryError(null);
  }, [item, isOpen]);

  if (!isOpen) return null;

  // Fetch images from Supabase Storage: gallery/announcement-banners/
  const fetchLibrary = async () => {
    try {
      setLoadingLibrary(true);
      setLibraryError(null);
      const { data, error } = await listAnnouncementBannerImages();
      if (error) {
        const errorMsg = error.message || String(error);
        console.error("Storage list error:", error);
        setLibraryError(errorMsg);
        setLibraryImages([]);
      } else {
        setLibraryImages(data || []);
      }
    } catch (err) {
      console.error("Storage list error:", err);
      const errorMsg = err.message || String(err);
      setLibraryError(errorMsg);
      setLibraryImages([]);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleToggleLibrary = async () => {
    const nextState = !showLibrary;
    setShowLibrary(nextState);
    if (nextState) {
      await fetchLibrary();
    }
  };

  const handleSelectImage = (img) => {
    setImageUrl(img.publicUrl);
    showToast("Banner image selected", "success", 2000);
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    showToast("Banner image removed from announcement", "info", 2000);
  };

  // Upload file to Supabase Storage: gallery/announcement-banners/<unique-file-name>
  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadAnnouncementBannerImage(file);

      // Automatically select newly uploaded image
      setImageUrl(res.publicUrl);
      showToast("Banner uploaded & selected", "success");

      // Refresh the library automatically after successful upload
      setShowLibrary(true);
      await fetchLibrary();
    } catch (err) {
      console.error("Storage upload error in AnnouncementEditor:", err);
      showToast(err.message || "Failed to upload banner", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (publishedState) => {
    onSave({
      title: title.trim(),
      slug: slug.trim() || undefined,
      description: desc.trim(),
      category: category.trim() || "All Departments",
      image_url: imageUrl.trim() || null,
      link: item?.link || null,
      priority: item?.priority || 0,
      featured,
      published: publishedState,
      publish_at: item?.publish_at || null,
    });
  };

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="admin-modal-box"
        style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            borderBottom: "1px solid rgba(214, 175, 102, 0.2)",
            paddingBottom: 12,
          }}
        >
          <h3 style={{ margin: 0 }}>
            {item ? "Edit Announcement" : "Create New Announcement"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#cca16b",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(Boolean(item?.published));
          }}
        >
          {/* Title */}
          <div className="admin-form-group">
            <label htmlFor="ann-title">Title *</label>
            <input
              id="ann-title"
              type="text"
              className="admin-input"
              placeholder="e.g. Registrations for Anugatha 2026 are now open"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div className="admin-form-group">
            <label htmlFor="ann-desc">Description / Excerpt</label>
            <textarea
              id="ann-desc"
              className="admin-textarea"
              placeholder="Summary text displayed on announcements card and details modal..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              disabled={saving}
            />
          </div>

          {/* Department */}
          <div className="admin-form-group">
            <label htmlFor="ann-dept">Department</label>
            <select
              id="ann-dept"
              className="admin-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={saving}
              style={{
                background: "rgba(10, 16, 14, 0.9)",
                color: "#ede6d8",
                borderColor: "rgba(214, 175, 102, 0.3)",
              }}
            >
              <option value="All Departments">All Departments</option>
              <option value="Comps">Comps</option>
              <option value="IT">IT</option>
              <option value="CSEDs">CSEDs</option>
              <option value="Mech">Mech</option>
              <option value="EXTC">EXTC</option>
              <option value="Allied">Allied</option>
            </select>
          </div>

          {/* ================================================================
              BANNER IMAGE SELECTOR (Supabase Storage: gallery/announcement-banners/)
              ================================================================ */}
          <div className="admin-form-group" style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8 }}>
              BANNER IMAGE
            </label>

            {/* Selector Action Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <button
                type="button"
                className={`admin-btn ${
                  showLibrary ? "admin-btn-primary" : "admin-btn-secondary"
                }`}
                onClick={handleToggleLibrary}
                disabled={saving || uploading}
              >
                {showLibrary ? "Hide Library" : "Select From Library"}
              </button>

              <label
                className="admin-btn admin-btn-secondary"
                style={{
                  cursor: uploading || saving ? "not-allowed" : "pointer",
                  margin: 0,
                }}
              >
                {uploading ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="admin-spinner sm" /> Uploading...
                  </span>
                ) : (
                  "Upload New Image"
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUploadFile}
                  disabled={uploading || saving}
                  style={{ display: "none" }}
                />
              </label>

              {imageUrl && (
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={handleRemoveImage}
                  disabled={saving || uploading}
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Selected Image Banner Preview */}
            {imageUrl ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  maxHeight: 220,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid rgba(214, 175, 102, 0.35)",
                  background: "#060b0a",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                  marginBottom: 12,
                }}
              >
                <img
                  src={imageUrl}
                  alt="Announcement Banner Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    background: "rgba(7, 12, 11, 0.85)",
                    border: "1px solid rgba(214, 175, 102, 0.3)",
                    padding: "3px 8px",
                    borderRadius: 4,
                    fontSize: 10.5,
                    fontFamily: "'DM Mono', monospace",
                    color: "#cca16b",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Selected Banner
                </div>
              </div>
            ) : (
              <p
                style={{
                  fontSize: 12,
                  color: "#8e8779",
                  margin: "4px 0 12px",
                  fontStyle: "italic",
                }}
              >
                No banner image selected. Click &quot;Select From Library&quot; or &quot;Upload New Image&quot; to assign one.
              </p>
            )}

            {/* Visual Library Drawer (gallery/announcement-banners/) */}
            {showLibrary && (
              <div
                style={{
                  background: "rgba(7, 12, 11, 0.85)",
                  border: "1px solid rgba(214, 175, 102, 0.25)",
                  borderRadius: 8,
                  padding: 14,
                  marginTop: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: "1px solid rgba(214, 175, 102, 0.15)",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      color: "#cca16b",
                      textTransform: "uppercase",
                    }}
                  >
                    Storage Library (gallery/announcement-banners/)
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={fetchLibrary}
                      disabled={loadingLibrary}
                      style={{ padding: "4px 10px", fontSize: 11 }}
                      title="Reload images from Supabase Storage"
                    >
                      {loadingLibrary ? "Refreshing..." : "↻ Refresh Library"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLibrary(false)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#cca16b",
                        fontSize: 18,
                        cursor: "pointer",
                        lineHeight: 1,
                        padding: "0 4px",
                      }}
                      title="Close library"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {loadingLibrary ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div
                      className="admin-spinner sm"
                      style={{ margin: "0 auto 8px" }}
                    />
                    <span style={{ fontSize: 12, color: "#8e8779" }}>
                      Fetching banner library...
                    </span>
                  </div>
                ) : libraryError ? (
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "rgba(201, 87, 76, 0.12)",
                      border: "1px solid rgba(201, 87, 76, 0.35)",
                      borderRadius: 6,
                      color: "#ff9d94",
                      fontSize: 12,
                      lineHeight: 1.5,
                      margin: "6px 0 12px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span>⚠️</span>
                      <span>Unable to load banner library:</span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11.5,
                        color: "#fce3e1",
                        wordBreak: "break-word",
                      }}
                    >
                      {libraryError}
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={fetchLibrary}
                      style={{
                        marginTop: 10,
                        borderColor: "rgba(201, 87, 76, 0.4)",
                      }}
                    >
                      Retry Loading Library
                    </button>
                  </div>
                ) : libraryImages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px 0",
                      color: "#8e8779",
                      fontSize: 12,
                    }}
                  >
                    <p style={{ margin: "0 0 8px" }}>
                      No banner images found in storage yet.
                    </p>
                    <span style={{ fontSize: 11, color: "#cca16b" }}>
                      Use &quot;Upload New Image&quot; above to add your first banner.
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: 12,
                      maxHeight: 250,
                      overflowY: "auto",
                      paddingRight: 4,
                    }}
                  >
                    {libraryImages.map((img) => {
                      const isSelected = imageUrl === img.publicUrl;
                      const displayName = img.name.replace(/^\d+-/, "");

                      return (
                        <div
                          key={img.id || img.name}
                          onClick={() => handleSelectImage(img)}
                          style={{
                            cursor: "pointer",
                            borderRadius: 6,
                            overflow: "hidden",
                            border: isSelected
                              ? "2px solid #cca16b"
                              : "1px solid rgba(214, 175, 102, 0.15)",
                            background: isSelected
                              ? "rgba(204, 161, 107, 0.15)"
                              : "rgba(14, 22, 20, 0.7)",
                            boxShadow: isSelected
                              ? "0 0 12px rgba(204, 161, 107, 0.4)"
                              : "none",
                            transition: "all 0.15s ease",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              aspectRatio: "16 / 9",
                              background: "#040807",
                              overflow: "hidden",
                              position: "relative",
                            }}
                          >
                            <img
                              src={img.publicUrl}
                              alt={displayName}
                              loading="lazy"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                            {isSelected && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  background: "#cca16b",
                                  color: "#070c0b",
                                  borderRadius: "50%",
                                  width: 18,
                                  height: 18,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 11,
                                  fontWeight: "bold",
                                }}
                              >
                                ✓
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              padding: "6px 8px",
                              fontSize: 10,
                              fontFamily: "'DM Mono', monospace",
                              color: isSelected ? "#ffd885" : "#a89f91",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={displayName}
                          >
                            {displayName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Checkboxes: Featured */}
          <div style={{ marginBottom: 24, marginTop: 8 }}>
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                disabled={saving}
              />
              <span style={{ fontSize: 13, color: "#ede6d8" }}>
                ★ Feature this announcement (Highlight badge & priority presentation)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              borderTop: "1px solid rgba(214, 175, 102, 0.2)",
              paddingTop: 18,
            }}
          >
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => handleSubmit(false)}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={() => handleSubmit(true)}
                disabled={saving}
              >
                {saving ? "Publishing..." : "Publish Live"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
