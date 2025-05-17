import React, { useEffect, useState } from "react";
import Itinerary from "../components/Itinerary.jsx";
import { useNavigate } from "react-router-dom";

const Result = () => {
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);

  useEffect(() => {
    const storedItinerary = JSON.parse(localStorage.getItem("itinerary"));
    if (storedItinerary) {
      setItinerary(storedItinerary);
    } else {
      navigate("/plan/preferences");
    }
  }, []);

  if (!itinerary) return null; // or a loading spinner

  return (
    <article className="csp-result-wrapper">
      <Itinerary data={itinerary} />
      <div className="go-summary-button">
        <a
          className="go-summary"
          onClick={() => {
            navigate("/plan/summary");
          }}
        >
          &#x276F;
        </a>
      </div>
    </article>
  );
};

export default Result;
