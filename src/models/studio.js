import * as THREE from "three";
import { makeTexture, mesh, rounded, stage, SURFACE } from "./kit.js";

function screenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 200;
  const context = canvas.getContext("2d");
  context.fillStyle = "#14352c";
  context.fillRect(0, 0, 320, 200);
  context.fillStyle = "#1f6b4a";
  context.fillRect(0, 0, 320, 28);
  context.fillStyle = "#f4efe6";
  context.font = "600 18px Outfit, sans-serif";
  context.fillText("Nano Folio", 16, 19);
  const cards = ["#e7f0ea", "#f6efe8", "#eef1f6"];
  cards.forEach((color, index) => {
    context.fillStyle = color;
    roundRect(context, 16 + index * 98, 48, 88, 64, 8);
    context.fill();
  });
  context.fillStyle = "#d7efe4";
  [40, 70, 52, 88, 64].forEach((height, index) => {
    context.fillRect(24 + index * 22, 168 - height, 14, height);
  });
  return makeTexture(canvas);
}

function keyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  context.fillStyle = "#2a2724";
  context.fillRect(0, 0, 256, 96);
  context.fillStyle = "#4a453f";
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 10; column += 1) {
      context.fillRect(10 + column * 24, 12 + row * 26, 18, 16);
    }
  }
  return makeTexture(canvas);
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

export function studio(materials) {
  const group = stage(materials, materials.woodTop, 3.15, "STUDIO");
  const deskTop = SURFACE + 0.66;

  group.add(mesh(rounded(2.05, 0.08, 1.05, 0.04, 3), materials.wood, 0, deskTop - 0.04, -0.08));
  const leg = new THREE.CylinderGeometry(0.035, 0.04, 0.58, 8);
  [
    [-0.9, -0.48],
    [0.9, -0.48],
    [-0.9, 0.32],
    [0.9, 0.32],
  ].forEach(([x, z]) => {
    group.add(mesh(leg, materials.woodDark, x, SURFACE + 0.29, z));
  });

  const bezel = mesh(rounded(0.78, 0.5, 0.06, 0.03, 3), materials.ink, 0, deskTop + 0.42, -0.42);
  group.add(bezel);
  const screenMap = screenTexture();
  const screenMaterial = new THREE.MeshStandardMaterial({
    map: screenMap,
    emissive: 0x0e2a22,
    emissiveMap: screenMap,
    emissiveIntensity: 0.45,
    roughness: 0.55,
  });
  const screen = mesh(new THREE.PlaneGeometry(0.68, 0.4), screenMaterial, 0, deskTop + 0.42, -0.385, {
    shadow: false,
  });
  group.add(screen);
  group.add(mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.16, 10), materials.metal, 0, deskTop + 0.1, -0.42));
  group.add(mesh(rounded(0.22, 0.03, 0.1, 0.015), materials.metal, 0, deskTop + 0.02, -0.42));

  const keys = mesh(rounded(0.62, 0.045, 0.22, 0.02), materials.ink, 0.08, deskTop + 0.025, 0.18);
  const keyFace = mesh(new THREE.PlaneGeometry(0.58, 0.18), new THREE.MeshBasicMaterial({ map: keyTexture() }), 0.08, deskTop + 0.05, 0.18, {
    shadow: false,
  });
  keyFace.rotation.x = -Math.PI / 2;
  group.add(keys, keyFace);
  group.add(mesh(rounded(0.09, 0.035, 0.13, 0.02), materials.ink, 0.55, deskTop + 0.02, 0.22));

  const mugX = -0.48;
  const mugZ = 0.12;
  group.add(mesh(new THREE.CylinderGeometry(0.075, 0.068, 0.16, 16), materials.clay, mugX, deskTop + 0.08, mugZ));
  const coffee = mesh(new THREE.CircleGeometry(0.062, 16), materials.coffee, mugX, deskTop + 0.155, mugZ, {
    shadow: false,
  });
  coffee.rotation.x = -Math.PI / 2;
  group.add(coffee);
  const handle = mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 14, Math.PI), materials.clay, mugX + 0.08, deskTop + 0.08, mugZ);
  handle.rotation.y = Math.PI / 2;
  group.add(handle);

  const puffs = [0, 1, 2].map((index) => {
    const material = materials.steam.clone();
    const puff = mesh(new THREE.SphereGeometry(0.028, 8, 6), material, mugX, deskTop + 0.24, mugZ, {
      shadow: false,
    });
    puff.userData.phase = index * 0.37;
    group.add(puff);
    return puff;
  });

  group.add(mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.14, 14), materials.pot, -0.78, deskTop + 0.07, -0.22));
  const soil = mesh(new THREE.CircleGeometry(0.09, 14), materials.soil, -0.78, deskTop + 0.145, -0.22, {
    shadow: false,
  });
  soil.rotation.x = -Math.PI / 2;
  group.add(soil);
  group.add(mesh(new THREE.SphereGeometry(0.13, 12, 10), materials.leaf, -0.78, deskTop + 0.28, -0.22));
  group.add(mesh(new THREE.SphereGeometry(0.09, 10, 8), materials.leafDark, -0.66, deskTop + 0.34, -0.16));
  group.add(mesh(new THREE.SphereGeometry(0.08, 10, 8), materials.leaf, -0.9, deskTop + 0.32, -0.28));

  group.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 16), materials.brass, 0.72, deskTop + 0.02, -0.28));
  group.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 8), materials.brass, 0.72, deskTop + 0.24, -0.28));
  const shade = mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.14, 16, 1, true), materials.shade, 0.72, deskTop + 0.5, -0.28);
  group.add(shade);
  const bulb = mesh(new THREE.SphereGeometry(0.04, 10, 8), materials.bulb, 0.72, deskTop + 0.46, -0.28, {
    shadow: false,
  });
  group.add(bulb);
  const lampLight = new THREE.PointLight(0xffc98a, 1.4, 3.4, 2);
  lampLight.position.set(0.72, deskTop + 0.42, -0.18);
  group.add(lampLight);

  const seatY = SURFACE + 0.4;
  group.add(mesh(rounded(0.48, 0.06, 0.46, 0.04), materials.leather, 0.02, seatY, 0.95));
  group.add(mesh(rounded(0.48, 0.46, 0.06, 0.04), materials.leather, 0.02, seatY + 0.28, 1.16));
  const chairLeg = new THREE.CylinderGeometry(0.025, 0.03, 0.38, 6);
  [
    [-0.16, 0.78],
    [0.2, 0.78],
    [-0.16, 1.1],
    [0.2, 1.1],
  ].forEach(([x, z]) => {
    group.add(mesh(chairLeg, materials.woodDark, x, SURFACE + 0.19, z));
  });

  const rug = mesh(new THREE.CircleGeometry(0.72, 28), materials.rug, 0.02, SURFACE + 0.012, 0.95, {
    shadow: false,
  });
  rug.rotation.x = -Math.PI / 2;
  rug.receiveShadow = true;
  group.add(rug);

  group.userData.tick = ({ t, reduce }) => {
    if (reduce) return;
    puffs.forEach((puff) => {
      const cycle = (t * 0.35 + puff.userData.phase) % 1;
      puff.position.y = deskTop + 0.2 + cycle * 0.45;
      puff.position.x = mugX + Math.sin(t * 1.5 + puff.userData.phase) * 0.02;
      puff.scale.setScalar(0.7 + cycle * 0.8);
      puff.material.opacity = 0.45 * (1 - cycle);
    });
  };

  return group;
}
