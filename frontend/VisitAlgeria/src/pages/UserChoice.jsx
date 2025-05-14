import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Stage1 from "../components/Stage1";
import Stage2 from "../components/Stage2";
import Stage3 from "../components/Stage3";
import Stage4 from "../components/Stage4";

export default function PreferenceFlow() {
  const [stage, setStage] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (stage < 4) {
      setStage(stage + 1);
    } else {
      navigate("/results");
    }
  };

  return (
    <article className="preference-wrapper">
      <div className="preference-container">
        <div className="stage-bar">
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
            style={{ left: `calc(${(stage - 1) * 25}% + 5%)` }}
          />
        </div>

        {/* SLIDING CONTENT */}
        <div className="stage-content-wrapper">
          <div
            className="stage-slider"
            style={{ transform: `translateX(-${(stage - 1) * 100}%)` }}
          >
            <div className="stage-slide">
              <Stage1 />
            </div>
            <div className="stage-slide">
              <Stage2 />
            </div>
            <div className="stage-slide">
              <Stage3 />
            </div>
            <div className="stage-slide">
              <Stage4 />
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
