import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Icon from "../assets/icnSearch.svg";
import Compas from "../assets/COMPAS.svg";

// Fix for missing marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function FlyToMarker({ position, zoomLevel }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      const flyToOptions = {
        duration: 1,
        easeLinearity: 0.25,
      };

      // First zoom out slightly if we're at high zoom level
      if (map.getZoom() > zoomLevel) {
        map.flyTo(position, Math.max(zoomLevel - 2, 1), {
          ...flyToOptions,
          onEnd: () => {
            // Then zoom to desired level
            map.flyTo(position, zoomLevel, flyToOptions);
          },
        });
      } else {
        // Direct zoom to position
        map.flyTo(position, zoomLevel, flyToOptions);
      }
    }
  }, [position, zoomLevel, map]);

  return null;
}

export default function Stage1({ onLocationSelected }) {
  const [position, setPosition] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const mapRef = useRef(null);
  const searchRef = useRef(null);

  // Initialize map ref
  const MapWrapper = () => {
    mapRef.current = useMap();
    return null;
  };

  // Get current location with better accuracy
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        onLocationSelected(coords);
        if (mapRef.current) {
          mapRef.current.flyTo(coords, 15, {
            duration: 1,
          });
        }
      },
      (err) => {
        console.warn("GPS error:", err);
        alert(
          "Could not get your location. Please ensure location services are enabled."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Request GPS access immediately on load
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const LocationSelector = () => {
    const map = useMap();

    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        setPosition(coords);
        onLocationSelected(coords);
        map.flyTo(coords, map.getZoom(), {
          duration: 0.5,
        });
      },
    });
    return null;
  };

  // Enhanced search with more place types
  const handleSearchChange = async (query) => {
    setSearchInput(query);

    if (query.length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&limit=10&countrycodes=dz&featureType=settlement,street,city,tourism,amenity`
        );
        const data = await res.json();
        setSearchResults(data || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    }, 300);
  };

  const handleSelectResult = (result) => {
    const coords = [parseFloat(result.lat), parseFloat(result.lon)];
    setPosition(coords);
    onLocationSelected(coords);
    setSearchInput(result.display_name);
    setShowResults(false);
    if (mapRef.current) {
      mapRef.current.flyTo(coords, 15, {
        duration: 1,
      });
    }
  };

  return (
    <div className="map-container">
      <div className="map-search-section">
        <div className="map-search-bar" ref={searchRef}>
          <div className="search-icon">
            <img src={Icon} alt="" />
          </div>
          <input
            type="text"
            placeholder="Search location..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchInput.length >= 1 && setShowResults(true)}
          />
        </div>
        <div className="search-result-container">
          {showResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => handleSelectResult(result)}
                >
                  <div className="result-name">{result.display_name}</div>
                  {result.address && (
                    <div className="result-details">
                      {[
                        result.address.road,
                        result.address.neighbourhood,
                        result.address.suburb,
                        result.address.city ||
                          result.address.town ||
                          result.address.village,
                        result.address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="map-current-location-button"
        onClick={getCurrentLocation}
        title="Find my location"
      >
        <img src={Compas} alt="" />
      </div>

      <MapContainer
        center={position || [36.75, 3.06]}
        zoom={position ? 13 : 6}
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          zIndex: 0,
        }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <LocationSelector />
        {position && (
          <>
            <Marker position={position}>
              <Popup>Selected Location</Popup>
            </Marker>
            <FlyToMarker position={position} zoomLevel={13} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
