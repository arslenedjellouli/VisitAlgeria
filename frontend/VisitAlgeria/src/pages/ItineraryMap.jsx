import React from 'react'

const ItineraryMap = () => {
  return (
    <>
        <div className="finalresult-wrapper">
            <div className="finalresult-container">
                <div className="finalresult-list">
                    {/* this is a vertically scrollable list of cards which represent a visited location during the itenerary based on the input JSON, ordered as given in the json. each card has img, name and time */}

                </div>
                <div className="finalresult-right">
                    <div className="finalresult-map">
                        {/* this map shows the entire itenerary given in the JSON, for ll days location by location, all locations linked with the next location in order */}
                    </div>
                    <div className="finalresult-stats">
                        <div className="finalresult-card">
                            
                        </div>
                        <div className="finalresult-card"></div>
                    </div>
                </div>
            </div>
        </div>
    
    </>
  )
}

export default ItineraryMap