import React, { useState, useEffect, useMemo } from "react";
import { getPublishedAnnouncements } from "../services/announcementService";
import { useAnnouncementNotification } from "../context/AnnouncementNotificationContext";

const deptOptions = [
  "All Departments",
  "Comps",
  "IT",
  "CSEDs",
  "Mech",
  "EXTC",
  "Allied",
];

const getCategoryMeta = (cat) => {
  const c = (cat || "ALL DEPARTMENTS").toUpperCase();
  if (c.includes("SINDHU") || c.includes("COMP"))
    return { tone: "water", glyph: "≈", filterDept: "Comps", deptLabel: "COMPS" };
  if (c.includes("AAKAR") || c.includes("IT") || c.includes("INFO"))
    return { tone: "arch", glyph: "⌂", filterDept: "IT", deptLabel: "IT" };
  if (c.includes("PRAGYA") || c.includes("CSED") || c.includes("DATA"))
    return { tone: "leaf", glyph: "❋", filterDept: "CSEDs", deptLabel: "CSEDS" };
  if (c.includes("UTKARSH") || c.includes("ALLIED") || c.includes("FIRST YEAR") || c.includes("FE"))
    return { tone: "textile", glyph: "▧", filterDept: "Allied", deptLabel: "ALLIED" };
  if (c.includes("AAROHAN") || c.includes("EXTC") || c.includes("TELECOM") || c.includes("ELECTRONIC"))
    return { tone: "feature", glyph: "✧", filterDept: "EXTC", deptLabel: "EXTC" };
  if (c.includes("KSHATRA") || c.includes("MECH"))
    return { tone: "deadline", glyph: "◈", filterDept: "Mech", deptLabel: "MECH" };
  return { tone: "feature", glyph: "▧", filterDept: "All Departments", deptLabel: "ALL DEPTS" };
};

const formatDate = (isoStr) => {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "";
  }
};

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function AnnouncementArt({ tone, glyph, big }) {
  return (
    <div className={`notice-art ${tone} ${big ? "big-art" : ""}`} aria-hidden="true">
      <span className="rect-grid r1"></span>
      <span className="rect-grid r2"></span>
      <b className="glyph">{glyph || "▧"}</b>
    </div>
  );
}

function AnnouncementCard({ item, big = false, onOpen }) {
  return (
    <article
      className={`notice ${item.tone} ${big ? "big" : ""} ${item.image_url ? "has-image" : ""}`}
      onClick={() => onOpen(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
    >
      {item.image_url ? (
        <div className="notice-banner-bg" aria-hidden="true">
          <img
            src={item.image_url}
            alt=""
            className="notice-banner-img"
            loading="lazy"
          />
          <div className="notice-banner-overlay" />
        </div>
      ) : (
        <AnnouncementArt tone={item.tone} glyph={item.glyph} big={big} />
      )}
      <div className="notice-content">
        <div className="notice-meta">
          <span className="notice-tag">{item.tag}</span>
          <time className="notice-date">{item.date}</time>
        </div>
        <h3 className="notice-title">{item.title}</h3>
        <p className="notice-excerpt">{item.excerpt}</p>
        <div className="notice-bottom">
          <em className="notice-order-pill">{item.dept}</em>
          <button
            type="button"
            className="notice-arrow-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(item);
            }}
            aria-label={`Read ${item.title}`}
          >
            <ArrowIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Announcements() {
  const [filter, setFilter] = useState("All Departments");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { markAllAsRead } = useAnnouncementNotification();

  useEffect(() => {
    let isMounted = true;
    async function fetchAnnouncements() {
      try {
        setLoading(true);
        const { data, error } = await getPublishedAnnouncements();

        if (error || !data || data.length === 0) {
          if (isMounted) {
            setAnnouncements([]);
            markAllAsRead([]);
          }
        } else {
          // Map database records into component's expected structure
          const dynamicItems = data.map((item) => {
            const meta = getCategoryMeta(item.category);
            return {
              id: item.id,
              title: item.title,
              excerpt: item.description || "",
              dept: meta.deptLabel,
              filterDept: meta.filterDept,
              date: formatDate(item.publish_at || item.created_at),
              tag: item.featured ? "PINNED" : "NOTICE",
              tone: meta.tone,
              glyph: meta.glyph,
              image_url: item.image_url || null,
              link: item.link,
              created_at: item.publish_at || item.created_at,
            };
          });
          if (isMounted) {
            setAnnouncements(dynamicItems);
            markAllAsRead(dynamicItems);
          }
        }
      } catch (err) {
        console.warn("Error fetching announcements:", err);
        if (isMounted) {
          setAnnouncements([]);
          markAllAsRead([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAnnouncements();
    return () => {
      isMounted = false;
    };
  }, [markAllAsRead]);

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      const matchesFilter =
        filter === "All Departments" ||
        a.filterDept.toLowerCase() === filter.toLowerCase();
      const matchesQuery = `${a.title} ${a.excerpt} ${a.dept}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [announcements, filter, query]);

  return (
    <main className="announcements">
      <div className="archive-head">
        <div className="archive-title-group">
          <p className="kicker">ARCHIVE · 2026</p>
          <h1>Announcements</h1>
        </div>
        <p className="archive-sub">STAY UPDATED WITH THE LATEST FROM ANUGATHA.</p>

        <div className="archive-controls">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the archive"
            aria-label="Search the archive"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by department"
          >
            {deptOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
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
            CONSULTING ARCHIVE CHRONICLES...
          </p>
        </div>
      ) : filtered.length ? (
        <div className="notice-grid">
          {filtered.map((item, index) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              big={index === 0}
              onOpen={setSelected}
            />
          ))}
        </div>
      ) : (
        <p className="empty">No notices found in this part of the archive.</p>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="close"
              onClick={() => setSelected(null)}
              aria-label="Close announcement"
            >
              ×
            </button>
            {selected.image_url && (
              <div className="modal-banner-wrap">
                <img
                  src={selected.image_url}
                  alt={selected.title}
                  className="modal-banner-img"
                />
              </div>
            )}
            <p className="kicker">
              {selected.tag} · {selected.dept}
            </p>
            <h2 id="modal-title">{selected.title}</h2>
            <p>{selected.excerpt}</p>
            {selected.link && (
              <p style={{ marginTop: 16 }}>
                <a
                  href={selected.link}
                  target={selected.link.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  style={{
                    color: "#cca16b",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textDecoration: "underline",
                  }}
                >
                  Explore Further Passage →
                </a>
              </p>
            )}
            <p className="modal-date">Published {selected.date}</p>
          </section>
        </div>
      )}
    </main>
  );
}
