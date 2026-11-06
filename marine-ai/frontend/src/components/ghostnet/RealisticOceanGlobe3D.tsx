import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RotateCw, MapPin, Sparkles, Volume2, VolumeX } from 'lucide-react';

export interface Hotspot {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  confidence: number;
  gearType: string;
  depthMeters: number;
  estimatedWeightKg: number;
  acousticFreqKHz: number;
}

interface RealisticOceanGlobe3DProps {
  className?: string;
  theme?: 'dark' | 'light';
  onSelectHotspot?: (hotspot: Hotspot) => void;
  entranceTrigger?: number;
}

export type MapMode = 'heatmap' | 'satellite' | 'night' | 'bathymetry';

export const RealisticOceanGlobe3D: React.FC<RealisticOceanGlobe3DProps> = ({
  className = '',
  theme = 'dark',
  onSelectHotspot,
  entranceTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [mapMode, setMapMode] = useState<MapMode>('heatmap');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);

  // Trigger camera dive from outside space (z=820) to inside (z=230) on entrance or replay
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = 820;
    }
  }, [entranceTrigger]);

  // References for live material and texture updates without destroying WebGL scene
  const globeMatRef = useRef<THREE.MeshPhongMaterial | null>(null);
  const texturesRef = useRef<Record<MapMode, THREE.Texture | null>>({
    heatmap: null,
    satellite: null,
    night: null,
    bathymetry: null,
  });

  // Sync default map mode with theme changes if appropriate
  useEffect(() => {
    // Keep heatmap as signature default, but adapt if user toggles
  }, [theme]);

  // Target rotation for smooth camera transitions (Starts focused on Indian Ocean / India)
  const targetRotationRef = useRef<{ x: number; y: number } | null>({
    x: 14 * (Math.PI / 180),
    y: -(76 + 90) * (Math.PI / 180),
  });

  const hotspots: Hotspot[] = useMemo(
    () => [
      {
        id: 'IND-01',
        name: 'Lakshadweep Ridge Drift',
        region: 'Indian Ocean',
        lat: 10.12,
        lon: 76.56,
        confidence: 94.7,
        gearType: 'Heavy Monofilament Gillnet',
        depthMeters: 42.5,
        estimatedWeightKg: 1420,
        acousticFreqKHz: 45.2,
      },
      {
        id: 'IND-02',
        name: 'Goa Coastal Bank',
        region: 'Arabian Sea',
        lat: 15.4,
        lon: 73.8,
        confidence: 96.1,
        gearType: 'Purse Seine Webbing',
        depthMeters: 28.0,
        estimatedWeightKg: 2850,
        acousticFreqKHz: 68.0,
      },
      {
        id: 'IND-03',
        name: 'Palk Strait Snag',
        region: 'Bay of Bengal',
        lat: 9.85,
        lon: 79.5,
        confidence: 91.8,
        gearType: 'Discarded Trawl Net',
        depthMeters: 18.2,
        estimatedWeightKg: 950,
        acousticFreqKHz: 52.4,
      },
      {
        id: 'IND-04',
        name: 'Andaman Trench Snag',
        region: 'Andaman Sea',
        lat: 11.75,
        lon: 92.75,
        confidence: 93.4,
        gearType: 'Abandoned Longline Rig',
        depthMeters: 64.0,
        estimatedWeightKg: 1680,
        acousticFreqKHz: 38.9,
      },
      {
        id: 'PAC-01',
        name: 'North Pacific Gyre Mass',
        region: 'Pacific Basin',
        lat: 34.2,
        lon: -142.1,
        confidence: 97.4,
        gearType: 'Mega Ghost Net Mass',
        depthMeters: 55.0,
        estimatedWeightKg: 8400,
        acousticFreqKHz: 82.1,
      },
      {
        id: 'ATL-01',
        name: 'Dogger Bank Submerged',
        region: 'North Sea',
        lat: 54.75,
        lon: 2.5,
        confidence: 89.2,
        gearType: 'Deepwater Trawl Rig',
        depthMeters: 36.5,
        estimatedWeightKg: 3100,
        acousticFreqKHz: 61.5,
      },
      {
        id: 'AUS-01',
        name: 'Great Barrier Outer Shelf',
        region: 'Coral Sea',
        lat: -18.28,
        lon: 147.7,
        confidence: 92.6,
        gearType: 'Polypropylene Marine Web',
        depthMeters: 22.0,
        estimatedWeightKg: 1120,
        acousticFreqKHz: 49.0,
      },
    ],
    []
  );

  // Web Audio Sonar Ping synthesizer
  const playSonarPing = (freq = 880) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, ctx.currentTime + 0.38);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.42);
    } catch {
      // Audio context may require prior user interaction
    }
  };

  // Switch texture maps dynamically without destroying scene
  useEffect(() => {
    const mat = globeMatRef.current;
    const tex = texturesRef.current[mapMode];
    if (!mat || !tex) return;

    mat.map = tex;
    if (mapMode === 'heatmap') {
      mat.specular = new THREE.Color(0x00e5ff);
      mat.emissive = new THREE.Color(0x030d18);
      mat.shininess = 28;
    } else if (mapMode === 'night') {
      mat.specular = new THREE.Color(0x00e5ff);
      mat.emissive = new THREE.Color(0x041b2d);
      mat.shininess = 32;
    } else if (mapMode === 'bathymetry') {
      mat.specular = new THREE.Color(0x00ff88);
      mat.emissive = new THREE.Color(0x021020);
      mat.shininess = 35;
    } else {
      mat.specular = new THREE.Color(0x2288bb);
      mat.emissive = new THREE.Color(0x020a14);
      mat.shininess = 18;
    }
    mat.needsUpdate = true;
  }, [mapMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;

    // Scene, Camera & Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.z = 820; // Starts far outside in space and dives into 230
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Parent group for globe and all attached surface objects
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Initial position: Focused directly on Indian Ocean / India
    globeGroup.rotation.x = 14 * (Math.PI / 180);
    globeGroup.rotation.y = -(76 + 90) * (Math.PI / 180);

    const radius = 70;

    // Texture Loader with local high-res world maps
    const textureLoader = new THREE.TextureLoader();

    const bumpMap = textureLoader.load('/textures/earth-topology.png');
    const specularMap = textureLoader.load('/textures/earth-water.png');

    // Preload all 4 map textures for instantaneous live switching
    const heatmapTex = textureLoader.load('/textures/earth-ocean-heatmap.jpg');
    const satTex = textureLoader.load('/textures/earth-blue-marble.jpg');
    const nightTex = textureLoader.load('/textures/earth-night.jpg');
    const bathyTex = textureLoader.load('/textures/earth-dark.jpg');

    texturesRef.current = {
      heatmap: heatmapTex,
      satellite: satTex,
      night: nightTex,
      bathymetry: bathyTex,
    };

    const initialTexture =
      mapMode === 'heatmap'
        ? heatmapTex
        : mapMode === 'satellite'
        ? satTex
        : mapMode === 'night'
        ? nightTex
        : bathyTex;

    // 1. Core World Map Earth Globe Mesh
    const globeGeo = new THREE.SphereGeometry(radius, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      map: initialTexture,
      bumpMap: bumpMap,
      bumpScale: 1.1,
      specularMap: specularMap,
      specular: new THREE.Color(mapMode === 'night' ? 0x00e5ff : 0x2288bb),
      shininess: mapMode === 'night' ? 32 : 18,
      emissive: mapMode === 'night' ? new THREE.Color(0x041b2d) : new THREE.Color(0x020a14),
      emissiveIntensity: 0.25,
    });
    globeMatRef.current = globeMat;
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // 2. Bathymetric Hydrographic Graticule Grid (Equator, Tropics, Coordinates)
    const graticuleGroup = new THREE.Group();

    // Latitudinal rings: Equator, Tropics (+/- 23.5°), Lat 45°, Lat 60°
    const latitudes = [0, 23.5, -23.5, 45, -45, 60, -60];
    latitudes.forEach((lat) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const ringRadius = radius * Math.sin(phi) + 0.35;
      const ringY = radius * Math.cos(phi);

      const ringGeo = new THREE.BufferGeometry();
      const ringPoints: THREE.Vector3[] = [];
      const segments = 120;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(theta) * ringRadius, ringY, Math.sin(theta) * ringRadius));
      }
      ringGeo.setFromPoints(ringPoints);

      const isEquator = lat === 0;
      const ringMat = new THREE.LineBasicMaterial({
        color: isEquator ? 0x00ff88 : 0x0284c7,
        transparent: true,
        opacity: isEquator ? 0.38 : 0.16,
      });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      graticuleGroup.add(ringLine);
    });

    // Longitudinal meridians (every 30 degrees)
    for (let lon = -180; lon < 180; lon += 30) {
      const meridianGeo = new THREE.BufferGeometry();
      const meridianPoints: THREE.Vector3[] = [];
      const steps = 80;
      const radLon = lon * (Math.PI / 180);

      for (let i = 0; i <= steps; i++) {
        const lat = -90 + (i / steps) * 180;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = radLon + Math.PI;
        const x = -(radius + 0.35) * Math.sin(phi) * Math.cos(theta);
        const y = (radius + 0.35) * Math.cos(phi);
        const z = (radius + 0.35) * Math.sin(phi) * Math.sin(theta);
        meridianPoints.push(new THREE.Vector3(x, y, z));
      }
      meridianGeo.setFromPoints(meridianPoints);

      const isPrime = lon === 0 || lon === 180;
      const meridianMat = new THREE.LineBasicMaterial({
        color: isPrime ? 0x00e5ff : 0x0284c7,
        transparent: true,
        opacity: isPrime ? 0.35 : 0.12,
      });
      const meridianLine = new THREE.Line(meridianGeo, meridianMat);
      graticuleGroup.add(meridianLine);
    }
    globeGroup.add(graticuleGroup);

    // 3. Coordinate Helper Function
    const latLonToVector3 = (lat: number, lon: number, r: number): THREE.Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      return new THREE.Vector3(x, y, z);
    };

    // 4. Acoustic Great-Circle Telemetry Surveillance Arcs
    const telemetryLinks = [
      { from: { lat: 9.93, lon: 76.26 }, to: { lat: 10.12, lon: 76.56 } }, // CMFRI/INCOIS Kochi -> Lakshadweep
      { from: { lat: 15.45, lon: 73.8 }, to: { lat: 15.4, lon: 73.8 } }, // NIO Goa -> Goa Bank
      { from: { lat: 13.08, lon: 80.27 }, to: { lat: 9.85, lon: 79.5 } }, // NIOT Chennai -> Palk Strait
      { from: { lat: 11.66, lon: 92.74 }, to: { lat: 11.75, lon: 92.75 } }, // Port Blair -> Andaman Trench
      { from: { lat: 21.3, lon: -157.85 }, to: { lat: 34.2, lon: -142.1 } }, // Honolulu -> Pacific Gyre
      { from: { lat: 53.55, lon: 9.99 }, to: { lat: 54.75, lon: 2.5 } }, // Hamburg/North Sea -> Dogger Bank
    ];

    const arcGroup = new THREE.Group();
    const pulsePackets: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; progress: number; speed: number }[] = [];

    telemetryLinks.forEach((link) => {
      const start = latLonToVector3(link.from.lat, link.from.lon, radius + 0.5);
      const end = latLonToVector3(link.to.lat, link.to.lon, radius + 0.5);

      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const dist = start.distanceTo(end);
      const altitude = Math.max(4.0, dist * 0.35);
      mid.normalize().multiplyScalar(radius + altitude);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const curvePoints = curve.getPoints(40);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMat = new THREE.LineDashedMaterial({
        color: 0x00ff88,
        dashSize: 1.5,
        gapSize: 0.8,
        transparent: true,
        opacity: 0.45,
      });
      const arcLine = new THREE.Line(curveGeo, curveMat);
      arcLine.computeLineDistances();
      arcGroup.add(arcLine);

      // Traveling Sonar Pulse Packet along arc
      const packetGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const packetMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      arcGroup.add(packetMesh);

      pulsePackets.push({
        mesh: packetMesh,
        curve,
        progress: Math.random(),
        speed: 0.25 + Math.random() * 0.2,
      });
    });
    globeGroup.add(arcGroup);

    // 5. Interactive Hotspot Markers (Pins & Sonar Radar Pings & Generous Hitboxes)
    const hotspotGroup = new THREE.Group();
    const hitMeshes: THREE.Mesh[] = [];
    const radarPings: { mesh: THREE.Mesh; scale: number; baseRadius: number }[] = [];

    hotspots.forEach((hs) => {
      const pos = latLonToVector3(hs.lat, hs.lon, radius + 0.6);
      const stalkEnd = latLonToVector3(hs.lat, hs.lon, radius + 3.8);

      // Vertical pin stalk
      const stalkGeo = new THREE.BufferGeometry().setFromPoints([pos, stalkEnd]);
      const stalkMat = new THREE.LineBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.7,
      });
      const stalkLine = new THREE.Line(stalkGeo, stalkMat);
      hotspotGroup.add(stalkLine);

      // Visible Beacon Pin Sphere
      const pinGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(stalkEnd);
      pinMesh.userData = { hotspot: hs };
      hotspotGroup.add(pinMesh);

      // Invisible larger hitbox for ultra-reliable hover & click
      const hitBoxGeo = new THREE.SphereGeometry(3.6, 8, 8);
      const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.copy(stalkEnd);
      hitBox.userData = { hotspot: hs };
      hotspotGroup.add(hitBox);
      hitMeshes.push(hitBox);

      // Expanding Sonar Radar Wave Ring
      const ringGeo = new THREE.RingGeometry(1.6, 2.4, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(stalkEnd);
      ringMesh.lookAt(stalkEnd.clone().multiplyScalar(2));
      hotspotGroup.add(ringMesh);

      radarPings.push({ mesh: ringMesh, scale: 1.0, baseRadius: 1.6 });
    });
    globeGroup.add(hotspotGroup);

    // 6. Equatorial Sonar Scanning Waves
    const waveRings: { mesh: THREE.Mesh; scale: number }[] = [];
    for (let w = 0; w < 2; w++) {
      const wGeo = new THREE.RingGeometry(radius * 0.995, radius * 1.025, 64);
      const wMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
      });
      const wMesh = new THREE.Mesh(wGeo, wMat);
      wMesh.rotation.x = Math.PI / 2;
      globeGroup.add(wMesh);
      waveRings.push({ mesh: wMesh, scale: 1 + w * 0.2 });
    }

    // 7. Atmospheric Glow Layer (Theme Aware)
    const isDark = theme === 'dark';
    const atmosphereGeo = new THREE.SphereGeometry(radius * 1.15, 48, 48);
    const atmosphereMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        glowColor: { value: new THREE.Color(isDark ? 0x00e5ff : 0x0284c7) },
        emeraldGlow: { value: new THREE.Color(isDark ? 0x00ff88 : 0x38bdf8) },
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
        uniform vec3 emeraldGlow;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          vec3 mixedCol = mix(glowColor, emeraldGlow, vNormal.y * 0.5 + 0.5);
          gl_FragColor = vec4(mixedCol, intensity * ${isDark ? '0.6' : '0.3'});
        }
      `,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 8. Dynamic Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x182a3a : 0x94a3b8,
      isDark ? 1.6 : 2.2
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, isDark ? 2.4 : 2.8);
    sunLight.position.set(160, 90, 140);
    scene.add(sunLight);

    const blueBackLight = new THREE.DirectionalLight(0x0284c7, 0.8);
    blueBackLight.position.set(-160, -40, -120);
    scene.add(blueBackLight);

    // 9. Interactive Drag Physics with Momentum Damping
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      targetRotationRef.current = null;
      velocityX = 0;
      velocityY = 0;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Raycast for hover detection
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(hitMeshes, false);

      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        const hit = intersects[0].object.userData.hotspot as Hotspot;
        setHoveredHotspot(hit);
      } else {
        renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
        setHoveredHotspot(null);
      }

      if (!isDragging) return;

      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      velocityX = deltaX * 0.0055;
      velocityY = deltaY * 0.0055;

      globeGroup.rotation.y += velocityX;
      globeGroup.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globeGroup.rotation.x + velocityY));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    // Click on Hotspots Raycasting
    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(hitMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object.userData.hotspot as Hotspot;
        setActiveHotspot(hit);
        if (onSelectHotspot) onSelectHotspot(hit);
        playSonarPing(920);

        // Smoothly center on clicked hotspot
        targetRotationRef.current = {
          x: hit.lat * (Math.PI / 180),
          y: -(hit.lon + 90) * (Math.PI / 180),
        };
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    dom.addEventListener('click', handleClick);

    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp, { passive: true });

    // 10. Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth camera dive from outside space (z=820) into resting orbit (z=230)
      if (camera.position.z > 230.1) {
        camera.position.z += (230 - camera.position.z) * 0.055;
      }

      // Smooth camera transition to target lat/lon
      if (targetRotationRef.current) {
        const diffY = targetRotationRef.current.y - globeGroup.rotation.y;
        const diffX = targetRotationRef.current.x - globeGroup.rotation.x;

        globeGroup.rotation.y += diffY * 0.07;
        globeGroup.rotation.x += diffX * 0.07;

        if (Math.abs(diffY) < 0.001 && Math.abs(diffX) < 0.001) {
          targetRotationRef.current = null;
        }
      } else if (!isDragging) {
        if (Math.abs(velocityX) > 0.0001 || Math.abs(velocityY) > 0.0001) {
          globeGroup.rotation.y += velocityX;
          globeGroup.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globeGroup.rotation.x + velocityY));
          velocityX *= 0.92;
          velocityY *= 0.92;
        } else if (autoRotate) {
          globeGroup.rotation.y += delta * 0.12;
        }
      }

      // Pulse Radar Rings
      radarPings.forEach((item) => {
        item.scale += delta * 1.5;
        if (item.scale > 3.2) item.scale = 1.0;
        item.mesh.scale.set(item.scale, item.scale, 1);
        const op = Math.max(0, 0.85 * (1 - (item.scale - 1) / 2.2));
        (item.mesh.material as THREE.MeshBasicMaterial).opacity = op;
      });

      // Advance telemetry pulse packets along bezier arcs
      pulsePackets.forEach((p) => {
        p.progress = (p.progress + delta * p.speed) % 1.0;
        const point = p.curve.getPoint(p.progress);
        p.mesh.position.copy(point);
      });

      // Expand Sonar Equator Waves
      waveRings.forEach((wave) => {
        wave.scale += delta * 0.28;
        if (wave.scale > 1.45) wave.scale = 1.0;
        wave.mesh.scale.set(wave.scale, wave.scale, wave.scale);
        const op = Math.max(0, 0.22 * (1 - (wave.scale - 1.0) / 0.45));
        (wave.mesh.material as THREE.MeshBasicMaterial).opacity = op;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
      globeMatRef.current = null;
      cameraRef.current = null;
    };
  }, [autoRotate, theme, soundEnabled, hotspots, onSelectHotspot]);

  // Regional Focus Presets
  const focusRegion = (lat: number, lon: number, defaultHotspot?: Hotspot) => {
    targetRotationRef.current = {
      x: lat * (Math.PI / 180),
      y: -(lon + 90) * (Math.PI / 180),
    };
    if (defaultHotspot) {
      setActiveHotspot(defaultHotspot);
      if (onSelectHotspot) onSelectHotspot(defaultHotspot);
    }
    playSonarPing(880);
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Top Status & Controls Bar */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mb-1 text-xs z-20">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
          </span>
          <span className="font-semibold text-white dark:text-white light:text-slate-900 tracking-normal text-xs">
            Global Sonar Surveillance
          </span>
          <span className="hidden sm:inline text-neutral-400 dark:text-neutral-400 light:text-slate-500 text-xs">
            · 7 Active Pinpoints
          </span>
        </div>

        {/* Map Texture Style Switcher */}
        <div className="flex items-center gap-1 bg-black/60 dark:bg-black/60 light:bg-slate-100 p-1 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-300 backdrop-blur-md">
          <button
            onClick={() => setMapMode('heatmap')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mapMode === 'heatmap'
                ? 'bg-[#00ff88] text-black font-semibold shadow-sm'
                : 'text-neutral-400 dark:text-neutral-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-black'
            }`}
            title="Ocean Currents & Thermal Heatmap"
          >
            Ocean Heatmap
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mapMode === 'satellite'
                ? 'bg-[#00ff88] text-black font-semibold shadow-sm'
                : 'text-neutral-400 dark:text-neutral-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-black'
            }`}
            title="Photorealistic NASA Satellite Earth"
          >
            Satellite
          </button>
          <button
            onClick={() => setMapMode('night')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mapMode === 'night'
                ? 'bg-[#00ff88] text-black font-semibold shadow-sm'
                : 'text-neutral-400 dark:text-neutral-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-black'
            }`}
            title="Night Illumination & Coastal Radar"
          >
            Night Radar
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors ml-0.5 cursor-pointer rounded-lg hover:bg-white/5"
            title={soundEnabled ? 'Mute Sonar Sound' : 'Enable Sonar Sound'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#00ff88]" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[380px] sm:h-[480px] md:h-[560px] lg:h-[620px] cursor-grab active:cursor-grabbing relative flex items-center justify-center overflow-hidden rounded-3xl"
      >
        {/* Subtle Coordinates Watermark */}
        <div className="absolute top-4 left-4 pointer-events-none font-mono text-[9px] text-white/30 dark:text-white/30 light:text-slate-400/60 leading-relaxed">
          <div>PROJECTION: WGS-84 EQUIRECTANGULAR</div>
          <div>BATHYMETRIC DEPTH: GEBCO 2024</div>
          <div>SENSOR: MULTI-BEAM ACOUSTIC SYNTH</div>
        </div>

        {/* Hover Tooltip */}
        {hoveredHotspot && !activeHotspot && (
          <div className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-black/85 dark:bg-black/85 light:bg-white/95 border border-[#00ff88]/40 shadow-lg backdrop-blur-md font-mono text-[10px] pointer-events-none z-30">
            <div className="text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {hoveredHotspot.name}
            </div>
            <div className="text-neutral-300 dark:text-neutral-300 light:text-slate-700">
              {hoveredHotspot.region} · {hoveredHotspot.confidence}% Confidence
            </div>
          </div>
        )}
      </div>

      {/* Floating Selected Hotspot Intelligence Dossier */}
      {activeHotspot && (
        <div className="absolute top-12 right-3 sm:right-6 p-4 rounded-2xl bg-black/92 dark:bg-black/92 light:bg-white/95 border border-[#00ff88]/50 shadow-[0_0_30px_rgba(0,0,0,0.85)] dark:shadow-[0_0_30px_rgba(0,0,0,0.85)] light:shadow-2xl backdrop-blur-xl max-w-xs animate-in fade-in slide-in-from-top-3 z-30">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 dark:border-white/10 light:border-slate-200 mb-2">
            <span className="text-[10px] font-mono text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3 h-3" /> ACOUSTIC PINPOINT
            </span>
            <span className="text-[10px] font-mono text-white dark:text-white light:text-slate-900 font-bold bg-[#00ff88]/20 px-2 py-0.5 rounded-full border border-[#00ff88]/40">
              {activeHotspot.confidence}% CONF
            </span>
          </div>

          <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-950 tracking-tight">
            {activeHotspot.name}
          </h4>

          <div className="text-[11px] text-neutral-400 dark:text-neutral-400 light:text-slate-500 font-mono mt-0.5">
            {activeHotspot.region} · {activeHotspot.lat.toFixed(2)}° N, {activeHotspot.lon.toFixed(2)}° E
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <div className="bg-white/5 dark:bg-white/5 light:bg-slate-100 p-2 rounded-lg border border-white/5 dark:border-white/5 light:border-slate-200">
              <div className="text-[9px] font-mono text-neutral-400 uppercase">Subsea Depth</div>
              <div className="text-xs font-mono font-bold text-white dark:text-white light:text-slate-900">
                {activeHotspot.depthMeters} m
              </div>
            </div>
            <div className="bg-white/5 dark:bg-white/5 light:bg-slate-100 p-2 rounded-lg border border-white/5 dark:border-white/5 light:border-slate-200">
              <div className="text-[9px] font-mono text-neutral-400 uppercase">Est. Weight</div>
              <div className="text-xs font-mono font-bold text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700">
                {activeHotspot.estimatedWeightKg} kg
              </div>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-neutral-300 dark:text-neutral-300 light:text-slate-700 font-light bg-white/5 dark:bg-white/5 light:bg-slate-100 p-2 rounded-lg border border-white/5 dark:border-white/5 light:border-slate-200 flex items-center justify-between">
            <span className="font-mono text-[10px] text-neutral-400">GEAR TYPE:</span>
            <span className="font-semibold text-right">{activeHotspot.gearType}</span>
          </div>

          <button
            onClick={() => setActiveHotspot(null)}
            className="w-full mt-2.5 py-1 text-[10px] font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-500 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors text-center cursor-pointer"
          >
            [ DISMISS TELEMETRY CARD ]
          </button>
        </div>
      )}

      {/* Interactive Quick-Controls Bar Below Globe */}
      <div className="relative z-20 flex flex-wrap items-center justify-center gap-2 mt-1 px-4 py-2 rounded-full bg-black/80 dark:bg-black/80 light:bg-white/90 border border-white/15 dark:border-white/15 light:border-slate-300 backdrop-blur-md text-xs shadow-sm">
        <span className="text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-medium hidden sm:inline mr-1">
          Explore Region:
        </span>

        <button
          onClick={() => focusRegion(14, 76, hotspots[0])}
          className="px-3.5 py-1.5 rounded-full bg-[#00ff88]/15 border border-[#00ff88]/50 text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 hover:bg-[#00ff88] hover:text-black font-semibold transition-all cursor-pointer flex items-center gap-1.5 text-xs"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Indian Ocean</span>
        </button>

        <button
          onClick={() => focusRegion(34.2, -142.1, hotspots[4])}
          className="px-3.5 py-1.5 rounded-full bg-white/5 dark:bg-white/5 light:bg-slate-100 border border-white/15 dark:border-white/15 light:border-slate-300 text-neutral-300 dark:text-neutral-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-950 hover:border-white transition-all cursor-pointer font-medium text-xs"
        >
          <span>Pacific Gyre</span>
        </button>

        <button
          onClick={() => focusRegion(54.75, 2.5, hotspots[5])}
          className="px-3.5 py-1.5 rounded-full bg-white/5 dark:bg-white/5 light:bg-slate-100 border border-white/15 dark:border-white/15 light:border-slate-300 text-neutral-300 dark:text-neutral-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-950 hover:border-white transition-all cursor-pointer font-medium text-xs"
        >
          <span>North Sea</span>
        </button>

        <button
          onClick={() => focusRegion(-18.28, 147.7, hotspots[6])}
          className="px-3.5 py-1.5 rounded-full bg-white/5 dark:bg-white/5 light:bg-slate-100 border border-white/15 dark:border-white/15 light:border-slate-300 text-neutral-300 dark:text-neutral-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-950 hover:border-white transition-all cursor-pointer font-medium text-xs"
        >
          <span>Coral Sea</span>
        </button>

        <button
          onClick={() => {
            targetRotationRef.current = null;
            setAutoRotate((prev) => !prev);
          }}
          className={`p-1.5 rounded-full border transition-all cursor-pointer ml-1 ${
            autoRotate
              ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10'
              : 'border-white/20 dark:border-white/20 light:border-slate-300 text-neutral-400 dark:text-neutral-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-950'
          }`}
          title="Toggle Earth Auto-Rotation"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-500 mt-2 text-center font-normal">
        Click & drag to rotate earth · Select any marker to view acoustic detection details
      </div>
    </div>
  );
};

export default RealisticOceanGlobe3D;
