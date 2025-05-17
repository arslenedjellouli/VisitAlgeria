import React, { useEffect, useState } from "react";
import ItineraryMap from "../components/ItineraryMap.jsx";
import { useNavigate } from "react-router-dom";

function App() {
  const [itineraryData, setItineraryData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("itinerary");
    if (stored) {
      try {
        setItineraryData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse itinerary from localStorage:", e);
      }
    }
  }, []);

  if (!itineraryData) return <p>Loading itinerary...</p>;

  return (
    <div className="csp-summary-wrapper">
      <ItineraryMap itineraryData={itineraryData} />
      <div className="go-details-button">
        <a
          className="go-summary"
          onClick={() => {
            navigate("/plan/itinerary");
          }}
        >
          &#x276E;
        </a>
      </div>
    </div>
  );
}

export default App;
