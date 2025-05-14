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
  const searchRef = useRef(null);

  // Request GPS access immediately
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        onLocationSelected(coords);
      },
      (err) => {
        console.warn("GPS denied or unavailable");
      },
      { enableHighAccuracy: true }
    );
  }, [onLocationSelected]);

  const LocationSelector = () => {
    const map = useMap();

    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        setPosition(coords);
        onLocationSelected(coords);
        // Use flyTo directly here for immediate response
        map.flyTo(coords, map.getZoom(), {
          duration: 1,
        });
      },
    });
    return null;
  };

  const handleSearchChange = async (query) => {
    setSearchInput(query);

    if (query.length < 3) {
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
          )}&addressdetails=1&limit=5&countrycodes=dz`
        );
        const data = await res.json();
        setSearchResults(data || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    }, 500);
  };

  const handleSelectResult = (result) => {
    const coords = [parseFloat(result.lat), parseFloat(result.lon)];
    setPosition(coords);
    onLocationSelected(coords);
    setSearchInput(result.display_name);
    setShowResults(false);
  };

  return (
    <div className="map-container">
      <div className="map-search-section">
        <div className="map-search-bar" ref={searchRef}>
        <input
          type="text"
          placeholder="Search location..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => searchInput.length >= 3 && setShowResults(true)}
        />
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
      

      <MapContainer
        center={position || [36.75, 3.06]}
        zoom={position ? 13 : 6}
        style={{ height: "100%", width: "100%", position: "relative", zIndex: 0 }}
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

      <style jsx>{`
        .map-search-bar {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1000;
          width: calc(100% - 40px);
          max-width: 400px;
        }

        .map-search-bar input {
          width: 100%;
          padding: 10px 15px;
          border-radius: 20px;
          border: 1px solid #ccc;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          font-size: 16px;
        }

        .search-results {
          background: white;
          border-radius: 0 0 10px 10px;
          margin-top: 5px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-top: none;
        }

        .search-result-item {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background 0.2s;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover {
          background-color: #f5f5f5;
        }

        .result-name {
          font-weight: 500;
          margin-bottom: 3px;
        }

        .result-details {
          font-size: 0.85em;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
