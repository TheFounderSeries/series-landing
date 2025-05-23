import React, { useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onError?: (error: string) => void;
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Enter a location',
  disabled = false,
  className = '',
  onError = (error: string) => console.error(error)
}) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle place selection
  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      try {
        const place = autocompleteRef.current.getPlace();
        if (place.formatted_address) {
          onChange(place.formatted_address);
        }
      } catch (error) {
        onError('Error getting place details: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  // Initialize autocomplete
  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    try {
      autocompleteRef.current = autocomplete;
      // Configure to only return cities
      autocomplete.setOptions({
        types: ['(cities)'],
        fields: ['formatted_address', 'geometry', 'name']
      });
      // Add listener for place selection
      autocomplete.addListener('place_changed', handlePlaceChanged);
    } catch (error) {
      onError('Error initializing Google Places: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Cleanup on unmount
  const onUnmount = () => {
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }
  };

  // Update the input value when the value prop changes
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div className="relative">
      <span className="text-2xl absolute left-2 top-1/2 transform -translate-y-1/2 z-10">📍</span>
      <Autocomplete
        onLoad={onLoad}
        onUnmount={onUnmount}
        restrictions={{ country: 'us' }} // Optional: restrict to US
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`pl-10 ${className}`}
          aria-label="Location input with autocomplete"
        />
      </Autocomplete>
      {disabled && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-pulse text-xs text-gray-500">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;
