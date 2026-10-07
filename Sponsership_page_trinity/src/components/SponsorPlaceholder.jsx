import React from 'react';

const SponsorPlaceholder = ({ type, label, logoUrl }) => {
  return (
    <div className={`sponsor-placeholder ${type}`}>
      <div className="corner-tl"></div>
      <div className="corner-tr"></div>
      <div className="corner-bl"></div>
      <div className="corner-br"></div>
      
      <div className="inner-corner-tl"></div>
      <div className="inner-corner-tr"></div>
      <div className="inner-corner-bl"></div>
      <div className="inner-corner-br"></div>

      <div className="placeholder-content">
        {logoUrl ? (
          <img src={logoUrl} alt="Sponsor Logo" className="sponsor-logo-img" />
        ) : (
          <span className="placeholder-label">{label}</span>
        )}
      </div>
    </div>
  );
};

export default SponsorPlaceholder;
