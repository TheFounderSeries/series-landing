import { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  isVisible?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer = ({ videoId, isVisible = true }: YouTubePlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Load YouTube IFrame Player API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (playerRef.current && isInitialized.current) {
      if (isVisible) {
        try {
          playerRef.current.playVideo();
        } catch (error) {
          console.warn('Failed to play video:', error);
        }
      } else {
        try {
          playerRef.current.pauseVideo();
        } catch (error) {
          console.warn('Failed to pause video:', error);
        }
      }
    }
  }, [isVisible]);

  const initializePlayer = () => {
    if (!containerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 1,
        loop: 1,
        mute: 1,
        controls: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        playlist: videoId, // Required for looping
      },
      events: {
        onReady: (event: any) => {
          if (isVisible) {
            isInitialized.current = true;
            event.target.playVideo();
          }
        },
      },
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg overflow-hidden"
    />
  );
};