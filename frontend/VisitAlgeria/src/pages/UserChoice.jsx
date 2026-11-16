import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Stage1 from "../components/Stage1";
import Stage2 from "../components/Stage2";
import Stage3 from "../components/Stage3";
import Stage4 from "../components/Stage4";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PreferenceFlow() {
  const sendPlanRequest = async () => {
    if (!selectedLocation || !selectedInterests || !selectedVisited) {
      alert("Please complete all stages before proceeding.");
      return;
    }

    const payload = {
      currentLat: selectedLocation[0],
      currentLong: selectedLocation[1],
      interests: selectedInterests,
      budgetPerDay: budget,
      minHotelRat: hotelRange[0],
      maxHotelRat: hotelRange[1],
      visitedAttractions: Object.fromEntries(
        selectedVisited.map((name) => [name, true])
      ),
      currentWilaya: "",
    };

    navigate("/plan/generating");

    try {
      const response = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      localStorage.setItem("itinerary", JSON.stringify(result));
      navigate("/plan/itinerary");
    } catch (err) {
      console.error("API error:", err);
    }
  };

  const [stage, setStage] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (stage < 4) {
      setStage(stage + 1);
    } else {
      sendPlanRequest();
    }
  };

  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelected = (coords) => {
    console.log("Received location:", coords);
    setSelectedLocation(coords);

    // Save starting location to localStorage
    const startingLocation = {
      latitude: coords[0],
      longitude: coords[1],
      name: "Starting Point", // or get this dynamically if you want
    };
    localStorage.setItem("startingLocation", JSON.stringify(startingLocation));
  };


  const [selectedInterests, setSelectedInterests] = useState(null);

  const handleInterestsSelected = (ints) => {
    console.log("Received location:", ints);
    setSelectedInterests(ints);
    // You can do more with the coordinates here
  };

  const [hotelRange, setHotelRange] = useState([3, 4]);
  const [budget, setBudget] = useState(10000);

  const handleHotelRangeChange = (range) => {
    setHotelRange(range);
    console.log("Hotel range changed:", range);
  };

  const handleBudgetChange = (newBudget) => {
    setBudget(newBudget);
    console.log("Budget changed:", newBudget);
  };

  const [selectedVisited, setSelectedVisited] = useState(null);

  const handleLocationVisited = (locs) => {
    console.log("Received location:", locs);
    setSelectedVisited(locs);
    // You can do more with the coordinates here
  };

  return (
    <article className="preference-wrapper">
      <div className="preference-container">
        <div className="stage-bar">
          <div className="stages">
            <div className={`stage-1 ${stage === 1 ? "active" : ""}`}>
              Current Location
            </div>
            <div className={`stage-2 ${stage === 2 ? "active" : ""}`}>
              Interests
            </div>
            <div className={`stage-3 ${stage === 3 ? "active" : ""}`}>
              Hotel standards
            </div>
            <div className={`stage-4 ${stage === 4 ? "active" : ""}`}>
              Visited attractions
            </div>
            <div
              className="indicator"
              style={{ left: `calc(5% + ${(stage - 1) * 25}%)` }}
            />
          </div>
        </div>

        {/* SLIDING CONTENT */}
        <div className="stage-content-wrapper">
          <div
            className="stage-slider"
            style={{ transform: `translateX(-${(stage - 1) * 50}%)` }}
          >
            <div className="stage-slide">
              <Stage1 onLocationSelected={handleLocationSelected} />
            </div>
            <div className="stage-slide">
              <Stage2 onSelect={handleInterestsSelected} />
            </div>
            <div className="stage-slide">
              <Stage3
                hotelRange={hotelRange}
                onHotelRangeChange={handleHotelRangeChange}
                budget={budget}
                onBudgetChange={handleBudgetChange}
              />
            </div>
            <div className="stage-slide">
              <Stage4 onLocationsChange={handleLocationVisited} />
            </div>
          </div>
        </div>
      </div>
      <button
        style={{ marginTop: "2.5rem" }}
        className="home-button"
        onClick={handleNext}
      >
        Next
      </button>
    </article>
  );
}
