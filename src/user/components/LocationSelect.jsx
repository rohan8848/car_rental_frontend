import React from 'react';
import { kthLocations } from '../../utils/locations';
import LocationPicker from './LocationPicker';

const LocationSelect = ({ value, onChange, type }) => {
  return (
    <div className="space-y-4">
      <select
        value={value?.name || ''}
        onChange={(e) => {
          if (e.target.value === 'custom') {
            onChange({ name: 'custom', coords: null });
          } else {
            const location = kthLocations.find(loc => loc.name === e.target.value);
            if (location) onChange(location);
          }
        }}
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select {type} Location</option>
        {kthLocations.map(loc => (
          <option key={loc.id} value={loc.name}>{loc.name}</option>
        ))}
        <option value="custom">Choose Custom Location</option>
      </select>

      {value?.name === 'custom' && (
        <LocationPicker
          location={value?.coords}
          onLocationSelect={(coords) => onChange({ name: 'custom', coords })}
        />
      )}
    </div>
  );
};

export default LocationSelect;