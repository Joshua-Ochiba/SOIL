import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

export default function SeedScene({ scrollProgress = 0 }) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const animFrameRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x1A1614, 0.002);

        // Camera
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(0, 0, 5);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.8;
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x8E3E2F, 0.3);
        scene.add(ambientLight);

        const mainLight = new THREE.PointLight(0xD9A036, 2, 20);
        mainLight.position.set(2, 3, 4);
        scene.add(mainLight);

        const rimLight = new THREE.PointLight(0x2D3924, 1, 15);
        rimLight.position.set(-3, -1, 2);
        scene.add(rimLight);

        // Seed geometry - organic sphere
        const seedGeometry = new THREE.IcosahedronGeometry(1.2, 4);
        const positions = seedGeometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < positions.count; i++) {
            vertex.fromBufferAttribute(positions, i);
            const noise = Math.sin(vertex.x * 3) * Math.cos(vertex.y * 2) * Math.sin(vertex.z * 4) * 0.15;
            vertex.normalize().multiplyScalar(1.2 + noise);
            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        seedGeometry.computeVertexNormals();

        const seedMaterial = new THREE.MeshStandardMaterial({
            color: 0x3D2518,
            roughness: 0.7,
            metalness: 0.1,
            emissive: 0x8E3E2F,
            emissiveIntensity: 0.05,
        });
        const seed = new THREE.Mesh(seedGeometry, seedMaterial);
        scene.add(seed);

        // Glowing veins on seed
        const veinGeometry = new THREE.IcosahedronGeometry(1.22, 2);
        const veinMaterial = new THREE.MeshBasicMaterial({
            color: 0xD9A036,
            wireframe: true,
            transparent: true,
            opacity: 0.15,
        });
        const veins = new THREE.Mesh(veinGeometry, veinMaterial);
        scene.add(veins);

        // Particles (dust motes)
        const particleCount = 200;
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i++) {
            particlePositions[i * 3] = (Math.random() - 0.5) * 15;
            particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 15;
            particleSizes[i] = Math.random() * 3 + 1;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xD9A036,
            size: 0.03,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Root lines emerging from seed
        const rootMaterial = new THREE.LineBasicMaterial({
            color: 0x2D3924,
            transparent: true,
            opacity: 0.3,
        });

        const roots = [];
        for (let r = 0; r < 5; r++) {
            const rootPoints = [];
            const angle = (r / 5) * Math.PI * 2;
            let x = Math.cos(angle) * 1.2;
            let y = -1.2;
            let z = Math.sin(angle) * 1.2;
            for (let i = 0; i < 20; i++) {
                rootPoints.push(new THREE.Vector3(x, y, z));
                x += (Math.random() - 0.5) * 0.3;
                y -= Math.random() * 0.3;
                z += (Math.random() - 0.5) * 0.3;
            }
            const rootGeom = new THREE.BufferGeometry().setFromPoints(rootPoints);
            const rootLine = new THREE.Line(rootGeom, rootMaterial.clone());
            scene.add(rootLine);
            roots.push(rootLine);
        }

        sceneRef.current = { scene, camera, renderer, seed, veins, particles, roots, mainLight };

        // Animation
        const clock = new THREE.Clock();
        const animate = () => {
            animFrameRef.current = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();

            seed.rotation.y = elapsed * 0.15;
            seed.rotation.x = Math.sin(elapsed * 0.1) * 0.1;
            veins.rotation.y = elapsed * 0.15;
            veins.rotation.x = Math.sin(elapsed * 0.1) * 0.1;

            veinMaterial.opacity = 0.1 + Math.sin(elapsed * 0.8) * 0.08;
            seedMaterial.emissiveIntensity = 0.05 + Math.sin(elapsed * 0.5) * 0.03;

            particles.rotation.y = elapsed * 0.02;

            // Scroll-driven transformations
            const prog = scrollProgress;
            seed.scale.setScalar(1 + prog * 0.5);
            mainLight.intensity = 2 + prog * 3;

            roots.forEach((root, i) => {
                root.material.opacity = Math.min(1, prog * 3);
            });

            renderer.render(scene, camera);
        };
        animate();

        // Resize
        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animFrameRef.current);
            if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // Update scroll progress without re-creating scene
    useEffect(() => {
        if (!sceneRef.current) return;
        const { seed, roots, mainLight, veins } = sceneRef.current;
        seed.scale.setScalar(1 + scrollProgress * 0.5);
        mainLight.intensity = 2 + scrollProgress * 3;
        roots.forEach(root => {
            root.material.opacity = Math.min(1, scrollProgress * 3);
        });
    }, [scrollProgress]);

    return (
        <div ref={mountRef} className="absolute inset-0 z-0" />
    );
}