import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const AudioPlayer = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const fadeInterval = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 7; // Increased retries
  const loadTimeout = useRef<number | null>(null);

  useEffect(() => {
    const setupAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      const audio = new Audio();
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audio.crossOrigin = 'anonymous';
      
      const handleCanPlay = () => {
        if (loadTimeout.current) {
          window.clearTimeout(loadTimeout.current);
          loadTimeout.current = null;
        }
        setIsLoaded(true);
        startPlayback(audio);
      };

      const handleError = (e: Event) => {
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000); // Cap at 10 seconds
          
          // Clean up current audio instance
          audio.pause();
          audio.src = '';
          audio.load();
          
          // Retry setup
          setTimeout(setupAudio, delay);
        }
      };

      const handleLoadTimeout = () => {
        handleError(new ErrorEvent('timeout'));
      };

      // Set a timeout for loading
      loadTimeout.current = window.setTimeout(handleLoadTimeout, 10000);

      audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
      audio.addEventListener('error', handleError);
      audio.addEventListener('stalled', handleError);
      audio.addEventListener('suspend', handleError);
      audio.addEventListener('abort', handleError);

      audio.src = 'https://jmp.sh/s/SksWrMDwzlbSv3xILslQ';
      audioRef.current = audio;

      return () => {
        if (loadTimeout.current) {
          window.clearTimeout(loadTimeout.current);
        }
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('progress', handleProgress);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('stalled', handleError);
        audio.removeEventListener('suspend', handleError);
        audio.removeEventListener('abort', handleError);
        audio.pause();
        audio.src = '';
      };
    };

    const startPlayback = async (audio: HTMLAudioElement) => {
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          startFade();
        }
      } catch (err) {
        console.error('Playback error:', err);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            console.log('Playback requires user interaction');
            return;
          }
          if (retryCount.current < maxRetries) {
            retryCount.current += 1;
            const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
            setTimeout(setupAudio, delay);
          }
        }
      }
    };

    const cleanup = setupAudio();
    return () => {
      cleanup();
      if (fadeInterval.current) {
        window.clearInterval(fadeInterval.current);
      }
      if (loadTimeout.current) {
        window.clearTimeout(loadTimeout.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const startFade = () => {
    if (!audioRef.current) return;
    
    let currentTime = 0;
    if (fadeInterval.current) {
      window.clearInterval(fadeInterval.current);
    }

    fadeInterval.current = window.setInterval(() => {
      currentTime += 100;
      let newVolume = 0;

      if (currentTime <= 5000) {
        newVolume = (currentTime / 5000) * 0.5;
      } else if (currentTime <= 10000) {
        newVolume = 0.5 + ((currentTime - 5000) / 5000) * 0.5;
      } else {
        newVolume = 1;
        if (fadeInterval.current) {
          window.clearInterval(fadeInterval.current);
        }
      }

      setVolume(newVolume);
      if (audioRef.current && !isMuted) {
        audioRef.current.volume = newVolume;
      }
    }, 100);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  if (!isLoaded) return null;

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
      aria-label={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-black/50" />
      ) : (
        <Volume2 className="w-5 h-5 text-black/50" />
      )}
    </button>
  );
};