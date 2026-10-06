import React, { useState } from "react";
import { uploadGalleryImage, validateImageFile } from "../../../services/galleryService";
import { useAdminUI } from "../AdminLayout";

export default function GalleryUploader({
  isOpen,
  onClose,
  onUploadSuccess,
  existingCount = 0,
}) {
  const { showToast } = useAdminUI();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newFiles = [];
    for (const file of files) {
      const check = validateImageFile(file);
      if (!check.valid) {
        showToast(check.error, "error");
        continue;
      }
      newFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        event_name: "Trinity 2026",
        description: "",
        homepage_featured: true,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      const removed = updated.splice(idx, 1)[0];
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return updated;
    });
  };

  const handleUploadSubmit = async () => {
    if (!selectedFiles.length) {
      showToast("Please choose at least one image to upload", "error");
      return;
    }

    try {
      setUploading(true);
      let successCount = 0;

      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        setUploadProgress(`Uploading ${i + 1} of ${selectedFiles.length}: ${item.title}...`);

        await uploadGalleryImage(item.file, {
          title: item.title,
          event_name: item.event_name,
          description: item.description,
          homepage_featured: item.homepage_featured,
          display_order: existingCount + i,
        });

        successCount++;
      }

      showToast(`Successfully uploaded ${successCount} image(s)`, "success");
      selectedFiles.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      setSelectedFiles([]);
      onClose();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error("Upload error:", err);
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleClose = () => {
    if (uploading) return;
    selectedFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setSelectedFiles([]);
    onClose();
  };

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className="admin-modal-box"
        style={{ maxWidth: 720 }}
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
          <h3 style={{ margin: 0 }}>Upload Gallery Images</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
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

        {/* Dropzone / File Picker */}
        <div
          style={{
            border: "2px dashed rgba(214, 175, 102, 0.3)",
            borderRadius: 8,
            padding: "24px 16px",
            textAlign: "center",
            background: "rgba(0, 0, 0, 0.3)",
            marginBottom: 20,
          }}
        >
          <input
            id="gallery-file-input"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={uploading}
          />
          <label
            htmlFor="gallery-file-input"
            style={{
              display: "inline-block",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
            <p
              style={{
                color: "#f5efe6",
                fontWeight: 500,
                margin: "0 0 4px",
              }}
            >
              Click to select images or drag and drop
            </p>
            <p style={{ color: "#8e8779", fontSize: 12, margin: 0 }}>
              Supports JPG, PNG, WebP (up to 15MB each). Multiple selection supported.
            </p>
          </label>
        </div>

        {/* Previews List */}
        {selectedFiles.length > 0 && (
          <div
            style={{
              maxHeight: 280,
              overflowY: "auto",
              paddingRight: 6,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: "#cca16b",
                margin: "0 0 6px",
                textTransform: "uppercase",
              }}
            >
              Selected Images ({selectedFiles.length}):
            </p>

            {selectedFiles.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr 1fr auto",
                  gap: 12,
                  alignItems: "center",
                  background: "rgba(8, 14, 13, 0.6)",
                  border: "1px solid rgba(214, 175, 102, 0.15)",
                  borderRadius: 6,
                  padding: 8,
                }}
              >
                <img
                  src={item.previewUrl}
                  alt="Preview"
                  style={{
                    width: 72,
                    height: 52,
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1px solid rgba(214, 175, 102, 0.2)",
                  }}
                />

                <div>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Image Title"
                    value={item.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedFiles((prev) => {
                        const copy = [...prev];
                        copy[idx].title = val;
                        return copy;
                      });
                    }}
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    disabled={uploading}
                  />
                </div>

                <div>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Event / Showcase Name"
                    value={item.event_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedFiles((prev) => {
                        const copy = [...prev];
                        copy[idx].event_name = val;
                        return copy;
                      });
                    }}
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    disabled={uploading}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      color: "#cca16b",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.homepage_featured}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setSelectedFiles((prev) => {
                          const copy = [...prev];
                          copy[idx].homepage_featured = val;
                          return copy;
                        });
                      }}
                      disabled={uploading}
                    />
                    HP
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    disabled={uploading}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#c9574c",
                      fontSize: 16,
                      cursor: "pointer",
                      padding: "4px 8px",
                    }}
                    title="Remove image from queue"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {uploadProgress && (
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11.5,
              color: "#cca16b",
              textAlign: "center",
              margin: "0 0 16px",
            }}
          >
            ⏳ {uploadProgress}
          </p>
        )}

        {/* Modal Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            borderTop: "1px solid rgba(214, 175, 102, 0.2)",
            paddingTop: 16,
          }}
        >
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleUploadSubmit}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading
              ? "Uploading to Storage..."
              : `Upload ${selectedFiles.length} Image(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
