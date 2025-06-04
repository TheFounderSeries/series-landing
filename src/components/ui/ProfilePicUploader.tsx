import React, { useRef } from 'react';

interface ProfilePicUploaderProps {
  profilePic: string;
  onImageChange: (file: File) => void;
  error?: string;
  disabled?: boolean;
  isUploading?: boolean;
  height?: number;
}

const ProfilePicUploader: React.FC<ProfilePicUploaderProps> = ({
  profilePic,
  onImageChange,
  error,
  disabled = false,
  isUploading = false,
  height = 350
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        width: '100%',
        height: height,
        background: 'rgba(210, 210, 210, 0.85)',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      }}
    >
      {/* Background image */}
      {profilePic && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${profilePic})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backdropFilter: 'blur(2px)',
            backgroundColor: 'rgba(210, 210, 210, 0.85)',
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        />
      )}
      
      {/* Upload button - centered in the upper portion */}
      <div className="flex justify-center items-center absolute inset-0 z-10">
        <label 
          htmlFor="profile-photo-upload"
          className="flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:bg-opacity-80 hover:shadow-lg"
          style={{
            background: error ? '#FEF2F2' : '#D9D9D9',
            borderRadius: 24,
            width: 190,
            height: 40,
            fontFamily: 'SF Pro, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            color: error ? '#ef4444' : '#222',
            border: error ? '2px solid #ef4444' : '2px solid #AAAAAA',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
          }}
        >
          <div className="flex items-center justify-center w-full h-full">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={error ? "#ef4444" : "#222"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 16V6M12 6L7 11M12 6L17 11" />
                <line x1="8" y1="18" x2="16" y2="18" />
              </svg>
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </span>
          </div>
          <input
            id="profile-photo-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading || disabled}
          />
        </label>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-red-500 text-sm bg-white/80 px-2 py-1 rounded-md inline-block">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePicUploader;
