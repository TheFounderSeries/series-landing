import React, { useState } from 'react';
import ForceGraph from '../components/ForceGraph';
import defaultAvatar from '../assets/images/default-avatar.png';

const ForceGraphTest: React.FC = () => {
  const [connections, setConnections] = useState([
    { position: 'CEO', location: 'San Francisco' },
    { position: 'CTO', location: 'New York' },
    { position: 'Designer', location: 'Remote' },
  ]);

  const userData = {
    name: {
      first: 'John',
      last: 'Doe'
    },
    profilePic: defaultAvatar
  };

  const handleNodeClick = (node: any) => {
    console.log('Node clicked:', node);
  };

  const handleSubmit = (data: any) => {
    console.log('Form submitted with data:', data);
  };

  return (
    <div className="h-screen w-full">
      <ForceGraph 
        userData={userData}
        connections={connections}
        onNodeClick={handleNodeClick}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ForceGraphTest;
