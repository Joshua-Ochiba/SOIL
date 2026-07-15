import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, DragControls, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// This rig allows the camera to follow the mouse WHILE OrbitControls is active
function CameraRig() {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();
  return useFrame(() => {
    // Only apply mouse follow if the user isn't actively orbiting
    camera.position.lerp(vec.set(mouse.x * 2, mouse.y * 2, camera.position.z), 0.02);
  });
}

function Artifact({ position, color, args, speed = 1 }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Float speed={speed} rotationIntensity={2} floatIntensity={2}>
      <mesh 
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={args || [1, 64, 64]} />
        <MeshDistortMaterial 
          color={color} 
          speed={hovered ? 4 : speed} 
          distort={0.4} 
          radius={1}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.2}
        />
      </mesh>
    </Float>
  );
}

export default function ArtifactsCanvas() {
  // Vibrant SOIL Palette (Glowing)
  const SOIL_COLORS = ['#c5a059', '#2d5a27', '#4b6fff', '#ff4da6', '#f5f5f0'];
  
  const shapes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 20; i++) {
        const z = -Math.random() * 20;
        const x = (Math.random() - 0.5) * 15;
        const y = (Math.random() - 0.5) * 10;
        const color = SOIL_COLORS[Math.floor(Math.random() * SOIL_COLORS.length)];
        
        temp.push({ 
            position: [x, y, z], 
            color, 
            args: [0.5 + Math.random() * 1, 64, 64],
            speed: 0.5 + Math.random()
        });
    }
    return temp;
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-black cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <color attach="background" args={['#050505']} />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#c5a059" />

        {/* This allows you to drag the shapes */}
        <DragControls>
            <group>
                {shapes.map((props, i) => (
                    <Artifact key={i} {...props} />
                ))}
            </group>
        </DragControls>

        {/* This allows you to rotate the whole camera view */}
        <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            rotateSpeed={0.4}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
        />

        <CameraRig />
        
        <Environment preset="studio" />
        <fog attach="fog" args={['#050505', 5, 25]} />
      </Canvas>
    </div>
  );
}
