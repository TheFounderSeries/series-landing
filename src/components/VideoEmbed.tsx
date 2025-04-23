import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const VIDEO_URL = 'https://qdcgqxijycvoetblfnji.supabase.co/storage/v1/object/sign/Video/Series%20Teaser%20Final.mov?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJWaWRlby9TZXJpZXMgVGVhc2VyIEZpbmFsLm1vdiIsImlhdCI6MTc0MjYyOTk1MywiZXhwIjoxNzc0MTY1OTUzfQ.tFbrF1KVUv1Xdj-AISz-PwJ256M8b5WBLwqTGXZZMDs';

interface VideoEmbedProps {
  videoUrl?: string;
}

export const VideoEmbed = ({ 
  videoUrl = VIDEO_URL
}: VideoEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    video.play().catch(console.warn);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative bg-black overflow-hidden group rounded-xl"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover bg-black rounded-xl"
        src={videoUrl}
        playsInline
        autoPlay
        muted={isMuted}
        loop
        controls={false}
      />
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 text-white"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};