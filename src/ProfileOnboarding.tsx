import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScreenSize } from './lib/useScreenSize';
import whiteGraphURL from './assets/group_icon.svg';
import groupIconURL from './assets/graph_icon.svg';


// Simple Card components since we can't import them
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
)

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

interface ProfileOnboardingProps {
  firstName?: string;
  lastName?: string;
  bio?: string;
  connections?: string[];
  color?: string;
  initialProfilePic?: string;
  location?: string;
  age?: number;
}

const ProfileOnboarding = ({
  firstName = '',
  lastName = '',
  bio = '',
  connections: initialConnections = [
    '',
    '',
    ''
  ],
  color = '',
  initialProfilePic = '/images/default-avatar.png',
  location = '',
  age = undefined,
}: ProfileOnboardingProps) => {
  // Get screen size information
  const { isMobile } = useScreenSize();
  const [name, setName] = useState('');
  const [description, setDescription] = useState(bio);
  const [connections, setConnections] = useState(initialConnections);
  const [userLocation, setUserLocation] = useState(location);
  const [userAge, setUserAge] = useState(age);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{
    name?: string;
    bio?: string;
    location?: string;
    age?: string;
    profilePic?: string;
    connections?: string[];
  }>({});
  
  // Modal visibility states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [profilePic, setProfilePic] = useState(initialProfilePic);
  const [isUploading, setIsUploading] = useState(false);
  const [processedImageId, setProcessedImageId] = useState<string | null>(null);
  const [userId, setUserId] = useState(''); // This should be set when user is created or logged in
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const slideVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
  };
  
  // We now support mobile devices, so we don't need to show the small screen message
  // Mobile-specific UI will be handled in the main component

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const styles = `
    /* Black selection styles */
    select:focus, input:focus, textarea:focus {
      border-color: #000 !important;
      --tw-ring-color: rgba(0, 0, 0, 0.5) !important;
      --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;
      --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;
      box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000) !important;
    }
    
    /* Make sure radio buttons and checkboxes use black */
    input[type="radio"]:checked {
      background-color: #000 !important;
      border-color: #000 !important;
    }
    
    input[type="checkbox"]:checked {
      background-color: #000 !important;
      border-color: #000 !important;
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e") !important;
    }
    
    /* Style the select dropdown arrow to be black */
    select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
      background-position: right 0.5rem center !important;
      background-repeat: no-repeat !important;
      background-size: 1.5em 1.5em !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Style for error states */
    .error-border {
      border-color: #ef4444 !important;
    }
    
    .error-text {
      color: #ef4444;
      font-size: 0.75rem;
      line-height: 1rem;
      margin-top: 0.25rem;
    }
    
    /* Custom shadow for mobile white textboxes and upload button */
    @media (max-width: 768px) {
      .series-shadow {
        border: 1px solid #E8E8E8 !important;
        box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.3) !important;
        font-style: normal !important;
      }
      .series-upload {
        border: 1px solid #222 !important;
      }
      .series-placeholder::placeholder {
        color: #A0A0A0 !important;
        font-weight: 400 !important;
        font-style: italic !important;
      }
      .series-input-regular {
        font-weight: 400 !important;
        font-style: normal !important;
      }
      .series-shadow:focus, .series-upload:focus {
        border-width: 0.2px !important;
      }
    }
  `;

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      bio?: string;
      location?: string;
      age?: string;
      profilePic?: string;
      connections?: string[];
    } = {};
    
    
    // Name validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Bio validation
    const trimmedBio = description.trim();
    if (!trimmedBio) {
      newErrors.bio = 'Bio is required';
    } else if (trimmedBio.length < 30) {
      newErrors.bio = 'Bio must be at least 30 characters';
    }
    
    // Only validate Age and Location on desktop
    if (!isMobile) {
      // Location validation
      const trimmedLocation = userLocation.trim();
      if (!trimmedLocation) {
        newErrors.location = 'Location is required';
      } else if (trimmedLocation.length < 2) {
        newErrors.location = 'Please enter a valid location';
      }
      
      // Age validation
      if (userAge === undefined || userAge === null) {
        newErrors.age = 'Age is required';
      } else if (isNaN(userAge) || userAge < 14 || userAge > 65) {
        newErrors.age = 'Age must be between 14 and 65';
      }
    }
    
    // Profile picture validation
    if (!profilePic || profilePic === initialProfilePic) {
      newErrors.profilePic = 'Profile picture is required';
    }
    
    const validConnections = connections.filter(conn => conn && conn.trim().length > 0);
    const invalidConnections: string[] = [];
    
    
    // Check each connection and provide specific error messages
    connections.forEach((conn, index) => {
      if (!conn.trim()) {
        invalidConnections[index] = 'This connection is required';
      } else if (conn.trim().length < 2) {
        invalidConnections[index] = 'Connection is too short';
      } else {
        invalidConnections[index] = '';
      }
    });
    
    // Check for minimum number of connections
    if (validConnections.length < 3) {
      const missingCount = 3 - validConnections.length;
      
      // Add the general message to the first empty or invalid connection
      let messageAdded = false;
      const updatedInvalidConnections = [...invalidConnections];
      
      for (let i = 0; i < updatedInvalidConnections.length; i++) {
        if (updatedInvalidConnections[i]) {
          const message = ` (${missingCount} more connection${missingCount > 1 ? 's' : ''} needed)`;
          updatedInvalidConnections[i] = updatedInvalidConnections[i] + (messageAdded ? '' : message);
          messageAdded = true;
        }
      }
      
      newErrors.connections = updatedInvalidConnections;
    } else {
      const connection_result = invalidConnections.filter(conn => conn !== '');
      if (connection_result.length > 0) {
        newErrors.connections = connection_result;
      }
    }
    
    setErrors(prev => {
      const updatedErrors = {
        ...prev,
        ...newErrors
      };
      return updatedErrors;
    });
    
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const searchUsersByBio = async (bio: string) => {
    try {
      const trimmedBio = bio.trim();
      
      // Skip check for empty or default bio
      if (!trimmedBio || 
          trimmedBio === "I'm new to Series! Looking forward to connecting with people and exploring opportunities.") {
        return [];
      }
      
      // Check if bio exists using the check-bio endpoint
      const url = `https://series-api-202642739529.us-central1.run.app/api/users/check-bio?bio=${encodeURIComponent(trimmedBio)}`;
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: url,
          timestamp: new Date().toISOString()
        };
        console.error('[Bio Check] API error:', errorDetails);
        throw new Error(`Bio check failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      const logData = {
        bio: trimmedBio,
        exists: result.exists,
        fullResponse: result,
        timestamp: new Date().toISOString()
      };
      
      // If bio exists, return a dummy user object, otherwise return empty array
      return result.exists ? [{ bio: trimmedBio }] : [];
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const bioPreview = typeof bio === 'string' ? bio.substring(0, 50) + (bio.length > 50 ? '...' : '') : 'N/A';
      
      console.error('Error in searchUsersByBio:', {
        error: errorMessage,
        bio: bioPreview
      });
      // If check fails, assume bio doesn't exist to be safe
      return [];
    }
  };

  const showError = (message: string) => {
    // Create a simple red alert for errors
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.backgroundColor = '#ff4444';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px 20px';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.zIndex = '1000';
    errorDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove the error after 3 seconds
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 3000);
  };

  // Helper function to show errors

  const handleButtonClick = async () => {
    // Set loading state at the beginning to prevent multiple clicks
    setIsLoading(true);
    
    // Validate form before submission
    if (!validateForm()) {
      console.log('Form validation failed');
      setIsLoading(false); // Reset loading state if validation fails
      return;
    } else {
      try {
        // First, check if a user with this bio already exists
        const existingUsers = await searchUsersByBio(description);
        
        if (existingUsers && existingUsers.length > 0) {
          showError('A user with this bio already exists. Please choose a different bio.');
          setIsLoading(false);
          return;
        }
        
        // Prepare user data
        const userData = {
          email: `${name.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 1000)}@series.placeholder`,
          name: {
            first: name.split(' ')[0],
            last: name.split(' ').slice(1).join(' ') || 'User'
          },
          groups: connections,
          bio: description,
          location: userLocation,
          age: userAge
        };
        
        // Create a new userData object with the profilePic property
        // Use the processed image URL if available, otherwise use the default
        const profilePicToUse = processedImageId 
          ? `https://series-api-202642739529.us-central1.run.app/api/files/${processedImageId}`  // MongoDB GridFS endpoint
          : (profilePic !== initialProfilePic ? profilePic : initialProfilePic);
        
        const userDataWithProfilePic = {
          ...userData,
          profilePic: profilePicToUse,
          color: backgroundColor // Add the background color to the user data
        };
        
        // Make API call to create user
        const response = await fetch('https://series-api-202642739529.us-central1.run.app/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userDataWithProfilePic)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          // If it's a duplicate error, show error message
          if (response.status === 400 && errorData.detail?.includes('already exists')) {
            showError('A user with this information already exists');
            setIsLoading(false);
            return;
          }
          
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        
        // Set the userId in state
        setUserId(result.userId);
        
        // If we have a processed image ID, we need to update the user's profile with it
        if (processedImageId) {
          try {
            await fetch('https://series-api-202642739529.us-central1.run.app/api/users/update-profile-pic', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                user_id: result.userId,
                image_url: `https://series-api-202642739529.us-central1.run.app/api/files/${processedImageId}`
              })
            });
          } catch (error) {
            console.error('Error updating profile picture:', error);
            // Continue with user creation even if profile pic update fails
          }
        }
        
        // IMPORTANT: There might be a timing issue with the state update
        // Use result.userId directly for navigation to ensure the correct value is passed
        const userIdToPass = result.userId || userId;
        
        // Wait a short time to show the loading screen before navigating
        setTimeout(() => {
          // Navigate to the questionnaire page
          navigate('/join/2', { state: { bio: description, userId: userIdToPass } });
        }, 2000); // 2 seconds delay to show loading screen
        
      } catch (error) {
        console.error('Error in handleButtonClick:', error);
        showError('An error occurred. Please try again.');
        setIsLoading(false);
      }
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Generate a random color once when the component mounts
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const [backgroundColor, setBackgroundColor] = React.useState<string>('');
  
  React.useEffect(() => {
    if (isMounted) {
      const colors: string[] = ['#4ecdc4', '#95a5a6', '#ffd93d', '#ff6b6b'];
      const randomIndex = Math.floor(Math.random() * colors.length);
      setBackgroundColor(colors[randomIndex]);
    }
  }, [isMounted]); // Empty dependency array means this runs once on mount
  
  const getBackgroundColor = (color: string) => {
    return backgroundColor || '#95a5a6'; // Default color if not set yet
  };
  
  // Handle photo upload
  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Clear any existing profile picture error when a new file is selected
    if (errors.profilePic) {
      setErrors({...errors, profilePic: undefined});
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size should be less than 5MB');
      return;
    }

    // Create a local URL for the image to display in the UI
    const localImageUrl = URL.createObjectURL(file);
    setProfilePic(localImageUrl);
    setIsUploading(true);
    
    try {
      // Upload the image to the server for processing
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('https://series-api-202642739529.us-central1.run.app/api/users/upload-photo', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Upload error:', {
          status: response.status,
          statusText: response.statusText,
          error: result
        });
        
        let errorMessage = 'Failed to upload image';
        if (response.status === 422) {
          errorMessage = 'Invalid image format. Please try another image.';
        } else if (result.error) {
          errorMessage = result.error;
        }
        
        throw new Error(errorMessage);
      }
      
      // Save the processed image ID for later use
      if (result.success && result.image_url) {
        // The image_url is now a GridFS file ID
        setProcessedImageId(result.image_url);
        
        // Store the image ID and update the profile pic with the direct URL
        setProcessedImageId(result.image_url);
        const fileUrl = `https://series-api-202642739529.us-central1.run.app/api/users/files/${result.image_url}`;
        setProfilePic(fileUrl);
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      showError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
      // Revert to default image on error
      setProfilePic(initialProfilePic);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add the styles to the document head
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-auto">
      {isMobile ? (
        // Mobile layout: rectangle matches Figma color, size, and border radius, positioned higher, and about 5% longer, with a black button below
        <div className="w-full px-2.5 flex min-h-screen flex-col items-center justify-start pt-8">
          <div
            className="bg-[#F2F2F7] relative mx-auto"
            style={{
              width: '100%',
              maxWidth: 360,
              height: '100vh',
              maxHeight: 900,
              borderRadius: 15,
              paddingBottom: 10,
              paddingTop: 2.5,
            }}
          >
            {/* Grey rectangle overlay with blur, only top corners rounded */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '50%', // 367/654 ≈ 0.56
                background: '#D2D2D2',
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                boxShadow: '0 0 80px 32px rgba(180,180,180,0.35)',
                zIndex: 1,
              }}
            >
              {/* Profile image background */}
              {(isMobile && profilePic === initialProfilePic) ? null : (
                <img
                  src={profilePic}
                  alt={isMobile ? "" : "Profile background"}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 1
                  }}
                />
              )}
              {/* Upload button */}
              <label 
                htmlFor="profile-photo-upload"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '29%',
                  transform: 'translate(-50%, -50%)',
                  background: errors.profilePic ? '#FEF2F2' : '#D9D9D9',
                  borderRadius: 24,
                  minWidth: 190,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'SF Pro Semibold, SF Pro, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: 0.1,
                  color: errors.profilePic ? '#ef4444' : '#222',
                  cursor: 'pointer',
                  zIndex: 2,
                  border: errors.profilePic ? '2px solid #ef4444' : 'none',
                  transition: 'all 0.2s',
                }}
                className={isMobile ? 'series-shadow series-upload' : ''}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 8}}>
                  <path d="M12 16V6M12 6L7 11M12 6L17 11" stroke={errors.profilePic ? "#ef4444" : "#222"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="18" x2="16" y2="18" stroke={errors.profilePic ? "#ef4444" : "#222"} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Upload
                <input
                  id="profile-photo-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={isLoading}
                />
              </label>

              {/* Graph and Join buttons row */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 24,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 20,
                  zIndex: 2,
                }}
              > 
                      <button
                  className="bg-[#A9A9A9] flex flex-col items-center justify-center rounded-2xl shadow-md"
                  style={{ width: 70, height: 60, padding: 0, border: 'none' }}
                  onClick={() => setShowGraphModal(true)}
                >
                  <img src={groupIconURL} alt="graph icon" width={30} height={25} />
                  <span className="text-[14px] text-white font-medium font-['SF_Pro_Medium','SF_Pro',system-ui,sans-serif] tracking-tight mt-.5">graph</span>
                      </button>
                  <button
                  className="bg-[#A9A9A9] flex flex-col items-center justify-center rounded-2xl shadow-md"  
                  style={{ width: 70, height: 60, border: 'none'}}
                  onClick={() => setShowJoinModal(true)}
                >
                  <img src={whiteGraphURL} alt="join icon" width={40} height={32} />
                  <span className="text-[14px] text-white font-medium font-['SF_Pro_Medium','SF_Pro',system-ui,sans-serif] tracking-tight mb-1 -mt-1">join</span>
                  </button>
              </div>
            </div>
            {/* first White rectangle in the bottom half of the profile card */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '52.5%',
                transform: 'translateX(-50%)',
                width: 350,
                height: 55,
                background: '#fff',
                borderRadius: 11,
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexDirection: 'row',
                paddingLeft: 12,
                paddingRight: 12,
                gap: 10,
              }}
            >
             <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: getBackgroundColor(color), // <-- use the same function as desktop
                  flexShrink: 0,
                }}
              />
              <div className="relative w-full">
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    // Clear error when user starts typing
                    if (errors.name) {
                      setErrors({...errors, name: undefined});
                    }
                  }}
                  placeholder="John Stuart"
                  className={`${isMobile ? 'series-shadow series-placeholder' : ''}`}
                  style={{
                    width: 282,
                    height: 32,
                    borderRadius: 8,
                    fontFamily: 'SF Pro, SF Pro Text, SF Pro Display, SF Pro Light, system-ui, sans-serif',
                    fontWeight: 400,
                    fontSize: 13,
                    paddingLeft: 10,
                    outline: 'none',
                    color: '#222',
                    transition: 'all 0.2s',
                    border: errors.name ? '2px solid #ef4444' : '1px solid #ccc',
                    backgroundColor: errors.name ? '#FEF2F2' : 'white',
                  }}
                  onFocus={e => {
                    if (!errors.name) {
                      e.target.style.borderWidth = '0.5px';
                    }
                  }}
                  onBlur={e => {
                    if (!errors.name) {
                      e.target.style.borderWidth = '1px';
                    }
                  }}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 absolute">{errors.name}</p>
                )}
              </div>
            </div>
            {/* second White rectangle in the bottom half of the profile card */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '61.5%',
                transform: 'translateX(-50%)',
                width: 350,
                height: 90,
                background: '#fff',
                borderRadius: 10,
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingLeft: 18,
                paddingRight: 18,
                paddingTop: 7,
                paddingBottom: 7,
                gap: 2,
              }}
            >
              <span style={{ color: '#111', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Me</span>
              <div className="relative w-full">
                <input
                  type="text"
                  value={description}
                  onChange={e => {
                    setDescription(e.target.value);
                    // Clear error when user starts typing
                    if (errors.bio) {
                      setErrors({...errors, bio: undefined});
                    }
                  }}
                  placeholder="student @Columbia building fintech startup"
                  className={`${isMobile ? 'series-shadow series-placeholder' : ''}`}
                  style={{
                    width: 315,
                    height: 32,
                    borderRadius: 8,
                    fontFamily: 'SF Pro, SF Pro Text, SF Pro Display, SF Pro Light, system-ui, sans-serif',
                    fontWeight: 400,
                    fontSize: 13,
                    paddingLeft: 10,
                    outline: 'none',
                    color: '#222',
                    transition: 'all 0.2s',
                    border: errors.bio ? '2px solid #ef4444' : '1px solid #ccc',
                    backgroundColor: errors.bio ? '#FEF2F2' : 'white',
                  }}
                  onFocus={e => {
                    if (!errors.bio) {
                      e.target.style.borderWidth = '0.5px';
                    }
                  }}
                  onBlur={e => {
                    if (!errors.bio) {
                      e.target.style.borderWidth = '1px';
                    }
                  }}
                  disabled={isLoading}
                />
                {errors.bio && (
                  <p className="mt-1 text-xs text-red-600 absolute">{errors.bio}</p>
                )}
              </div>
            </div>
            {/*third White rectangle in the bottom half of the profile card */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '75%',
                transform: 'translateX(-50%)',
                width: 350,
                height: 180,
                background: '#fff',
                borderRadius: 11,
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: 14,
                gap: 6,
                marginBottom: 24,
              }}
            >
              <span style={{ color: '#111', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Who I know</span>
              <div className="relative w-full mb-2">
                <input  
                  type="text"
                  value={connections[0]}
                  onChange={e => {
                    setConnections([e.target.value, connections[1], connections[2]]);
                    // Clear error when user starts typing
                    if (errors.connections && errors.connections[0]) {
                      const newConnectionErrors = [...(errors.connections || [])];
                      newConnectionErrors[0] = '';
                      setErrors({...errors, connections: newConnectionErrors.filter(e => e !== '')});
                    }
                  }}
                  placeholder="the founders of Prod"
                  className={`${isMobile ? 'series-shadow series-placeholder' : ''}`}
                  style={{
                    width: 315,
                    height: 28,
                    borderRadius: 8,
                    fontFamily: 'SF Pro, SF Pro Text, SF Pro Display, SF Pro Light, system-ui, sans-serif',
                    fontWeight: 400,
                    fontSize: 13,
                    paddingLeft: 10,
                    outline: 'none',
                    color: '#222',
                    marginBottom: 2,
                    transition: 'all 0.2s',
                    border: errors.connections && errors.connections[0] ? '2px solid #ef4444' : '1px solid #ccc',
                    backgroundColor: errors.connections && errors.connections[0] ? '#FEF2F2' : 'white',
                  }}
                  onFocus={e => {
                    if (!errors.connections || !errors.connections[0]) {
                      e.target.style.borderWidth = '0.5px';
                    }
                  }}
                  onBlur={e => {
                    if (!errors.connections || !errors.connections[0]) {
                      e.target.style.borderWidth = '1px';
                    }
                  }}
                  disabled={isLoading}
                />
                {errors.connections && errors.connections[0] && (
                  <p className="text-xs text-red-600 absolute">{errors.connections[0]}</p>
                )}
              </div>
              <div className="relative w-full mb-2">
                <input
                  type="text"
                  value={connections[1]}
                  onChange={e => {
                    setConnections([connections[0], e.target.value, connections[2]]);
                    // Clear error when user starts typing
                    if (errors.connections && errors.connections[1]) {
                      const newConnectionErrors = [...(errors.connections || [])];
                      newConnectionErrors[1] = '';
                      setErrors({...errors, connections: newConnectionErrors.filter(e => e !== '')});
                    }
                  }}
                  placeholder="engineers at Georgia Tech building Fintech"
                  className={`${isMobile ? 'series-shadow series-placeholder' : ''}`}
                  style={{
                    width: 315,
                    height: 28,
                    borderRadius: 8,
                    fontFamily: 'SF Pro, SF Pro Text, SF Pro Display, SF Pro Light, system-ui, sans-serif',
                    fontWeight: 400,
                    fontSize: 13,
                    paddingLeft: 10,
                    outline: 'none',
                    color: '#222',
                    marginBottom: 2,
                    transition: 'all 0.2s',
                    border: errors.connections && errors.connections[1] ? '2px solid #ef4444' : '1px solid #ccc',
                    backgroundColor: errors.connections && errors.connections[1] ? '#FEF2F2' : 'white',
                  }}
                  onFocus={e => {
                    if (!errors.connections || !errors.connections[1]) {
                      e.target.style.borderWidth = '0.5px';
                    }
                  }}
                  onBlur={e => {
                    if (!errors.connections || !errors.connections[1]) {
                      e.target.style.borderWidth = '1px';
                    }
                  }}
                  disabled={isLoading}
                />
                {errors.connections && errors.connections[1] && (
                  <p className="text-xs text-red-600 absolute">{errors.connections[1]}</p>
                )}
              </div>
              <div className="relative w-full mb-2">
                <input
                  type="text"
                  value={connections[2]}
                  onChange={e => {
                    setConnections([connections[0], connections[1], e.target.value]);
                    // Clear error when user starts typing
                    if (errors.connections && errors.connections[2]) {
                      const newConnectionErrors = [...(errors.connections || [])];
                      newConnectionErrors[2] = '';
                      setErrors({...errors, connections: newConnectionErrors.filter(e => e !== '')});
                    }
                  }}
                  placeholder="friends and family investors"
                  className={`${isMobile ? 'series-shadow series-placeholder' : ''}`}
                  style={{
                    width: 315,
                    height: 28,
                    borderRadius: 8,
                    fontFamily: 'SF Pro, SF Pro Text, SF Pro Display, SF Pro Light, system-ui, sans-serif',
                    fontWeight: 400,
                    fontSize: 13,
                    paddingLeft: 10,
                    outline: 'none',
                    color: '#222',
                    marginBottom: 2,
                    transition: 'all 0.2s',
                    border: errors.connections && errors.connections[2] ? '2px solid #ef4444' : '1px solid #ccc',
                    backgroundColor: errors.connections && errors.connections[2] ? '#FEF2F2' : 'white',
                  }}
                  onFocus={e => {
                    if (!errors.connections || !errors.connections[2]) {
                      e.target.style.borderWidth = '0.5px';
                    }
                  }}
                  onBlur={e => {
                    if (!errors.connections || !errors.connections[2]) {
                      e.target.style.borderWidth = '1px';
                    }
                  }}
                  disabled={isLoading}
                />
                {errors.connections && errors.connections[2] && (
                  <p className="text-xs text-red-600 absolute">{errors.connections[2]}</p>
                )}
              </div>
            </div>
            {/* Spacer to add gap at the bottom of the card */}
            <div style={{ height: 24 }} />
          </div>
          <div className="w-full flex justify-center mt-12 mb-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  className="fixed inset-0 flex items-center justify-center bg-white z-40"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <div className="flex items-center">
                    <motion.span
                      className="text-[10rem] font-bold leading-none inline-block relative"
                    >
                      S
                    </motion.span>
                    <motion.div
                      className="w-20 h-4 overflow-hidden ml-4 relative -bottom-12"
                      initial={{ scaleX: 0 }}
                      animate={{ 
                        scaleX: 1,
                        transformOrigin: 'left center',
                      }}
                      transition={{ 
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity, 
                        repeatType: "loop"
                      }}
                    >
                      <motion.div 
                        className="h-full bg-black absolute top-0 left-0"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ 
                          duration: 3,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <button
                  className={`${isLoading ? 'bg-gray-400' : 'bg-black hover:bg-black/80'} text-white rounded-full flex items-center justify-center transition-colors`}
                  style={{ width: 120, height: 48 }}
                  onClick={!isLoading ? handleButtonClick : undefined}
                  disabled={isLoading}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" stroke="white" />
                  </svg>
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        // Desktop layout
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 relative h-[calc(100vh-120px)] max-h-screen overflow-y-hidden">
        {/* Left side - Profile Card */}
        <motion.div 
          className="w-full md:w-96 bg-gray-200 p-0 rounded-3xl flex flex-col h-fit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ marginBottom: '2px' }}
        >
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm flex-shrink-0">
            {/* Profile image */}
            <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-3xl">
              <img 
                src={profilePic}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover object-center filter rounded-3xl"
              />
              
              {/* Apple-style modals */}
              <AnimatePresence>
                {showJoinModal && (
                  <motion.div 
                    className="fixed inset-0 z-50 flex items-center justify-center shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setShowJoinModal(false)}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-black/60"
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div 
                      className="relative bg-white/95 backdrop-blur-md rounded-2xl py-4 px-2 max-w-xs w-[80%] mx-auto shadow-xl"
                      initial={{ scale: 0.95, y: 10, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.95, y: 10, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center">
                        <p className="text-lg font-semibold mb-2 font-['SF_Pro','SF_Pro',system-ui,sans-serif]">"Graph" predicts the <br></br>types of people in your <br></br>warm network</p>
                        <hr className="border-t border-gray-200 w-full mt-4" />
                        <button 
                          className="w-full mt-2 text-center text-blue-500 font-medium text-lg font-['SF_Pro','SF_Pro',system-ui,sans-serif]"
                          onClick={() => setShowJoinModal(false)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
                
                {showGraphModal && (
                  <motion.div 
                    className="fixed inset-0 z-50 flex items-center justify-center shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setShowGraphModal(false)}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-black/60"
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div 
                      className="relative bg-white/95 backdrop-blur-md rounded-2xl py-4 px-2 max-w-xs w-[90%] mx-auto shadow-xl"
                      initial={{ scale: 0.95, y: 10, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.95, y: 10, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center">
                        <p className="text-lg font-semibold mb-2 font-['SF_Pro','SF_Pro',system-ui,sans-serif]">"Join" allows someone<br></br> not on Series to join an <br></br>existing groupchat</p>
                        <hr className="border-t border-gray-200 w-full mt-4" />
                        <button 
                          className="w-full mt-2 text-center text-blue-500 font-medium text-lg font-['SF_Pro','SF_Pro',system-ui,sans-serif]"
                          onClick={() => setShowGraphModal(false)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 16,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 20,
                  zIndex: 2,
                }}
              >
                <button
                  className="bg-black/50 backdrop-blur-sm pl-4 pr-4 pb-1.5 pt-2 rounded-xl shadow-md hover:bg-black/70 hover:backdrop-blur transition-all duration-200 flex flex-col items-center w-[56px] h-[56px]"
                  onClick={() => setShowJoinModal(true)}
                  style={{ border: 'none' }}
                >
                  <img src={groupIconURL} alt="graph icon" width={40} height={32} />
                  <span className="text-[12px] mt-1 text-white font-medium font-['SF_Pro_Medium','SF_Pro',system-ui,sans-serif] tracking-tight">graph</span>
                </button>
                <button
                  className="bg-black/50 backdrop-blur-sm pl-4 pr-4 pb-1.5 pt-2 rounded-xl shadow-md hover:bg-black/70 hover:backdrop-blur transition-all duration-200 flex flex-col items-center w-[56px] h-[56px]"
                  onClick={() => setShowGraphModal(true)}
                  style={{ border: 'none' }}
                >
                  <img src={whiteGraphURL} alt="join icon" width={40} height={32} />
                  <span className="text-[12px] mt-1 text-white font-medium font-['SF_Pro_Medium','SF_Pro',system-ui,sans-serif] tracking-tight">join</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Profile info */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-6 px-3 pb-3 font-['SF_Pro_Medium','SF_Pro',system-ui,sans-serif] tracking-tight"
          >
            {/* Name card */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <motion.div variants={item} className="flex items-center">
                  <div 
                    style={{ backgroundColor: getBackgroundColor(color) }} 
                    className="h-10 w-10 rounded-full mr-3 flex-shrink-0"
                  />
                  <div>
                    <h2 className="font-medium text-gray-900 font-['SF_Pro_Medium','SF_Pro',system-ui,sans-serif] tracking-tight">{name}</h2>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
            
            {/* Bio card */}
            <Card className="mb-4">
              <CardContent className="p-6">
                <motion.div variants={item}>
                  <h3 className="font-medium text-sm mb-1 text-gray-900 font-['SF_Pro_Medium','SF_Pro',system-ui,sans-serif] tracking-tight">Me</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-['SF_Pro_Text','SF_Pro',system-ui,sans-serif] tracking-tight">{description}</p>
                </motion.div>
              </CardContent>
            </Card>
            
            {/* Connections card */}
            <Card className="flex-shrink-0">
              <CardContent className="p-6 pb-4 !mb-[-2px]">
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1.5 text-gray-900 font-['SF_Pro_Medium','SF_Pro',system-ui,sans-serif] tracking-tight">Who I Know</h3>
                  <ul className="space-y-1">
                    {connections.map((connection, index) => (
                      <li key={index} className="flex">
                        <span className="text-xs text-gray mr-2 flex-shrink0">.</span>
                        <span className="text-sm mr-1 text-gray-400 break-words flex-1 font-['SF_Pro_Text','SF_Pro',system-ui,sans-serif] tracking-tight">{connection}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Right side - Form */}
        <motion.div 
          className="flex-1 flex flex-col px-12 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-xl mx-auto w-full space-y-6 flex-1 flex flex-col">
            {/* Name and Picture on the same line */}
            <div className="mb-5">
              <div className="flex gap-8">
                {/* Name field - 65% width */}
                <div className="w-[65%]">
                  <div className="flex items-center gap-2 mb-3">
                    <label className="block text-2xl font-medium text-gray-900">Name</label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      onChange={(e) => {
                        setName(e.target.value);
                        // Clear error when user starts typing
                        if (errors.name) {
                          setErrors({...errors, name: undefined});
                        }
                      }}
                      className={`block w-full rounded-2xl border-2 ${errors.name ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 placeholder:italic placeholder:font-light placeholder-[\'SF_Pro\',system-ui,sans-serif] placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
                      placeholder="John Doe"
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>
                
                {/* Profile Picture Upload Box - 35% width */}
                <div className="w-[35%] flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <label className={`block text-2xl font-medium text-gray-900`}>Profile</label>
                  </div>
                  <label 
                    htmlFor="profile-photo-upload"
                    className={`group flex items-center justify-center h-[58px] ${errors.profilePic ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-300 hover:bg-gray-500'} transition-colors cursor-pointer rounded-2xl shadow-lg`}
                    title="Upload new photo"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 group-hover:text-white transition-colors">Upload</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                    <input
                      id="profile-photo-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isLoading}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* ID Card and Location on same line */}
            <div className="flex gap-8 mt-8 mb-8">
              {/* Age field */}
              <div className="w-[25%]">
                <div className="flex items-center gap-2 mb-3">
                  <label className={`block text-2xl font-medium ${errors.age ? 'text-red-600' : 'text-gray-900'}`}>Age</label>
                </div>
                <div className="relative inline-block w-full">
                  {isMobile ? (
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        setUserAge(parseInt(e.target.value));
                        if (errors.age) {
                          setErrors({ ...errors, age: undefined });
                        }
                      }}
                      className={`block w-full appearance-none rounded-2xl border-2 ${errors.age ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 placeholder:italic placeholder:font-light placeholder-[\'SF_Pro\',system-ui,sans-serif] placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
                      disabled={isLoading}
                    >
                      <option value="" disabled hidden></option>
                      {Array.from({ length: 52 }, (_, i) => i + 14).map(age => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        setUserAge(parseInt(e.target.value));
                        if (errors.age) {
                          setErrors({ ...errors, age: undefined });
                        }
                      }}
                      className={`block w-full appearance-none rounded-2xl border-2 ${errors.age ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 placeholder:italic placeholder:font-light placeholder-[\'SF_Pro\',system-ui,sans-serif] placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
                      disabled={isLoading}
                    >
                      <option value="" disabled>Select age</option>
                      {Array.from({ length: 52 }, (_, i) => i + 14).map(age => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  )}
                  {errors.age && (
                    <p className="mt-1 text-xs text-red-600">{errors.age}</p>
                  )}
                </div>
              </div>
              
              {/* Location field */}
              <div className="w-[75%]">
                <div className="flex items-center gap-2 mb-3">
                  <label className="block text-2xl font-medium text-gray-900">Location</label>
                </div>
                <div className="relative w-full">
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => {
                      setUserLocation(e.target.value);
                      if (errors.location) {
                        setErrors({...errors, location: undefined});
                      }
                    }}
                    className={`block w-full rounded-2xl border-2 ${errors.location ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 placeholder:italic placeholder:font-light placeholder-[\'SF_Pro\',system-ui,sans-serif] placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
                    placeholder="New York, New York, USA"
                    disabled={isLoading}
                  />
                  {errors.location && (
                    <p className="mt-1 text-xs text-red-600">{errors.location}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bio field */}
            <div className="space-y-2 mt-10">
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-2xl font-medium text-gray-900">Who you are and what you do</label>
              </div>
              <div className="relative">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.bio) {
                        setErrors(prev => ({ ...prev, bio: '' }));
                      }
                    }}
                    className={`block w-full rounded-2xl border-2 ${errors.bio ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 placeholder:italic placeholder:font-light placeholder-[\'SF_Pro\',system-ui,sans-serif] placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200 resize-none`}
                    placeholder="studying AI and machine learning @ UCLA and building in healthtech"
                    disabled={isLoading}
                  />
                  {errors.bio && (
                    <p className="mt-1 text-xs text-red-600">{errors.bio}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Connections field with add/remove buttons */}
            <div className="space-y-8 mt-8 mb-10">
              <div className="flex items-center gap-2">
                <label className="block text-2xl font-medium text-gray-900">Who you know</label>
              </div>
              <div className="space-y-2">
                {connections.map((connection, index) => (
                  <div key={index} className="relative">
                    <textarea
                      rows={2}
                      value={connection}
                      onChange={(e) => {
                        const updatedConnections = [...connections];
                        updatedConnections[index] = e.target.value;
                        setConnections(updatedConnections);
                        // Clear error for this connection when typing
                        if (errors.connections?.[index]) {
                          const newErrors = { ...errors };
                          if (newErrors.connections) {
                            newErrors.connections = [...newErrors.connections];
                            newErrors.connections[index] = '';
                            setErrors(newErrors);
                          }
                        }
                      }}
                      className={`block w-full rounded-xl border-2 ${errors.connections?.[index] ? 'border-red-500' : 'border-gray-200'} shadow-lg px-4 py-3 text-gray-900 placeholder:italic placeholder:font-light placeholder-[\'SF_Pro\',system-ui,sans-serif] placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
                      placeholder={
                        index === 0 ? "full-stack engineers based in Georgia" :
                        index === 1 ? "college athletes from universities in New Jersey" :
                        "the founders of Prod"
                      }
                      disabled={isLoading}
                    />
                    {connections.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedConnections = [...connections];
                          updatedConnections.splice(index, 1);
                          setConnections(updatedConnections);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                        disabled={isLoading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {connections.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setConnections([...connections, ''])}
                    className="mt-2 flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add another group of people you know
                  </button>
                )}
              </div>
            </div>
            
            {/* Next button */}
            <div className="mt-auto pt-4 flex justify-center">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    className="fixed inset-0 flex items-center justify-center bg-white z-40"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <div className="flex items-center">
                      <motion.span
                        className="text-[12rem] font-bold leading-none inline-block relative"
                        animate={{  
                          scale: [1, 1.1],
                        }}
                        transition={{ 
                          duration: 5,
                          ease: "easeInOut"
                        }}
                      >
                        S
                      </motion.span>
                      <motion.div
                        className="w-20 h-4 bg-black/20 overflow-hidden ml-4 relative -bottom-12"
                        initial={{ scaleX: 0 }}
                        animate={{ 
                          scaleX: 1,
                          transformOrigin: 'left center',
                        }}
                        transition={{ 
                          duration: 5,
                          ease: "easeInOut"
                        }}
                      >
                        <motion.div 
                          className="h-full bg-black absolute top-0 left-0"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ 
                            duration: 5,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="button"
                    className={`${isLoading ? 'bg-gray-400' : 'bg-black hover:bg-black/80'} text-white rounded-full p-3 w-24 h-9 inline-flex items-center justify-center transition-colors`}
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                    whileHover={!isLoading ? { scale: 1.05 } : {}}
                    whileTap={!isLoading ? { scale: 0.95 } : {}}
                    onClick={!isLoading ? handleButtonClick : undefined}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </div>
  );
};

export default ProfileOnboarding;
