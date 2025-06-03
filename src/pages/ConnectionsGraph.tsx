import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import defaultAvatar from '../assets/images/default-avatar.png';
import ForceGraph from '../components/ForceGraph';
const initialProfilePic = defaultAvatar;

interface ConnectionsGraphProps {
  userData?: {
    name?: {
      first: string;
      last: string;
    };
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
  // Use a separate state for pane visibility that doesn't change with every input focus
  const [isPaneVisible, setIsPaneVisible] = useState(false);
  const [positionInput, setPositionInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [focusedNode, setFocusedNode] = useState<string | undefined>(undefined);

  // Memoized connections to prevent unnecessary rerenders
  const memoizedConnections = useMemo(() => connections, [connections.length]);

  // Update progress when connections change
  useEffect(() => {
    const progressValue = Math.min(connections.length / 3, 1);
    setProgress(progressValue);
    if (connections.length >= 3) {
      setShowSubmitButton(true);
    }
  }, [connections]);

  // Handle node click in the force graph
  const handleNodeClick = useCallback((nodeId: string | undefined) => {
    setFocusedNode(nodeId);
  }, []);

  // Handle submit button click
  const handleSubmit = useCallback(() => {
    const connectionData = {
      connections: connections.map(conn => ({
        position: conn.position,
        location: conn.location
      }))
    };
    onSubmit(connectionData);
  }, [connections, onSubmit]);

  // Reset inputs
  const resetInputs = () => {
    setPositionInput('');
    setLocationInput('');
    setCurrentInput(null);
  };

  // Add a new connection
  const addConnection = useCallback(() => {
    if (positionInput && locationInput) {
      // Use a callback to ensure we have the latest state
      setConnections(prevConnections => [
        ...prevConnections, 
        { position: positionInput, location: locationInput }
      ]);
      // Only update isPaneVisible when connections change
      setIsPaneVisible(true);
      resetInputs();
    }
  }, [positionInput, locationInput]);
  
  // Update isPaneVisible when connections change
  useEffect(() => {
    if (connections.length > 0) {
      setIsPaneVisible(true);
    }
  }, [connections.length]);

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 fixed top-0 left-0 z-50">
        <div 
          className="h-full bg-black transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* ForceGraph visualization - using the same container style as ForceGraphTest */}
      <div className="h-screen w-full">
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
          isPaneVisible={isPaneVisible} /* Using stable state that doesn't change with input focus */
        />
      </div>
      
      {/* Submit button (appears when 3 connections are added) */}
      <AnimatePresence>
        {showSubmitButton && (
          <motion.div 
            className="fixed bottom-48 left-0 right-0 flex justify-center z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <button
              onClick={handleSubmit}
              className="bg-black text-white py-3 px-8 rounded-full font-medium hover:bg-black/90 transition-colors shadow-lg"
            >
              Continue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input panel with title */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center">
        <motion.div 
          className="bg-white p-6 rounded-t-3xl shadow-lg border border-gray-100 flex flex-col"
          animate={{ 
            height: currentInput ? '40vh' : '20vh',
            y: currentInput ? 0 : 0
          }}
          initial={{ height: '30vh', y: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 25,
            height: { duration: 0.3 }
          }}
          style={{ width: '432px', maxWidth: '95vw' }}
        >
          {/* Title inside input panel */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">who i know</h1>
            <p className="text-gray-600 mt-2 italic">include any ______ groups you know</p>
          </div>
          
          {/* Input fields */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <div className="w-full sm:w-[calc(50%-16px)] flex items-center">
              <input 
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="content creators"
                value={positionInput}
                onChange={(e) => setPositionInput(e.target.value)}
                onFocus={() => setCurrentInput('position')}
                onBlur={() => setTimeout(() => {
                  if (!document.activeElement || 
                      (document.activeElement.tagName !== 'INPUT' && 
                       document.activeElement.tagName !== 'BUTTON')) {
                    setCurrentInput(null);
                    // Don't update isPaneVisible here to prevent ForceGraph rerenders
                  }
                }, 100)}
                onKeyDown={handleKeyPress}
              />
            </div>
            <div className="flex-shrink-0 text-xl flex items-center justify-center font-light px-1 tracking-wider">from</div>
            <div className="w-full sm:w-[calc(50%-16px)] flex items-center">
              <input 
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="New York"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onFocus={() => setCurrentInput('location')}
                onBlur={() => setTimeout(() => {
                  if (!document.activeElement || 
                      (document.activeElement.tagName !== 'INPUT' && 
                       document.activeElement.tagName !== 'BUTTON')) {
                    setCurrentInput(null);
                    // Don't update isPaneVisible here to prevent ForceGraph rerenders
                  }
                }, 100)}
                onKeyDown={handleKeyPress}
              />
              <button 
                className={`flex-shrink-0 rounded-full w-10 h-10 flex items-center justify-center ml-1 ${
                  positionInput || locationInput 
                    ? 'bg-black text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}
                onClick={addConnection}
                disabled={!positionInput && !locationInput}
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>

          {/* Explanatory text */}
          <p className="text-gray-400 italic text-sm mt-8 text-center">
            You must add at least 3 connections so your AI friend knows who you know and can use that to make accurate group chats with people you should know within the network. The more connections, the better the matches.
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default ConnectionsGraph;
