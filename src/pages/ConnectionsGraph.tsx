import React, { useState, useEffect, useCallback, useMemo } from 'react';
import defaultAvatar from '../assets/images/default-avatar.png';
import ForceGraph from '../components/ForceGraph';
import { getApiUrl } from '../utils/api';
import { usePostHog } from 'posthog-js/react';
import {
  PageContainer,
  SlideUpPanel,
  PanelTitle,
  InputGroup,
  ConnectionInput
} from '../components/ui';

const initialProfilePic = defaultAvatar;

interface ConnectionsGraphProps {
  userData?: {
    name?: {
      first: string;
      last: string;
    };
    bio?: string;
    location?: string;
    phone?: string;
    profilePic?: string;
    [key: string]: any;
  };
  onSubmit: (data: any) => void;
}

// ForceGraph component handles node and link interfaces internally
const ConnectionsGraph: React.FC<ConnectionsGraphProps> = ({ userData = {}, onSubmit }) => {
  // Initialize PostHog
  const posthog = usePostHog();
  
  // State for connections and inputs
  const [connections, setConnections] = useState<Array<{ position: string; location: string }>>([]);
  const [currentInput, setCurrentInput] = useState<'position' | 'location' | null>(null);
  const [positionInput, setPositionInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [focusedNode, setFocusedNode] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false); // Track if modal should be shown
  const [isLoading, setIsLoading] = useState(false); // Track loading state for the Continue button

  // Memoized connections to prevent unnecessary rerenders
  const memoizedConnections = useMemo(() => connections, [connections.length]);

  // Update progress when connections change
  useEffect(() => {
    const progressValue = Math.min(connections.length / 3 * 100, 100);
    setProgress(progressValue);
    
    // Show submit button and hide panel when we have 3+ connections
    setShowSubmitButton(connections.length >= 3);
    
    // If we have 3 connections, hide the modal
    if (connections.length >= 3) {
      setShowModal(false);
      setCurrentInput(null);
      
      // Force modal to close with a slight delay to ensure state updates properly
      setTimeout(() => {
        setShowModal(false);
        setCurrentInput(null);
      }, 100);
    }
  }, [connections]);

  // Handle node click in the force graph
  const handleNodeClick = useCallback((nodeId: string | undefined) => {
    setFocusedNode(nodeId);
  }, []);

  // Format phone number to E.164 format (copied from PhoneAuth.tsx)
  const formatPhoneToE164 = (phoneNumber: string): string => {
    // Remove all non-digit characters
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    // Add country code if not present
    return formattedPhone.startsWith('1') ? `+${formattedPhone}` : `+1${formattedPhone}`;
  };

  // Helper function for avatar background color (copied from PhoneAuth.tsx)
  const getBackgroundColor = (colorIndex?: number): string => {
    const colors = ['#FFD700', '#FF6347', '#4682B4', '#32CD32', '#9370DB'];
    const index = typeof colorIndex === 'number' ? colorIndex : Math.floor(Math.random() * colors.length);
    return colors[index % colors.length];
  };

  // Handle form submission with user creation
  const handleSubmit = async () => {
    // Set loading state to prevent multiple clicks
    setIsLoading(true);
    // Track connections submission event
    posthog.capture('connections_submitted', {
      connection_count: connections.length,
      connections: connections
    });
    
    // Update user properties with connection information
    if (userData.phone) {
      posthog.identify(userData.phone, {
        $set: {
          connections_count: connections.length,
          connections: connections.map(c => `${c.position} at ${c.location}`).join(', ')
        }
      });
    }
    
    // If we have a phone number, check if user exists first, then create if needed
    if (userData.phone) {
      try {
        // Format the user data according to the backend schema
        interface UserCreateData {
          email: string;
          name: {
            first: string;
            last: string;
          };
          groups: string[];
          bio: string;
          location: string | null;
          age: number | null;
          profilePic: string | null;
          color: string | null;
          phone?: string;
          connections?: Array<{ position: string; location: string }>;
          metadata?: {
            referredBy?: string;
            [key: string]: any;
          };
        }

        // Format phone number to E.164 format
        const e164Phone = formatPhoneToE164(userData.phone);
        
        // First check if user already exists by phone number
        let userId = e164Phone;
        let existingUser = null;
        
        try {
          const checkUserResponse = await fetch(getApiUrl(`users/phone/${e164Phone}`));
          if (checkUserResponse.ok) {
            existingUser = await checkUserResponse.json();
            userId = existingUser.userId || e164Phone;
            console.log('User already exists:', existingUser);
            
            // If user exists and has current_sender_name, pass it along with other user data
            if (existingUser.current_sender_name) {
              onSubmit({
                ...userData,
                ...existingUser,  // Include all existing user data
                connections,
                userId,
                phone: e164Phone
              });
              return; // Exit early since we've handled the submission
            }
          }
        } catch (error) {
          console.log('User not found, will create new user');
        }
        
        // If user doesn't exist, create a new one
        if (!existingUser) {
          // Generate a random email based on the user's name
          const firstName = userData?.name?.first || '';
          const lastName = userData?.name?.last || '';
          const fullName = `${firstName} ${lastName}`.trim();
          const randomEmail = `${fullName.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 1000)}@series.placeholder`;
          
          // Log userData to see what we're working with
          console.log('User data before formatting for creation:', {
            userData,
            firstName,
            lastName,
            profilePic: userData?.profilePic,
            phone: userData?.phone,
            e164Phone,
            metadata: userData?.metadata
          });
          
          const userCreateData: UserCreateData = {
            // Generate a placeholder email
            email: randomEmail,
            // Pass through name in the correct format
            name: {
              first: firstName,
              last: lastName || 'User'
            },
            // Format connections as strings in the format "(position) from (location)"
            groups: connections.map(conn => `${conn.position} from ${conn.location}`) || [],
            // Pass through bio
            bio: userData?.bio || '',
            // Pass through location as a string
            location: userData?.location || null,
            // Pass through age, converting to number if needed
            age: userData?.age ? Number(userData?.age) : null,
            // Pass through profile picture if available
            profilePic: userData?.profilePic || null,
            // Pass through color
            color: userData?.color || getBackgroundColor(userData?.colorIndex as number),
            // Add phone number in E.164 format
            phone: e164Phone,
            // Include metadata with referral information if available
            metadata: userData.metadata
          };
          
          // Log the formatted data being sent to the backend
          console.log('User create data being sent to backend:', JSON.stringify(userCreateData, null, 2));

          // Create the user in the backend using fetch directly for more detailed error logging
          try {
            console.log('Sending user creation request to:', getApiUrl('users'));
            
            const response = await fetch(getApiUrl('users'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userCreateData)
            });
            
            // Log the raw response status
            console.log('User creation response status:', response.status, response.statusText);
            
            // If response is not ok, get the error details
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Error response from server:', {
                status: response.status,
                statusText: response.statusText,
                errorBody: errorText
              });
              
              try {
                // Try to parse the error as JSON if possible
                const errorJson = JSON.parse(errorText);
                console.error('Parsed error details:', errorJson);
                
                // Log specific validation errors if available
                if (errorJson.detail && Array.isArray(errorJson.detail)) {
                  console.error('Validation errors:', errorJson.detail);
                }
              } catch (parseError) {
                // If it's not JSON, just log the raw text
                console.error('Raw error response:', errorText);
              }
              
              throw new Error(`Server returned ${response.status}: ${errorText}`);
            }
            
            // Parse the successful response
            const createdUser = await response.json();
            console.log('User created successfully:', createdUser);
            userId = createdUser.userId || e164Phone;
          } catch (error) {
            console.error('Error in user creation process:', error);
            throw new Error('Failed to create user: ' + (error instanceof Error ? error.message : String(error)));
          }
        }
        
        // Trigger the search endpoint with the AI enhancement preference
        try {
          // Default to enhancing with AI unless explicitly set to false
          const enhanceWithAI = userData?.enhanceWithAI !== undefined ? userData.enhanceWithAI : true;
          const searchUrl = getApiUrl(`users/${userId}/search?enhance_with_ai=${enhanceWithAI}`);
          
          console.log('Triggering search endpoint:', {
            url: searchUrl,
            userId,
            enhanceWithAI
          });
          
          const searchResponse = await fetch(searchUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          // Log the search response status
          console.log('Search response status:', searchResponse.status, searchResponse.statusText);
          
          if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            console.error('Search API error:', {
              status: searchResponse.status,
              statusText: searchResponse.statusText,
              errorBody: errorText
            });
            
            try {
              // Try to parse the error as JSON
              const errorJson = JSON.parse(errorText);
              console.error('Search error details:', errorJson);
            } catch (parseError) {
              // If not JSON, log the raw text
              console.error('Raw search error response:', errorText);
            }
          } else {
            const searchResult = await searchResponse.json();
            console.log('Search completed successfully:', searchResult);
          }
        } catch (searchErr) {
          console.error('Exception when triggering search:', searchErr);
          // Don't throw error here, continue with the flow
        }
        
        // Fetch the current sender name for the deeplink
        try {
          const response = await fetch(getApiUrl(`users/${userId}`));
          if (response.ok) {
            const userData = await response.json();

            // GCS URLs are now permanently accessible with service account authentication
            // No need to convert the URL

            if (userData.current_sender_name) {
              // Pass the userId and sender name to onSubmit
              onSubmit({
                ...userData,
                connections,
                userId,
                current_sender_name: userData.current_sender_name,
                phone: e164Phone
              });
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        
        // If we couldn't get the current_sender_name, just pass the userId and phone
        onSubmit({
          ...userData,
          connections,
          userId,
          phone: e164Phone
        });
        
      } catch (error) {
        console.error('Error creating user:', error);
        // Fall back to regular submission if user creation fails
        onSubmit({
          ...userData,
          connections,
          phone: userData.phone
        });
      }
    } else {
      // No phone number, just pass the data through
      onSubmit({
        ...userData,
        connections
      });
    }
  };

  // Reset inputs but keep modal visible
  const resetInputs = () => {
    setPositionInput('');
    setLocationInput('');
    
    // Reset to position input but keep modal visible
    setCurrentInput('position');
  };

  // Add a new connection
  const addConnection = useCallback(() => {
    if (positionInput.trim() && locationInput.trim() && connections.length < 3) {
      // Add the new connection
      setConnections([...connections, {
        position: positionInput.trim(),
        location: locationInput.trim()
      }]);
      
      // Track connection added event
      posthog.capture('connection_added', {
        position: positionInput.trim(),
        location: locationInput.trim(),
        connection_count: connections.length + 1
      });
      
      // Reset inputs
      resetInputs();
      
      // No need to update panel visibility as we're using the SlideUpPanel component directly
    }
  }, [positionInput, locationInput, connections, posthog]);

  // Handle key press in input fields
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentInput === 'position' && positionInput) {
        setCurrentInput('location');
      } else if (currentInput === 'location' && locationInput && positionInput) {
        addConnection();
      }
    }
  };

  return (
    <PageContainer className="overflow-hidden p-0">
      {/* Progress bar with indicator */}
      <div className="fixed top-8 left-0 right-0 z-50 flex justify-center items-center gap-3 px-4">
        <div className="w-full max-w-md bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs font-medium whitespace-nowrap">
          {connections.length}/3
        </div>
      </div>
      
      {/* ForceGraph visualization - contained to prevent overflow */}
      <div 
        className="absolute inset-0 w-full h-screen overflow-hidden" 
        style={{ 
          top: '0px',
          height: '100vh',
          maxHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          zIndex: 10, // Ensure graph has a defined z-index
          pointerEvents: 'auto' // Explicitly enable pointer events
        }}
      >
        <ForceGraph
          userData={{
            name: { first: userData.name?.first || 'You', last: userData.name?.last || '' },
            profilePic: userData.profilePic || initialProfilePic
          }}
          connections={memoizedConnections}
          isDarkMode={false}
          focusedNode={focusedNode}
          setFocusedNode={(node) => handleNodeClick(node === null ? undefined : node)}
          onNodeClick={(node) => node && handleNodeClick(node.id)}
          onSubmit={handleSubmit}
          /* isPaneVisible prop removed as it's not needed in ForceGraph component */
        />
      </div>
      
      {/* Continue button (appears only when exactly 3 connections are added) */}
      {showSubmitButton && (
        <div className="fixed bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 z-30 w-[80%] sm:w-auto max-w-[300px] pointer-events-auto">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full bg-black text-white py-3 px-8 rounded-full font-medium transition-all shadow-lg text-base sm:text-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black/90 animate-pulse hover:animate-none active:scale-95'} duration-150`}
          >
            {isLoading ? 'Loading...' : 'Continue'}
          </button>
        </div>
      )}
      
      {/* Input panel with title - only shows after user clicks the button */}
      {showModal && connections.length < 3 && (
        <SlideUpPanel 
          expanded={true} /* Always expanded once shown */
          minHeight={window.innerWidth <= 768 ? "30vh" : "20vh"}
          maxHeight={window.innerWidth <= 768 ? "52vh" : "30vh"}
          width={window.innerWidth <= 768 ? "95%" : "432px"}
        >
        {/* Title inside input panel */}
        <PanelTitle 
          title="who i know"
          subtitle="Add 3 groups of people that you're involved with, a part of, or know a lot of people in; one at a time!"
          className='mb-4'
        />
        
        {/* Input fields */}
        <InputGroup>
          <ConnectionInput
            positionValue={positionInput}
            locationValue={locationInput}
            onPositionChange={(e) => setPositionInput(e.target.value)}
            onLocationChange={(e) => setLocationInput(e.target.value)}
            onPositionFocus={() => setCurrentInput('position')}
            onLocationFocus={() => setCurrentInput('location')}
            onPositionBlur={() => setTimeout(() => {
              if (!document.activeElement || 
                  (document.activeElement.tagName !== 'INPUT' && 
                   document.activeElement.tagName !== 'BUTTON')) {
                setCurrentInput(null);
              }
            }, 100)}
            onLocationBlur={() => setTimeout(() => {
              if (!document.activeElement || 
                  (document.activeElement.tagName !== 'INPUT' && 
                   document.activeElement.tagName !== 'BUTTON')) {
                setCurrentInput(null);
              }
            }, 100)}
            onKeyDown={handleKeyPress}
            onAddConnection={addConnection}
          />
        </InputGroup>
        
      </SlideUpPanel>
      )}
      
      {/* Add who you know button - fixed at bottom with proper spacing */}
      {!showModal && connections.length === 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-12 px-6">
          <button
            onClick={() => {
              setShowModal(true);
              setCurrentInput('position');
              
              // Track modal open event
              posthog.capture('add_connection_clicked');
            }}
            className="bg-black text-white py-3 px-8 rounded-full font-medium hover:bg-black/90 transition-all shadow-lg w-full max-w-[320px] active:scale-95 duration-150"
          >
            Add who you know
          </button>
        </div>
      )}
    </PageContainer>
  );
};

export default ConnectionsGraph;
