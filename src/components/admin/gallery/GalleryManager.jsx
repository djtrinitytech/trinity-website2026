import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getAllGalleryItems,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
  toggleHomepageFeatured,
  togglePublishGalleryItem,
} from "../../../services/galleryService";
import { useAdminUI } from "../AdminLayout";
import GalleryItem from "./GalleryItem";
import GalleryUploader from "./GalleryUploader";
import "../AdminCommon.css";
import "./Gallery.css";

export default function GalleryManager() {
  const { showToast, confirmAction } = useAdminUI();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Edit Metadata Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editEvent, setEditEvent] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAllGalleryItems();
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load gallery items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check URL query param ?action=upload to open upload modal
  useEffect(() => {
    if (searchParams.get("action") === "upload") {
      setUploadModalOpen(true);
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Reordering: Move Up / Down
  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Optimistically update UI
    setItems(reordered);

    try {
      await reorderGalleryItems(reordered);
      showToast("Gallery display order updated", "success", 2000);
    } catch (err) {
      console.error(err);
      showToast("Failed to save new order", "error");
      await loadData(); // rollback
    }
  };

  // Quick toggle homepage featured
  const handleToggleHomepage = async (item) => {
    try {
      await toggleHomepageFeatured(item.id, item.homepage_featured);
      showToast(
        item.homepage_featured
          ? "Removed from homepage orbit"
          : "Featured on homepage orbit",
        "success"
      );
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("Could not update homepage status", "error");
    }
  };

  // Quick toggle publish
  const handleTogglePublish = async (item) => {
    try {
      await togglePublishGalleryItem(item.id, item.published);
      showToast(
        item.published ? "Image hidden from gallery" : "Image published live",
        "success"
      );
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("Could not update publish state", "error");
    }
  };

  // Delete with modal confirmation & storage cleanup
  const handleDelete = (item) => {
    confirmAction({
      title: "Delete Gallery Image?",
      message: `Are you sure you want to permanently delete "${item.title || "this image"}"? It will be removed from both the database and cloud storage.`,
      confirmText: "Delete Image",
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteGalleryItem(item.id, item.storage_path);
          showToast("Image deleted successfully", "info");
          await loadData();
        } catch (err) {
          console.error(err);
          showToast("Failed to delete gallery image", "error");
        }
      },
    });
  };

  // Edit metadata modal
  const openEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditEvent(item.event_name || "");
    setEditDesc(item.description || "");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setEditSaving(true);
      await updateGalleryItem(editingItem.id, {
        title: editTitle.trim(),
        event_name: editEvent.trim(),
        description: editDesc.trim(),
      });
      showToast("Image metadata updated", "success");
      setEditingItem(null);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to update metadata", "error");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="admin-gallery-page">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <p className="admin-page-kicker">MEDIA ARCHIVE</p>
          <h1>Gallery Archive</h1>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setUploadModalOpen(true)}
        >
          + Upload Images
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
          padding: "12px 16px",
          background: "rgba(14, 22, 20, 0.6)",
          border: "1px solid rgba(214, 175, 102, 0.15)",
          borderRadius: 6,
          fontSize: 12.5,
          color: "#ded6c5",
        }}
      >
        <span>
          Use <strong>↑ / ↓</strong> arrows on cards to reorder images on the
          homepage DNA orbit. Order updates immediately.
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", color: "#cca16b" }}>
          Total Images: {items.length} · Homepage Featured:{" "}
          {items.filter((i) => i.homepage_featured && i.published).length}
        </span>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div className="admin-spinner" style={{ margin: "0 auto 14px" }} />
          <p style={{ color: "#8e8779" }}>Loading media archive...</p>
        </div>
      ) : items.length === 0 ? (
        <div
          className="admin-panel"
          style={{ textAlign: "center", padding: 48 }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🖼️</div>
          <h3
            style={{
              fontFamily: "'DM Serif Display', serif",
              color: "#f5efe6",
              margin: "0 0 8px",
            }}
          >
            No Gallery Images
          </h3>
          <p style={{ color: "#8e8779", maxWidth: 440, margin: "0 auto 20px" }}>
            Upload festival photographs, project showcases, and cultural moments
            to display across Trinity's gallery and homepage orbit.
          </p>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setUploadModalOpen(true)}
          >
            + Upload First Image
          </button>
        </div>
      ) : (
        <div className="adm-gallery-grid">
          {items.map((item, index) => (
            <GalleryItem
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              onMoveUp={() => handleMove(index, -1)}
              onMoveDown={() => handleMove(index, 1)}
              onToggleHomepage={handleToggleHomepage}
              onTogglePublish={handleTogglePublish}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Upload Images Modal */}
      <GalleryUploader
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={loadData}
        existingCount={items.length}
      />

      {/* Edit Metadata Modal */}
      {editingItem && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => !editSaving && setEditingItem(null)}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
                borderBottom: "1px solid rgba(214, 175, 102, 0.2)",
                paddingBottom: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>Edit Image Details</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
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

            <form onSubmit={handleSaveEdit}>
              <div className="admin-form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Event / Showcase</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editEvent}
                  onChange={(e) => setEditEvent(e.target.value)}
                  placeholder="e.g. Cultural Stage, Hackathon Lab"
                />
              </div>

              <div className="admin-form-group">
                <label>Description / Caption</label>
                <textarea
                  className="admin-textarea"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  placeholder="Optional archival context..."
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 20,
                  borderTop: "1px solid rgba(214, 175, 102, 0.2)",
                  paddingTop: 16,
                }}
              >
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingItem(null)}
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={editSaving}
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
