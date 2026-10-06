import React, { useState, useEffect, useMemo } from "react";
import { getPublishedGallery } from "../services/galleryService";
import { DNA_ITEMS } from "../components/homepage/GallerySectionDNA";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEvent, setFilterEvent] = useState("All Events");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadGalleryData() {
      try {
        setLoading(true);
        const { data, error } = await getPublishedGallery();
        if (!error && data && data.length > 0) {
          if (isMounted) setItems(data);
        } else {
          // Graceful fallback to curated DNA items
          const fallback = DNA_ITEMS.map((item) => ({
            id: item.id,
            title: item.title,
            image_url: item.image,
            event_name: "Trinity Archive",
            description: "A testament to the craftsmanship and celebratory spirit of DJS Trinity.",
          }));
          if (isMounted) setItems(fallback);
        }
      } catch (err) {
        console.warn("Using fallback gallery archive:", err);
        const fallback = DNA_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          image_url: item.image,
          event_name: "Trinity Archive",
          description: "A testament to the craftsmanship and celebratory spirit of DJS Trinity.",
        }));
        if (isMounted) setItems(fallback);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadGalleryData();
    return () => {
      isMounted = false;
    };
  }, []);

  const eventOptions = useMemo(() => {
    const events = new Set(items.map((i) => i.event_name || "General"));
    return ["All Events", ...Array.from(events)];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filterEvent === "All Events") return items;
    return items.filter((i) => (i.event_name || "General") === filterEvent);
  }, [items, filterEvent]);

  return (
    <main
      className="gallery-page"
      style={{
        minHeight: "85vh",
        padding: "48px clamp(20px, 4vw, 64px) 80px",
        maxWidth: 1400,
        margin: "0 auto",
        width: "100%",
        color: "#ede6d8",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 42 }}>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "#cca16b",
            textTransform: "uppercase",
            margin: "0 0 10px",
          }}
        >
          ✦ VISUAL ARCHIVE · 2026
        </p>
        <h1
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(32px, 5vw, 52px)",
            letterSpacing: "0.02em",
            color: "#f5efe6",
            margin: "0 0 12px",
          }}
        >
          Gallery & Chronicles
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#ded6c5",
            maxWidth: 620,
            margin: "0 auto 28px",
            lineHeight: 1.6,
          }}
        >
          A visual pilgrimage across Trinity’s cultural, technical, and artistic
          milestones.
        </p>

        {/* Filter Pills */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {eventOptions.map((ev) => (
            <button
              key={ev}
              type="button"
              onClick={() => setFilterEvent(ev)}
              style={{
                background:
                  filterEvent === ev
                    ? "rgba(214, 175, 102, 0.2)"
                    : "rgba(14, 22, 20, 0.6)",
                border:
                  filterEvent === ev
                    ? "1px solid #cca16b"
                    : "1px solid rgba(214, 175, 102, 0.18)",
                color: filterEvent === ev ? "#ffd885" : "#ded6c5",
                padding: "6px 16px",
                borderRadius: 20,
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {ev}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid rgba(214, 175, 102, 0.2)",
              borderTopColor: "#cca16b",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "#cca16b",
            }}
          >
            GATHERING CELESTIAL FRAGMENTS...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <p style={{ textAlign: "center", color: "#8e8779", padding: "40px 0" }}>
          No images catalogued under this event.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelectedImage(item);
              }}
              style={{
                position: "relative",
                background: "rgba(14, 22, 20, 0.75)",
                border: "1px solid rgba(214, 175, 102, 0.18)",
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.25s ease, border-color 0.25s ease",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "rgba(214, 175, 102, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(214, 175, 102, 0.18)";
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  background: "#050807",
                  overflow: "hidden",
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.title || "Trinity Visual"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.5s ease",
                  }}
                  loading="lazy"
                />
              </div>

              <div style={{ padding: "14px 16px" }}>
                <p
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    color: "#cca16b",
                    textTransform: "uppercase",
                    margin: "0 0 4px",
                  }}
                >
                  {item.event_name || "Trinity 2026"}
                </p>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 17,
                    color: "#f5efe6",
                    margin: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  {item.title || "Showcase Photo"}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          role="presentation"
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 10, 9, 0.92)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 150,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 920,
              width: "100%",
              background: "rgba(14, 22, 20, 0.96)",
              border: "1px solid rgba(214, 175, 102, 0.35)",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 24px 70px rgba(0, 0, 0, 0.95)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                maxHeight: "68vh",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "68vh",
                  objectFit: "contain",
                }}
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "rgba(0, 0, 0, 0.7)",
                  border: "1px solid rgba(214, 175, 102, 0.3)",
                  color: "#cca16b",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  fontSize: 20,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Close image"
              >
                ×
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: "#cca16b",
                  textTransform: "uppercase",
                  margin: "0 0 6px",
                }}
              >
                {selectedImage.event_name || "Trinity 2026"}
              </p>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 22,
                  color: "#f5efe6",
                  margin: "0 0 8px",
                }}
              >
                {selectedImage.title}
              </h2>
              {selectedImage.description && (
                <p
                  style={{
                    fontSize: 13.5,
                    color: "#ded6c5",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {selectedImage.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
