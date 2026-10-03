import React, { useState, useMemo } from "react";

const announcements = [
  {
    id: 1,
    title: "Registrations for Anugatha 2025 are now open",
    excerpt: "Be a part of the journey. Explore, create and contribute across the six orders.",
    order: "ALL ORDERS",
    filterOrder: "All Orders",
    date: "14 SEP 2025",
    tag: "PINNED",
    tone: "feature",
    glyph: "▧"
  },
  {
    id: 2,
    title: "Design Submission Deadline",
    excerpt: "The final call for visual narratives and poster systems.",
    order: "UTKARSH",
    filterOrder: "Utkarsh",
    date: "25 SEP 2025",
    tag: "DEADLINE",
    tone: "deadline",
    glyph: "▧"
  },
  {
    id: 3,
    title: "Orientation Session",
    excerpt: "A first gathering for every new traveller.",
    order: "AAKAR",
    filterOrder: "Aakar",
    date: "08 SEP 2025",
    tag: "GATHERING",
    tone: "arch",
    glyph: "⌂"
  },
  {
    id: 4,
    title: "Workshop: Visual Storytelling",
    excerpt: "From artefact to image: shaping a shared archive.",
    order: "PRAGYA",
    filterOrder: "Pragya",
    date: "05 SEP 2025",
    tag: "WORKSHOP",
    tone: "leaf",
    glyph: "❋"
  },
  {
    id: 5,
    title: "Team Reveal",
    excerpt: "Meet the people charting Sindhu's next passage.",
    order: "SINDHU",
    filterOrder: "Sindhu",
    date: "01 SEP 2025",
    tag: "NOTICE",
    tone: "water",
    glyph: "≈"
  },
  {
    id: 6,
    title: "Night of the Makers",
    excerpt: "An open studio for craft, form and conversation.",
    order: "UTKARSH",
    filterOrder: "Utkarsh",
    date: "30 AUG 2025",
    tag: "EVENT",
    tone: "textile",
    glyph: "▧"
  }
];

const orderOptions = ["All Orders", "Sindhu", "Aakar", "Pragya", "Kshatra", "Aarohan", "Utkarsh"];

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
      className={`notice ${item.tone} ${big ? "big" : ""}`}
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
      <AnnouncementArt tone={item.tone} glyph={item.glyph} big={big} />
      <div className="notice-content">
        <div className="notice-meta">
          <span className="notice-tag">{item.tag}</span>
          <time className="notice-date">{item.date}</time>
        </div>
        <h3 className="notice-title">{item.title}</h3>
        <p className="notice-excerpt">{item.excerpt}</p>
        <div className="notice-bottom">
          <em className="notice-order-pill">{item.order}</em>
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
  const [filter, setFilter] = useState("All Orders");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      const matchesFilter = filter === "All Orders" || a.filterOrder.toLowerCase() === filter.toLowerCase();
      const matchesQuery = `${a.title} ${a.excerpt} ${a.order}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <main className="announcements">
      <div className="archive-head">
        <div className="archive-title-group">
          <p className="kicker">ARCHIVE · 2025</p>
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
            aria-label="Filter by order"
          >
            {orderOptions.map((name) => (
              <option key={name} value={name}>
                {name === "All Orders" ? "All Orders" : name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length ? (
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
            <p className="kicker">
              {selected.tag} · {selected.order}
            </p>
            <h2 id="modal-title">{selected.title}</h2>
            <p>{selected.excerpt}</p>
            <p className="modal-date">Published {selected.date}</p>
          </section>
        </div>
      )}
    </main>
  );
}
