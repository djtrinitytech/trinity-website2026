import React from "react";
import GalleryReorder from "./GalleryReorder";

export default function GalleryItem({
  item,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onToggleHomepage,
  onTogglePublish,
  onEdit,
  onDelete,
}) {
  return (
    <div className="adm-gallery-card">
      {/* Thumbnail Container */}
      <div className="adm-gallery-thumb-box">
        <img
          src={item.image_url}
          alt={item.title || "Gallery Item"}
          className="adm-gallery-thumb"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.classList.add("img-fallback");
          }}
        />

        {/* Display Order Badge */}
        <span className="adm-order-badge">#{index + 1}</span>

        {/* Badges on Thumbnail */}
        <div className="adm-thumb-badges">
          <span
            className={`status-badge ${
              item.published ? "status-published" : "status-draft"
            }`}
          >
            {item.published ? "Published" : "Hidden"}
          </span>
          {item.homepage_featured && (
            <span className="status-badge status-featured">Homepage ON</span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="adm-gallery-content">
        <h4 className="adm-gallery-title" title={item.title}>
          {item.title || "Untitled Image"}
        </h4>
        <p className="adm-gallery-event">{item.event_name || "Trinity 2026"}</p>
        {item.description && (
          <p className="adm-gallery-desc">{item.description}</p>
        )}

        {/* Reorder Buttons (Up / Down) */}
        <GalleryReorder
          index={index}
          total={total}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />

        {/* Card Actions */}
        <div className="adm-gallery-actions">
          <button
            type="button"
            className={`admin-btn admin-btn-sm ${
              item.homepage_featured
                ? "admin-btn-primary"
                : "admin-btn-secondary"
            }`}
            onClick={() => onToggleHomepage(item)}
            title="Toggle appearance on homepage DNA carousel"
          >
            HP: {item.homepage_featured ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => onTogglePublish(item)}
          >
            {item.published ? "Hide" : "Publish"}
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => onEdit(item)}
          >
            Edit
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-danger admin-btn-sm"
            onClick={() => onDelete(item)}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
