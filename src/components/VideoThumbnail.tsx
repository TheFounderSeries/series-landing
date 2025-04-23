import { Play } from 'lucide-react';

interface VideoThumbnailProps {
  videoUrl: string;
}

export const VideoThumbnail = ({ videoUrl }: VideoThumbnailProps) => {
  return (
    <a 
      href={videoUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative block w-full h-full overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
      
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
          <Play className="w-8 h-8 text-black ml-1" />
        </div>
      </div>

      <img
        src="https://stackblitz.com/storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMHlwVXc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--170b02c2cf39ddaa0ff31eafc771e39e8ec059ce/seriesfav.jpeg"
        alt="Video Thumbnail"
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
      />
    </a>
  );
};