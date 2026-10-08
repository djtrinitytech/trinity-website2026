import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllAnnouncements } from "../../services/announcementService";
import { getAllGalleryItems } from "../../services/galleryService";
import { isSupabaseConfigured } from "../../lib/supabase";

export default function DashboardOverview() {
  const [announcements, setAnnouncements] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [annRes, galRes] = await Promise.all([
          getAllAnnouncements(),
          getAllGalleryItems(),
        ]);
        setAnnouncements(annRes.data || []);
        setGalleryItems(galRes.data || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalAnnouncements = announcements.length;
  const publishedAnnouncements = announcements.filter((a) => a.published).length;
  const draftAnnouncements = announcements.filter((a) => !a.published).length;

  const totalGallery = galleryItems.length;
  const homepageGallery = galleryItems.filter(
    (g) => g.homepage_featured && g.published
  ).length;

  return (
    <div className="admin-dashboard-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <p className="admin-page-kicker">ARCHIVE OVERVIEW</p>
          <h1>Dashboard Overview</h1>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            to="/admin/announcements?action=new"
            className="admin-btn admin-btn-primary"
          >
            + New Announcement
          </Link>
          <Link
            to="/admin/gallery?action=upload"
            className="admin-btn admin-btn-secondary"
          >
            + Upload Images
          </Link>
        </div>
      </div>

      {!isSupabaseConfigured() && (
        <div
          style={{
            background: "rgba(201, 87, 76, 0.12)",
            border: "1px solid rgba(201, 87, 76, 0.3)",
            borderRadius: 6,
            padding: "14px 18px",
            marginBottom: 24,
            fontSize: 13,
            color: "#ffc2bc",
            lineHeight: 1.5,
          }}
        >
          <strong>⚠️ Notice:</strong> Supabase environment variables (
          <code>VITE_SUPABASE_URL</code> & <code>VITE_SUPABASE_ANON_KEY</code>) are
          not configured. Please follow the instructions in{" "}
          <code>SUPABASE_SETUP.md</code> to connect your live database.
        </div>
      )}

      {/* Stats Row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <p className="stat-card-label">Announcements</p>
          <p className="stat-card-value">{loading ? "—" : totalAnnouncements}</p>
          <p className="stat-card-sub">
            {publishedAnnouncements} Published · {draftAnnouncements} Drafts
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="stat-card-label">Gallery Archive</p>
          <p className="stat-card-value">{loading ? "—" : totalGallery}</p>
          <p className="stat-card-sub">
            {homepageGallery} Active on Homepage DNA Orbit
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="stat-card-label">CMS Status</p>
          <p className="stat-card-value" style={{ fontSize: 22, color: "#cca16b" }}>
            {isSupabaseConfigured() ? "● Connected" : "○ Offline"}
          </p>
          <p className="stat-card-sub">Supabase PostgreSQL & Storage</p>
        </div>
      </div>

      {/* Two-Column Grid: Recent Announcements & Recent Images */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
        }}
      >
        {/* Recent Announcements Panel */}
        <div className="admin-panel">
          <div className="admin-panel-title">
            <span>Recent Announcements</span>
            <Link
              to="/admin/announcements"
              style={{
                fontSize: 12,
                color: "#cca16b",
                fontFamily: "'DM Mono', monospace",
                textDecoration: "none",
              }}
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: "#8e8779", fontSize: 13 }}>Loading notices...</p>
          ) : announcements.length === 0 ? (
            <p style={{ color: "#8e8779", fontSize: 13 }}>
              No announcements in database. Click "+ New Announcement" above to
              create one.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {announcements.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(214, 175, 102, 0.1)",
                    borderRadius: 6,
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: 12 }}>
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: "#ede6d8",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {a.title}
                    </p>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 10,
                        color: "#cca16b",
                      }}
                    >
                      {a.category || "ALL ORDERS"} · Priority {a.priority || 0}
                    </span>
                  </div>

                  <span
                    className={`status-badge ${
                      a.published ? "status-published" : "status-draft"
                    }`}
                  >
                    {a.published ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Gallery Images Panel */}
        <div className="admin-panel">
          <div className="admin-panel-title">
            <span>Recent Gallery Uploads</span>
            <Link
              to="/admin/gallery"
              style={{
                fontSize: 12,
                color: "#cca16b",
                fontFamily: "'DM Mono', monospace",
                textDecoration: "none",
              }}
            >
              Manage Archive →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: "#8e8779", fontSize: 13 }}>Loading gallery...</p>
          ) : galleryItems.length === 0 ? (
            <p style={{ color: "#8e8779", fontSize: 13 }}>
              No images uploaded yet. Click "+ Upload Images" above to add event
              photographs.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                gap: 10,
              }}
            >
              {galleryItems.slice(0, 8).map((img) => (
                <div
                  key={img.id}
                  style={{
                    position: "relative",
                    aspectRatio: "4/3",
                    borderRadius: 6,
                    overflow: "hidden",
                    border: "1px solid rgba(214, 175, 102, 0.2)",
                    background: "#050807",
                  }}
                  title={`${img.title || "Image"} ${
                    img.homepage_featured ? "(Homepage)" : ""
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.title || "Gallery"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                  {img.homepage_featured && (
                    <span
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "rgba(204, 161, 107, 0.9)",
                        color: "#070c0b",
                        fontSize: 9,
                        fontWeight: "bold",
                        padding: "1px 4px",
                        borderRadius: 3,
                        lineHeight: 1,
                      }}
                    >
                      HP
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
