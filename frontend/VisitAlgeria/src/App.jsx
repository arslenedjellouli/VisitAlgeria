import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UserChoice from "./pages/userChoice";
import Result from "./pages/result";
import Loading from "./pages/Loading";
import FinalPath from "./pages/FinalPath";

import BackgroundSlideshow from "./components/BackgroundSlideshow";

function App() {
  return (
    <Router>
      <BackgroundSlideshow />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan/preferences" element={<UserChoice />} />
        <Route path="/plan/itinerary" element={<Result />} />
        <Route path="/plan/generating" element={<Loading />} />
        <Route path="/plan/summary" element={<FinalPath />} />

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
