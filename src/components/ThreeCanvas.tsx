/**
 * Lightbot Camp Studio 3D - Three.js WebGL Arena & Kinematic Renderer
 * Features:
 * - High-fidelity PBR graphics with RoomEnvironment reflections and studio 3-point lighting
 * - Optimus-inspired multi-part procedural robot with articulated limbs and core energy flare
 * - Realistic jumping parabolic arcs, footstep strides, shockwave landing rings, and glowing light beacons
 * - Dynamic camera presets (Isometric, Tactical Top-Down, Behind Robot Follow Cam, Free Orbit)
 * - Software-WebGL detection with adaptive performance and smooth frame pacing
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BoardTile, Direction, ExecutionStep, LevelConfig } from '../game/types';
import { createRobotModel, RobotParts } from './RobotModel';
import { soundManager } from '../audio/soundManager';

export type CameraPreset = 'ISO' | 'TOP_DOWN' | 'FOLLOW' | 'FREE';

interface ThreeCanvasProps {
  level: LevelConfig;
  currentStep: ExecutionStep | null;
  stepProgress: number; // 0 to 1
  litTileCoordinates: Array<{ x: number; y: number }>;
  isExecuting: boolean;
  isCompleted: boolean;
  cameraPreset: CameraPreset;
  onCameraPresetChange?: (preset: CameraPreset) => void;
}

const TILE_SIZE = 1.0;
const TILE_GAP = 0.05;
const HEIGHT_STEP = 0.5;

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  level,
  currentStep,
  stepProgress,
  litTileCoordinates,
  isCompleted,
  cameraPreset,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Mutable state references for WebGL loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const robotRef = useRef<RobotParts | null>(null);
  
  const tileMeshesRef = useRef<Map<string, {
    baseMesh: THREE.Mesh;
    beaconMesh?: THREE.Mesh;
    beamMesh?: THREE.Mesh;
    ringMesh?: THREE.Mesh;
    quizMesh?: THREE.Mesh;
  }>>(new Map());

  const shockwavesRef = useRef<Array<{ mesh: THREE.Mesh; progress: number }>>([]);
  const animFrameRef = useRef<number>(0);
  const propsRef = useRef({
    level,
    currentStep,
    stepProgress,
    litTileCoordinates,
    isCompleted,
    cameraPreset,
  });

  propsRef.current = {
    level,
    currentStep,
    stepProgress,
    litTileCoordinates,
    isCompleted,
    cameraPreset,
  };

  // Convert grid (x, y) to world (X, Z) coordinates
  const gridToWorld = (x: number, y: number) => {
    const cx = (level.gridSize.width - 1) / 2;
    const cy = (level.gridSize.height - 1) / 2;
    return {
      worldX: (x - cx) * (TILE_SIZE + TILE_GAP),
      worldZ: -(y - cy) * (TILE_SIZE + TILE_GAP), // Y+ is North (-Z in Three.js)
    };
  };

  // Direction to rotation Y in radians
  const dirToAngle = (dir: Direction): number => {
    switch (dir) {
      case 0: return 0;              // North (-Z)
      case 1: return -Math.PI / 2;    // East (+X)
      case 2: return Math.PI;         // South (+Z)
      case 3: return Math.PI / 2;     // West (-X)
    }
  };

  // Build or rebuild board tiles
  const buildBoard = (scene: THREE.Scene, lvl: LevelConfig) => {
    // Clear previous tiles
    tileMeshesRef.current.forEach((val) => {
      scene.remove(val.baseMesh);
      if (val.beaconMesh) scene.remove(val.beaconMesh);
      if (val.beamMesh) scene.remove(val.beamMesh);
      if (val.ringMesh) scene.remove(val.ringMesh);
      if (val.quizMesh) scene.remove(val.quizMesh);
    });
    tileMeshesRef.current.clear();

    // Procedural tile surface texture
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 256;
    texCanvas.height = 256;
    const ctx = texCanvas.getContext('2d')!;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 244, 244);
    // Tech corner notches
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(10, 10, 20, 4);
    ctx.fillRect(10, 10, 4, 20);
    ctx.fillRect(226, 10, 20, 4);
    ctx.fillRect(242, 10, 4, 20);
    ctx.fillRect(10, 242, 20, 4);
    ctx.fillRect(10, 226, 4, 20);
    ctx.fillRect(226, 242, 20, 4);
    ctx.fillRect(242, 226, 4, 20);

    const tileTexture = new THREE.CanvasTexture(texCanvas);
    tileTexture.colorSpace = THREE.SRGBColorSpace;

    // Normal tile material
    const baseTileMaterial = new THREE.MeshStandardMaterial({
      map: tileTexture,
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.35,
    });

    const targetTileMaterial = new THREE.MeshStandardMaterial({
      map: tileTexture,
      color: 0x0284c7,
      metalness: 0.7,
      roughness: 0.25,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
    });

    lvl.tiles.forEach((tile: BoardTile) => {
      const { worldX, worldZ } = gridToWorld(tile.x, tile.y);
      const heightUnits = tile.height + 1;
      const totalBlockHeight = heightUnits * HEIGHT_STEP;
      const posY = totalBlockHeight / 2;

      // Base column geometry
      const boxGeo = new THREE.BoxGeometry(TILE_SIZE, totalBlockHeight, TILE_SIZE);
      const mesh = new THREE.Mesh(
        boxGeo,
        tile.isLightTarget ? targetTileMaterial.clone() : baseTileMaterial
      );
      mesh.position.set(worldX, posY, worldZ);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      const entry: {
        baseMesh: THREE.Mesh;
        beaconMesh?: THREE.Mesh;
        beamMesh?: THREE.Mesh;
        ringMesh?: THREE.Mesh;
        quizMesh?: THREE.Mesh;
      } = { baseMesh: mesh };

      // If it's a light target, add futuristic crystal beacon and vertical beam
      if (tile.isLightTarget) {
        // Beacon Crystal Receptacle
        const beaconGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.08, 16);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: 0x0ea5e9,
          emissive: 0x0284c7,
          emissiveIntensity: 0.8,
          metalness: 0.3,
          roughness: 0.1,
          transparent: true,
          opacity: 0.95,
        });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.set(worldX, totalBlockHeight + 0.04, worldZ);
        scene.add(beaconMesh);
        entry.beaconMesh = beaconMesh;

        // Vertical holographic light beam (for lit state)
        const beamGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.8, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xfacc15,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.set(worldX, totalBlockHeight + 1.4, worldZ);
        scene.add(beamMesh);
        entry.beamMesh = beamMesh;

        // Energy orbit ring
        const ringGeo = new THREE.TorusGeometry(0.32, 0.02, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.6,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.set(worldX, totalBlockHeight + 0.12, worldZ);
        scene.add(ringMesh);
        entry.ringMesh = ringMesh;
      }

      // If it's a computing science quiz checkpoint gate
      if (tile.isQuizTrigger) {
        const quizGeo = new THREE.OctahedronGeometry(0.22, 0);
        const quizMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          emissive: 0x9333ea,
          emissiveIntensity: 1.5,
          roughness: 0.2,
          metalness: 0.8,
        });
        const quizMesh = new THREE.Mesh(quizGeo, quizMat);
        quizMesh.position.set(worldX, totalBlockHeight + 0.38, worldZ);
        scene.add(quizMesh);
        entry.quizMesh = quizMesh;
      }

      tileMeshesRef.current.set(`${tile.x},${tile.y}`, entry);
    });
  };

  // Spawn landing shockwave ring
  const spawnShockwave = (x: number, y: number, z: number, scene: THREE.Scene) => {
    const geo = new THREE.RingGeometry(0.1, 0.18, 24);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y + 0.03, z);
    scene.add(mesh);
    shockwavesRef.current.push({ mesh, progress: 0 });
  };

  // Initialize Three.js scene once
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(4, 5.5, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go under ground
    controls.minDistance = 2.5;
    controls.maxDistance = 18;
    controls.target.set(0, 0.5, 0);

    // Procedural Studio Environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-point Lighting
    // 1. Key Light (Warm directional)
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    keyLight.position.set(6, 10, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.camera.left = -6;
      keyLight.shadow.camera.right = 6;
      keyLight.shadow.camera.top = 6;
      keyLight.shadow.camera.bottom = -6;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // 2. Hemisphere fill (Cool sky to dark ground)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // 3. Cyber cyan rim light
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.4);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);

    // Sci-Fi Arena Deck & Boundary Grid
    const arenaSize = 24;
    const arenaGeo = new THREE.PlaneGeometry(arenaSize, arenaSize);
    const arenaMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.85,
      metalness: 0.3,
    });
    const arenaMesh = new THREE.Mesh(arenaGeo, arenaMat);
    arenaMesh.rotation.x = -Math.PI / 2;
    arenaMesh.position.y = -0.02;
    arenaMesh.receiveShadow = true;
    scene.add(arenaMesh);

    // Holographic grid lines
    const gridHelper = new THREE.GridHelper(arenaSize, 32, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Add Optimus Robot Model
    const robot = createRobotModel();
    robotRef.current = robot;
    scene.add(robot.group);

    // Initial board construction
    buildBoard(scene, propsRef.current.level);

    // Setup resize listener
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // Animation & Kinematics Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { currentStep: step, stepProgress: prog, litTileCoordinates: litCoords, isCompleted: won, cameraPreset: camPreset } = propsRef.current;

      // Update Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.progress += delta * 2.5;
        const scale = 1 + sw.progress * 4.5;
        sw.mesh.scale.set(scale, scale, 1);
        (sw.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 * (1 - sw.progress));
        if (sw.progress >= 1) {
          scene.remove(sw.mesh);
          shockwavesRef.current.splice(i, 1);
        }
      }

      // Update Light Targets Visuals (lit / unlit beacon & beam animation)
      const litSet = new Set(litCoords.map((c) => `${c.x},${c.y}`));
      tileMeshesRef.current.forEach((val, key) => {
        const isLit = litSet.has(key);
        if (val.beaconMesh) {
          const bMat = val.beaconMesh.material as THREE.MeshStandardMaterial;
          if (isLit) {
            bMat.color.setHex(0xfacc15); // Blazing gold
            bMat.emissive.setHex(0xeab308);
            bMat.emissiveIntensity = 2.0 + Math.sin(time * 5) * 0.4;
          } else {
            bMat.color.setHex(0x0ea5e9); // Electric blue
            bMat.emissive.setHex(0x0284c7);
            bMat.emissiveIntensity = 0.4 + Math.sin(time * 2.5) * 0.15;
          }
        }
        if (val.beamMesh) {
          const bMat = val.beamMesh.material as THREE.MeshBasicMaterial;
          bMat.opacity = isLit ? 0.45 + Math.sin(time * 6) * 0.15 : 0;
          val.beamMesh.rotation.y += delta * 0.8;
        }
        if (val.ringMesh) {
          val.ringMesh.rotation.z += delta * 1.5;
          (val.ringMesh.material as THREE.MeshBasicMaterial).color.setHex(isLit ? 0xfef08a : 0x38bdf8);
        }
        if (val.quizMesh) {
          val.quizMesh.rotation.y += delta * 2.2;
          val.quizMesh.rotation.x = Math.sin(time * 2) * 0.2;
        }
      });

      // Update Robot Kinematics and Movement
      if (robotRef.current) {
        const rob = robotRef.current;

        if (step) {
          const before = step.robotStateBefore;
          const after = step.robotStateAfter;
          const p = THREE.MathUtils.clamp(prog, 0, 1);

          const startW = gridToWorld(before.x, before.y);
          const endW = gridToWorld(after.x, after.y);

          const startH = (before.height + 1) * HEIGHT_STEP;
          const endH = (after.height + 1) * HEIGHT_STEP;

          let startAngle = dirToAngle(before.direction);
          let endAngle = dirToAngle(after.direction);
          
          // Smooth angle wrapping
          let angleDiff = endAngle - startAngle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          const curAngle = startAngle + angleDiff * p;

          let curX = THREE.MathUtils.lerp(startW.worldX, endW.worldX, p);
          let curZ = THREE.MathUtils.lerp(startW.worldZ, endW.worldZ, p);
          let curY = THREE.MathUtils.lerp(startH, endH, p);

          // Reset limbs to neutral
          rob.leftArmGroup.rotation.x = 0;
          rob.rightArmGroup.rotation.x = 0;
          rob.leftLegGroup.rotation.x = 0;
          rob.rightLegGroup.rotation.x = 0;
          rob.torsoGroup.position.y = 0.52;
          rob.headGroup.rotation.y = 0;

          if (step.action === 'MOVE') {
            // Forward walking animation with leg swing and arm counter-swing
            const stride = Math.sin(p * Math.PI * 2);
            rob.leftLegGroup.rotation.x = stride * 0.45;
            rob.rightLegGroup.rotation.x = -stride * 0.45;
            rob.leftArmGroup.rotation.x = -stride * 0.4;
            rob.rightArmGroup.rotation.x = stride * 0.4;
            curY += Math.abs(Math.sin(p * Math.PI * 2)) * 0.06; // Foot bounce
          } else if (step.action === 'JUMP_UP' || step.action === 'JUMP_DOWN') {
            // Ballistic parabolic jump arc
            const jumpApex = 0.65;
            const arcY = 4 * jumpApex * p * (1 - p);
            curY = THREE.MathUtils.lerp(startH, endH, p) + arcY;

            // Leg tuck in air
            rob.leftLegGroup.rotation.x = -0.5 * Math.sin(p * Math.PI);
            rob.rightLegGroup.rotation.x = -0.5 * Math.sin(p * Math.PI);
            rob.leftArmGroup.rotation.x = 0.6 * Math.sin(p * Math.PI);
            rob.rightArmGroup.rotation.x = 0.6 * Math.sin(p * Math.PI);

            // Spawn shockwave when landing near completion of jump
            if (p > 0.92 && p < 0.97 && shockwavesRef.current.length === 0) {
              spawnShockwave(endW.worldX, endH, endW.worldZ, scene);
            }
          } else if (step.action === 'TURN_L' || step.action === 'TURN_R') {
            // Turning: slight lean and torso twist
            rob.torsoGroup.rotation.y = Math.sin(p * Math.PI) * (step.action === 'TURN_L' ? 0.2 : -0.2);
          } else if (step.action === 'LIGHT_ON') {
            // Light flare animation
            rob.coreMaterial.emissiveIntensity = 1.4 + Math.sin(p * Math.PI) * 3.0;
            rob.leftArmGroup.rotation.x = -0.8 * Math.sin(p * Math.PI);
            rob.rightArmGroup.rotation.x = -0.8 * Math.sin(p * Math.PI);
          } else if (step.action === 'BLOCKED') {
            // Bump / shake head
            rob.headGroup.rotation.y = Math.sin(p * Math.PI * 6) * 0.35;
            rob.coreMaterial.emissive.setHex(0xef4444); // Red warning
          }

          rob.group.position.set(curX, curY, curZ);
          rob.group.rotation.y = curAngle;
        } else {
          // Idle breathing animation
          const idlePos = gridToWorld(propsRef.current.level.startPos.x, propsRef.current.level.startPos.y);
          const idleH = (propsRef.current.level.startPos.height + 1) * HEIGHT_STEP;
          const idleAngle = dirToAngle(propsRef.current.level.startPos.direction);

          rob.group.position.set(idlePos.worldX, idleH, idlePos.worldZ);
          rob.group.rotation.y = idleAngle;

          // Subtle idle breathing
          const breath = Math.sin(time * 2.5) * 0.02;
          rob.torsoGroup.position.y = 0.52 + breath;
          rob.headGroup.rotation.y = Math.sin(time * 0.8) * 0.1;
          rob.coreMaterial.emissiveIntensity = 1.2 + Math.sin(time * 3) * 0.3;
          rob.coreMaterial.emissive.setHex(0x0ea5e9);
          rob.leftLegGroup.rotation.x = 0;
          rob.rightLegGroup.rotation.x = 0;
          rob.leftArmGroup.rotation.x = 0;
          rob.rightArmGroup.rotation.x = 0;

          if (won) {
            // Victory celebration wave
            rob.leftArmGroup.rotation.x = -1.6 + Math.sin(time * 8) * 0.3;
            rob.rightArmGroup.rotation.x = -1.6 - Math.sin(time * 8) * 0.3;
            rob.group.rotation.y += delta * 2;
          }
        }
      }

      // Smooth Camera Positioning based on Camera Preset
      if (controls && camera) {
        let targetCamPos = new THREE.Vector3();
        let targetLookAt = new THREE.Vector3(0, 0.8, 0);

        if (camPreset === 'ISO') {
          targetCamPos.set(4.2, 5.2, 5.8);
          controls.enabled = false;
        } else if (camPreset === 'TOP_DOWN') {
          targetCamPos.set(0.01, 8.5, 0.01);
          controls.enabled = false;
        } else if (camPreset === 'FOLLOW') {
          if (robotRef.current) {
            const rPos = robotRef.current.group.position;
            const rRot = robotRef.current.group.rotation.y;
            // Behind robot position
            const offsetZ = 2.8 * Math.cos(rRot);
            const offsetX = 2.8 * Math.sin(rRot);
            targetCamPos.set(rPos.x + offsetX, rPos.y + 1.8, rPos.z + offsetZ);
            targetLookAt.set(rPos.x, rPos.y + 0.6, rPos.z);
          }
          controls.enabled = false;
        } else {
          // FREE Orbit
          controls.enabled = true;
          controls.update();
        }

        if (camPreset !== 'FREE') {
          camera.position.lerp(targetCamPos, delta * 3.5);
          controls.target.lerp(targetLookAt, delta * 4);
          camera.lookAt(controls.target);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // When level changes, rebuild board
  useEffect(() => {
    if (sceneRef.current) {
      buildBoard(sceneRef.current, level);
    }
  }, [level]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
