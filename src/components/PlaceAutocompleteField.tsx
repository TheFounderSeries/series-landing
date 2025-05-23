import React, { useEffect, useRef, useState } from 'react';

interface PlaceAutocompleteFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onError?: (error: string) => void;
}

// Add type definition for the Google Maps API
declare global {
  interface Window {
    google?: any;
    initMap?: () => void;
  }
}

const PlaceAutocompleteField: React.FC<PlaceAutocompleteFieldProps> = ({
  value,
  onChange,
  placeholder = 'Enter a location',
  disabled = false,
  className = '',
  onError = (error: string) => console.error(error)
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Initialize the autocomplete field once the container is available
    if (!containerRef.current || hasInitialized) {
      return;
    }

    const initAutocomplete = async () => {
      try {
        setIsLoading(true);
        
        // Make sure the Google Maps API is loaded
        if (!window.google?.maps) {
          console.log('Waiting for Google Maps API to load...');
          return; // Wait for the API to load
        }

        // Import the places library if needed
        if (typeof window.google.maps.importLibrary === 'function') {
          await window.google.maps.importLibrary('places');
        }

        // Clear the container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Create the autocomplete element with options to restrict to cities
        const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
          // Restrict to establishments and cities
          includedPrimaryTypes: ['locality', 'sublocality', 'administrative_area_level_1', 'administrative_area_level_2'],
          // Restrict to US only
          includedRegionCodes: ['us']
        });
        
        // Add the element to the container
        containerRef.current?.appendChild(autocompleteElement);
        
        // Style the element to match our design
        autocompleteElement.style.width = '100%';
        autocompleteElement.style.height = '100%';
        autocompleteElement.style.borderRadius = 'inherit';
        autocompleteElement.style.padding = '0.5rem';
        
        // Apply additional styling to match the Age input box height
        const autocompleteInput = autocompleteElement.querySelector('input');
        if (autocompleteInput) {
          // Reset any default styles
          autocompleteInput.style.all = 'unset';
          
          // Apply our custom styles and any additional classes
          const baseStyles = {
            width: '100%',
            height: '54px',
            padding: '0.75rem 1rem',
            border: '2px solid #e5e7eb',
            borderRadius: '1rem',
            boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            fontSize: '1rem',
            color: '#111827',
            backgroundColor: 'white',
          };
          
          // Apply base styles
          Object.assign(autocompleteInput.style, baseStyles);
          
          // Add any additional classes
          if (className) {
            autocompleteInput.className = className;
          }
          
          // Add focus styles
          autocompleteInput.addEventListener('focus', () => {
            autocompleteInput.style.borderColor = '#9ca3af';
            autocompleteInput.style.outline = 'none';
          });
          
          autocompleteInput.addEventListener('blur', () => {
            autocompleteInput.style.borderColor = '#e5e7eb';
          });
        }
        
        // Listen for place selection
        autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
          try {
            const { placePrediction } = event.detail;
            
            // First, try to get the display name directly from the prediction
            if (placePrediction.description) {
              onChange(placePrediction.description);
              return;
            }
            
            // If not available, fetch more details
            try {
              const place = placePrediction.toPlace();
              
              // Fetch additional details about the place
              await place.fetchFields({
                fields: ['displayName', 'formattedAddress', 'addressComponents']
              });
              
              // Update the value with the formatted address
              if (place.formattedAddress) {
                onChange(place.formattedAddress);
              } else if (place.displayName?.text) {
                onChange(place.displayName.text);
              } else {
                // Fallback to the raw input value if nothing else works
                const inputElement = containerRef.current?.querySelector('input');
                if (inputElement && inputElement.value) {
                  onChange(inputElement.value);
                }
              }
            } catch (placeError) {
              console.warn('Error fetching place details:', placeError);
              // Still try to use the prediction description
              if (event.target && event.target.value) {
                onChange(event.target.value);
              }
            }
          } catch (error) {
            onError(`Error selecting place: ${error instanceof Error ? error.message : String(error)}`);
          }
        });
        
        // Also listen for input changes to capture manual edits
        const inputElement = containerRef.current?.querySelector('input');
        if (inputElement) {
          inputElement.addEventListener('change', (e: any) => {
            if (e.target.value) {
              onChange(e.target.value);
            }
          });
        }

        setHasInitialized(true);
        setIsLoading(false);
      } catch (error) {
        onError(`Error initializing Google Places: ${error instanceof Error ? error.message : String(error)}`);
        setIsLoading(false);
      }
    };

    initAutocomplete();

    // Check periodically if Google Maps API is loaded
    const checkInterval = setInterval(() => {
      if (window.google?.maps?.places?.PlaceAutocompleteElement && !hasInitialized) {
        initAutocomplete();
      }
    }, 500);

    return () => {
      clearInterval(checkInterval);
      // Clean up is handled automatically since we're using React refs
    };
  }, [containerRef.current, hasInitialized, onChange, onError]);

  // Show a fallback input if the API hasn't loaded yet
  if (!window.google?.maps?.places?.PlaceAutocompleteElement) {
    return (
      <div className={`relative ${className}`}>
        <span className="text-2xl absolute left-2 top-1/2 transform -translate-y-1/2 z-10">📍</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`pl-10 ${className}`}
        />
        {disabled && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-pulse text-xs text-gray-500">Loading Places API...</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block w-full">
      <div 
        ref={containerRef} 
        className={`block w-full appearance-none rounded-2xl border-2 border-gray-200 shadow-lg px-0 py-0.5 text-base text-gray-900 focus:border-gray-400 focus:ring-0 transition-all duration-200 ${className || ''}`}
        // style={{ 
        //   minHeight: '54px',
        //   position: 'relative',
        //   width: '100%'
        // }}
      />
    </div>
  );
};

export default PlaceAutocompleteField;
