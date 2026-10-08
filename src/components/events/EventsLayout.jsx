import React from "react";
import { Outlet } from "react-router-dom";

// Shared shell for /events, /events/:category and /events/:category/:slug.
// Theme tokens live in ./events.css (imported from index.css) and are scoped to .events-theme;
// the background is the site-wide landing-page background from .app-root.
export default function EventsLayout() {
  return (
    <div className="events-theme flex-1">
      <Outlet />
    </div>
  );
}
