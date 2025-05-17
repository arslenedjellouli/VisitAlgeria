import React from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Icon1 from "../assets/Frame (2).svg";
import Icon2 from "../assets/Frame (3).svg";
import FallBackImage from "../assets/2270882ef6bf42f10c4f9aeacbda33c2b0d55814.png";
// Colors for each day
const DAY_COLORS = [
  "#FF5733", // Day 1 - Orange
  "#33FF57", // Day 2 - Green
  "#3357FF", // Day 3 - Blue
  "#F333FF", // Day 4 - Purple
  "#FF33F3", // Day 5 - Pink
  "#33FFF5", // Day 6 - Teal
  "#F5FF33", // Day 7 - Yellow
];

// Starting location (example coordinates - replace with your actual starting point)
const STARTING_LOCATION = {
  latitude: 36.7538,
  longitude: 3.0588,
  name: "Starting Point",
};

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-day">{payload[0].payload.name}</p>
        <p className="tooltip-cost">{payload[0].payload.cost.toFixed(2)} DZD</p>
        <p className="tooltip-wilaya">{payload[0].payload.wilaya}</p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Distance Chart
const DistanceTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip distance-tooltip">
        <p className="tooltip-header">{payload[0].payload.name}</p>
        <p className="tooltip-value">{payload[0].payload.distance} km</p>
        <p className="tooltip-wilaya">{payload[0].payload.wilaya}</p>
      </div>
    );
  }
  return null;
};

