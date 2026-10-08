import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CalendarDays, Clock, IndianRupee, MapPin, Phone, Trophy, Users } from "lucide-react";
import useDocumentTitle from "../components/events/useDocumentTitle";
import { getCategory, getEvent } from "../data/eventsData";

function SectionTitle({ children }) {
  return (
    <h2 className="flex items-center gap-3 font-serif text-2xl font-bold text-foreground">
      <span aria-hidden="true" className="size-1.5 rotate-45 bg-primary" />
      {children}
    </h2>
  );
}

const EventDetail = () => {
  const { category, slug } = useParams();
  const event = getEvent(category, slug);
  const cat = getCategory(category);
  useDocumentTitle(event ? `${event.name} — Trinity Events` : "Event — Trinity");

  if (!cat) return <Navigate to="/events" replace />;
  if (!event) return <Navigate to={`/events/${cat.slug}`} replace />;

  const facts = [
    { icon: CalendarDays, label: "Date", value: event.date },
    { icon: Clock, label: "Time", value: event.time },
    { icon: MapPin, label: "Venue", value: event.venue },
    { icon: Users, label: "Team size", value: event.teamSize },
    { icon: IndianRupee, label: "Entry fee", value: event.entryFee },
    { icon: Trophy, label: "Prize pool", value: event.prizePool },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-8 pb-24 pt-10 md:px-16">
      <Link
        to={`/events/${cat.slug}`}
        className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-primary"
      >
        <span aria-hidden="true">← </span>
        {cat.name} events
      </Link>

      <article className="mt-6 overflow-hidden border border-border bg-card backdrop-blur-sm">
        <div className="relative aspect-[21/9] min-h-56">
          <img src={event.image} alt={event.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{cat.tagline}</p>
            <h1 className="text-metal mt-2 font-serif text-4xl font-bold md:text-6xl">{event.name}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-12 p-6 md:p-10">
          <p className="text-pretty font-serif text-lg leading-relaxed text-foreground/90">{event.description}</p>

          <dl className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-1 bg-background/90 p-5">
                <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <Icon className="size-3.5 text-primary" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="font-serif text-lg font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="passes">
            <SectionTitle>
              <span id="passes">How to get your pass</span>
            </SectionTitle>
            <ol className="mt-6 flex flex-col gap-4">
              {event.passSteps.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center border border-primary/60 font-mono text-sm text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="pt-1 font-serif leading-relaxed text-foreground/90">{step}</p>
                </li>
              ))}
            </ol>
            <Link
              to="/registrations"
              className="mt-8 inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 font-serif font-semibold text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
            >
              Register now <span aria-hidden="true">→</span>
            </Link>
          </section>

          <section aria-labelledby="rules">
            <SectionTitle>
              <span id="rules">Rules</span>
            </SectionTitle>
            <ul className="mt-6 flex flex-col gap-3">
              {event.rules.map((r) => (
                <li key={r} className="flex gap-3 font-serif leading-relaxed text-foreground/90">
                  <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="contact">
            <SectionTitle>
              <span id="contact">Event coordinators</span>
            </SectionTitle>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {event.coordinators.map((c) => (
                <li key={c.name} className="flex items-center justify-between border border-border bg-background/60 p-4">
                  <span className="font-serif font-semibold text-foreground">{c.name}</span>
                  <a
                    href={`tel:${c.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 font-mono text-xs text-primary hover:text-foreground"
                  >
                    <Phone className="size-3.5" aria-hidden="true" />
                    {c.phone}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </section>
  );
};

export default EventDetail;
