import React, { useState, useEffect, useCallback, useMemo } from 'react';
import defaultAvatar from '../assets/images/default-avatar.png';
import ForceGraph from '../components/ForceGraph';
import { getApiUrl } from '../utils/api';
import {
  PageContainer,
  ProgressBar,
  SlideUpPanel,
  PanelTitle,
  InputGroup,
  ConnectionInput,
  FloatingActionButton
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
  // State for connections and inputs
  const [connections, setConnections] = useState<Array<{ position: string; location: string }>>([]);
  const [currentInput, setCurrentInput] = useState<'position' | 'location' | null>(null);
  const [positionInput, setPositionInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [focusedNode, setFocusedNode] = useState<string | undefined>(undefined);

  // Memoized connections to prevent unnecessary rerenders
  const memoizedConnections = useMemo(() => connections, [connections.length]);

  // Update progress when connections change
  useEffect(() => {
    const progressValue = Math.min(connections.length / 3 * 100, 100);
    setProgress(progressValue);
    
    // Show submit button and hide panel when we have 3+ connections
    setShowSubmitButton(connections.length >= 3);
    
    // If we have 3 connections, clear the input panel
    if (connections.length >= 3) {
      setCurrentInput(null);
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
    console.log('Submitting connections:', connections);
    
    // If we have a phone number, create a user first
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
        }

        // Format phone number to E.164 format
        const e164Phone = formatPhoneToE164(userData.phone);

        // Generate a random email based on the user's name
        const firstName = userData?.name?.first || '';
        const lastName = userData?.name?.last || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const randomEmail = `${fullName.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 1000)}@series.placeholder`;
        
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
          phone: e164Phone
        };

        // Create the user in the backend
        const createUserResponse = await fetch(getApiUrl('users'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userCreateData),
        });

        if (!createUserResponse.ok) {
          const errorData = await createUserResponse.json();
          throw new Error(errorData.detail || 'Failed to create user');
        }

        const createdUser = await createUserResponse.json();
        const userId = createdUser.userId || e164Phone;
        
        // Fetch the current sender name for the deeplink
        try {
          const response = await fetch(getApiUrl(`users/${userId}`));
          console.log('API response status:', response.status);
          
          if (response.ok) {
            const userData = await response.json();
            console.log('API response data:', userData);
            console.log('Current sender name:', userData.current_sender_name);
            
            if (userData.current_sender_name) {
              console.log('Passing current_sender_name to OnboardingPage:', userData.current_sender_name);
              // Pass the userId and sender name to onSubmit
              onSubmit({
                ...userData,
                connections,
                userId,
                current_sender_name: userData.current_sender_name,
                phone: e164Phone
              });
              return;
            } else {
              console.log('No current_sender_name found in API response');
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

  // Reset inputs and update panel visibility
  const resetInputs = () => {
    setPositionInput('');
    setLocationInput('');
    
    // Only clear current input if we haven't reached 3 connections
    if (connections.length < 3) {
      setCurrentInput(null);
    }
  };

  // Add a new connection
  const addConnection = useCallback(() => {
    if (positionInput.trim() && locationInput.trim() && connections.length < 3) {
      // Add the new connection
      setConnections([...connections, {
        position: positionInput.trim(),
        location: locationInput.trim()
      }]);
      
      // Reset inputs
      resetInputs();
      
      // No need to update panel visibility as we're using the SlideUpPanel component directly
    }
  }, [positionInput, locationInput, connections]);

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
      {/* Progress bar */}
      <ProgressBar progress={progress} />
      
      {/* ForceGraph visualization - contained to prevent overflow */}
      <div 
        className="absolute inset-0 w-full h-screen overflow-hidden" 
        style={{ 
          top: '2px', /* Account for progress bar */
          height: 'calc(100vh - 2px)', /* Subtract progress bar height */
          maxHeight: 'calc(100vh - 2px)',
          width: '100%',
          maxWidth: '100%'
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
      
      {/* Submit button (appears only when exactly 3 connections are added) */}
      {showSubmitButton && (
        <FloatingActionButton 
          onClick={handleSubmit}
          visible={showSubmitButton}
          position="center" /* Center the button in the screen */
          text="Continue"
          className="fixed bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 z-50 w-[80%] sm:w-auto max-w-[300px] font-medium text-base sm:text-lg" /* Position at bottom center with responsive width and font */
        />
      )}
      
      {/* Input panel with title - completely hidden when we have 3 connections */}
      {connections.length < 3 && (
        <SlideUpPanel 
          expanded={currentInput !== null}
          minHeight={window.innerWidth <= 768 ? "30vh" : "20vh"}
          maxHeight={window.innerWidth <= 768 ? "52vh" : "30vh"}
          width={window.innerWidth <= 768 ? "95%" : "432px"}
        >
        {/* Title inside input panel */}
        <PanelTitle 
          title="who i know"
          subtitle="Add 3 groups of people that you're involved with, a part of, or know a lot of people in"
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

        {/* Explanatory text */}
        {/* <HelpText centered className='mt-4'>
          You must add at least 3 connections so your AI friend knows who you know and can use that to make accurate group chats with people you should know within the network. The more connections, the better the matches.
        </HelpText> */}
      </SlideUpPanel>
      )}
    </PageContainer>
  );
};

export default ConnectionsGraph;
