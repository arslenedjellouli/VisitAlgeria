import React, { useState } from "react";

const ALL_CATEGORIES = [
  "Natural Wonders & Landscapes",
  "Parks & Recreation Areas",
  "Historical & Architectural Sites",
  "Cultural & Heritage Sites",
  "Urban Attractions & Entertainment",
  "Beaches & Islands",
  "Shopping & Souks",
  "Museums & Cultural Centers",
  "Oases & Springs",
  "Wildlife & Nature Reserves",
];

export default function Stage2({ onSelect }) {
  const [selected, setSelected] = useState([]);

  const toggleTag = (category) => {
    if (selected.includes(category)) {
      const updated = selected.filter((c) => c !== category);
      setSelected(updated);
      onSelect(updated);
    } else {
      const updated = [...selected, category];
      setSelected(updated);
      onSelect(updated);
    }
  };

  return (
    <div className="tag-selector">
      {ALL_CATEGORIES.map((category, i) => (
        <div
          key={i}
          className={`tag ${selected.includes(category) ? "selected" : ""}`}
          onClick={() => toggleTag(category)}
        >
          {category}
        </div>
      ))}
    </div>
  );
}
