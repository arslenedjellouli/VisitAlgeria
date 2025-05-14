import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <article className="home-wrapper">
        <div className="home-container innerWidth">
          <h1 className="home-title">Visit Algeria</h1>
          <p className="home-description">
            Plan unforgettable journeys across Algeria with our intelligent
            travel planner. <br /> Just input your preferences—location,
            interests, hotel standards—and get a <br /> personalized 7-day
            itinerary, complete with maps, attractions, and more. <br />
            Fast, smart, and tailored for you.
          </p>
          <a href="/plan/preferences" className="home-button">
            Generate
          </a>
        </div>
      </article>
    </>
  );
};

export default Home;
