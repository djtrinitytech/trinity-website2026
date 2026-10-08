import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePublishAnnouncement,
} from "../../../services/announcementService";
import { useAdminUI } from "../AdminLayout";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementEditor from "./AnnouncementEditor";

export default function AnnouncementManager() {
  const { showToast, confirmAction } = useAdminUI();
  const [searchParams, setSearchParams] = useSearchParams();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [sortAsc, setSortAsc] = useState(false);

  // Editor Modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAllAnnouncements(sortBy, sortAsc);
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load announcements", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sortBy, sortAsc]);

  // Check URL query param ?action=new to open editor directly
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      openNewEditor();
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  const openNewEditor = () => {
    setEditingItem(null);
    setEditorOpen(true);
  };

  const openEditEditor = (item) => {
    setEditingItem(item);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingItem(null);
  };

  // Save handler from AnnouncementEditor
  const handleSave = async (payload) => {
    if (!payload.title || !payload.title.trim()) {
      showToast("Announcement title is required", "error");
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        await updateAnnouncement(editingItem.id, payload);
        showToast(
          payload.published
            ? "Announcement published successfully"
            : "Announcement draft saved",
          "success"
        );
      } else {
        await createAnnouncement(payload);
        showToast(
          payload.published
            ? "New announcement published"
            : "New announcement draft created",
          "success"
        );
      }

      closeEditor();
      await loadData();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save announcement", "error");
    } finally {
      setSaving(false);
    }
  };

  // Quick toggle publish
  const handleTogglePublish = async (item) => {
    try {
      await togglePublishAnnouncement(item.id, item.published);
      showToast(
        item.published ? "Notice moved to draft" : "Notice published live",
        "success"
      );
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("Could not update publish state", "error");
    }
  };

  // Delete with confirmation modal
  const handleDelete = (item) => {
    confirmAction({
      title: "Delete Announcement?",
      message: `Are you sure you want to permanently delete "${item.title}"? This cannot be undone.`,
      confirmText: "Delete Notice",
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteAnnouncement(item.id);
          showToast("Announcement deleted", "info");
          await loadData();
        } catch (err) {
          console.error(err);
          showToast("Failed to delete announcement", "error");
        }
      },
    });
  };

  // Filtered and searched list
  const filteredList = useMemo(() => {
    return announcements.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    });
  }, [announcements, searchQuery]);

  return (
    <div className="admin-announcements-page">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <p className="admin-page-kicker">CONTENT MANAGER</p>
          <h1>Announcements</h1>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={openNewEditor}
        >
          + New Announcement
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ flex: "1 1 280px", maxWidth: 420 }}>
          <input
            type="text"
            className="admin-input"
            placeholder="Search by title, order or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#cca16b",
              textTransform: "uppercase",
            }}
          >
            Sort By:
          </label>
          <select
            className="admin-select"
            style={{ width: "auto", padding: "8px 12px", fontSize: 12 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="priority">Priority (High to Low)</option>
            <option value="created_at">Date Created</option>
            <option value="updated_at">Date Updated</option>
            <option value="title">Title (A-Z)</option>
          </select>

          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => setSortAsc((prev) => !prev)}
            title="Toggle sort direction"
          >
            {sortAsc ? "▲ Asc" : "▼ Desc"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>Pri</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Publish Date</th>
              <th>Last Updated</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 36 }}>
                  <div className="admin-spinner" style={{ margin: "0 auto 12px" }} />
                  <p style={{ color: "#8e8779", margin: 0 }}>
                    Loading announcement archive...
                  </p>
                </td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: 36,
                    color: "#8e8779",
                  }}
                >
                  {searchQuery
                    ? "No announcements matched your search."
                    : "No announcements created yet. Click '+ New Announcement' to begin."}
                </td>
              </tr>
            ) : (
              filteredList.map((item) => (
                <AnnouncementCard
                  key={item.id}
                  item={item}
                  onEdit={openEditEditor}
                  onTogglePublish={handleTogglePublish}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal Component */}
      <AnnouncementEditor
        item={editingItem}
        isOpen={editorOpen}
        onClose={closeEditor}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
