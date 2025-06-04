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

  // Function to auto-zoom to fit all nodes and text
  const zoomToFit = useCallback(() => {
    const fg = graphRef.current;
    if (!fg || !graphData.nodes.length) return;
    
    // Calculate bounding box of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    graphData.nodes.forEach(node => {
      const x = node.x || 0;
      const y = node.y || 0;
      // Add extra padding for node labels
      const labelPadding = 120; // Increased padding to ensure text fits
      
      minX = Math.min(minX, x - labelPadding);
      minY = Math.min(minY, y - labelPadding);
      maxX = Math.max(maxX, x + labelPadding);
      maxY = Math.max(maxY, y + labelPadding);
    });
    
    // Add padding for better visibility
    const padding = 50;
    const width = Math.max(1, maxX - minX) + (padding * 2);
    const height = Math.max(1, maxY - minY) + (padding * 2);
    
    // Calculate center and zoom level
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Calculate required zoom level to fit all nodes
    const zoomX = dimensions.width / width;
    const zoomY = dimensions.height / height;
    const zoomLevel = Math.min(zoomX, zoomY) * 0.85; // 85% of max to add some padding
    
    // Apply the zoom and center
    if (fg.zoomToFit) {
      fg.zoomToFit(400, 150); // Duration, padding
    } else if (fg.zoom) {
      fg.zoom(zoomLevel, 400); // Duration
      fg.centerAt(centerX, centerY, 400); // Duration
    }
  }, [graphData, dimensions]);
  
  // Set initial zoom level and auto-zoom when graph data changes
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    
    const handleEngineStop = () => {
      zoomToFit();
    };
    
    // Setup auto-zoom after a short delay to allow initial render
    const zoomTimer = setTimeout(() => {
      zoomToFit();
      
      // Set up auto-zoom after simulation stabilizes
      if (fg.d3ReheatSimulation) {
        fg.d3ReheatSimulation();
        fg.onEngineStop(handleEngineStop);
      }
    }, 300); // Increased delay to ensure graph is properly initialized
    
    // Cleanup function
    return () => {
      clearTimeout(zoomTimer);
      if (fg.off) {
        fg.off('engineStop', handleEngineStop);
      }
    };
  }, [zoomToFit]);

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

  // Store current zoom level for text scaling
  const [currentZoom, setCurrentZoom] = useState(1);
  
  // Custom node rendering with avatar for user node
  const nodeCanvasObject = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    // Base font size that will be scaled with zoom
    const baseFontSize = window.innerWidth < 864 ? 0.87 : 1.22; // Smaller font size on mobile
    // Use both globalScale (for canvas scaling) and currentZoom (for user zoom level)
    // This ensures text scales properly with the zoom level
    const nodeRadius = node.val;
    const x = node.x || 0;
    const y = node.y || 0;
    
    // Draw avatar for user node (drawn first to be behind the border)
    if (node.id === 'user' && node.avatar) {
      const img = new Image();
      img.src = node.avatar;
      
      // Only draw if image is loaded
      if (img.complete) {
        // We'll use nodeRadius * 2 as our target size for the circular avatar
        // Create a circular clipping path for the image
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        // Draw the image to fill the entire circle
        // Calculate dimensions to ensure the image covers the entire circle
        const targetSize = nodeRadius * 2.2; // Slightly larger than the node to ensure full coverage
        
        // Calculate dimensions to ensure the smallest dimension of the image covers the circle
        const imgAspectRatio = img.width / img.height;
        let drawWidth, drawHeight;
        
        if (imgAspectRatio >= 1) {
          // Image is wider than tall or square
          // Use height as the limiting factor and scale width accordingly
          drawHeight = targetSize;
          drawWidth = drawHeight * imgAspectRatio;
        } else {
          // Image is taller than wide
          // Use width as the limiting factor and scale height accordingly
          drawWidth = targetSize;
          drawHeight = drawWidth / imgAspectRatio;
        }
        
        // Center the image in the circle
        const offsetX = x - (drawWidth / 2);
        const offsetY = y - (drawHeight / 2);
        
        // Draw the image centered in the node circle
        ctx.drawImage(
          img,
          offsetX, offsetY, drawWidth, drawHeight
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
    
    // If zooming out beyond the base zoom level, reset to base zoom
    if (event.k < 1.5) {  // Minimum zoom level
      fg.zoom(1.5);
      setCurrentZoom(1.5);
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
