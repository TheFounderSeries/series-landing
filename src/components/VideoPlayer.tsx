import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenSize } from '../lib/useScreenSize';

interface VideoPlayerProps {
  onComplete: () => void;
  autoPlay?: boolean;
  src?: string;
}

const VideoPlayer = ({ 
  onComplete, 
  autoPlay = true,
  src: customSrc
}: VideoPlayerProps) => {
  const { isMobile } = useScreenSize();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Use the provided src or fall back to default based on screen size
  const videoSrc = customSrc || (isMobile ? '/loading_screen_mobile.mov' : '/loading_screen.mov');
  const fallbackTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      onComplete();
    };

    const handleError = () => {
      console.error('Video playback error');
      setHasError(true);
      // Fallback: if video fails, proceed after a short delay
      fallbackTimer.current = setTimeout(onComplete, 2000);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (autoPlay) {
        video.play().catch(error => {
          console.error('Autoplay failed:', error);
          handleError();
        });
      }
    };

    // Set up event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Force load the video
    try {
      video.load();
    } catch (error) {
      console.error('Error loading video:', error);
      handleError();
    }

    // Clean up
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onComplete, autoPlay]);

  if (hasError) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <p>Loading experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
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
      </AnimatePresence>

      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay={autoPlay}
        disablePictureInPicture
        disableRemotePlayback
      />
    </div>
  );
};

export default VideoPlayer;