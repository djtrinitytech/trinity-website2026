import React from "react";
import { Outlet } from "react-router-dom";
import { eventsBackground } from "../../data/eventsData";

// Shared shell for /events, /events/:category and /events/:category/:slug.
// Theme tokens live in ./events.css (imported from index.css) and are scoped to .events-theme.
export default function EventsLayout() {
  return (
    <div className="events-theme flex-1" style={{ backgroundImage: `url(${eventsBackground})` }}>
      <Outlet />
    </div>
  );
}
