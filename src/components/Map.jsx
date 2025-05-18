import React, { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { kthLocations } from "../utils/locations";

// Styles for Map container
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
  position: "relative",
  overflow: "hidden",
};

const Map = ({ onLocationChange, initialLocation }) => {
  const initialLat = initialLocation?.lat || 27.7172;
  const initialLng = initialLocation?.lng || 85.324;
  
  const iframeRef = useRef(null);
  const overlayRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: initialLat,
    lng: initialLng,
  });
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const markerRef = useRef(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now()); // Key to force iframe refresh

  // Initialize map with the passed initial location or default
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      
      // Try to find location name from predefined locations
      const closestLocation = findClosestLocation(initialLocation);
      if (closestLocation) {
        setSelectedLocationName(closestLocation.name);
      } else {
        setSelectedLocationName(`Location at ${initialLocation.lat.toFixed(5)}, ${initialLocation.lng.toFixed(5)}`);
      }
    }
  }, [initialLocation]);

  // Create marker element for showing selection
  useEffect(() => {
    if (!markerRef.current && overlayRef.current) {
      markerRef.current = document.createElement('div');
      markerRef.current.className = "absolute w-6 h-6 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white";
      markerRef.current.style.zIndex = 999;
      markerRef.current.style.display = "none";
      overlayRef.current.appendChild(markerRef.current);
    }
  }, []);

  // When location changes, notify parent component
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(selectedLocation, selectedLocationName);
    }
  }, [selectedLocation, selectedLocationName, onLocationChange]);

  const findClosestLocation = (coords) => {
    const MAX_DISTANCE = 0.002; // Approximately 200-250 meters
    let closest = null;
    let minDistance = Infinity;

    kthLocations.forEach(loc => {
      // Calculate Euclidean distance (simplified for small areas)
      const distance = Math.sqrt(
        Math.pow(loc.coords.lat - coords.lat, 2) + 
        Math.pow(loc.coords.lng - coords.lng, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closest = loc;
      }
    });

    return minDistance <= MAX_DISTANCE ? closest : null;
  };

  const handleMapClick = (e) => {
    if (!overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const mapWidth = rect.width;
    const mapHeight = rect.height;

    // Calculate position relative to the overlay
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate percentage across the map
    const percentX = x / mapWidth;
    const percentY = y / mapHeight;

    // Set marker position
    if (markerRef.current) {
      markerRef.current.style.display = "block";
      markerRef.current.style.left = `${x}px`;
      markerRef.current.style.top = `${y}px`;
    }

    // Approximate lat/lng (this is a simplified calculation)
    // Center of Kathmandu: 27.7172° N, 85.3240° E
    // Let's create a small area around it for demonstration purposes
    const latRange = 0.02; // about 2.2 km north-south
    const lngRange = 0.02; // about 2.2 km east-west

    const lat = 27.7172 + latRange * (0.5 - percentY) * 2;
    const lng = 85.324 + lngRange * (percentX - 0.5) * 2;

    const newLocation = { lat, lng };
    
    // Check if click is near a known location
    const closestLocation = findClosestLocation(newLocation);
    
    if (closestLocation) {
      setSelectedLocation(closestLocation.coords);
      setSelectedLocationName(closestLocation.name);
    } else {
      setSelectedLocation(newLocation);
      setSelectedLocationName(`Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
    
    // Force iframe refresh to center on new location
    setMapKey(Date.now());
  };

  // Select from predefined locations
  const selectPredefinedLocation = (loc) => {
    setSelectedLocation(loc.coords);
    setSelectedLocationName(loc.name);
    setShowLocationPicker(false);
    // Force iframe refresh
    setMapKey(Date.now());
  };

  return (
    <div className="relative">
      <div
        className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-md"
        ref={overlayRef}
      >
        <iframe
          key={mapKey}
          className="gmap_iframe"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={`https://maps.google.com/maps?width=600&height=400&hl=en&q=${selectedLocation.lat},${selectedLocation.lng}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
          ref={iframeRef}
        ></iframe>

        <div
          onClick={handleMapClick}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair z-10"
        ></div>

        {/* Show location indicator */}
        <div
          className="absolute z-20 transform -translate-x-1/2 -translate-y-full"
          style={{
            top: "50%",
            left: "50%",
            pointerEvents: "none",
          }}
        >
          <FaMapMarkerAlt className="text-red-600 h-8 w-8" />
          <div className="bg-white text-gray-800 px-2 py-1 rounded-md shadow-md text-sm">
            {selectedLocationName || "Selected Location"}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
          Click on the map to select a location
        </div>
      </div>

      <div className="mt-4 flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showLocationPicker ? "Hide Popular Locations" : "Show Popular Locations"}
          </button>

          <div className="text-sm text-gray-500">
            <span className="font-medium">Selected:</span>{" "}
            {selectedLocationName}
          </div>
        </div>

        {showLocationPicker && (
          <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Popular Locations in Kathmandu:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-auto">
              {kthLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => selectPredefinedLocation(loc)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-left truncate"
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confirm Location Button */}
        <button
          onClick={() => {
            // Force a final update
            onLocationChange(selectedLocation, selectedLocationName);
          }}
          className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <FaMapMarkerAlt className="mr-2" />
          Confirm This Location
        </button>
      </div>
    </div>
  );
};

export default Map;
