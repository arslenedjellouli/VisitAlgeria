import React, { useState } from "react";
import fallbackImage from "../assets/2270882ef6bf42f10c4f9aeacbda33c2b0d55814.png";

const Itinerary = ({ data }) => {
  // Track which day is expanded at the Itinerary level
  const [expandedDay, setExpandedDay] = useState(null);

  // Function to handle expanding/collapsing day rows
  const handleDayToggle = (dayNumber) => {
    // If the clicked day is already expanded, collapse it by setting to null
    // Otherwise expand the clicked day
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  return (
    <div className="csp-result-container-wrap">
      <div className="csp-result-container">
        {data.itinerary.map((day) => (
          <DayBox
            key={`day-${day.day}`}
            dayData={day}
            isExpanded={expandedDay === day.day}
            onDayToggle={handleDayToggle}
          />
        ))}
      </div>
    </div>
  );
};

const DayBox = ({ dayData, isExpanded, onDayToggle }) => {
  return (
    <div className="result-day-box">
      <div className="day-header">Day 0{dayData.day}</div>
      <div className="cards-container">
        {dayData.schedule.map((item, index) => (
          <LocationCard
            key={`day-${dayData.day}-item-${index}`}
            item={item}
            isExpanded={isExpanded}
            onToggle={() => onDayToggle(dayData.day)}
          />
        ))}
      </div>
    </div>
  );
};

const LocationCard = ({ item, isExpanded, onToggle }) => {
  return (
    <div
      className={`card ${isExpanded ? "card-expanded" : "card-collapsed"}`}
      onClick={onToggle}
    >
      <div className="card-header">
        <img
          src={item.img_url || fallbackImage}
          alt={item.location}
          className="card-image"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = fallbackImage;
          }}
        />
        <div className="card-basic-info">
          <div className="card-name">{item.location}</div>
          <div className="card-time">{item.time}</div>
        </div>
      </div>

      <div className="card-content">
        <div className={`card-details ${isExpanded ? "expanded" : ""}`}>
          {item.category && (
            <div className="card-category">{item.category}</div>
          )}
          {item.description && (
            <div className="card-description">{item.description}</div>
          )}
          {(item.phone_number || item.website) && (
            <div className="card-contact">
              {item.phone_number && (
                <div className="card-contact-item">{item.phone_number}</div>
              )}
              {item.website && (
                <div className="card-contact-item">
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.website}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
