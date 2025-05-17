import React from "react";
import ItineraryMap from "../components/ItineraryMap.jsx";
import itineraryData from "./response_1747413732462.json"; // Import your JSON file

function App() {
  return (
    <div className="App">
      <ItineraryMap itineraryData={itineraryData} />
    </div>
  );
}

export default App;
