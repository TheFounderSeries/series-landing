import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useScreenSize } from '../lib/useScreenSize';
import { getApiUrl } from '../utils/api';
import { usePostHog } from 'posthog-js/react';
import defaultAvatar from '../assets/images/default-avatar.png';
import { Info } from 'lucide-react';
import { getAbsoluteImageUrl } from '../utils/imageUtils';

// Constants
const initialProfilePic = defaultAvatar;

interface ProfilePageProps {
  initialData?: {
    name?: string;
    bio?: string;
    connections?: Array<{ position: string; location: string }> | string[];
    enhanceWithAI?: boolean;
    profilePic?: string;
    location?: string;
    age?: number;
    phone?: string;
  };
  onSubmit: (data: any) => void;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  initialData = {}, 
  onSubmit
}) => {
  const { isMobile } = useScreenSize();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posthog = usePostHog();
  
  // Form state with dummy defaults
  
  // Initialize firstName and lastName from name if it exists
  const nameParts = (initialData.name || '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData.phone || '');
  const [userAge, setUserAge] = useState<number | undefined>(initialData.age);
  const [userLocation, setUserLocation] = useState(initialData.location || '');
  const [description, setDescription] = useState(initialData.bio || '');
  const [connections, setConnections] = useState(initialData.connections || ['', '', '']);
  const [enhanceWithAI, setEnhanceWithAI] = useState(initialData.enhanceWithAI !== false);
  const [profilePic, setProfilePic] = useState(initialData.profilePic || initialProfilePic);
  // We use profilePic for both display and backend storage
  const [color] = useState(Math.floor(Math.random() * 5));
  const [isUploading, setIsUploading] = useState(false);
  
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
    phone?: string;
    age?: string;
    location?: string;
    bio?: string;
    profilePic?: string;
    connections?: string[];
  }>({});

  // Handle photo upload with Google Cloud Storage
  // This implementation intentionally bypasses authentication for profile creation
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    console.log('Photo upload initiated');
    if (!event.target.files || event.target.files.length === 0) {
      console.log('No files selected');
      return;
    }
    console.log('File selected:', event.target.files[0].name);
    const file = event.target.files[0];
    if (!file) return;
    
    // Track profile picture upload attempt
    posthog.capture('profile_picture_upload_attempt');
    // Clear any existing profile picture error when a new file is selected
    if (errors.profilePic) {
      setErrors({...errors, profilePic: undefined});
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file');
      return;
    }

    // Validate file type more specifically
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size should be less than 5MB');
      return;
    }

    // Create a local URL for the image to display in the UI immediately
    const localImageUrl = URL.createObjectURL(file);
    setProfilePic(localImageUrl);
    setIsUploading(true);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata for Google Cloud Storage
      formData.append('storage_type', 'gcs'); // Indicate we want to use Google Cloud Storage
      formData.append('access_level', 'public'); // Use public access since we're getting direct URLs
      
      // IMPORTANT: This is a profile creation page, so we bypass authentication
      // We automatically validate all uploads from this page without requiring auth
      formData.append('bypass_auth', 'true'); // Signal to backend that this is from profile creation
      console.log("FORM DATA: ", Array.from(formData.entries()))
      
      // Upload the image to our backend which will handle GCS upload
      // Using our API utility to get the base URL from environment variables
      const response = await fetch(getApiUrl('users/upload-photo'), {
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
      
      // Update the profile picture with the direct URL
      if (result.success && result.image_url) {
        // Track successful upload
        posthog.capture('profile_picture_upload_success');
        try {
          // Convert the URL to a proxied URL if it's a GCS URL for display
          const processedUrl = getAbsoluteImageUrl(result.image_url);
          
          // Use the processed URL for UI display
          setProfilePic(processedUrl);
          
          if (errors.profilePic) {
            setErrors({ ...errors, profilePic: undefined });
          }
        } catch (error) {
          console.error('Error in profile pic update:', error);
          showError(error instanceof Error ? error.message : 'Failed to update profile picture');
          setProfilePic(initialProfilePic);
        }
      } else {
        console.error('Upload response missing success or image_url:', result);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
      setProfilePic(initialProfilePic);
      
      // Track upload failure
      posthog.capture('profile_picture_upload_error', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 10) {
      let formatted = input;
      if (input.length > 3) {
        formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
      }
      if (input.length > 6) {
        formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)} - ${input.slice(6)}`;
      }
      setPhoneNumber(formatted);
      if (errors.phone) {
        setErrors({...errors, phone: undefined});
      }
    }
  };

  // Format phone number to E.164 format for API calls
  const formatPhoneToE164 = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`; // Assuming US numbers
    }
    return phone; // Return as is if not valid
  };

  // Validate phone number
  const validatePhoneNumber = (): boolean => {
    // Remove all non-digits and check if we have 10 digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      return false;
    }
    return true;
  };
  
  
  // Check if phone number already exists in the system
  const checkPhoneNumberExists = async (phone: string): Promise<boolean> => {
    try {
      const e164Phone = formatPhoneToE164(phone);
      const response = await fetch(getApiUrl(`users/check-phone?phone=${encodeURIComponent(e164Phone)}`));
      
      if (!response.ok) {
        console.error('Error checking phone number:', response.statusText);
        return false; // Assume it doesn't exist if we can't check
      }
      
      const data = await response.json();
      return data.exists === true;
    } catch (error) {
      console.error('Error checking phone number:', error);
      return false; // Assume it doesn't exist if we can't check
    }
  };

  // Form validation function that can be used for both validation and checking if form is complete
  const validateForm = (showErrors = true) => {
    // Validation
    let newErrors: any = {};
    
    // Check each field individually
    const isFirstNameValid = firstName.trim() !== '';
    if (!isFirstNameValid) {
      newErrors.firstName = 'First name is required';
    }
    
    const isLastNameValid = lastName.trim() !== '';
    if (!isLastNameValid) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Phone validation
    const isPhoneValid = validatePhoneNumber();
    if (!isPhoneValid) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Location validation
    const isLocationValid = userLocation.trim() !== '';
    if (!isLocationValid) {
      newErrors.location = 'Location is required';
    }
    
    // Profile picture validation
    const isProfilePicValid = profilePic !== initialProfilePic;
    if (!isProfilePicValid) {
      newErrors.profilePic = 'Profile picture is required';
    }

    // Bio validation
    const isBioValid = description.trim().length >= 30;
    if (!description.trim()) {
      newErrors.bio = 'Please tell us about yourself';
    } else if (!isBioValid) {
      newErrors.bio = 'Please write at least 30 characters about yourself';
    }
    
    // Log validation state for debugging
    // console.log('Field validation states:', {
    //   isFirstNameValid,
    //   isLastNameValid,
    //   isPhoneValid,
    //   isLocationValid,
    //   isProfilePicValid,
    //   isBioValid,
    //   formValid: Object.keys(newErrors).length === 0
    // });
    
    // Only set errors if showErrors is true
    if (showErrors) {
      setErrors(newErrors);
    }
    
    // For button enabling, we only care about the basic fields
    if (!showErrors) {
      return (
        isFirstNameValid &&
        isLastNameValid &&
        isPhoneValid &&
        // isAgeValid &&
        isLocationValid &&
        isProfilePicValid &&
        isBioValid
      );
    }
    
    // For form submission, we care about all fields including connections
    return Object.keys(newErrors).length === 0;
  };
  
  // Helper function to check if form is filled enough to enable the submit button
  const isFormFilledEnough = () => {
    return validateForm(false);
  };

  // Form submission with validation
  const handleSubmit = async () => {
    
    // Track form submission attempt
    posthog.capture('profile_form_submission_attempt');
    
    // Validate the form with error display
    if (!validateForm(true)) {
      
      // Track validation failure
      posthog.capture('profile_form_validation_failed', {
        errors: errors
      });
      return;
    }
    
    // Check if phone number already exists
    if (phoneNumber && validatePhoneNumber()) {
      setIsLoading(true); // Show loading indicator
      
      try {
        const phoneExists = await checkPhoneNumberExists(phoneNumber);
        
        if (phoneExists) {
          // Phone number already exists, show error
          setErrors(prev => ({
            ...prev,
            phone: 'This phone number is already registered'
          }));
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking phone number:', error);
        // Continue with submission even if check fails
      } finally {
        setIsLoading(false);
      }
    }
    
    // Create comprehensive profile data to pass through the flow
    const profileData = {
      // Format name as an object with first and last name
      name: {"first": firstName || "Test", "last": lastName || "User"},
      // Pass phone number in E.164 format for iMessage deeplink
      phone: phoneNumber ? formatPhoneToE164(phoneNumber) : "+15555555555",
      // Pass age as a number
      age: userAge || 25,
      // Pass location as a string
      location: userLocation || "New York",
      // Pass bio as a string for iMessage sharing
      bio: description || "This is a test bio for debugging purposes.",
      // Pass connections data if available
      connections: connections.filter(c => c && c !== '').map(c => {
        // Handle both string and object formats
        if (typeof c === 'string') {
          return { position: c, location: userLocation || "New York" };
        }
        return c;
      }),
      // These fields are used by the UI but not sent to the backend
      enhanceWithAI,
      profilePic: profilePic,
      colorIndex: color, // Pass the color index for the background color
      color: getBackgroundColor(color) // Pass the actual color value as well
    };

    // Track successful profile submission
    posthog.capture('profile_completed', {
      has_profile_pic: profilePic !== initialProfilePic,
      bio_length: description.length,
      location_provided: !!userLocation,
      age_provided: !!userAge
    });
    
    // Identify the user with PostHog
    const userId = phoneNumber ? formatPhoneToE164(phoneNumber) : `anonymous-${Date.now()}`;
    posthog.identify(userId, {
      name: `${firstName} ${lastName}`.trim(),
      email: '', // Add email if you collect it
      phone: phoneNumber ? formatPhoneToE164(phoneNumber) : '',
      bio: description,
      location: userLocation,
      age: userAge,
      $set_once: { first_seen: new Date().toISOString() }
    });
    
    // Call the onSubmit prop function to move to the connections page
    if (onSubmit) {
      onSubmit(profileData);
    }
  };

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default button behavior
    await handleSubmit();
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
    <div className="min-h-screen bg-white p-2 sm:p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">  
        <div
          className="bg-[#F2F2F7] mx-auto flex flex-col"
          style={{
            width: '90%',
            maxWidth: isMobile ? '100%' : 400,
            borderRadius: 15,
            paddingBottom: 20,
          }}
        >
          {/* Gray box with rounded top corners */}
          <div
            className="relative flex flex-col items-center"
            style={{
              width: '100%',
              height: isMobile ? 350 : 450, // Reduced height for mobile
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
                  background: errors.profilePic ? '#FEF2F2' : '#D9D9D9',
                  borderRadius: 24,
                  width: isMobile ? 160 : 190,
                  height: 40,
                  fontFamily: 'SF Pro, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: isMobile ? 12 : 14,
                  color: errors.profilePic ? '#ef4444' : '#222',
                  border: errors.profilePic ? '2px solid #ef4444' : '2px solid #AAAAAA',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                }}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <span className="inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={errors.profilePic ? "#ef4444" : "#222"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
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
                  onChange={handlePhotoUpload}
                  disabled={isUploading || isLoading}
                />
              </label>
            </div>
          </div>

          {/* Form content container */}
          <div className="flex flex-col w-full gap-3 sm:gap-4 px-3 sm:px-5 py-1 mt-2">
            {/* Name inputs card */}
            <div
              className="w-full bg-white rounded-xl flex items-center px-3 sm:px-4 py-2 sm:py-3 gap-3 sm:gap-4"
              style={{
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                fontFamily: 'SF Pro, system-ui, sans-serif'
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex-shrink-0"
                style={{
                  background: getBackgroundColor(color),
                }}
              />
              <div className="flex w-full gap-4">
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
            
            
          
            {/* Bio section */}
            <div
              className="w-full bg-white rounded-xl flex flex-col items-start px-4 py-3 gap-1"
              style={{
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                fontFamily: 'SF Pro, system-ui, sans-serif'
              }}
            >
              <span style={{ color: '#111', fontWeight: 600, fontSize: isMobile ? 14 : 16, letterSpacing: '-0.01em' }}>Me</span>
              <div className="relative w-full">
                <textarea
                  value={description}
                  onChange={e => {
                    // Limit to 120 characters
                    if (e.target.value.length <= 100) {
                      setDescription(e.target.value);
                      // Clear error when user starts typing
                      if (errors.bio) {
                        setErrors({...errors, bio: undefined});
                      }
                    }
                  }}
                  maxLength={100}
                  placeholder="Who are you? (30-100 characters)"
                  className={`${isMobile ? 'series-shadow series-placeholder' : ''} w-full p-2 mb-2 rounded-lg border resize-none placeholder:italic placeholder:text-xs sm:placeholder:text-sm`}
                  style={{
                    fontFamily: 'SF Pro, system-ui, sans-serif',
                    fontSize: isMobile ? 12 : 13,
                    outline: 'none',
                    color: '#222',
                    transition: 'all 0.2s',
                    border: errors.bio || (description.trim().length > 0 && description.trim().length < 30) ? '2px solid #ef4444' : '1px solid #ccc',
                    backgroundColor: errors.bio || (description.trim().length > 0 && description.trim().length < 30) ? '#FEF2F2' : 'white',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                  }}
                  onFocus={e => {
                    if (!errors.bio && !(description.trim().length > 0 && description.trim().length < 30)) {
                      e.target.style.borderWidth = '1px';
                    }
                  }}
                  onBlur={e => {
                    if (!errors.bio && !(description.trim().length > 0 && description.trim().length < 30)) {
                      e.target.style.borderWidth = '1px';
                    }
                  }}
                  disabled={isLoading}
                />
                <div className={`text-xs ${description.trim().length < 30 ? 'text-red-600' : 'text-green-600'} text-right`}>
                  {description.length}/30 characters
                </div>
                {errors.bio && (
                  <p className="text-[0.5rem] text-red-600 absolute">{errors.bio}</p>
                )}
                {/* {!errors.bio && description.trim().length > 0 && (
                  <p className={`text-[0.5rem] ${description.trim().length < 30 ? 'text-red-600' : 'text-green-600'}`}>
                    {description.trim().length}/30 characters {description.trim().length < 30 ? '(minimum 30)' : '✓'}
                  </p>
                )} */}
              </div>
            </div>
            
            {/* Who I know section */}
            {/* <div
              className="w-full bg-white rounded-xl flex flex-col items-start px-4 py-4 gap-3 overflow-y-auto"
              style={{
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                maxHeight: 300, // Limit height and enable scrolling
                fontFamily: 'SF Pro, system-ui, sans-serif'
              }}
            >
              <span style={{ color: '#111', fontWeight: 600, fontSize: 16 }}>Who I know</span>
                */}
              {/* Connection inputs with X buttons */}
              {/* {connections.map((connection, index) => {
                // We track individual errors in the errors object, but don't need a global hasErrors flag
                
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
            </div> */}

            {/* AI Toggle - Copied from QuestionnaireOnboarding
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
            </motion.div> */}
          </div>
        </div>

        
        <div className="mx-auto mt-4 flex flex-col items-center" style={{ width: '100%', maxWidth: 400 }}>
          <div className="justify-center items-center flex w-full">
            <p className="italic text-gray-500 text-cente mt-4 mb-2" style={{ fontFamily: 'SF Pro, system-ui, sans-serif', fontSize: 14 }}>
              The following won't be shown on your profile.
            </p>
          </div>
          
          <div className="flex flex-col w-full gap-4 px-5 py-1">
            <div className="w-full flex flex-col gap-4">
              {/* Phone Number field in a white box */}
              <div
                className="w-full bg-white rounded-xl flex flex-col items-start px-4 gap-1"
                style={{
                  fontFamily: 'SF Pro, system-ui, sans-serif'
                }}
              >
                <div className="flex items-center gap-1">
                  <span style={{ color: '#111', fontWeight: 600, fontSize: 16 }}>Phone</span> 
                  {/* Info icon with tooltip */}
                  <div className="relative inline-block group">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center cursor-help transition-colors hover:bg-gray-200"
                    >
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div 
                      className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                      style={{
                        zIndex: 100,
                        width: '11rem',
                        padding: '0.6rem',
                        background: 'rgba(0,0,0,0.85)',
                        color: 'white',
                        borderRadius: '0.4rem',
                        fontSize: '0.75rem',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                        left: '50%',
                        bottom: '100%',
                        transform: 'translateX(-50%)',
                        marginBottom: '0.5rem',
                        whiteSpace: 'normal',
                        lineHeight: '1.3',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      Your phone number is needed to text with your AI friend on iMessage. It's stored securely and never displayed on your profile.
                    </div>
                  </div>
                </div>

                <div className="flex items-center w-full">
                  <div className="relative flex-grow mr-2">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="(999) 999 - 9999"
                      className={`${isMobile ? 'series-shadow series-placeholder' : ''} w-full p-2 mb-2 rounded-lg border resize-none placeholder:italic`}
                      style={{
                        fontFamily: 'SF Pro, system-ui, sans-serif',
                        fontSize: 13,
                        outline: 'none',
                        color: '#222',
                        backgroundColor: errors.phone ? '#FEF2F2' : 'white',
                        borderColor: errors.phone ? '#ef4444' : '#ccc',
                        borderWidth: errors.phone ? '2px' : '1px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                        height: '36px',
                        lineHeight: '1.5'
                      }}
                      disabled={isLoading}
                    />
                    {errors.phone && (
                      <p className="absolute text-[0.5rem] text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Location field in a white box */}
              <div
                className="w-full bg-white rounded-xl flex flex-col items-start px-4 mt-1 gap-1"
                style={{
                  // boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  fontFamily: 'SF Pro, system-ui, sans-serif'
                }}
              >
                <div className="flex items-center gap-1">
                  <span style={{ color: '#111', fontWeight: 600, fontSize: 16 }}>Location</span>
                  {/* Info icon with tooltip */}
                  <div className="relative inline-block group">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center cursor-help transition-colors hover:bg-gray-200"
                    >
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div 
                      className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
                      style={{
                        zIndex: 100,
                        width: '11rem',
                        padding: '0.6rem',
                        background: 'rgba(0,0,0,0.85)',
                        color: 'white',
                        borderRadius: '0.4rem',
                        fontSize: '0.75rem',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                        left: '50%',
                        bottom: '100%',
                        transform: 'translateX(-50%)',
                        marginBottom: '0.5rem',
                        whiteSpace: 'normal',
                        lineHeight: '1.3',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      Your location helps us connect you with more accurate local matches. It's stored securely and never shared on your profile.
                    </div>
                  </div>
                </div>
                <div className="flex items-center w-full">
                  <div className="relative flex-grow mr-2">
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
                      className={`${isMobile ? 'series-shadow series-placeholder' : ''} w-full p-2 mb-2 rounded-lg border resize-none placeholder:italic`}
                      style={{
                        fontFamily: 'SF Pro, system-ui, sans-serif',
                        fontSize: 13,
                        outline: 'none',
                        color: '#222',
                        backgroundColor: errors.location ? '#FEF2F2' : 'white',
                        borderColor: errors.location ? '#ef4444' : '#ccc',
                        borderWidth: errors.location ? '2px' : '1px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                        height: '36px',
                        lineHeight: '1.5'
                      }}
                      disabled={isLoading}
                    />
                    {errors.location && (
                      <p className="absolute text-[0.5rem] text-red-600">{errors.location}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center mt-12">
          <AnimatePresence mode="wait">
            <button
              className="rounded-full flex items-center justify-center transition-colors"
              style={{ 
                width: 120, 
                height: 48,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontFamily: 'SF Pro, system-ui, sans-serif',
                cursor: isFormFilledEnough() ? 'pointer' : 'not-allowed',
                backgroundColor: isFormFilledEnough() ? 'black' : '#CCCCCC',
                color: 'white'
              }}
              onClick={async (e) => {
                e.preventDefault();
                if (isFormFilledEnough()) {
                  await handleButtonClick(e);
                } else {
                  validateForm(true); // Show validation errors
                }
              }}
              disabled={!isFormFilledEnough()}
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" stroke="white" />
              </svg>
            </button>
          </AnimatePresence>
        </div> 
      </div>
    </div>
  );
};

export default ProfilePage;
