import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Globe3DProps {
  className?: string;
  interactive?: boolean;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  className = '',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent background
    container.appendChild(renderer.domElement);

    // Main Group for all Globe elements
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Dark Ocean Core Sphere
    const radius = 78;
    const oceanGeo = new THREE.SphereGeometry(radius - 0.5, 64, 64);
    const oceanMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.92,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    globeGroup.add(oceanMesh);

    // 2. Wireframe / Latitude-Longitude Grid
    const wireGeo = new THREE.SphereGeometry(radius, 24, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // 3. Procedural Landmass & Sonar Points (approx 5200 points)
    const dotCount = 5200;
    const dotPositions: number[] = [];
    const dotColors: number[] = [];

    // Helper: Approximate Earth Landmass mask
    const isLand = (lat: number, lon: number): boolean => {
      // Eurasia & Africa
      if (lat > -35 && lat < 70 && lon > -20 && lon < 140) {
        if (lat > 15 && lat < 45 && lon > 30 && lon < 55) return true; // Middle East
        if (lat > 5 && lat < 38 && lon > 68 && lon < 90) return true; // India / South Asia
        if (lat > 35 && lon > -10 && lon < 60) return true; // Europe
        if (lat > -35 && lat < 35 && lon > -18 && lon < 52) return true; // Africa
        if (lat > 10 && lat < 70 && lon > 60 && lon < 140) return true; // Asia
      }
      // North America
      if (lat > 15 && lat < 75 && lon > -168 && lon < -52) return true;
      // South America
      if (lat > -55 && lat < 12 && lon > -82 && lon < -34) return true;
      // Australia
      if (lat > -44 && lat < -11 && lon > 112 && lon < 154) return true;
      // Japan / SE Asia Archipelago
      if (lat > -10 && lat < 46 && lon > 95 && lon < 146) return true;
      return false;
    };

    // Color definitions
    const neonGreen = new THREE.Color(0x00ff88);
    const limeYellow = new THREE.Color(0xa3e635);
    const magentaPink = new THREE.Color(0xec4899);
    const oceanPurple = new THREE.Color(0x8b5cf6);
    const deepBlue = new THREE.Color(0x0f172a);

    for (let i = 0; i < dotCount; i++) {
      // Golden Spiral distribution on sphere
      const phi = Math.acos(1 - 2 * (i + 0.5) / dotCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const lat = 90 - (phi * 180) / Math.PI;
      const lon = ((theta * 180) / Math.PI) % 360 - 180;

      const land = isLand(lat, lon);
      const r = land ? radius + 1.2 : radius + 0.2;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      dotPositions.push(x, y, z);

      if (land) {
        // Gradient between neon green, lime, and magenta
        const choice = Math.random();
        let col: THREE.Color;
        if (choice < 0.55) {
          col = neonGreen.clone().lerp(limeYellow, Math.random() * 0.5);
        } else if (choice < 0.85) {
          col = limeYellow.clone().lerp(magentaPink, Math.random() * 0.4);
        } else {
          col = magentaPink.clone().lerp(oceanPurple, Math.random() * 0.3);
        }
        dotColors.push(col.r, col.g, col.b);
      } else {
        // Faint deep ocean purple/blue dots
        const col = oceanPurple.clone().lerp(deepBlue, 0.7);
        dotColors.push(col.r * 0.35, col.g * 0.35, col.b * 0.35);
      }
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute('color', new THREE.Float32BufferAttribute(dotColors, 3));

    // Custom Canvas Circular Point Texture
    const createCircleTexture = () => {
      const cv = document.createElement('canvas');
      cv.width = 32;
      cv.height = 32;
      const ctx = cv.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.arc(16, 16, 14, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      return new THREE.CanvasTexture(cv);
    };

    const dotMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      map: createCircleTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pointsMesh = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(pointsMesh);

    // 4. Ghost Net Detection Hotspot Pings
    const hotspots = [
      { lat: 10.12, lon: 76.56, label: 'Indian Ocean Net #1' }, // Kerala / Lakshadweep
      { lat: 15.40, lon: 73.80, label: 'Arabian Sea Debris' }, // Goa / Arabian Sea
      { lat: 13.08, lon: 80.27, label: 'Bay of Bengal Drift' }, // Chennai Offshore
      { lat: 35.00, lon: -140.00, label: 'Pacific Gyre Anomaly' }, // Great Pacific
      { lat: 54.00, lon: 3.00, label: 'North Sea Tangle' }, // North Sea
      { lat: 24.50, lon: -81.00, label: 'Florida Straits Net' }, // Caribbean / Florida
    ];

    const hotspotGroup = new THREE.Group();
    const pingRings: { mesh: THREE.Mesh; scale: number; baseR: number; opacity: number }[] = [];

    hotspots.forEach((hs) => {
      const phi = (90 - hs.lat) * (Math.PI / 180);
      const theta = (hs.lon + 180) * (Math.PI / 180);
      const hx = (radius + 2.5) * Math.sin(phi) * -Math.cos(theta);
      const hy = (radius + 2.5) * Math.cos(phi);
      const hz = (radius + 2.5) * Math.sin(phi) * Math.sin(theta);

      // Center glowing marker
      const pinGeo = new THREE.SphereGeometry(1.6, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(hx, hy, hz);
      hotspotGroup.add(pinMesh);

      // Pulsing Sonar Ping Ring
      const ringGeo = new THREE.RingGeometry(1.8, 2.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(hx, hy, hz);
      ringMesh.lookAt(hx * 2, hy * 2, hz * 2);
      hotspotGroup.add(ringMesh);

      pingRings.push({ mesh: ringMesh, scale: 1, baseR: 1.8, opacity: 0.8 });
    });
    globeGroup.add(hotspotGroup);

    // 5. Dynamic Sonar Equator Scan Waves (Concentric expanding rings)
    const scanRings: { mesh: THREE.Mesh; scale: number; speed: number }[] = [];
    for (let s = 0; s < 3; s++) {
      const sGeo = new THREE.RingGeometry(radius * 0.98, radius * 1.01, 64);
      const sMat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.rotation.x = Math.PI / 2;
      globeGroup.add(sMesh);
      scanRings.push({ mesh: sMesh, scale: 1 + s * 0.12, speed: 0.0015 + s * 0.0008 });
    }

    // 6. Subtle Outer Atmospheric Neon Haze
    const atmosphereGeo = new THREE.SphereGeometry(radius * 1.14, 48, 48);
    const atmosphereMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        glowColor: { value: new THREE.Color(0x00ff88) },
        purpleGlow: { value: new THREE.Color(0x8b5cf6) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 glowColor;
        uniform vec3 purpleGlow;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          vec3 mixedCol = mix(glowColor, purpleGlow, vNormal.y * 0.5 + 0.5);
          gl_FragColor = vec4(mixedCol, intensity * 0.45);
        }
      `,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // Initial Tilt for optimal aesthetic presentation (showing Eurasia/Indian Ocean)
    globeGroup.rotation.x = 0.28;
    globeGroup.rotation.y = 1.15;

    // Mouse Interaction
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouseRef.current.targetX = (clientX / rect.width - 0.5) * 0.6;
      mouseRef.current.targetY = (clientY / rect.height - 0.5) * 0.6;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const elapsedTime = (now - startTime) / 1000;

      // Smooth mouse parallax interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Base auto-rotation
      globeGroup.rotation.y += delta * 0.12;
      globeGroup.rotation.x = 0.28 + mouseRef.current.y * 0.4;
      globeGroup.position.x = mouseRef.current.x * 20;

      // Pulse Hotspot Ping Rings
      pingRings.forEach((ring) => {
        ring.scale += delta * 1.5;
        if (ring.scale > 3.2) {
          ring.scale = 1;
        }
        ring.mesh.scale.set(ring.scale, ring.scale, 1);
        const op = Math.max(0, 0.9 * (1 - (ring.scale - 1) / 2.2));
        (ring.mesh.material as THREE.MeshBasicMaterial).opacity = op;
      });

      // Expand Sonar Sweep Waves
      scanRings.forEach((scan) => {
        scan.scale += delta * 0.3;
        if (scan.scale > 1.45) {
          scan.scale = 0.98;
        }
        scan.mesh.scale.set(scan.scale, scan.scale, scan.scale);
        const op = Math.max(0, 0.22 * (1 - (scan.scale - 0.98) / 0.47));
        (scan.mesh.material as THREE.MeshBasicMaterial).opacity = op;
      });

      // Subtle breath of atmosphere
      atmosphereMesh.scale.setScalar(1 + Math.sin(elapsedTime * 1.2) * 0.012);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none pointer-events-none ${className}`}
    />
  );
};
export default Globe3D;
