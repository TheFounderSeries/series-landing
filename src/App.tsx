import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
// import ForceGraphTest from './pages/ForceGraphTest';
// import ProfileOnboarding from './ProfileOnboarding';
// import QuestionnaireOnboarding from './QuestionnaireOnboarding';
// import WelcomePage from './WelcomePage';
// import VideoPlayer from './VideoPlayer';
// import ConfusedPage from './ConfusedPage';
// import ImsgVideo from './ImsgVideo';

// PageTracker component to track page views and page leave events
const PageTracker = () => {
  const location = useLocation();
  const posthog = usePostHog();
  
  // Track page view when location changes
  useEffect(() => {
    // Capture page view event
    posthog.capture('$pageview', {
      path: location.pathname,
      url: window.location.href,
      referrer: document.referrer,
      page_title: document.title
    });
    
    // Track page leave event when component unmounts or route changes
    return () => {
      posthog.capture('page_leave', {
        path: location.pathname,
        time_spent: Date.now() - performance.now(), // Approximate time on page
        exit_url: window.location.href
      });
    };
  }, [location.pathname, posthog]);
  
  return null;
};

// TrackingWrapper HOC to wrap components with tracking
const withTracking = <P extends object>(Component: React.ComponentType<P>, pageName: string) => {
  return (props: P) => {
    const posthog = usePostHog();
    
    useEffect(() => {
      // Track page entry with more detailed information
      posthog.capture('page_entered', {
        page_name: pageName,
        timestamp: new Date().toISOString(),
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        user_agent: navigator.userAgent
      });
      
      // Set up click tracking for the entire page
      const clickHandler = (e: MouseEvent) => {
        // Find the closest element with a data-tracking attribute or use the element's tag name
        let target = e.target as HTMLElement;
        let trackingId = '';
        let elementType = target.tagName.toLowerCase();
        
        // Try to find a meaningful identifier by walking up the DOM tree
        while (target && target !== document.body) {
          if (target.dataset && target.dataset.tracking) {
            trackingId = target.dataset.tracking;
            break;
          }
          if (target.id) {
            trackingId = target.id;
            break;
          }
          if (target.className && typeof target.className === 'string') {
            // Use class name as a fallback identifier
            trackingId = target.className.split(' ')[0];
            break;
          }
          const parentNode = target.parentNode;
          if (parentNode instanceof HTMLElement) {
            target = parentNode;
          } else {
            break;
          }
        }
        
        // Only track clicks on interactive elements or elements with tracking data
        if (
          elementType === 'button' || 
          elementType === 'a' || 
          elementType === 'input' || 
          elementType === 'select' || 
          elementType === 'textarea' ||
          trackingId
        ) {
          posthog.capture('element_clicked', {
            page_name: pageName,
            element_type: elementType,
            element_id: trackingId || 'unknown',
            element_text: target.innerText ? target.innerText.substring(0, 50) : '',
            element_href: target instanceof HTMLAnchorElement ? target.href : '',
            x_position: e.clientX,
            y_position: e.clientY
          });
        }
      };
      
      // Add click event listener
      document.addEventListener('click', clickHandler);
      
      return () => {
        // Remove event listener and track page exit
        document.removeEventListener('click', clickHandler);
        posthog.capture('page_exited', {
          page_name: pageName,
          exit_timestamp: new Date().toISOString(),
          time_on_page: Date.now() - performance.now() // Approximate time on page
        });
      };
    }, [posthog]);
    
    return <Component {...props} />;
  };
};

// Wrap pages with tracking
const TrackedLandingPage = withTracking(LandingPage, 'landing_page');
const TrackedOnboardingPage = withTracking(OnboardingPage, 'onboarding_page');

const App = () => {
  return (
    <Router>
      <PageTracker />
      <Routes>
        <Route path="/" element={<TrackedLandingPage />} />
        <Route path="/join" element={<TrackedOnboardingPage />} />
        {/* Redirect from /eunice to /?ref=eunice */}
        <Route path="/eunice" element={<Navigate to="/?ref=eunice" replace />} />
        {/* <Route path="/test-graph" element={<ForceGraphTest />} /> */}
        {/* <Route path="/join/intro" element={<VideoPlayer src = "" nextRoute="/join/1" />} />
        <Route path="/join/faq" element={<ConfusedPage />} />
        <Route path="/join/1" element={<ProfileOnboarding />} />
        <Route path="/join/2" element={<QuestionnaireOnboarding />} />
        <Route path="/join/complete" element={<WelcomePage />} /> 
        <Route path="/welcome" element={<ImsgVideo />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
