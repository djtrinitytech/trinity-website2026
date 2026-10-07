import React from 'react';

const SponsorshipCard = ({ title, icon, benefits, isCenter }) => {
  return (
    <div className={`sponsorship-card ${isCenter ? 'center-card' : 'side-card'}`}>
      <div className="corner-tl"></div>
      <div className="corner-tr"></div>
      <div className="corner-bl"></div>
      <div className="corner-br"></div>
      
      <div className="inner-corner-tl"></div>
      <div className="inner-corner-tr"></div>
      <div className="inner-corner-bl"></div>
      <div className="inner-corner-br"></div>

      <h2 className="card-title">{title}</h2>
      
      <div className="card-icon">
        {icon}
      </div>

      <ul className="card-benefits">
        {benefits.map((benefit, index) => (
          <li key={index} className="benefit-item">
            <span className="benefit-check">✓</span>
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SponsorshipCard;
