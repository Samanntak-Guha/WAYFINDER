"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float, Line } from "@react-three/drei";
import * as THREE from "three";
import { ViewpointNode, NavigationEdge } from "@/types";

interface EnvironmentViewerProps {
  nodes: ViewpointNode[];
  edges: NavigationEdge[];
  currentViewpointId?: string;
  goalViewpointId?: string;
  startViewpointId?: string;
  visitedTrajectory?: string[];
  optimalPath?: string[];
  currentHeading?: number;
  onSelectViewpoint?: (viewpointId: string) => void;
  className?: string;
}

// Visual agent marker with orientation cone and glowing aura
function AgentMarker({
  position,
  heading = 0,
}: {
  position: [number, number, number];
  heading?: number;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 3) * 0.15;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  const headingRad = (heading * Math.PI) / 180;

  return (
    <group ref={meshRef} position={position}>
      {/* Outer Pulse Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.55, 0.7, 32]} />
        <meshBasicMaterial color="#B7C5A5" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Directional Heading Pointer Cone */}
      <group rotation={[0, -headingRad, 0]}>
        <mesh position={[0, 0.45, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.2, 0.5, 16]} />
          <meshStandardMaterial color="#B7C5A5" emissive="#B7C5A5" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Center Beacon Orb */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial
          color="#F1F0E9"
          emissive="#B7C5A5"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

// 3D Graph Edges between viewpoints
function GraphEdges({
  edges,
  nodesMap,
  visitedNodes,
  optimalNodes,
}: {
  edges: NavigationEdge[];
  nodesMap: Map<string, ViewpointNode>;
  visitedNodes: Set<string>;
  optimalNodes: Set<string>;
}) {
  return (
    <group>
      {edges.map((edge) => {
        const u = nodesMap.get(edge.from_viewpoint_id);
        const v = nodesMap.get(edge.to_viewpoint_id);
        if (!u || !v) return null;

        const isTraversed = visitedNodes.has(edge.from_viewpoint_id) && visitedNodes.has(edge.to_viewpoint_id);
        const isOptimal = optimalNodes.has(edge.from_viewpoint_id) && optimalNodes.has(edge.to_viewpoint_id);

        const color = isTraversed ? "#B7C5A5" : isOptimal ? "#C7B99C" : "#32372F";
        const lineWidth = isTraversed ? 3 : isOptimal ? 2 : 1;
        const opacity = isTraversed ? 0.95 : isOptimal ? 0.7 : 0.35;

        return (
          <Line
            key={`${edge.from_viewpoint_id}-${edge.to_viewpoint_id}`}
            points={[
              [u.x, u.y + 0.1, u.z],
              [v.x, v.y + 0.1, v.z],
            ]}
            color={color}
            lineWidth={lineWidth}
            transparent
            opacity={opacity}
          />
        );
      })}
    </group>
  );
}

// Viewpoint Nodes
function ViewpointNodes({
  nodes,
  currentId,
  goalId,
  startId,
  visitedSet,
  onSelect,
}: {
  nodes: ViewpointNode[];
  currentId?: string;
  goalId?: string;
  startId?: string;
  visitedSet: Set<string>;
  onSelect?: (id: string) => void;
}) {
  return (
    <group>
      {nodes.map((n) => {
        const isCurrent = n.viewpoint_id === currentId;
        const isGoal = n.viewpoint_id === goalId;
        const isStart = n.viewpoint_id === startId;
        const isVisited = visitedSet.has(n.viewpoint_id);

        let color = "#555A4F";
        let emissive = "#000000";
        let scale = 0.22;

        if (isCurrent) {
          color = "#B7C5A5";
          emissive = "#B7C5A5";
          scale = 0.35;
        } else if (isGoal) {
          color = "#C7B99C";
          emissive = "#C7B99C";
          scale = 0.32;
        } else if (isStart) {
          color = "#8A9A7A";
          scale = 0.26;
        } else if (isVisited) {
          color = "#A4A69C";
          scale = 0.24;
        }

        return (
          <group key={n.viewpoint_id} position={[n.x, n.y + 0.15, n.z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(n.viewpoint_id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <sphereGeometry args={[scale, 20, 20]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={isCurrent || isGoal ? 0.6 : 0.1}
                roughness={0.3}
              />
            </mesh>

            {/* Room / Viewpoint Label */}
            <Text
              position={[0, 0.45, 0]}
              fontSize={0.2}
              color="#F1F0E9"
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.02}
              outlineColor="#0C0D0B"
            >
              {n.room_label.replace("_", " ").toUpperCase()}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export function EnvironmentViewer({
  nodes,
  edges,
  currentViewpointId,
  goalViewpointId,
  startViewpointId,
  visitedTrajectory = [],
  optimalPath = [],
  currentHeading = 0,
  onSelectViewpoint,
  className = "w-full h-full min-h-[500px]",
}: EnvironmentViewerProps) {
  const nodesMap = useMemo(() => {
    const m = new Map<string, ViewpointNode>();
    nodes.forEach((n) => m.set(n.viewpoint_id, n));
    return m;
  }, [nodes]);

  const visitedSet = useMemo(() => new Set(visitedTrajectory), [visitedTrajectory]);
  const optimalSet = useMemo(() => new Set(optimalPath), [optimalPath]);

  const currentCoords: [number, number, number] = useMemo(() => {
    const node = currentViewpointId ? nodesMap.get(currentViewpointId) : nodes[0];
    return node ? [node.x, node.y, node.z] : [0, 0, 0];
  }, [currentViewpointId, nodesMap, nodes]);

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-[#0A0B09] border border-glass-border shadow-glass ${className}`}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [currentCoords[0] + 6, 9, currentCoords[2] + 9], fov: 48 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#0C0D0B"]} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[10, 20, 15]} intensity={0.9} color="#F1F0E9" />
        <pointLight position={[currentCoords[0], 5, currentCoords[2]]} intensity={1.2} color="#B7C5A5" distance={15} />

        {/* Architectural ground grid */}
        <gridHelper args={[60, 60, "#232620", "#141612"]} position={[0, -0.01, 0]} />

        {/* Viewpoint Graph components */}
        <GraphEdges
          edges={edges}
          nodesMap={nodesMap}
          visitedNodes={visitedSet}
          optimalNodes={optimalSet}
        />

        <ViewpointNodes
          nodes={nodes}
          currentId={currentViewpointId}
          goalId={goalViewpointId}
          startId={startViewpointId}
          visitedSet={visitedSet}
          onSelect={onSelectViewpoint}
        />

        {/* Agent 3D Position and Orientation Marker */}
        <AgentMarker position={currentCoords} heading={currentHeading} />

        {/* Smooth Orbit Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          target={[currentCoords[0], 0.5, currentCoords[2]]}
          maxPolarAngle={Math.PI / 2.05} // Keep camera above floor
          minDistance={2}
          maxDistance={35}
        />
      </Canvas>

      {/* Floating HUD controls on top right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 font-mono text-[11px]">
        <div className="px-3 py-2 rounded-xl bg-surface/80 border border-glass-border backdrop-blur-md shadow-glass-sm text-secondary flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <span>CURRENT: {currentViewpointId || "NONE"}</span>
        </div>
        <div className="px-3 py-2 rounded-xl bg-surface/80 border border-glass-border backdrop-blur-md shadow-glass-sm text-secondary flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sand" />
          <span>GOAL: {goalViewpointId || "NONE"}</span>
        </div>
      </div>

      {/* Legend on bottom left */}
      <div className="absolute bottom-4 left-4 z-10 px-3.5 py-2.5 rounded-xl bg-surface/75 border border-glass-border backdrop-blur-md text-[10px] font-mono text-muted flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-primary">Agent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sand" />
          <span className="text-primary">Goal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#A4A69C]" />
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#555A4F]" />
          <span>Navigable Node</span>
        </div>
      </div>
    </div>
  );
}
