import React from "react";

export default function GalleryReorder({
  index,
  total,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <div className="adm-reorder-bar">
      <span style={{ fontSize: 11, color: "#8e8779" }}>Order:</span>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          type="button"
          className="adm-order-btn"
          onClick={onMoveUp}
          disabled={index === 0}
          title="Move up / earlier in display order"
        >
          ▲
        </button>
        <button
          type="button"
          className="adm-order-btn"
          onClick={onMoveDown}
          disabled={index === total - 1}
          title="Move down / later in display order"
        >
          ▼
        </button>
      </div>
    </div>
  );
}
