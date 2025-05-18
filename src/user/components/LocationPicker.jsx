import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { kthLocations } from '../../utils/locations';

const LocationPicker = ({ value, onChange }) => {
  const kathmandu = { lat: 27.7172, lng: 85.3240 };
  
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    onChange({ coords: { lat, lng }, type: 'custom' });
  };

  return (
    <div className="relative h-[300px] rounded-lg overflow-hidden">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          zoom={13}
          center={value?.coords || kathmandu}
          onClick={handleMapClick}
        >
          {kthLocations.map(loc => (
            <Marker
              key={loc.id}
              position={loc.coords}
              title={loc.name}
              onClick={() => onChange(loc)}
            />
          ))}
          
          {value?.coords && (
            <Marker
              position={value.coords}
              icon={{
                url: '/marker-selected.png',
                scaledSize: { width: 35, height: 35 }
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default LocationPicker;