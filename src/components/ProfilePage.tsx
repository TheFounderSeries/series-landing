import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenSize } from '../lib/useScreenSize';
import whiteGraphURL from '../assets/graph_icon.svg';
import groupIconURL from '../assets/group_icon.svg';

// Dummy data and assets
const initialProfilePic = '/images/default-avatar.png';

interface ProfilePageProps {
  initialData?: {
    name?: string;
    bio?: string;
    connections?: string[];
    enhanceWithAI?: boolean;
    profilePic?: string;
    location?: string;
    age?: number;
  };
  onSubmit: (data: any) => void;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  initialData = {}, 
  onSubmit 
  // onBack is not used but kept in the props interface for future use
}) => {
  const { isMobile } = useScreenSize();
  const [isLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state with dummy defaults
  
  // Initialize firstName and lastName from name if it exists
  const nameParts = (initialData.name || '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [userAge, setUserAge] = useState<number | undefined>(initialData.age);
  const [userLocation, setUserLocation] = useState(initialData.location || '');
  const [description, setDescription] = useState(initialData.bio || '');
  const [connections, setConnections] = useState(initialData.connections || ['', '', '']);
  const [enhanceWithAI, setEnhanceWithAI] = useState(initialData.enhanceWithAI !== false);
  const [profilePic, setProfilePic] = useState(initialData.profilePic || initialProfilePic);
  // Color is used in the getBackgroundColor function
  const [color] = useState(Math.floor(Math.random() * 5)); // Random color for avatar
  
  // UI state
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  // State to track if an image is being uploaded
  const [isUploading, setIsUploading] = useState(false);
  
  // Helper function to show error messages
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

  // Error state
  const [errors, setErrors] = useState<{
    name?: string;
    firstName?: string;
    lastName?: string;
    age?: string;
    location?: string;
    bio?: string;
    profilePic?: string;
    connections?: string[];
  }>({});

  // Handle photo upload with server processing
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Update the profile picture with the server URL
      if (result.success && result.image_url) {
        const fileUrl = `https://series-api-202642739529.us-central1.run.app/api/users/files/${result.image_url}`;
        setProfilePic(fileUrl);
        
        // Clear any previous errors
        if (errors.profilePic) {
          setErrors({ ...errors, profilePic: undefined });
        }
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

  // Form validation function
  const validateForm = () => {
    // Reset errors
    setErrors({});
    
    // Validation
    let newErrors: any = {};
    let hasErrors = false;
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      hasErrors = true;
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      hasErrors = true;
    }
    
    // Age validation
    if (!userAge) {
      newErrors.age = 'Age is required';
      hasErrors = true;
    } else if (isNaN(userAge) || userAge < 14 || userAge > 65) {
      newErrors.age = 'Please enter a valid age between 14 and 65';
      hasErrors = true;
    }
    
    // Location validation
    if (!userLocation.trim()) {
      newErrors.location = 'Location is required';
      hasErrors = true;
    }
    

    // Profile picture validation
    if (profilePic === initialProfilePic) {
      newErrors.profilePic = 'Profile picture is required';
      hasErrors = true;
    }

    if (!description.trim()) {
      newErrors.bio = 'Please tell us about yourself';
      hasErrors = true;
    } else if (description.trim().length < 30) {
      newErrors.bio = 'Please write at least 30 characters about yourself';
      hasErrors = true;
    }
    
    // Check connections
    const connectionErrors = connections.map((connection) => {
      if (!connection.trim()) {
        hasErrors = true;
        return 'Please add someone you know';
      } else if (connection.trim().length < 10) {
        hasErrors = true;
        return 'Please enter at least 10 characters';
      }
      return '';
    });
    
    if (hasErrors) {
      newErrors.connections = connectionErrors;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simplified form submission with dummy backend
  const handleSubmit = () => {
    if (validateForm()) {
      // Prepare data for submission
      const profileData = {
        // Format name as an object with first and last name
        name: {"first": firstName, "last": lastName},
        // Pass age as a number
        age: userAge,
        // Pass location as a string
        location: userLocation,
        // Pass bio as a string
        bio: description,
        // Filter out empty connections and pass as groups array
        groups: connections.filter(c => c.trim()),
        // These fields are used by the UI but not sent to the backend
        enhanceWithAI,
        profilePic: profilePic,
        colorIndex: color, // Pass the color index for the background color
        color: getBackgroundColor(color) // Pass the actual color value as well
      };

      onSubmit(profileData);
    }
  };

  const handleButtonClick = () => {
    handleSubmit();
  };

  // Helper function for avatar background color
  const getBackgroundColor = (colorIndex: number) => {
    const colors = ['#FFD700', '#FF6347', '#4682B4', '#32CD32', '#9370DB'];
    return colors[colorIndex % colors.length];
  };
  
  const slideVariants = {
    enter: { x: '100%' },
    center: { x: 0 },
    exit: { x: '-100%' }
  };
  
  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full max-w-2xl mx-auto overflow-hidden">
        <motion.h1 
          className="text-4xl font-medium text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ fontFamily: 'SF Pro, system-ui, sans-serif' }}
        >
          Let's make your profile.
        </motion.h1>
        <motion.p 
          className="text-center text-gray-500 mt-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontFamily: 'SF Pro, system-ui, sans-serif' }}
        >
          Tell your AI friend who you are and who you know.
        </motion.p>

        <div
          className="bg-[#F2F2F7] mx-auto flex flex-col overflow-auto"
          style={{
            width: '100%',
            maxWidth: 460,
            borderRadius: 15,
            paddingBottom: 20,
          }}
        >
            {/* Gray box with rounded top corners */}
            <div
              className="relative flex flex-col items-center overflow-hidden"
              style={{
                width: '100%',
                height: 350, // Reduced height for the header section
                background: 'rgba(210, 210, 210, 0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
              }}
            >
              {/* Background image */}
              {profilePic && profilePic !== initialProfilePic && (
                <div 
                  className="absolute inset-0 bg-cover bg-center z-0"
                  style={{
                    backgroundImage: `url(${profilePic})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.7
                  }}
                />
              )}
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/10 z-0" />
              {/* Upload button - centered in the upper portion */}
              <div className="flex justify-center mt-32 relative z-10">
                <label 
                  htmlFor="profile-photo-upload"
                  className="flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 hover:bg-opacity-80 hover:shadow-lg"
                  style={{
                    background: errors.profilePic ? '#FEF2F2' : '#D9D9D9',
                    borderRadius: 24,
                    width: 190,
                    height: 40,
                    fontFamily: 'SF Pro, system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: 14,
                    color: errors.profilePic ? '#ef4444' : '#222',
                    border: errors.profilePic ? '2px solid #ef4444' : '2px solid #AAAAAA',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 8}}>
                    <path d="M12 16V6M12 6L7 11M12 6L17 11" stroke={errors.profilePic ? "#ef4444" : "#222"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="8" y1="18" x2="16" y2="18" stroke={errors.profilePic ? "#ef4444" : "#222"} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {isUploading ? 'Uploading...' : 'Upload'}
                  <input
                    id="profile-photo-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploading || isLoading}
                  />
                </label>
              </div>
              
              {/* Graph and Join buttons row */}
              <div className="flex justify-center gap-4 mt-24 relative z-10">
                {/* Join button */}
                <button
                  className="bg-[#4F4F4F] flex flex-col items-center justify-center rounded-xl shadow-md transition-colors duration-200 hover:bg-[#666666] active:bg-[#333333]"
                  style={{ width: 75, height: 63, padding: 0, border: 'none' }}
                  onClick={() => setShowJoinModal(true)}
                >
                  <img src={whiteGraphURL} alt="graph icon" width={28} height={23} className="mb-1" />
                  <span className="text-[13px] text-white font-medium font-['SF_Pro',system-ui,sans-serif]">graph</span>
                </button>
                
                {/* Graph button */}
                <button
                  className="bg-[#4F4F4F] flex flex-col items-center justify-center rounded-xl shadow-md transition-colors duration-200 hover:bg-[#666666] active:bg-[#333333]"  
                  style={{ width: 75, height: 63, border: 'none'}}
                  onClick={() => setShowGraphModal(true)}
                >
                  <img src={groupIconURL} alt="join icon" width={28} height={23} className="mb-1" />
                  <span className="text-[13px] text-white font-medium font-['SF_Pro',system-ui,sans-serif]">join</span>
                </button>
              </div>
            </div>

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

            {/* Form content container */}
            <div className="flex flex-col w-full gap-4 px-5 py-1 mt-2">
              {/* Name inputs card */}
              <div
                className="w-full bg-white rounded-xl flex items-center px-4 py-3 gap-4"
                style={{
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  fontFamily: 'SF Pro, system-ui, sans-serif'
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 mr-1"
                  style={{
                    background: getBackgroundColor(color),
                  }}
                />
                <div className="flex w-full gap-6">
                  {/* First Name Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => {
                        setFirstName(e.target.value);
                        // Clear error when user starts typing
                        if (errors.firstName) {
                          setErrors({...errors, firstName: undefined});
                        }
                      }}
                      placeholder="First name"
                      className={`${isMobile ? 'series-shadow series-placeholder' : ''} placeholder:italic`}
                      style={{
                        width: '100%',
                        height: 32,
                        borderRadius: 8,
                        fontFamily: 'SF Pro, system-ui, sans-serif',
                        fontWeight: 400,
                        fontSize: 13,
                        paddingLeft: 10,
                        outline: 'none',
                        color: '#222',
                        transition: 'all 0.2s',
                        border: errors.firstName ? '2px solid #ef4444' : '1px solid #ccc',
                        backgroundColor: errors.firstName ? '#FEF2F2' : 'white',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                      }}
                      onFocus={e => {
                        if (!errors.firstName) {
                          e.target.style.borderWidth = '0.5px';
                        }
                      }}
                      onBlur={e => {
                        if (!errors.firstName) {
                          e.target.style.borderWidth = '1px';
                        }
                      }}
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p className="text-[0.5rem] text-red-600 absolute">{errors.firstName}</p>
                    )}
                  </div>
                  
                  {/* Last Name Input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => {
                        setLastName(e.target.value);
                        // Clear error when user starts typing
                        if (errors.lastName) {
                          setErrors({...errors, lastName: undefined});
                        }
                      }}
                      placeholder="Last name"
                      className={`${isMobile ? 'series-shadow series-placeholder' : ''} placeholder:italic`}
                      style={{
                        width: '100%',
                        height: 32,
                        borderRadius: 8,
                        fontFamily: 'SF Pro, system-ui, sans-serif',
                        fontWeight: 400,
                        fontSize: 13,
                        paddingLeft: 10,
                        outline: 'none',
                        color: '#222',
                        transition: 'all 0.2s',
                        border: errors.lastName ? '2px solid #ef4444' : '1px solid #ccc',
                        backgroundColor: errors.lastName ? '#FEF2F2' : 'white',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                      }}
                      onFocus={e => {
                        if (!errors.lastName) {
                          e.target.style.borderWidth = '0.5px';
                        }
                      }}
                      onBlur={e => {
                        if (!errors.lastName) {
                          e.target.style.borderWidth = '1px';
                        }
                      }}
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p className="text-[0.5rem] text-red-600 absolute">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Age and Location fields in a white box */}
              <div
                className="w-full bg-white rounded-xl flex items-center px-4 py-3"
                style={{
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  fontFamily: 'SF Pro, system-ui, sans-serif'
                }}
              >
                {/* Age Label */}
                <span style={{ color: '#111', fontWeight: 600, fontSize: 16, marginRight: 8 }}>Age: </span>
                
                {/* Age Select */}
                <div className="w-14 mr-8">
                  <select
                    value={userAge || ''}
                    onChange={e => {
                      setUserAge(e.target.value ? parseInt(e.target.value) : undefined);
                      if (errors.age) {
                        setErrors({...errors, age: undefined});
                      }
                    }}
                    className={`w-full h-8 rounded-md border ${errors.age ? 'border-red-500' : 'border-gray-300'} bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-black`}
                    style={{
                      fontFamily: 'SF Pro, system-ui, sans-serif',
                      color: userAge ? '#222' : '#ABABAB',
                      fontStyle: userAge ? 'normal' : 'italic',
                      backgroundColor: errors.age ? '#FEF2F2' : 'white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                    }}
                    disabled={isLoading}
                  >
                    <option value="" disabled style={{ display: 'none' }}>##</option>
                    {Array.from({length: 52}, (_, i) => i + 14).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                  {errors.age && (
                    <p className="absolute text-[0.5rem] text-red-600">{errors.age}</p>
                  )}
                </div>
                
                {/* Location Label */}
                <span style={{ color: '#111', fontWeight: 600, fontSize: 16, marginRight: 12 }}>Location: </span>
                
                {/* Location Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={userLocation}
                    onChange={e => {
                      setUserLocation(e.target.value);
                      if (errors.location) {
                        setErrors({...errors, location: undefined});
                      }
                    }}
                    placeholder="New York, NY"
                    className={`w-full h-8 rounded-md border ${errors.location ? 'border-red-500' : 'border-gray-300'} bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-black placeholder:italic`}
                    style={{
                      fontFamily: 'SF Pro, system-ui, sans-serif',
                      color: '#222',
                      backgroundColor: errors.location ? '#FEF2F2' : 'white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                    }}
                    disabled={isLoading}
                  />
                  {errors.location && (
                    <p className="absolute text-[0.5rem] text-red-600">{errors.location}</p>
                  )}
                </div>
              </div>
              
              {/* Bio section */}
              <div
                className="w-full bg-white rounded-xl flex flex-col items-start px-4 py-4 gap-1"
                style={{
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  fontFamily: 'SF Pro, system-ui, sans-serif'
                }}
              >
                <span style={{ color: '#111', fontWeight: 600, fontSize: 16 }}>Me:</span>
                <div className="relative w-full">
                  <input
                    value={description}
                    onChange={e => {
                      setDescription(e.target.value);
                      // Clear error when user starts typing
                      if (errors.bio) {
                        setErrors({...errors, bio: undefined});
                      }
                    }}
                    placeholder="student @ Columbia building the next fintech unicorn"
                    className={`${isMobile ? 'series-shadow series-placeholder' : ''} w-full p-2 rounded-lg border resize-none placeholder:italic`}
                    style={{
                      fontFamily: 'SF Pro, system-ui, sans-serif',
                      fontSize: 13,
                      outline: 'none',
                      color: '#222',
                      transition: 'all 0.2s',
                      border: errors.bio ? '2px solid #ef4444' : '1px solid #ccc',
                      backgroundColor: errors.bio ? '#FEF2F2' : 'white',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
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
                    <p className="text-[0.5rem] text-red-600 absolute">{errors.bio}</p>
                  )}
                </div>
              </div>
              
              {/* Who I know section */}
              <div
                className="w-full bg-white rounded-xl flex flex-col items-start px-4 py-4 gap-3 overflow-y-auto"
                style={{
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  maxHeight: 300, // Limit height and enable scrolling
                  fontFamily: 'SF Pro, system-ui, sans-serif'
                }}
              >
                <span style={{ color: '#111', fontWeight: 600, fontSize: 16 }}>Who I know:</span>
                
                {/* Connection inputs with X buttons */}
                {connections.map((connection, index) => {
                  const hasError = errors.connections && errors.connections[index];
                  
                  return (
                    <div key={index} className="relative w-full flex items-center mb-2">
                      <input
                        type="text"
                        value={connection}
                        onChange={e => {
                          const newConnections = [...connections];
                          newConnections[index] = e.target.value;
                          setConnections(newConnections);
                          
                          // Clear error when user starts typing
                          if (errors.connections && errors.connections[index]) {
                            const newConnectionErrors = [...(errors.connections || [])];
                            newConnectionErrors[index] = '';
                            setErrors({
                              ...errors, 
                              connections: newConnectionErrors.some(e => e) ? newConnectionErrors : undefined
                            });
                          }
                        }}
                      placeholder={[
                        'new york area student entrepeneurs in SaaS and healthtech',
                        'the founders of Prod',
                        'friends and family investors'
                      ][index % 3]}
                        className={`${isMobile ? 'series-shadow series-placeholder' : ''} w-full placeholder:italic`}
                        style={{
                          height: 36,
                          borderRadius: 8,
                          fontFamily: 'SF Pro, system-ui, sans-serif',
                          fontWeight: 400,
                          fontSize: 13,
                          paddingLeft: 10,
                          paddingRight: 30,
                          outline: 'none',
                          color: '#222',
                          transition: 'all 0.2s',
                          border: hasError ? '2px solid #ef4444' : '1px solid #ccc',
                          backgroundColor: hasError ? '#FEF2F2' : 'white',
                          boxShadow: hasError ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : '0 2px 6px rgba(0,0,0,0.12)'
                        }}
                        onFocus={e => {
                          e.target.style.borderWidth = hasError ? '2px' : '1px';
                          e.target.style.boxShadow = hasError 
                            ? '0 0 0 3px rgba(239, 68, 68, 0.3)' 
                            : '0 0 0 3px rgba(59, 130, 246, 0.3)';
                        }}
                        onBlur={e => {
                          e.target.style.borderWidth = hasError ? '2px' : '1px';
                          e.target.style.boxShadow = hasError 
                            ? '0 0 0 2px rgba(239, 68, 68, 0.2)' 
                            : '0 2px 6px rgba(0,0,0,0.12)';
                        }}
                        disabled={isLoading}
                      />
                      
                      {hasError && errors.connections && (
                        <p className="text-[0.5rem] text-red-600 absolute bottom-[-1rem] left-0">
                          {errors.connections[index]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* AI Toggle - Copied from QuestionnaireOnboarding */}
              <motion.div 
                className="flex items-center justify-center w-full"
              >
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={enhanceWithAI}
                    onChange={() => setEnhanceWithAI(prev => !prev)}
                    id="ai-toggle"
                  />
                  <motion.div 
                    className="w-7 h-4 bg-white-100 rounded-full peer dark:bg-gray-400 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-100 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-100 peer-checked:bg-black"
                    whileTap={{ scale: 0.95 }}
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                  />
                  <motion.span 
                    className="ms-3 text-xs font-medium text-gray-900 whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    style={{ fontFamily: 'SF Pro, system-ui, sans-serif' }}
                  >
                    Enhance your profile with AI
                  </motion.span>
                </label>
              </motion.div>
            </div>
          </div>
          <div className="w-full flex justify-center mt-4">
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
                  className={`${isLoading || isUploading ? 'bg-gray-400' : 'bg-black hover:bg-black/80'} text-white rounded-full flex items-center justify-center transition-colors`}
                  style={{ 
                    width: 120, 
                    height: 48,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    fontFamily: 'SF Pro, system-ui, sans-serif',
                    cursor: (isLoading || isUploading) ? 'not-allowed' : 'pointer'
                  }}
                  onClick={!(isLoading || isUploading) ? handleButtonClick : undefined}
                  disabled={isLoading || isUploading}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" stroke="white" />
                  </svg>
                </button>
              )}
            </AnimatePresence>
          </div> 
      </div>
    </div>
  );
};

export default ProfilePage;
