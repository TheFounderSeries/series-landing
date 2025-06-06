import React, { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide, forceX, forceY } from 'd3-force-3d';
import { usePostHog } from 'posthog-js/react';
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
}

// Helper function to apply forces to the graph
const applyGraphForces = (graphRef: React.RefObject<any>, linkDistances: number | number[], nodeRadius: number) => {
  const fg = graphRef.current;
  if (!fg) return;

  // Configure link force
  const linkForce = fg.d3Force('link')
    ?.id((d: any) => d.id)
    .iterations(1);
    
  // If we have an array of distances, set a distance function
  if (Array.isArray(linkDistances)) {
    linkForce?.distance((_: any, i: number) => {
      return linkDistances[i % linkDistances.length];
    });
  } else {
    // Single distance for all links
    linkForce?.distance(linkDistances);
  }

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
};

const ForceGraph: React.FC<ForceGraphProps> = ({
  userData = {},
  connections = [],
  // Renamed to avoid unused variable warning
  focusedNode: _focusedNode,
  setFocusedNode,
  onNodeClick,
  // onSubmit is used in handleNodeClick
}) => {
  const graphRef = useRef<any>(null);
  const posthog = usePostHog();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  // Track when the graph is initialized
  useEffect(() => {
    posthog.capture('force_graph_initialized', {
      connection_count: connections.length,
      viewport_width: dimensions.width,
      viewport_height: dimensions.height,
      has_user_data: !!userData?.name,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Generate graph data from user data and connections
  const generateGraphData = useCallback((): GraphData => {
    // Create user node
    const userNode: GraphNode = {
      id: 'user',
      name: userData?.name?.first || 'You',
      val: 12 , 
      avatar: userData?.profilePic || defaultAvatar,
      x: 0,
      y: 0,
    };

    // Create connection nodes
    const connectionNodes: GraphNode[] = connections.map((conn, i) => ({
      id: `${conn.position}-${conn.location}-${i}`,
      name: conn.position,
      val: 1.3,
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
    // Ensure we have exactly one link of each distance (2, 8, 16)
    // and cycle through them if there are more than 3 links
    const baseDistances = [2, 4, 8];
    const linkDistances = graphData.links.map((_, index) => {
      return baseDistances[index % baseDistances.length];
    });
    
    // Shuffle the distances to randomize which link gets which distance
    for (let i = linkDistances.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [linkDistances[i], linkDistances[j]] = [linkDistances[j], linkDistances[i]];
    }
    
    // Apply forces with dynamic link distances
    applyGraphForces(
      graphRef, 
      linkDistances.length > 0 ? linkDistances : [20], // Fallback to 20 if no links
      Math.max(...graphData.nodes.map((node) => node.val * 3))
    );
    
    // Set simulation parameters
    if (typeof fg.cooldownTicks === 'function') fg.cooldownTicks(Infinity);
    if (typeof fg.d3VelocityDecay === 'function') fg.d3VelocityDecay(0.4);
    
    // No automatic zoom adjustment - let the graph render at its natural size
  }, 50);
}, [graphData, dimensions]);

  // We no longer need the auto-zoom function as we're using a fixed zoom level
  
  // Set initial fixed zoom level instead of auto-zooming
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    
    // Instead of auto-zooming, set a fixed initial zoom level
    const initialZoomTimer = setTimeout(() => {
      // Apply a larger fixed zoom level
      // Use a larger zoom level for mobile to make content more visible
      const fixedZoomLevel = window.innerWidth < 864 ? 5.0 : 6.0; // Increased zoom level for both mobile and web
      
      if (fg.zoom) {
        // Set the zoom level with a short animation duration
        fg.zoom(fixedZoomLevel, 400);
        
        // Center the graph at (0,0) which should be where the user node is
        fg.centerAt(0, 0, 400);
      }
      
      // Still reheat the simulation for better layout
      if (fg.d3ReheatSimulation) {
        fg.d3ReheatSimulation();
      }
    }, 300); // Delay to ensure graph is properly initialized
    
    // Cleanup function
    return () => {
      clearTimeout(initialZoomTimer);
    };
  }, []);  // No dependency on zoomToFit since we're not using it here

  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    console.log(`Node clicked: ${node.name}`);
    
    // Track node click event with PostHog
    posthog.capture('graph_node_clicked', {
      node_id: node.id,
      node_name: node.name,
      node_type: node.id === 'user' ? 'user' : 'connection',
      graph_state: {
        total_nodes: graphData.nodes.length,
        total_connections: graphData.links.length
      },
      interaction_coordinates: {
        x: node.x,
        y: node.y
      },
      timestamp: new Date().toISOString()
    });
    
    if (onNodeClick) {
      onNodeClick(node);
    }
    if (setFocusedNode) {
      setFocusedNode(node.id);
    }
  };

  const handleNodeDragEnd = (node: GraphNode) => {
    console.log(`Node dragged: ${node.name}`);
    
    // Track node drag event with PostHog
    posthog.capture('graph_node_dragged', {
      node_id: node.id,
      node_name: node.name,
      node_type: node.id === 'user' ? 'user' : 'connection',
      new_position: {
        x: node.x,
        y: node.y
      },
      timestamp: new Date().toISOString()
    });
    
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

  // Store current zoom level for text scaling
  const [currentZoom, setCurrentZoom] = useState(1);
  
  // Create a ref to store the avatar image to prevent flickering on rerenders
  const avatarImageRef = useRef<HTMLImageElement | null>(null);

  // Preload the avatar image when userData changes
  useEffect(() => {
    if (userData?.profilePic) {
      const img = new Image();
      img.src = userData.profilePic;
      img.onload = () => {
        avatarImageRef.current = img;
        // Force a refresh of the graph when the image is loaded
        const fg = graphRef.current;
        if (fg && fg.refresh) {
          fg.refresh();
        }
      };
    }
  }, [userData?.profilePic]);

  // Custom node rendering with avatar for user node
  const nodeCanvasObject = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    // Increase base font size significantly for mobile
    const baseFontSize = window.innerWidth < 864 ? 2.2 : 2.5; // Much larger font size, especially on mobile
    const nodeRadius = node.val;
    const x = node.x || 0;
    const y = node.y || 0;
    
    // Draw avatar for user node (drawn first to be behind the border)
    if (node.id === 'user' && node.avatar) {
      // Use the cached image from the ref to prevent flickering
      const img = avatarImageRef.current || new Image();
      
      // If we don't have a cached image yet, set the source and wait for it to load
      if (!avatarImageRef.current) {
        img.src = node.avatar;
      }
      
      // Only draw if image is loaded
      if (img.complete && img.naturalWidth > 0) {
        // Create a circular clipping path for the image
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        // Draw the image to fill the entire circle
        const targetSize = nodeRadius * 2.2; // Slightly larger than the node to ensure full coverage
        
        // Draw the image centered in the node circle
        ctx.drawImage(
          img,
          x - targetSize/2, y - targetSize/2, targetSize, targetSize
        );
        
        // Add a subtle white border
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2, true);
        ctx.lineWidth = 2 / globalScale;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        
        ctx.restore();
      } else {
        // Fallback circle if image not loaded
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#4299e1';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
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

    // Initialize textY for potential use in location text
    const textYOffset = baseFontSize * currentZoom * 0.5;
    let textY = y + nodeRadius + textYOffset + 2;
    
    // Only draw label for non-user nodes
    if (node.id !== 'user') {
      const nodeIndex = parseInt(node.id.split('-').pop() || '0');
      const location = connections[nodeIndex]?.location;
      
      if (location) {
        // Combine position and location into one label
        const combinedLabel = `${label} from ${location}`;
        
        // Calculate font size based directly on zoom level
        // This ensures text scales properly with zoom
        const scaledFontSize = baseFontSize * currentZoom * 0.5;
        
        // Draw node label with SF Pro font and increased weight
        ctx.font = `450 ${scaledFontSize}px 'SF Pro', -apple-system, BlinkMacSystemFont`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw main text
        ctx.fillStyle = '#000000';
        // Add subtle text shadow for better readability
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 2;
        ctx.fillText(combinedLabel, x, textY);
        
        // Reset shadow
        ctx.shadowBlur = 0;
      } else {
        // Fallback to just the position if no location is available
        // Calculate font size based directly on zoom level
        const scaledFontSize = baseFontSize * currentZoom * 0.5;
        
        ctx.font = `450 ${scaledFontSize}px 'SF Pro', -apple-system, BlinkMacSystemFont`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5 / globalScale;
        ctx.strokeText(label, x, textY);
        
        ctx.fillStyle = '#222222';
        ctx.fillText(label, x, textY);
      }
    }
  }, [connections]);

  // Handle zoom events to prevent zooming out beyond the base zoom level
  // and update the current zoom level for text scaling
  const handleZoom = (event: { k: number }) => {
    const fg = graphRef.current;
    if (!fg) return;
    
    // Store the current zoom level for text scaling
    setCurrentZoom(event.k);
    
    // Track zoom events, but throttle to avoid too many events
    // Only track significant zoom changes (more than 0.5 difference)
    const prevZoom = currentZoom;
    if (Math.abs(event.k - prevZoom) > 0.5) {
      posthog.capture('graph_zoom_changed', {
        previous_zoom: prevZoom,
        new_zoom: event.k,
        zoom_direction: event.k > prevZoom ? 'in' : 'out',
        timestamp: new Date().toISOString()
      });
    }
    
    // Determine minimum zoom level based on device width
    const minZoomLevel = window.innerWidth < 864 ? 3.0 : 1.5;
    
    // If zooming out beyond the base zoom level, reset to base zoom
    if (event.k < minZoomLevel) {  // Use the calculated minimum zoom level
      fg.zoom(minZoomLevel);
      setCurrentZoom(minZoomLevel);
    } else if (event.k > 10) { // Maximum zoom level
      fg.zoom(10);
      setCurrentZoom(10);
    }
    
    // Force re-render to update text scaling
    if (fg.refresh) fg.refresh();
  };

  return (
    <div className="force-graph-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeCanvasObject={nodeCanvasObject}
        linkColor={() => '#cccccc'}
        linkWidth={1.5}
        linkLineDash={[1, 1]} // Creates a dotted line effect
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
        minZoom={1.5} // Set minimum zoom level to base zoom
        onZoom={handleZoom} // Handle zoom events
        onEngineStop={() => {
          // Keep simulation running continuously
          if (graphRef.current && typeof graphRef.current.d3ReheatSimulation === 'function') {
            setTimeout(() => {
              graphRef.current.d3ReheatSimulation();
              
              // Periodically track graph state (once per reheat)
              posthog.capture('graph_state_update', {
                node_count: graphData.nodes.length,
                link_count: graphData.links.length,
                viewport_dimensions: dimensions,
                zoom_level: currentZoom,
                timestamp: new Date().toISOString()
              });
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
