import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenSize } from './lib/useScreenSize';

interface VideoPlayerProps {
  src: string;
  nextRoute: string;
}

const VideoPlayer = ({ nextRoute = '/join/1' }: VideoPlayerProps) => {
  // Get screen size information
  const { isMobile } = useScreenSize();
  
  // Determine which loading screen to use based on screen size
  const videoSrc = (isMobile ? '/loading_screen_mobile.mp4' : '/loading_screen.mp4');
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fallbackTimer, setFallbackTimer] = useState<NodeJS.Timeout | null>(null);

  // Use a ref to track if component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    // Set up cleanup function
    return () => {
      isMounted.current = false;
      // Clear any pending timers
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Set a fallback timer in case the video doesn't trigger events properly
    // This ensures the user doesn't get stuck on this page
    const timer = setTimeout(() => {
      console.log('Fallback timer triggered - navigating to next route');
      if (isMounted.current) {
        navigate(nextRoute);
      }
    }, 10000); // 10 seconds fallback

    setFallbackTimer(timer);

    // Handle video loading
    const handleCanPlay = () => {
      console.log('Video can play now');
      setIsLoading(false);
      
      try {
        // Attempt to play the video
        videoElement.play()
          .then(() => {
            console.log('Video playback started successfully');
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('Error playing video:', error);
            // If autoplay is prevented, navigate after a delay
            if (isMounted.current) {
              setHasError(true);
              setTimeout(() => {
                if (isMounted.current) navigate(nextRoute);
              }, 1000);
            }
          });
      } catch (error) {
        console.error('Exception during play():', error);
        if (isMounted.current) {
          setHasError(true);
          setTimeout(() => {
            if (isMounted.current) navigate(nextRoute);
          }, 1000);
        }
      }
    };

    // Handle video end
    const handleEnded = () => {
      console.log('Video ended, navigating to:', nextRoute);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (isMounted.current) navigate(nextRoute);
    };

    // Handle loading errors
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (isMounted.current) {
        setHasError(true);
        setTimeout(() => {
          if (isMounted.current) navigate(nextRoute);
        }, 1000);
      }
    };

    // Handle time updates to detect if video is actually playing
    const handleTimeUpdate = () => {
      if (!isPlaying && videoElement.currentTime > 0) {
        console.log('Video is playing (detected via timeupdate)');
        setIsPlaying(true);
      }
    };

    // Set up event listeners
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    // Force load the video
    try {
      videoElement.load();
    } catch (error) {
      console.error('Error loading video:', error);
    }

    // Clean up event listeners
    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [navigate, nextRoute]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="animate-pulse text-white">Loading...</div>
          </motion.div>
        )}

        {hasError && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="text-white text-xl">Error loading video</div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <video
        ref={videoRef}
        className="w-full h-auto max-h-screen object-contain"
        playsInline
        muted
        autoPlay
        controls={false}
        preload="auto"
        onEnded={() => navigate(nextRoute)}
      >
        <source src={videoSrc} type="video/quicktime" />
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
