import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, ChangeEvent } from 'react';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import User from 'lucide-react/dist/esm/icons/user';
import Phone from 'lucide-react/dist/esm/icons/phone';
import WelcomePage from './WelcomePage';

// Simple Card components since we can't import them
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

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
  firstName = 'John',
  lastName = 'Doe',
  bio = 'new Series user',
  connections: initialConnections = [
    'PLACEHOLDER Input your connections here'
  ],
  color = 'purple',
  initialProfilePic = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
  location = 'New York, New York, US',
  age = 18
}: ProfileOnboardingProps) => {
  const [name, setName] = useState(firstName + ' ' + lastName);
  const [description, setDescription] = useState(bio);
  const [connections, setConnections] = useState(initialConnections);
  const [userLocation, setUserLocation] = useState(location);
  const [userAge, setUserAge] = useState(age);
  const [isLoading, setIsLoading] = useState(false);
  const [showNextPage, setShowNextPage] = useState(false);
  const [errors, setErrors] = useState<{name?: string; bio?: string; location?: string; age?: string}>({});
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
  
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const validateForm = () => {
    const newErrors: {name?: string; bio?: string; location?: string; age?: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!description.trim()) {
      newErrors.bio = 'Bio is required';
    }
    
    if (!userLocation.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!userAge) {
      newErrors.age = 'Age is required';
    }
    
    setErrors(newErrors);
    
    // If validation passes but no profile picture has been uploaded, show a warning
    if (Object.keys(newErrors).length === 0 && profilePic === initialProfilePic) {
      showError('Consider uploading a profile picture before continuing');
    }
    
    return Object.keys(newErrors).length === 0;
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
    }
    
    setIsLoading(true);
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
        bio: description,
        onboarding: {
          completed: false,
          currentStep: 'initial'
        },
      };
      
      // Create a new userData object with the profilePic property
      // Use the processed image URL if available, otherwise use the default
      const profilePicToUse = processedImageId 
        ? processedImageId  // Just use the ID, the full URL will be constructed on the backend
        : (profilePic !== initialProfilePic ? profilePic : initialProfilePic);
      
      const userDataWithProfilePic = {
        ...userData,
        profilePic: profilePicToUse
      };
      
      // Log whether we're using a custom uploaded image or the default
      if (profilePicToUse && profilePicToUse !== initialProfilePic) {
        console.log('Using processed profile picture from server');
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
      
      // If we have a processed image ID, we need to update the user's profile with it
      if (processedImageId) {
        try {
          console.log('Updating user profile with processed image ID:', processedImageId);
          const updateResponse = await fetch('https://series-api-202642739529.us-central1.run.app/api/users/update-profile-pic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              user_id: result.userId,
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
      
      // Call the search endpoint to generate embeddings and archetypes
      try {
        console.log('Triggering search and archetype generation...');
        const searchResponse = await fetch(
          `https://series-api-202642739529.us-central1.run.app/api/users/${result.userId}/search`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!searchResponse.ok) {
          const searchError = await searchResponse.json().catch(() => ({}));
          console.warn('Search endpoint returned non-200 status, but continuing:', {
            status: searchResponse.status,
            error: searchError
          });
          // Don't block the user flow if search fails
        } else {
          const searchResult = await searchResponse.json();
          console.log('Search and archetype generation started:', searchResult);
        }
      } catch (searchError) {
        console.error('Error triggering search and archetype generation:', searchError);
        // Don't block the user flow if search fails
      }
      
      // Proceed to welcome page after both operations
      setShowNextPage(true);
      
    } catch (error) {
      console.error('Error in handleButtonClick:', error);
      showError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };
  
  if (showNextPage) {
    return <WelcomePage bio={description} />;
  }

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

  const getBackgroundColor = (color: string) => {
    const colors: { [key: string]: string } = {
      gray: '#95a5a6',
      teal: '#4ecdc4',
      yellow: '#ffd93d',
      purple: '#6c5ce7',
      red: '#ff6b6b'
    };
    return colors[color] || '#95a5a6';
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        {/* Left side - Profile Card */}
        <motion.div 
          className="w-full md:w-96"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative bg-white rounded-lg overflow-hidden shadow-sm">
            {/* Profile header with Series logo */}

            
            {/* Profile image */}
            <div className="relative w-full aspect-[3/4] bg-gray-100">
              <img 
                src={profilePic}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover"
              />
              {/* Loading indicator removed as we're no longer uploading images separately */}
              
              {/* Action buttons */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <div className="opacity-50 cursor-not-allowed flex flex-col items-center w-16">
                  <button className="bg-black/30 backdrop-blur-sm p-3 rounded-xl shadow-md w-full flex flex-col items-center" disabled>
                    <MessageCircle size={20} className="text-white" />
                    <span className="text-[10px] mt-1 text-white font-medium">message</span>
                  </button>
                </div>
                <button className="bg-black/30 backdrop-blur-sm p-3 rounded-xl shadow-md hover:bg-black/60 hover:backdrop-blur transition-all duration-200 flex flex-col items-center w-16">
                  <User size={20} className="text-white" />
                  <span className="text-[10px] mt-1 text-white font-medium">join</span>
                </button>
                <div className="opacity-50 cursor-not-allowed flex flex-col items-center w-16">
                  <button className="bg-black/30 backdrop-blur-sm p-3 rounded-xl shadow-md w-full flex flex-col items-center" disabled>
                    <Phone size={20} className="text-white" />
                    <span className="text-[10px] mt-1 text-white font-medium">call</span>
                  </button>
                </div>
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
            <Card className="mb-4">
              <CardContent className="p-4">
                <motion.div variants={item}>
                  <h3 className="font-medium text-sm text-gray-900 mb-2">Me</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                </motion.div>
              </CardContent>
            </Card>
            
            {/* Connections card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-900 mb-2">Who I Know</h3>
                  <ul className="space-y-2">
                    {connections.map((connection, index) => (
                      <li key={index} className="flex">
                        <span className="text-blue-500 mr-2 mt-1.5 flex-shrink-0">•</span>
                        <span className="text-sm mr-1 mt-2 text-gray-600 break-words flex-1">{connection}</span>
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
          className="flex-1 flex flex-col justify-between py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-xl mx-auto w-full space-y-8 flex-1 flex flex-col">
            {/* Name and Picture on the same line */}
            <div className="mb-8">
              <div className="flex gap-8">
                {/* Name field - 65% width */}
                <div className="w-[65%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2">
                      <span className="text-gray-700">👤</span>
                    </div>
                    <label className="block text-xl font-medium text-gray-900">Name</label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        // Clear error when user starts typing
                        if (errors.name) {
                          setErrors({...errors, name: undefined});
                        }
                      }}
                      className={`block w-full rounded-2xl border ${errors.name ? 'border-red-500' : 'border-gray-200'} shadow-sm px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-0`}
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
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2">
                      <span className="text-gray-700">📸</span>
                    </div>
                    <label className="block text-xl font-medium text-gray-900">Profile</label>
                  </div>
                  <label 
                    htmlFor="profile-photo-upload"
                    className="flex items-center justify-center h-[58px] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer rounded-2xl shadow-sm"
                    title="Upload new photo"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-700">Upload</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
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
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2">
                    <span className="text-gray-700">🪪</span>
                  </div>
                  <label className="block text-xl font-medium text-gray-900">Age</label>
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
                    className={`block w-full appearance-none rounded-2xl border ${errors.age ? 'border-red-500' : 'border-gray-200'} shadow-sm px-5 py-4 text-base text-gray-900 focus:border-gray-300 focus:ring-0`}
                    disabled={isLoading}
                  >
                    <option value="18">18</option>
                    {Array.from({ length: 82 }, (_, i) => i + 19).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {errors.age && (
                    <p className="mt-1 text-xs text-red-600">{errors.age}</p>
                  )}
                </div>
              </div>
              
              {/* Location field */}
              <div className="w-[75%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2">
                    <span className="text-gray-700">📍</span>
                  </div>
                  <label className="block text-xl font-medium text-gray-900">Location</label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => {
                      setUserLocation(e.target.value);
                      // Clear error when user starts typing
                      if (errors.location) {
                        setErrors({...errors, location: undefined});
                      }
                    }}
                    className={`block w-full rounded-2xl border ${errors.location ? 'border-red-500' : 'border-gray-200'} shadow-sm px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-0`}
                    placeholder="New York, New York, US"
                    disabled={isLoading}
                  />
                  {errors.location && (
                    <p className="mt-1 text-xs text-red-600">{errors.location}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bio field */}
            <div className="space-y-2 mt-6">
              <label className="block text-xl font-medium text-gray-900">Who you are and what you do:</label>
              <div className="relative">
                <div className="relative">
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      // Clear error when user starts typing
                      if (errors.bio) {
                        setErrors({...errors, bio: undefined});
                      }
                    }}
                    className={`block w-full rounded-xl border ${errors.bio ? 'border-red-500' : 'border-gray-200'} shadow-sm px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-0`}
                    placeholder="junior @UCLA building e-commerce platform for shoes..."
                    disabled={isLoading}
                  />
                  {errors.bio && (
                    <p className="mt-1 text-xs text-red-600">{errors.bio}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Connections field with add/remove buttons */}
            <div className="space-y-2 mt-6 mb-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2">
                  <span className="text-gray-700">👥</span>
                </div>
                <label className="block text-xl font-medium text-gray-900">Who you know</label>
              </div>
              <div className="space-y-2">
                {connections.map((connection, index) => (
                  <div key={index} className="relative">
                    <input
                      type="text"
                      value={connection}
                      onChange={(e) => {
                        const updatedConnections = [...connections];
                        updatedConnections[index] = e.target.value;
                        setConnections(updatedConnections);
                      }}
                      className={`block w-full rounded-xl border border-gray-200 shadow-sm px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-0`}
                      placeholder="Enter name"
                      disabled={isLoading}
                    />
                    {connections.length > 1 && (
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
                    Add another person
                  </button>
                )}
              </div>
            </div>
            
            {/* Next button */}
            <div className="mt-auto pt-8 flex justify-center">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    className="fixed inset-0 flex items-center justify-center bg-white z-50"
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
                          duration: 3,
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
                          duration: 3,
                          ease: "easeInOut"
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
                  <motion.button
                    key="button"
                    className={`${isLoading ? 'bg-gray-400' : 'bg-black hover:bg-black/80'} text-white rounded-full p-3 w-24 h-10 mb-10 inline-flex items-center justify-center transition-colors`}
                    initial="initial"
                    animate="animate"
                    variants={fadeInUp}
                    whileHover={!isLoading ? { scale: 1.05 } : {}}
                    whileTap={!isLoading ? { scale: 0.95 } : {}}
                    onClick={!isLoading ? handleButtonClick : undefined}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileOnboarding;
