import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import EventCard from "../components/events/EventCard";
import PageHeader from "../components/events/PageHeader";
import useDocumentTitle from "../components/events/useDocumentTitle";
import { categories, getCategory, getEventsByCategory } from "../data/eventsData";

const EventCategory = () => {
  const { category } = useParams();
  const cat = getCategory(category);
  useDocumentTitle(cat ? `${cat.name} Events — Trinity` : "Events — Trinity");

  if (!cat) return <Navigate to="/events" replace />;
  const list = getEventsByCategory(cat.slug);

  return (
    <section className="mx-auto w-full max-w-6xl px-8 pb-24 pt-10 md:px-16">
      <Link to="/events" className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-primary">
        <span aria-hidden="true">← </span>All orders
      </Link>
      <div className="mt-6">
        <PageHeader eyebrow={cat.tagline} devanagari={cat.sanskrit} title={`${cat.name} Events`} subtitle={cat.description} />
      </div>

      <nav aria-label="Event categories" className="mt-10 flex justify-center gap-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/events/${c.slug}`}
            aria-current={c.slug === cat.slug ? "page" : undefined}
            className={
              c.slug === cat.slug
                ? "border-b border-primary pb-1 font-serif font-semibold text-primary"
                : "border-b border-transparent pb-1 font-serif text-muted-foreground hover:text-foreground"
            }
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e) => (
          <li key={e.slug}>
            <EventCard event={e} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default EventCategory;
