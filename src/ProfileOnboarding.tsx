import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Share from 'lucide-react/dist/esm/icons/share';
import Network from 'lucide-react/dist/esm/icons/network';
import { useScreenSize } from './lib/useScreenSize';

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
  age = 18
}: ProfileOnboardingProps) => {
  // Get screen size information
  const { isMobile } = useScreenSize();
  const [name, setName] = useState(firstName + ' ' + lastName);
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
    }`;

  const validateForm = (): boolean => {
    console.log('--- Starting form validation ---');
    const newErrors: {
      name?: string;
      bio?: string;
      location?: string;
      age?: string;
      profilePic?: string;
      connections?: string[];
    } = {};
    
    console.log('Current connections state:', connections);
    
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
    } else if (trimmedBio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    }
    
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
    
    // Profile picture validation
    if (!profilePic) {
      newErrors.profilePic = 'Profile picture is required';
    }
    
    // Connections validation
    console.log('Validating connections...');
    console.log('Current connections:', connections);
    
    const validConnections = connections.filter(conn => conn && conn.trim().length > 0);
    const invalidConnections: string[] = [];
    
    console.log('Valid connections found:', validConnections);
    
    // Check each connection and provide specific error messages
    connections.forEach((conn, index) => {
      console.log(`Validating connection ${index + 1}:`, conn);
      if (!conn.trim()) {
        console.log(`Connection ${index + 1} is empty`);
        invalidConnections[index] = 'This connection is required';
      } else if (conn.trim().length < 2) {
        console.log(`Connection ${index + 1} is too short`);
        invalidConnections[index] = 'Connection is too short';
      } else {
        console.log(`Connection ${index + 1} is valid`);
        invalidConnections[index] = '';
      }
    });
    
    console.log('Invalid connections array:', invalidConnections);
    
    // Check for minimum number of connections
    if (validConnections.length < 3) {
      const missingCount = 3 - validConnections.length;
      console.log(`Need ${missingCount} more valid connections`);
      
      // Add the general message to the first empty or invalid connection
      let messageAdded = false;
      const updatedInvalidConnections = [...invalidConnections];
      
      for (let i = 0; i < updatedInvalidConnections.length; i++) {
        if (updatedInvalidConnections[i]) {
          const message = ` (${missingCount} more connection${missingCount > 1 ? 's' : ''} needed)`;
          updatedInvalidConnections[i] = updatedInvalidConnections[i] + (messageAdded ? '' : message);
          messageAdded = true;
          console.log(`Added missing connections message to connection ${i + 1}`);
        }
      }
      
      console.log('Updated invalid connections with missing count:', updatedInvalidConnections);
      newErrors.connections = updatedInvalidConnections;
    } else {
      console.log('Enough valid connections, using individual validation errors');
      const connection_result = invalidConnections.filter(conn => conn !== '');
      if (connection_result.length > 0) {
        newErrors.connections = connection_result;
      }
    }
    
    console.log('Final connections errors:', newErrors.connections);
    
    console.log('All validation errors:', newErrors);
    
    setErrors(prev => {
      const updatedErrors = {
        ...prev,
        ...newErrors
      };
      console.log('Updated errors state:', updatedErrors);
      return updatedErrors;
    });
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form is', isValid ? 'valid' : 'invalid');
    return isValid;
  };

  const searchUsersByBio = async (bio: string) => {
    try {
      const trimmedBio = bio.trim();
      
      // Skip check for empty or default bio
      if (!trimmedBio || 
          trimmedBio === "I'm new to Series! Looking forward to connecting with people and exploring opportunities.") {
        console.log('[Bio Check] Skipping check for empty or default bio');
        return [];
      }
      
      console.log('[Bio Check] Checking if bio exists:', JSON.stringify(trimmedBio));
      
      // Check if bio exists using the check-bio endpoint
      const url = `https://series-api-202642739529.us-central1.run.app/api/users/check-bio?bio=${encodeURIComponent(trimmedBio)}`;
      console.log('[Bio Check] Making request to:', url);
      
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
      
      console.log('[Bio Check] Result:', JSON.stringify(logData, null, 2));
      
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
    // Validate form before submission
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    } else {
      console.log('Form validation passed');
      // Don't show loading screen when transitioning to questionnaire
      // Just log the data and proceed
      console.log('Starting user creation process...', {
        name,
        bio: description,
        connections: connections.filter(conn => conn && conn.trim() !== '' && !conn.includes('PLACEHOLDER'))
      });
      
      try {
        // First, check if a user with this bio already exists
        console.log('Checking for existing users with the same bio...');
        const existingUsers = await searchUsersByBio(description);
        
        if (existingUsers && existingUsers.length > 0) {
          console.log('Found existing user with the same bio:', existingUsers[0]);
          showError('A user with this bio already exists. Please choose a different bio.');
          setIsLoading(false);
          return;
        }
        
        // If no existing user found, create a new one
        console.log('No existing user found with this bio, creating new user...');
        
        // Prepare user data
        const userData = {
          email: `${name.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 1000)}@series.placeholder`,
          name: {
            first: name.split(' ')[0],
            last: name.split(' ').slice(1).join(' ') || 'User'
          },
          groups: connections,
          bio: description,
          onboarding: {
            completed: false,
            currentStep: 'initial'
          },
        };
        
        // Create a new userData object with the profilePic property
        // Use the processed image URL if available, otherwise use the default
        const profilePicToUse = processedImageId 
          ? `https://series-api-202642739529.us-central1.run.app/api/files/${processedImageId}`  // MongoDB GridFS endpoint
          : (profilePic !== initialProfilePic ? profilePic : initialProfilePic);
        
        const userDataWithProfilePic = {
          ...userData,
          profilePic: profilePicToUse
        };
        
        // Log whether we're using a custom uploaded image or the default
        if (profilePicToUse && profilePicToUse !== initialProfilePic) {
          console.log('Using processed profile picture from server:', profilePicToUse);
        } else {
          console.log('Using default profile picture');
        }
        
        console.log('Sending user data to API...');

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
        console.log('User created successfully:', result);
        console.log('User ID from API response:', result.userId);
        
        // Set the userId in state
        setUserId(result.userId);
        console.log('User ID set in state:', userId);
        
        // If we have a processed image ID, we need to update the user's profile with it
        if (processedImageId) {
          try {
            console.log('Updating user profile with processed image ID:', processedImageId);
            const updateResponse = await fetch('https://series-api-202642739529.us-central1.run.app/api/users/update-profile-pic', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                user_id: userId,
                image_url: processedImageId  // Just send the ID, not the full URL
              })
            });
            
            if (!updateResponse.ok) {
              const error = await updateResponse.json().catch(() => ({}));
              console.error('Failed to update profile picture:', error);
              // Continue with user creation even if profile pic update fails
            } else {
              console.log('Profile picture updated successfully');
            }
          } catch (error) {
            console.error('Error updating profile picture:', error);
            // Continue with user creation even if profile pic update fails
          }
        }
        
        // Search and archetype generation will be handled in the questionnaire step
        console.log('Proceeding to questionnaire - search will be handled there');
        
        // Log the userId values before navigation
        console.log("User ID from API result: ", result.userId);
        console.log("User ID from state before navigation: ", userId);
        
        // IMPORTANT: There might be a timing issue with the state update
        // Use result.userId directly for navigation to ensure the correct value is passed
        const userIdToPass = result.userId || userId;
        console.log("User ID being passed to questionnaire: ", userIdToPass);
        
        // Navigate to the questionnaire page
        navigate('/join/2', { state: { bio: description, userId: userIdToPass } });
        
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
      
      console.log('Uploading image to server...');
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
      
      console.log('Image upload successful:', result);
      
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center relative">
      {/* Page Indicator - Outside main content so it stays visible during loading */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm border border-gray-200 z-50">
        <div className="flex items-center space-x-1.5 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        </div>
      </div>
      
      {isMobile ? (
        // Mobile layout
        <div className="w-full max-w-md mt-10">
          {/* Mobile form fields */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Name field */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({...errors, name: undefined});
                }}
                className={`block w-full rounded-2xl border-2 ${errors.name ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
                placeholder="Zark Muckerberg"
                disabled={isLoading}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            
            {/* Profile Picture */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mt-8 mb-1">Profile Picture:</label>
              <div className="flex items-center w-full">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 mr-3">
                  <img 
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <label 
                  htmlFor="mobile-profile-upload"
                  className={`flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-full text-sm flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </label>
                <input
                  id="mobile-profile-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={isLoading || isUploading}
                />
              </div>
            </div>
            
            <div className="space-y-4 mt-8">
              <div className="flex space-x-6">
                  {/* Age field */}
                <div className="flex flex-col w-1/4">
                  <label className="block text-lg font-medium text-gray-700 mb-1">Age:</label>
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">💳</span>
                    <select
                      value={userAge}
                      onChange={(e) => {
                        setUserAge(parseInt(e.target.value));
                        if (errors.age) setErrors({...errors, age: undefined});
                      }}
                      className={`block w-full rounded-2xl border-2 border-gray-200 shadow-lg px-5 py-4 text-base text-gray-900 focus:border-gray-400 focus:ring-0 transition-all duration-200 appearance-none bg-white`}
                      disabled={isLoading}
                    >
                      {Array.from({ length: 52 }, (_, i) => i + 14).map(age => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                  {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
                </div>

                {/* Location field */}
                <div className="w-[65%]">
                  <div className="flex items-center gap-2 mb-3">
                    <label className="block text-2xl font-medium text-gray-900">Location</label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={userLocation}
                      onChange={(e) => {
                        setUserLocation(e.target.value);
                        if (errors.location) {
                          setErrors({...errors, location: undefined});
                        }
                      }}
                      className={`block w-full rounded-2xl border-2 ${errors.location ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
                      placeholder="New York, New York, USA"
                      disabled={isLoading}
                    />
                    {errors.location && (
                      <p className="mt-1 text-xs text-red-600">{errors.location}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Who you are field */}
            <div className="w-full">
              <div className="flex items-center gap-2 mb-3">
                <label className="block text-2xl font-medium text-gray-900">Who you are and what you do</label>
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.bio) {
                      setErrors({...errors, bio: undefined});
                    }
                  }}
                  className={`block w-full rounded-2xl border-2 ${errors.bio ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200 resize-none`}
                  placeholder="Junior @UCLA building e-commerce platform for shoes"
                  disabled={isLoading}
                />
                {errors.bio && (
                  <p className="mt-1 text-xs text-red-600">{errors.bio}</p>
                )}
              </div>
            </div>
            
            {/* Who you know field */}
            <div className="w-full mt-8">
              <div className="flex items-center gap-2 mb-3">
                <label className="block text-2xl font-medium text-gray-900">Who you know</label>
              </div>
              <div className="space-y-4">
                {connections.map((connection, index) => (
                  <div key={index} className="w-full">
                    <div className="relative">
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
                        className={`block w-full rounded-2xl border-2 ${
                          errors.connections?.[index] ? 'border-red-500' : 'border-gray-200'
                        } shadow-lg px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200 resize-none`}
                        placeholder={
                          index === 0 ? "full-stack engineers at Series University Computer Society" :
                          index === 1 ? "product management team at Innovative Corp" :
                          "Professor Jarvis's group at Series University ML and AI Lab"
                        }
                        disabled={isLoading}
                      />
                      {errors.connections?.[index] && (
                        <p className="mt-1 text-xs text-red-600">{errors.connections[index]}</p>
                      )}
                    </div>
                    {connections.length > 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedConnections = [...connections];
                          updatedConnections.splice(index, 1);
                          setConnections(updatedConnections);
                        }}
                        className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition-color"
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
                    Add another person
                  </button>
                )}
              </div>
            </div>
            
            {/* Next button */}
            <div className="mt-12 pt-4 flex justify-center">
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
                    className={`${isLoading ? 'bg-gray-400' : 'bg-black hover:bg-black/80'} text-white rounded-full p-3 w-24 h-9 mb-10 inline-flex items-center justify-center transition-colors`}
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
          </motion.div>
        </div>
      ) : (
        // Desktop layout
        <div className="w-full max-w-6xl mt-14 flex flex-col md:flex-row gap-8 relative">
        {/* Left side - Profile Card */}
        <motion.div 
          className="w-full md:w-96"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
            {/* Profile image */}
            <div className="relative w-full aspect-[3/4] bg-gray-100">
              <img 
                src={profilePic}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover object-center filter"
              />
              
              {/* Action buttons */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button className="bg-black/30 backdrop-blur-sm p-3 rounded-xl shadow-md hover:bg-black/60 hover:backdrop-blur transition-all duration-200 flex flex-col items-center w-16">
                  <Share size={20} className="text-white" />
                  <span className="text-[10px] mt-1 text-white font-medium">connect</span>
                </button>
                <button className="bg-black/30 backdrop-blur-sm p-3 rounded-xl shadow-md hover:bg-black/60 hover:backdrop-blur transition-all duration-200 flex flex-col items-center w-16">
                  <Network size={20} className="text-white" />
                  <span className="text-[10px] mt-1 text-white font-medium">graph</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Profile info */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-6"
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
                    <h2 className="font-medium text-gray-900">{name}</h2>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
            
            {/* Bio card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <motion.div variants={item}>
                  <h3 className="font-medium text-sm text-gray-900 mb-2">Me</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                </motion.div>
              </CardContent>
            </Card>
            
            {/* Connections card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900 mb-2">Who I Know</h3>
                  <ul className="space-y-2">
                    {connections.map((connection, index) => (
                      <li key={index} className="flex">
                        <span className="text-black-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                        <span className="text-sm mr-1 mt-1 text-gray-600 break-words flex-1">{connection}</span>
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
          className="flex-1 flex flex-col px-12 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-xl mx-auto w-full space-y-8 flex-1 flex flex-col">
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
                      className={`block w-full rounded-2xl border-2 ${errors.name ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
                      placeholder="Zark Muckerberg"
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
                    <label className="block text-2xl font-medium text-gray-900">Profile</label>
                  </div>
                  <label 
                    htmlFor="profile-photo-upload"
                    className="group flex items-center justify-center h-[58px] bg-gray-300 hover:bg-gray-500 transition-colors cursor-pointer rounded-2xl shadow-lg"
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
                  <label className="block text-2xl font-medium text-gray-900">Age</label>
                </div>
                <div className="relative inline-block w-full">
                  <select
                    value={userAge}
                    onChange={(e) => {
                      setUserAge(parseInt(e.target.value));
                      if (errors.age) {
                        setErrors({...errors, age: undefined});
                      }
                    }}
                    className={`block w-full appearance-none rounded-2xl border-2 border-gray-200 shadow-lg px-5 py-4 text-base text-gray-900 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
                    disabled={isLoading}
                  >
                    {Array.from({ length: 52 }, (_, i) => i + 14).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                  {/* <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div> */}
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
                    placeholder="New York, New York, USA"
                    disabled={isLoading}
                    className={`block w-full appearance-none rounded-2xl border-2 ${errors.location ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
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
                <label className="block text-2xl font-medium text-gray-900">Who you are and what you do:</label>
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
                    className={`block w-full rounded-2xl border-2 ${errors.bio ? 'border-red-500' : 'border-gray-200'} shadow-lg px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200 resize-none`}
                    placeholder="undergrad math major at Emory working on quant ML research while building in medtech"
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
                <label className="block text-2xl font-medium text-gray-900">Who you know:</label>
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
                      className={`block w-full rounded-xl border-2 ${errors.connections?.[index] ? 'border-red-500' : 'border-gray-200'} shadow-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-0 transition-all duration-200`}
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
            <div className="mt-auto mt-10 pt-8 flex justify-center">
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
                    className={`${isLoading ? 'bg-gray-400' : 'bg-black hover:bg-black/80'} text-white rounded-full p-3 w-24 h-9 mb-10 inline-flex items-center justify-center transition-colors`}
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
