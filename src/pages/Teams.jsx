import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { chairperson, orderTiers } from "../data/orderMembers";
import {
  TeamHero,
  ChairpersonFeature,
  TierHeading,
  OrderRow,
  ConstellationDecoration,
  ScrollIndicator,
} from "../components/order/OrderSections";
import "./Teams.css";

const Teams = () => {
  const reduce = useReducedMotion();
  return (
    <div className="order-page">
      <ConstellationDecoration />
      <section className="om-intro">
        <TeamHero />
        <ChairpersonFeature member={chairperson} />
      </section>

      {orderTiers.map((tier) => (
        <React.Fragment key={tier.id}>
          <TierHeading title={tier.title} />
          <OrderRow tier={tier} />
        </React.Fragment>
      ))}

      <motion.p
        className="om-epigraph"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.2 }}
      >
        Different minds <span>✦</span> One orbit <span>✦</span> A larger tomorrow
      </motion.p>

      <ScrollIndicator />
    </div>
  );
};

export default Teams;
