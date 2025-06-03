import React, { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide, forceX, forceY } from 'd3-force-3d';
import defaultAvatar from '../assets/images/default-avatar.png';

interface GraphNode {
  id: string;
  name: string;
  val: number;
  avatar?: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value?: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface ForceGraphProps {
  userData?: {
    name?: {
      first: string;
      last: string;
    };
    profilePic?: string;
    [key: string]: any;
  };
  connections?: Array<{ position: string; location: string }>;
  isDarkMode?: boolean;
  focusedNode?: string;
  setFocusedNode?: (node: string | null) => void;
  onNodeClick?: (node: GraphNode) => void;
  onSubmit?: (data: any) => void;
  isPaneVisible?: boolean;
}

// Helper function to apply forces to the graph
const applyGraphForces = (graphRef: React.RefObject<any>, linkDistance: number, nodeRadius: number) => {
  const fg = graphRef.current;
  if (!fg) return;

  // Configure link force
  fg.d3Force('link')
    ?.id((d: any) => d.id)
    .distance(linkDistance)
    .iterations(1);

  // Configure charge force (repulsion)
  const chargeForce = fg.d3Force('charge');
  if (chargeForce) {
    chargeForce.strength(-800)  // Increased repulsion for more movement
      .distanceMin(10)  // Minimum distance before repulsion kicks in
      .distanceMax(200); // Maximum distance for repulsion
  }
  
  // Add center attraction
  fg.d3Force('centerX', forceX(0).strength(0.05));
  fg.d3Force('centerY', forceY(0).strength(0.05));
  
  // Add some random jitter to keep things moving
  fg.d3Force('jitter', forceX(0)
    .strength(() => Math.random() * 0.01)
    .x(() => Math.random() * 2 - 1)
  );

  // Configure collision detection with node radius
  fg.d3Force('collide', forceCollide()
    .radius((d: any) => (d.val || nodeRadius) * 1.2)
    .strength(0.7)
    .iterations(2)
  );

  // Reheat the simulation to get things moving
  if (fg.d3ReheatSimulation && typeof fg.d3ReheatSimulation === 'function') {
    fg.d3ReheatSimulation();
  }
};

const ForceGraph: React.FC<ForceGraphProps> = ({
  userData = {},
  connections = [],
  focusedNode,
  setFocusedNode,
  onNodeClick,
  onSubmit,
  // Ignoring isPaneVisible as it was causing rendering issues
  isPaneVisible: _unused = false // Using proper destructuring pattern to ignore
}) => {
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Generate graph data from user data and connections
  const generateGraphData = useCallback((): GraphData => {
    // Create user node
    const userNode: GraphNode = {
      id: 'user',
      name: userData?.name?.first || 'You',
      val: 10, 
      avatar: userData?.profilePic || defaultAvatar,
      x: 0,
      y: 0,
    };

    // Create connection nodes
    const connectionNodes: GraphNode[] = connections.map((conn, i) => ({
      id: `${conn.position}-${conn.location}-${i}`,
      name: conn.position,
      val: 2, // Smaller than user node
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
    }));

    // Create links from user to connections
    const links: GraphLink[] = connections.map((conn, i) => ({
      source: 'user',
      target: `${conn.position}-${conn.location}-${i}`,
      value: 1,
    }));

    return {
      nodes: [userNode, ...connectionNodes],
      links,
    };
  }, [userData, connections]);

  const [graphData, setGraphData] = useState<GraphData>(() => generateGraphData());

  // Update graph data when userData or connections change
  useEffect(() => {
    setGraphData(generateGraphData());
  }, [userData, connections, generateGraphData]);

  // Handle window resize events - simplified to just update dimensions without zoom
  useEffect(() => {
    const handleWindowResize = () => {
      // Just update the dimensions state, let the graph handle the rest naturally
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Initial resize and event listener
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  // Apply forces when graph data changes
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg || !graphData) return;
    
    // Set dimensions
    if (typeof fg.width === 'function') fg.width(dimensions.width);
    if (typeof fg.height === 'function') fg.height(dimensions.height);

    if (typeof fg.graphData === 'function') {
      const nodesWithPositions = graphData.nodes.map(node => ({
        ...node,
        x: node.x || 0,
        y: node.y || 0
      }));

      fg.graphData({
        nodes: nodesWithPositions,
        links: graphData.links
      })
    }

    // Apply our custom forces after data is set
  setTimeout(() => {
    applyGraphForces(graphRef, 20, Math.max(...graphData.nodes.map((node) => node.val)));
    
    // Set simulation parameters
    if (typeof fg.cooldownTicks === 'function') fg.cooldownTicks(Infinity);
    if (typeof fg.d3VelocityDecay === 'function') fg.d3VelocityDecay(0.4);
    
    // No automatic zoom adjustment - let the graph render at its natural size
    // This should prevent the size jumping issue
  }, 50);
}, [graphData, dimensions]);

  // Set initial zoom level
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    
    // Set initial zoom level to be closer (higher value = closer zoom)
    setTimeout(() => {
      if (fg.zoom && typeof fg.zoom === 'function') {
        fg.zoom(2.5);
      }
    }, 100);
  }, []);

  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    console.log(`Node clicked: ${node.name}`);
    if (onNodeClick) {
      onNodeClick(node);
    }
    if (setFocusedNode) {
      setFocusedNode(node.id);
    }
  };

  const handleNodeDragEnd = (node: GraphNode) => {
    console.log(`Node dragged: ${node.name}`);
    
    // Update node position in the graph data
    const updatedNodes = graphData.nodes.map(n => {
      if (n.id === node.id) {
        return { ...n, x: node.x, y: node.y };
      }
      return n;
    });
    
    // Create proper links by reference to ensure they work correctly
    const nodeMap: Record<string, GraphNode> = {};
    updatedNodes.forEach(node => {
      nodeMap[node.id] = node;
    });
    
    const updatedLinks = graphData.links.map(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source as string;
      const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target as string;
      
      return {
        source: nodeMap[sourceId],
        target: nodeMap[targetId],
        value: link.value
      };
    });
    
    // Update the graph data with both updated nodes and links
    setGraphData({ nodes: updatedNodes, links: updatedLinks });
    
    // Reheat the simulation to ensure proper force application after drag
    setTimeout(() => {
      const fg = graphRef.current;
      if (fg && typeof fg.d3ReheatSimulation === 'function') {
        fg.d3ReheatSimulation();
      }
    }, 10);
  };

  const applyCustomForces = (force: any) => {
    // Configure forces as needed
    force('charge').strength(-50).distanceMax(100);
    force('collide', forceCollide(30).strength(0.7));
    
    // Add a slight center attraction force
    force('center').strength(0.05);
    
    // Add jitter forces for organic movement
    force('x', forceX().strength(0.01));
    force('y', forceY().strength(0.01));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ connections });
    }
  };

  const handleContinue = handleSubmit;

  // Custom node rendering with avatar for user node
  const nodeCanvasObject = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    // Increased base font size and adjusted scaling for better readability
    const baseFontSize = 16; // Increased from 12
    const fontSize = baseFontSize / Math.max(globalScale, 0.8); // Adjusted scaling to prevent text from getting too small
    const nodeRadius = node.val;
    const x = node.x || 0;
    const y = node.y || 0;
    
    // Draw avatar for user node (drawn first to be behind the border)
    if (node.id === 'user' && node.avatar) {
      const img = new Image();
      img.src = node.avatar;
      
      // Only draw if image is loaded
      if (img.complete) {
        const imgSize = nodeRadius * 2;
        // Create a circular clipping path for the image
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        // Draw the image with preserved aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (aspectRatio >= 1) {
          // Image is wider than tall
          drawHeight = imgSize;
          drawWidth = drawHeight * aspectRatio;
          offsetX = x - (drawWidth / 2);
          offsetY = y - nodeRadius;
        } else {
          // Image is taller than wide
          drawWidth = imgSize;
          drawHeight = drawWidth / aspectRatio;
          offsetX = x - nodeRadius;
          offsetY = y - (drawHeight / 2);
        }
        
        ctx.drawImage(
          img,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight
        );
        
        // Add a subtle white border
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2, true);
        ctx.lineWidth = 2 / globalScale;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        
        ctx.restore();
      } else {
        // If image isn't loaded yet, draw a placeholder
        img.onload = () => {
          if (graphRef.current) {
            // Force a re-render by updating the graph data
            if (typeof graphRef.current.graphData === 'function') {
              const currentData = graphRef.current.graphData();
              graphRef.current.graphData({...currentData});
            }
          }
        };
        
        // Fallback circle if image not loaded
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#4299e1';
        ctx.fill();
      }
    } else {
      // Draw regular node for non-user nodes
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#2b2b2b';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();
    }

    // Draw node label with SF Pro font and increased weight
    ctx.font = `600 ${fontSize}px 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position text below the node
    const textY = y + nodeRadius + fontSize + 2;
    
    // Draw text with white outline for better visibility
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3 / globalScale;
    ctx.strokeText(label, x, textY);
    
    // Draw main text
    ctx.fillStyle = '#333333';
    ctx.fillText(label, x, textY);
    
    // Draw location for connection nodes
    if (node.id !== 'user') {
      const nodeIndex = parseInt(node.id.split('-').pop() || '0');
      const location = connections[nodeIndex]?.location;
      if (location) {
        const locationY = textY + fontSize * 1.4; // Slightly more spacing
        ctx.font = `500 ${fontSize * 0.85}px 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = '#555555'; // Slightly darker for better contrast
        ctx.fillText(location, x, locationY);
      }
    }
  }, [connections]);

  return (
    <div className="force-graph-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeCanvasObject={nodeCanvasObject}
        linkColor={() => '#cccccc'}
        linkWidth={3}
        linkDirectionalParticles={0}
        linkDirectionalParticleWidth={1.4}
        nodeRelSize={1}
        width={dimensions.width}
        height={dimensions.height}
        onNodeClick={handleNodeClick}
        onNodeDragEnd={handleNodeDragEnd}
        cooldownTicks={Infinity} // Keep simulation running indefinitely
        d3VelocityDecay={0.3} // Lower decay = more movement
        warmupTicks={50} // More warmup ticks to stabilize initial layout
        enableNodeDrag={true} // Allow nodes to be dragged
        enableZoomInteraction={true} // Allow zooming
        enablePanInteraction={true} // Allow panning
        onEngineStop={() => {
          // Keep simulation running continuously
          if (graphRef.current && typeof graphRef.current.d3ReheatSimulation === 'function') {
            setTimeout(() => {
              graphRef.current.d3ReheatSimulation();
            }, 2000); // Reheat every 2 seconds
          }
        }}
      />
    </div>
  );
};

// Use React.memo to prevent unnecessary rerenders
export default React.memo(ForceGraph, (prevProps, nextProps) => {
  // Only rerender if connections array length changes (added/removed connections)
  // or if userData changes (new profile picture)
  const prevConnectionsLength = prevProps.connections?.length || 0;
  const nextConnectionsLength = nextProps.connections?.length || 0;
  
  // Check if connections length has changed
  if (prevConnectionsLength !== nextConnectionsLength) {
    return false; // Different length means we should rerender
  }
  
  // Check if userData has changed
  const prevUserPic = prevProps.userData?.profilePic;
  const nextUserPic = nextProps.userData?.profilePic;
  if (prevUserPic !== nextUserPic) {
    return false; // Different user pic means we should rerender
  }
  
  // Check if focusedNode has changed
  if (prevProps.focusedNode !== nextProps.focusedNode) {
    return false; // Different focused node means we should rerender
  }
  
  // For all other prop changes, don't rerender
  // This prevents rerenders when input fields are focused/blurred
  return true;
});
