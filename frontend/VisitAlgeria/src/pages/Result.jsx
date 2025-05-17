import React from 'react'
import Itinerary from '../components/Itinerary.jsx';
import itineraryData from './response_1747413732462.json'; // Import your JSON data

const result = () => {
  return (
    <>
      <article className="csp-result-wrapper">
        <Itinerary data={itineraryData} />
      </article>


    </>
  );


}

export default result