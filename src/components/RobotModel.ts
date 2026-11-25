/**
 * Lightbot Camp Studio 3D - Optimus-Inspired Cybernetic Robot (Procedural 3D Model)
 * Constructed from articulated procedural parts using THREE.Group.
 * Adheres strictly to Three.js design constitution:
 * - Composite multi-part hierarchy (10+ distinct articulated components)
 * - PBR materials with varied roughness/metalness (white lacquer, dark titanium, cyan glow)
 * - Grounded bottom-center pivot with integrated contact shadow & directional beacon
 */

import * as THREE from 'three';

export interface RobotParts {
  group: THREE.Group;
  torsoGroup: THREE.Group;
  headGroup: THREE.Group;
  coreMesh: THREE.Mesh;
  coreMaterial: THREE.MeshStandardMaterial;
  leftArmGroup: THREE.Group;
  rightArmGroup: THREE.Group;
  leftLegGroup: THREE.Group;
  rightLegGroup: THREE.Group;
  directionIndicator: THREE.Group;
  shadowMesh: THREE.Mesh;
}

export function createRobotModel(): RobotParts {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'OptimusRobot';

  // --- Reusable PBR Materials ---
  const armorWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.4,
    roughness: 0.25,
  });

  const armorDarkMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.2,
  });

  const jointMetalMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.95,
    roughness: 0.15,
  });

  const accentCyanMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    metalness: 0.5,
    roughness: 0.2,
    emissive: 0x0891b2,
    emissiveIntensity: 0.8,
  });

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.4,
    roughness: 0.1,
  });

  const visorMaterial = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x22d3ee,
    emissiveIntensity: 1.8,
    roughness: 0.1,
  });

  // --- Ground Contact Shadow & Base Plate ---
  // Soft radial contact shadow
  const shadowGeo = new THREE.PlaneGeometry(0.9, 0.9);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.85,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.02; // Just above tile surface to avoid z-fighting
  rootGroup.add(shadowMesh);

  // Directional Indicator: Glowing Arrow / Chevron on ground pointing forward (-Z)
  const directionIndicator = new THREE.Group();
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, -0.36);
  arrowShape.lineTo(0.14, -0.22);
  arrowShape.lineTo(0.06, -0.22);
  arrowShape.lineTo(0.06, -0.12);
  arrowShape.lineTo(-0.06, -0.12);
  arrowShape.lineTo(-0.06, -0.22);
  arrowShape.lineTo(-0.14, -0.22);
  arrowShape.closePath();

  const arrowGeo = new THREE.ShapeGeometry(arrowShape);
  const arrowMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
  arrowMesh.rotation.x = -Math.PI / 2;
  arrowMesh.position.y = 0.025;
  directionIndicator.add(arrowMesh);
  rootGroup.add(directionIndicator);

  // --- Lower Body: Legs & Magnetic Soles ---
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.16, 0.42, 0);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.16, 0.42, 0);

  function buildLeg(): THREE.Group {
    const leg = new THREE.Group();
    // Thigh
    const thighGeo = new THREE.BoxGeometry(0.12, 0.22, 0.14);
    const thigh = new THREE.Mesh(thighGeo, armorDarkMat);
    thigh.position.y = -0.11;
    thigh.castShadow = true;
    leg.add(thigh);

    // Knee joint
    const kneeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.14, 12);
    const knee = new THREE.Mesh(kneeGeo, jointMetalMat);
    knee.rotation.z = Math.PI / 2;
    knee.position.y = -0.22;
    knee.castShadow = true;
    leg.add(knee);

    // Shin & Guard
    const shinGeo = new THREE.BoxGeometry(0.13, 0.22, 0.16);
    const shin = new THREE.Mesh(shinGeo, armorWhiteMat);
    shin.position.y = -0.32;
    shin.castShadow = true;
    leg.add(shin);

    // Foot / Magnetic Sole
    const footGeo = new THREE.BoxGeometry(0.15, 0.08, 0.24);
    const foot = new THREE.Mesh(footGeo, armorDarkMat);
    foot.position.set(0, -0.42, -0.04);
    foot.castShadow = true;
    leg.add(foot);

    return leg;
  }

  leftLegGroup.add(buildLeg());
  rightLegGroup.add(buildLeg());
  rootGroup.add(leftLegGroup);
  rootGroup.add(rightLegGroup);

  // --- Pelvis / Waist ---
  const pelvisGeo = new THREE.BoxGeometry(0.36, 0.12, 0.2);
  const pelvis = new THREE.Mesh(pelvisGeo, armorDarkMat);
  pelvis.position.y = 0.46;
  pelvis.castShadow = true;
  rootGroup.add(pelvis);

  // --- Upper Body: Torso Group ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.52, 0);

  // Abdomen hydraulic spine
  const spineGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.14, 12);
  const spine = new THREE.Mesh(spineGeo, jointMetalMat);
  spine.position.y = 0.06;
  spine.castShadow = true;
  torsoGroup.add(spine);

  // Chest Armor Hull (Optimus inspired multi-layered plate)
  const chestMainGeo = new THREE.BoxGeometry(0.44, 0.32, 0.26);
  const chestMain = new THREE.Mesh(chestMainGeo, armorWhiteMat);
  chestMain.position.y = 0.25;
  chestMain.castShadow = true;
  torsoGroup.add(chestMain);

  // Chest Upper Pectoral Plates (Angled dark titanium plates)
  const chestPlateGeo = new THREE.BoxGeometry(0.18, 0.14, 0.05);
  const chestPlateL = new THREE.Mesh(chestPlateGeo, armorDarkMat);
  chestPlateL.position.set(-0.11, 0.32, -0.14);
  chestPlateL.castShadow = true;
  torsoGroup.add(chestPlateL);

  const chestPlateR = new THREE.Mesh(chestPlateGeo, armorDarkMat);
  chestPlateR.position.set(0.11, 0.32, -0.14);
  chestPlateR.castShadow = true;
  torsoGroup.add(chestPlateR);

  // Central Power Core (Glowing reactor)
  const coreGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.06, 16);
  const coreMesh = new THREE.Mesh(coreGeo, coreMaterial);
  coreMesh.rotation.x = Math.PI / 2;
  coreMesh.position.set(0, 0.22, -0.14);
  torsoGroup.add(coreMesh);

  // Backpack / Cyber Thrusters
  const backpackGeo = new THREE.BoxGeometry(0.28, 0.24, 0.12);
  const backpack = new THREE.Mesh(backpackGeo, armorDarkMat);
  backpack.position.set(0, 0.26, 0.16);
  backpack.castShadow = true;
  torsoGroup.add(backpack);

  // Thruster nozzles
  const nozzleGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.1, 12);
  const nozzleL = new THREE.Mesh(nozzleGeo, accentCyanMat);
  nozzleL.position.set(-0.08, 0.14, 0.22);
  nozzleL.rotation.x = 0.3;
  torsoGroup.add(nozzleL);

  const nozzleR = new THREE.Mesh(nozzleGeo, accentCyanMat);
  nozzleR.position.set(0.08, 0.14, 0.22);
  nozzleR.rotation.x = 0.3;
  torsoGroup.add(nozzleR);

  // --- Head Group ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.42, 0);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.06, 10);
  const neck = new THREE.Mesh(neckGeo, jointMetalMat);
  neck.position.y = 0.03;
  headGroup.add(neck);

  // Main Helmet / Head
  const helmetGeo = new THREE.BoxGeometry(0.24, 0.22, 0.22);
  const helmet = new THREE.Mesh(helmetGeo, armorDarkMat);
  helmet.position.y = 0.15;
  helmet.castShadow = true;
  headGroup.add(helmet);

  // Helmet Crest / Crown
  const crestGeo = new THREE.BoxGeometry(0.08, 0.08, 0.26);
  const crest = new THREE.Mesh(crestGeo, armorWhiteMat);
  crest.position.set(0, 0.26, 0);
  crest.castShadow = true;
  headGroup.add(crest);

  // Ear Antennae
  const antennaGeo = new THREE.BoxGeometry(0.03, 0.16, 0.08);
  const antennaL = new THREE.Mesh(antennaGeo, accentCyanMat);
  antennaL.position.set(-0.13, 0.22, 0);
  headGroup.add(antennaL);

  const antennaR = new THREE.Mesh(antennaGeo, accentCyanMat);
  antennaR.position.set(0.13, 0.22, 0);
  headGroup.add(antennaR);

  // Faceplate
  const faceplateGeo = new THREE.BoxGeometry(0.16, 0.09, 0.04);
  const faceplate = new THREE.Mesh(faceplateGeo, armorWhiteMat);
  faceplate.position.set(0, 0.11, -0.12);
  headGroup.add(faceplate);

  // Glowing Visor / Optics
  const visorGeo = new THREE.BoxGeometry(0.16, 0.05, 0.04);
  const visorMesh = new THREE.Mesh(visorGeo, visorMaterial);
  visorMesh.position.set(0, 0.18, -0.12);
  headGroup.add(visorMesh);

  torsoGroup.add(headGroup);

  // --- Arms & Pauldrons ---
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.28, 0.36, 0);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.28, 0.36, 0);

  function buildArm(isLeft: boolean): THREE.Group {
    const arm = new THREE.Group();

    // Shoulder Pauldron (Angled cyber armor)
    const pauldronGeo = new THREE.BoxGeometry(0.16, 0.14, 0.2);
    const pauldron = new THREE.Mesh(pauldronGeo, armorWhiteMat);
    pauldron.position.set(isLeft ? -0.04 : 0.04, 0.02, 0);
    pauldron.rotation.z = isLeft ? 0.15 : -0.15;
    pauldron.castShadow = true;
    arm.add(pauldron);

    // Bicep
    const bicepGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.18, 10);
    const bicep = new THREE.Mesh(bicepGeo, jointMetalMat);
    bicep.position.y = -0.12;
    bicep.castShadow = true;
    arm.add(bicep);

    // Elbow
    const elbowGeo = new THREE.SphereGeometry(0.06, 10, 10);
    const elbow = new THREE.Mesh(elbowGeo, armorDarkMat);
    elbow.position.y = -0.22;
    arm.add(elbow);

    // Forearm
    const forearmGeo = new THREE.BoxGeometry(0.11, 0.18, 0.12);
    const forearm = new THREE.Mesh(forearmGeo, armorWhiteMat);
    forearm.position.y = -0.32;
    forearm.castShadow = true;
    arm.add(forearm);

    // Fist / Hand
    const handGeo = new THREE.BoxGeometry(0.09, 0.09, 0.1);
    const hand = new THREE.Mesh(handGeo, armorDarkMat);
    hand.position.set(0, -0.42, 0);
    hand.castShadow = true;
    arm.add(hand);

    return arm;
  }

  leftArmGroup.add(buildArm(true));
  rightArmGroup.add(buildArm(false));
  torsoGroup.add(leftArmGroup);
  torsoGroup.add(rightArmGroup);

  rootGroup.add(torsoGroup);

  // Position root slightly above tile base so feet rest cleanly at y = 0
  rootGroup.position.y = 0;

  return {
    group: rootGroup,
    torsoGroup,
    headGroup,
    coreMesh,
    coreMaterial,
    leftArmGroup,
    rightArmGroup,
    leftLegGroup,
    rightLegGroup,
    directionIndicator,
    shadowMesh,
  };
}
