import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Rig({ children }) {
    const group = useRef();
    const { mouse } = useThree();
    const vec = new THREE.Vector3();

    useFrame((state) => {
        // Soft weighted parallax rig
        // It tilts the group based on mouse, but always lerps back to 0
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (mouse.x * Math.PI) / 10, 0.05);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, (mouse.y * Math.PI) / -10, 0.05);
    });

    return <group ref={group}>{children}</group>;
}

function SeedNode({ position, color, size = 1, speed = 1, factor = 0.5 }) {
    const mesh = useRef();

    return (
        <Float speed={speed} rotationIntensity={2} floatIntensity={2}>
            <mesh position={position} ref={mesh}>
                <icosahedronGeometry args={[size * 0.1, 0]} />
                <MeshDistortMaterial
                    color={color}
                    speed={2}
                    distort={0.3}
                    radius={1}
                    emissive={color}
                    emissiveIntensity={1.5}
                    toneMapped={false}
                />
            </mesh>
        </Float>
    );
}

export default function SeedConstellation({ seeds = [] }) {
    // Generate a few random ambient seeds for depth
    const ambientSeeds = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => ({
            id: `ambient-${i}`,
            position: [
                (Math.random() - 0.5) * 15, // Spread wide
                (Math.random() - 0.5) * 10,
                -Math.random() * 10 - 2    // Depth
            ],
            color: Math.random() > 0.8 ? '#2d5a27' : '#D9A036', // Occasional green
            size: 0.3 + Math.random() * 0.7,
            speed: 0.5 + Math.random()
        }));
    }, []);

    // Map user seeds to 3D space
    const userSeeds = useMemo(() => {
        return seeds.map((seed, i) => ({
            id: seed.id,
            position: [
                (seed.position_x / 100 - 0.5) * 12,
                (seed.position_y / 100 - 0.5) * 8,
                Math.sin(i) * 2 - 1 // Vary depth slightly
            ],
            color: `hsl(${seed.color_hue}, 60%, 60%)`,
            size: 1.2,
            speed: 1.5
        }));
    }, [seeds]);

    return (
        <div className="absolute inset-0 z-0">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#D9A036" />

                <Rig>
                    {/* Background seeds */}
                    {ambientSeeds.map(s => (
                        <SeedNode key={s.id} {...s} />
                    ))}

                    {/* User planted seeds */}
                    {userSeeds.map(s => (
                        <SeedNode key={s.id} {...s} />
                    ))}
                </Rig>

                <fog attach="fog" args={['#0c0c0a', 5, 20]} />
            </Canvas>
        </div>
    );
}
