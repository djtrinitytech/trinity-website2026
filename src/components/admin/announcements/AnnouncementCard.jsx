import React from "react";

export default function AnnouncementCard({
  item,
  onEdit,
  onTogglePublish,
  onDelete,
}) {
  // Determine publication status
  const getStatus = () => {
    if (!item.published) return { label: "DRAFT", class: "status-draft" };
    if (item.publish_at) {
      const pubDate = new Date(item.publish_at);
      if (pubDate > new Date()) {
        return { label: "SCHEDULED", class: "status-scheduled" };
      }
    }
    return { label: "PUBLISHED", class: "status-published" };
  };

  const status = getStatus();

  return (
    <tr>
      {/* Priority */}
      <td>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "#cca16b",
          }}
        >
          {item.priority || 0}
        </span>
      </td>

      {/* Title & Description */}
      <td style={{ maxWidth: 300 }}>
        <strong style={{ color: "#f5efe6", display: "block" }}>
          {item.title}
        </strong>
        {item.description && (
          <span
            style={{
              fontSize: 11.5,
              color: "#8e8779",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.description}
          </span>
        )}
      </td>

      {/* Category */}
      <td>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "#cca16b",
            letterSpacing: "0.1em",
          }}
        >
          {item.category || "ALL ORDERS"}
        </span>
      </td>

      {/* Status Badge */}
      <td>
        <span className={`status-badge ${status.class}`}>{status.label}</span>
      </td>

      {/* Featured Indicator */}
      <td>
        {item.featured ? (
          <span className="status-badge status-featured">★ Yes</span>
        ) : (
          <span style={{ color: "#666", fontSize: 11 }}>—</span>
        )}
      </td>

      {/* Publish Date */}
      <td>
        <span style={{ fontSize: 11.5, color: "#c4bcb0" }}>
          {item.publish_at
            ? new Date(item.publish_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Immediate"}
        </span>
      </td>

      {/* Last Updated */}
      <td>
        <span style={{ fontSize: 11, color: "#8e8779" }}>
          {new Date(item.updated_at).toLocaleDateString()}
        </span>
      </td>

      {/* Actions */}
      <td>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 6,
          }}
        >
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => onTogglePublish(item)}
            title={item.published ? "Move to Draft" : "Publish Live"}
          >
            {item.published ? "Unpublish" : "Publish"}
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
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
