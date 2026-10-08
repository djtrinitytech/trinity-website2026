import React from "react";
import CategoryCard from "../components/events/CategoryCard";
import PageHeader from "../components/events/PageHeader";
import useDocumentTitle from "../components/events/useDocumentTitle";
import { categories } from "../data/eventsData";

const Events = () => {
  useDocumentTitle("Events — Trinity");

  return (
    <section className="mx-auto w-full max-w-6xl px-8 pb-24 pt-10 md:px-16">
      <PageHeader
        eyebrow="Choose your order"
        devanagari="उत्सव"
        title="The Events"
        subtitle="Three orders, one archive. Select a path to discover the contests that await."
      />
      <ul className="mt-14 grid gap-8 md:grid-cols-3">
        {categories.map((c) => (
          <li key={c.slug}>
            <CategoryCard category={c} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Events;
