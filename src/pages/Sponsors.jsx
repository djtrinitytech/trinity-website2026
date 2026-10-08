import React from 'react';
import SponsorPlaceholder from '../components/SponsorPlaceholder';
import '../components/sponsorship.css';
import logo1 from '../images/logo1.png';
import logo2 from '../images/logo2.png';
import logo3 from '../images/logo3.png';
import logo4 from '../images/logo4.png';

const sponsorData = {
  titleSponsor: { id: "title", label: "", logoUrl: logo1 },
  techSponsors: [
    { id: "tech1", label: "", logoUrl: logo2 },
    { id: "tech2", label: "", logoUrl: logo3 }
  ],
  generalSponsors: [
    { id: "gen1", label: "", logoUrl: logo4 },
    { id: "gen2", label: "", logoUrl: logo1 },
    { id: "gen3", label: "", logoUrl: logo2 }
  ]
};

const Sponsors = () => {
  return (
    <div className="sponsorship-page">
      <div className="sponsorship-page-background"></div>
      
      <div className="sponsorship-page-content">
        {/* Title Sponsor Section */}
        <section className="sponsor-section title-sponsor-section">
          <h2 className="section-title">Title Sponsor</h2>
          <SponsorPlaceholder type="title-sponsor" label={sponsorData.titleSponsor.label} logoUrl={sponsorData.titleSponsor.logoUrl} />
        </section>

        {/* Tech Sponsors Section */}
        <section className="sponsor-section tech-sponsors-section">
          <h2 className="section-title">Tech Sponsors</h2>
          <div className="tech-sponsors-grid">
            {sponsorData.techSponsors.map((sponsor) => (
              <SponsorPlaceholder key={sponsor.id} type="tech-sponsor" label={sponsor.label} logoUrl={sponsor.logoUrl} />
            ))}
          </div>
        </section>

        {/* General Sponsors Section */}
        <section className="sponsor-section general-sponsors-section">
          <h2 className="section-title">Sponsors</h2>
          <div className="general-sponsors-grid">
            {sponsorData.generalSponsors.map((sponsor) => (
              <SponsorPlaceholder key={sponsor.id} type="general-sponsor" label={sponsor.label} logoUrl={sponsor.logoUrl} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Sponsors;