const ItineraryMap = ({ itineraryData }) => {
  if (!itineraryData) {
    return <div>Loading itinerary data...</div>;
  }

  // Prepare data for charts
  const chartData = itineraryData.itinerary.map((day) => ({
    name: `Day ${day.day}`,
    cost: day.total_cost,
    distance: day.total_distance,
    wilaya: day.wilaya,
  }));

  // Get all hotel locations (including first and last of each day)
  const hotelLocations = [];

  // Add starting location
  hotelLocations.push({
    ...STARTING_LOCATION,
    type: "starting",
    day: 0,
  });

  // Add first hotel of the trip
  const firstHotel = itineraryData.itinerary[0].schedule.find(
    (loc) => loc.loc_type === "hotel"
  );
  if (firstHotel) {
    hotelLocations.push({
      ...firstHotel,
      type: "hotel",
      day: 1,
    });
  }

  // Add hotel transitions between days
  for (let i = 1; i < itineraryData.itinerary.length; i++) {
    const prevDay = itineraryData.itinerary[i - 1];
    const currentDay = itineraryData.itinerary[i];

    const prevHotel = prevDay.schedule.find((loc) => loc.loc_type === "hotel");
    const currentHotel = currentDay.schedule.find(
      (loc) => loc.loc_type === "hotel"
    );

    if (
      prevHotel &&
      currentHotel &&
      (prevHotel.latitude !== currentHotel.latitude ||
        prevHotel.longitude !== currentHotel.longitude)
    ) {
      hotelLocations.push({
        ...prevHotel,
        type: "hotel",
        day: prevDay.day,
      });
      hotelLocations.push({
        ...currentHotel,
        type: "hotel",
        day: currentDay.day,
      });
    }
  }

  // Flatten all locations with day information
  const allLocations = itineraryData.itinerary.flatMap((day) =>
    day.schedule
      .filter((loc) => loc.latitude && loc.longitude)
      .map((loc) => ({ ...loc, day: day.day }))
  );

  // Create complete path including starting point and hotel transitions
  const completePath = [
    [STARTING_LOCATION.latitude, STARTING_LOCATION.longitude],
    ...allLocations.map((loc) => [loc.latitude, loc.longitude]),
  ];

  // Create daily paths
  const dailyPaths = itineraryData.itinerary.map((day) => ({
    day: day.day,
    positions: day.schedule
      .filter((loc) => loc.latitude && loc.longitude)
      .map((loc) => [loc.latitude, loc.longitude]),
    color: DAY_COLORS[(day.day - 1) % DAY_COLORS.length],
  }));

  // Create hotel transition paths (black lines)
  const hotelTransitionPaths = [];
  for (let i = 1; i < hotelLocations.length; i++) {
    const prev = hotelLocations[i - 1];
    const current = hotelLocations[i];

    if (prev.day !== current.day) {
      hotelTransitionPaths.push({
        positions: [
          [prev.latitude, prev.longitude],
          [current.latitude, current.longitude],
        ],
        color: "#000000", // Black for transitions
      });
    }
  }

  // Calculate center of the map
  const allPoints = [
    [STARTING_LOCATION.latitude, STARTING_LOCATION.longitude],
    ...allLocations.map((loc) => [loc.latitude, loc.longitude]),
  ];
  const latitudes = allPoints.map((p) => p[0]);
  const longitudes = allPoints.map((p) => p[1]);
  const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;

  return (
    <div className="finalresult-wrapper">
      <div className="finalresult-container">
        <div className="finalresult-list">
          {itineraryData.itinerary.map((day) => (
            <React.Fragment key={day.day}>
              {day.schedule.map((location, index) => (
                <div key={index} className="location-card">
                  <img
                    src={location.img_url || FallBackImage}
                    alt={location.location}
                    className="card-image"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = FallBackImage;
                    }}
                  />
                  <div className="location-info">
                    <h3>{location.location}</h3>
                    <p className="time">{location.time}</p>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        <div className="finalresult-right">
          <div className="finalresult-map">
            <MapContainer
              center={[STARTING_LOCATION.latitude, STARTING_LOCATION.longitude]}
              zoom={10}
              scrollWheelZoom={true}
              zoomControl={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Complete path (black) connecting all locations */}
              <Polyline
                positions={completePath}
                color="#000000"
                weight={2}
                opacity={0.5}
                dashArray="5, 5"
              />

              {/* Daily colored paths */}
              {dailyPaths.map((dayData) => (
                <Polyline
                  key={`day-${dayData.day}-path`}
                  positions={dayData.positions}
                  color={dayData.color}
                  weight={3}
                />
              ))}

              {/* Hotel transition paths (black) */}
              {hotelTransitionPaths.map((path, idx) => (
                <Polyline
                  key={`transition-${idx}`}
                  positions={path.positions}
                  color={path.color}
                  weight={3}
                />
              ))}

              {/* Starting location marker */}
              <Marker
                position={[
                  STARTING_LOCATION.latitude,
                  STARTING_LOCATION.longitude,
                ]}
                icon={L.icon({
                  iconUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
                })}
              >
                <Popup className="custom-popup">
                  <div>
                    <h3>{STARTING_LOCATION.name}</h3>
                    <p>
                      <strong>Starting Point</strong>
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* All locations markers */}
              {allLocations.map((location, index) => {
                const isCurrent = index === allLocations.length - 1;
                const isHotel = location.loc_type === "hotel";
                const dayColor =
                  DAY_COLORS[(location.day - 1) % DAY_COLORS.length];

                if (isCurrent) {
                  return (
                    <Marker
                      key={`marker-${index}`}
                      position={[location.latitude, location.longitude]}
                    >
                      <Popup className="custom-popup">
                        <div>
                          <h3>{location.location}</h3>
                          <p>
                            <strong>Day {location.day}</strong> -{" "}
                            {location.wilaya}
                          </p>
                          <p>Time: {location.time}</p>
                          <p>Activity: {location.activity}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                } else if (isHotel) {
                  return (
                    <CircleMarker
                      key={`hotel-${index}`}
                      center={[location.latitude, location.longitude]}
                      radius={10}
                      fillOpacity={1}
                      fillColor="white"
                      color={dayColor}
                      weight={4}
                    >
                      <Popup className="custom-popup">
                        <div>
                          <h3>{location.location}</h3>
                          <p>
                            <strong>Day {location.day}</strong> -{" "}
                            {location.wilaya}
                          </p>
                          <p>Time: {location.time}</p>
                          <p>Activity: {location.activity}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                } else {
                  return (
                    <CircleMarker
                      key={`circle-${index}`}
                      center={[location.latitude, location.longitude]}
                      radius={8}
                      fillOpacity={1}
                      fillColor="white"
                      color={dayColor}
                      weight={3}
                    >
                      <Popup className="custom-popup">
                        <div>
                          <h3>{location.location}</h3>
                          <p>
                            <strong>Day {location.day}</strong> -{" "}
                            {location.wilaya}
                          </p>
                          <p>Time: {location.time}</p>
                          <p>Activity: {location.activity}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                }
              })}
            </MapContainer>
          </div>

          <div className="finalresult-stats">
            <div className="finalresult-card">
              <div className="result-card-head">
                <div className="result-card-icon">
                  <img src={Icon1} alt="" />
                </div>
                <div className="result-card-text">
                  <p>Total Cost</p>
                  <h3>{itineraryData.summary.total_cost.toFixed(2)} DZD</h3>
                </div>
              </div>
              <div className="chart-result">
                <ResponsiveContainer>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorCost"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="-8.72%"
                          stopColor="#FFAC8F"
                          stopOpacity={0.67}
                        />
                        <stop
                          offset="95%"
                          stopColor="#201612"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="#FFAC8F"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCost)"
                    />
                    <XAxis hide />
                    <YAxis hide />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: "#FFAC8F",
                        strokeWidth: 1,
                        strokeDasharray: "3 3",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="finalresult-card">
              <div className="result-card-head">
                <div className="result-card-icon-2">
                  <img src={Icon2} alt="" />
                </div>
                <div className="result-card-text">
                  <p>Total Distance</p>
                  <h3>{itineraryData.summary.total_distance} KM</h3>
                </div>
              </div>
              <div className="chart-result">
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorDistance"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="-8.72%"
                          stopColor="#4BA2A4"
                          stopOpacity={1}
                        />
                        <stop
                          offset="95%"
                          stopColor="##041616"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="distance"
                      stroke="#73CED0"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDistance)"
                    />
                    <XAxis hide />
                    <YAxis hide />
                    <Tooltip
                      content={<DistanceTooltip />}
                      cursor={{
                        stroke: "#73ced0",
                        strokeWidth: 1,
                        strokeDasharray: "3 3",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryMap;
