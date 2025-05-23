import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import LandingPage from './LandingPage';
import ProfileOnboarding from './ProfileOnboarding';
import QuestionnaireOnboarding from './QuestionnaireOnboarding';
import WelcomePage from './WelcomePage';

// Add type definitions for Google Maps API
declare global {
  interface Window {
    initMap?: () => void;
    google?: any; // Using any type for google to avoid type conflicts with @types/google.maps
  }
}

// Google Maps configuration
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const App = () => {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const scriptLoaded = useRef(false);
  const initMapRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Skip if already loaded or script is being loaded
    if (scriptLoaded.current || window.google?.maps?.places) {
      if (!mapsLoaded) setMapsLoaded(true);
      return;
    }

    const loadGoogleMapsScript = () => {
      if (scriptLoaded.current) return;
      scriptLoaded.current = true;

      // Check if script is already in the document
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      
      if (existingScript) {
        console.log('Google Maps API script already exists');
        // If script exists but not loaded yet, set up a handler
        if (!window.google?.maps?.places) {
          initMapRef.current = () => {
            console.log('Google Maps API loaded via existing script');
            setMapsLoaded(true);
            initMapRef.current = null;
          };
          window.initMap = initMapRef.current;
        } else {
          setMapsLoaded(true);
        }
        return;
      }

      console.log('Loading Google Maps API');
      
      // Create the script element
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initMap&v=weekly`;
      script.async = true;
      script.defer = true;
      
      // Set up the callback before adding the script
      initMapRef.current = () => {
        console.log('Google Maps API loaded successfully');
        setMapsLoaded(true);
        initMapRef.current = null;
      };
      window.initMap = initMapRef.current;
      
      // Handle script load errors
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        scriptLoaded.current = false;
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        // Clean up the global callback
        if (window.initMap === initMapRef.current) {
          window.initMap = undefined;
        }
        initMapRef.current = null;
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    return () => {
      // Clean up the global callback if it's ours
      if (window.initMap === initMapRef.current) {
        window.initMap = undefined;
      }
      // Don't remove the script as it might be used by other components
    };
  }, [mapsLoaded]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join/1" element={<ProfileOnboarding />} />
        <Route path="/join/2" element={<QuestionnaireOnboarding />} />
        <Route path="/join/complete" element={<WelcomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
