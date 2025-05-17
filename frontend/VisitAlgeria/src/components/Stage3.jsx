import React from "react";
import MUiSlider from "./MUiSlider";

const Stage3 = ({ onHotelRangeChange,  onBudgetChange }) => {
  return (
    <article className="stage-3-container">
      <div className="hotel-section">
        <h3>Hotel Standards</h3>
        <MUiSlider onChange={onHotelRangeChange} />
      </div>

      <div className="separator">
        <div className="separator-line"></div>
        <div className="separator-text">Optional</div>
        <div className="separator-line"></div>
      </div>

      <div className="budget-section">
        <h3>Budget Per Day</h3>
        <input
          type="number"
          placeholder="min 10000da"
          min={10000}
          onChange={(e) => onBudgetChange(Number(e.target.value))}
        />
      </div>
    </article>
  );
};

export default Stage3;
