import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const SURFACE = 0.47;

export function makeTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function rounded(width, height, depth, radius = 0.08, segments = 2) {
  const limit = Math.min(width, height, depth) * 0.5 - 0.001;
  const safeRadius = THREE.MathUtils.clamp(radius, 0.001, Math.max(0.001, limit));
  return new RoundedBoxGeometry(width, height, depth, segments, safeRadius);
}

export function mesh(geometry, material, x = 0, y = 0, z = 0, { shadow = true } = {}) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(x, y, z);
  item.castShadow = shadow;
  item.receiveShadow = shadow;
  if (!shadow) item.userData.noShadow = true;
  return item;
}

let shadowMaterial;

function sharedShadowMaterial() {
  if (shadowMaterial) return shadowMaterial;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 128, 16, 128, 128, 124);
  gradient.addColorStop(0, "rgba(72, 48, 28, 0.42)");
  gradient.addColorStop(0.55, "rgba(72, 48, 28, 0.16)");
  gradient.addColorStop(1, "rgba(72, 48, 28, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  shadowMaterial = new THREE.MeshBasicMaterial({
    map: makeTexture(canvas),
    transparent: true,
    depthWrite: false,
  });
  return shadowMaterial;
}

export function plinth(materials, topMaterial, radius) {
  const group = new THREE.Group();
  group.add(
    mesh(
      new THREE.CylinderGeometry(radius + 0.12, radius + 0.3, 0.32, 48),
      materials.stone,
      0,
      0.22,
      0,
    ),
  );
  group.add(
    mesh(new THREE.CylinderGeometry(radius, radius, 0.12, 48), topMaterial, 0, 0.41, 0),
  );

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), sharedShadowMaterial());
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  shadow.scale.set(radius * 2.15, radius * 2.15, 1);
  shadow.receiveShadow = false;
  shadow.castShadow = false;
  shadow.userData.noShadow = true;
  group.add(shadow);
  return group;
}

let plateMaterial;

function plateMaterialOnce() {
  if (!plateMaterial) {
    plateMaterial = new THREE.MeshStandardMaterial({ color: 0x1c1915, roughness: 0.5 });
  }
  return plateMaterial;
}

export function nameplate(text, radius) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#f6f1e7";
  context.font = "600 72px Fraunces, Georgia, serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 256, 68);

  const labelMaterial = new THREE.MeshBasicMaterial({
    map: makeTexture(canvas),
    transparent: true,
    depthWrite: false,
  });
  const board = mesh(rounded(1.15, 0.28, 0.06, 0.05), plateMaterialOnce(), 0, 0.24, radius + 0.22);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.2), labelMaterial);
  label.position.set(0, 0.24, radius + 0.26);
  label.userData.noShadow = true;
  const group = new THREE.Group();
  group.add(board, label);
  return group;
}

export function stage(materials, topMaterial, radius, label) {
  const group = new THREE.Group();
  group.add(plinth(materials, topMaterial, radius));
  group.add(nameplate(label, radius));
  return group;
}

const facadeCache = new Map();

function facadeMaterial(color, columns, rows) {
  const key = `${color}:${columns}:${rows}`;
  const cached = facadeCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  context.fillStyle = color;
  context.fillRect(0, 0, 160, 160);

  const padX = 16;
  const padY = 16;
  const gapX = 8;
  const gapY = 10;
  const cellW = (160 - padX * 2 - gapX * (columns - 1)) / columns;
  const cellH = (160 - padY * 2 - gapY * (rows - 1)) / rows;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const lit = (x * 5 + y * 3) % 7 === 0;
      context.fillStyle = lit ? "#f0d7a6" : "#c5e0d6";
      const px = padX + x * (cellW + gapX);
      const py = padY + y * (cellH + gapY);
      context.fillRect(px, py, cellW, cellH);
    }
  }

  const material = new THREE.MeshStandardMaterial({
    map: makeTexture(canvas),
    roughness: 0.86,
    metalness: 0.02,
  });
  facadeCache.set(key, material);
  return material;
}

let roofMaterial;

function sharedRoofMaterial() {
  if (!roofMaterial) {
    roofMaterial = new THREE.MeshStandardMaterial({ color: 0x6d6158, roughness: 0.84 });
  }
  return roofMaterial;
}

export function building(parent, { w, h, d, color, x, z }) {
  const columns = Math.max(2, Math.round(w / 0.32));
  const rows = Math.max(2, Math.round(h / 0.34));
  const body = mesh(
    rounded(w, h, d, Math.min(0.08, w, h, d) * 0.16, 3),
    facadeMaterial(color, columns, rows),
    x,
    SURFACE + h / 2,
    z,
  );
  const roof = mesh(
    rounded(w + 0.08, 0.08, d + 0.08, 0.03),
    sharedRoofMaterial(),
    x,
    SURFACE + h + 0.045,
    z,
  );
  parent.add(body, roof);
  return body;
}

export function tree(materials, x, z, scale = 1) {
  const group = new THREE.Group();
  group.add(
    mesh(
      new THREE.CylinderGeometry(0.045 * scale, 0.07 * scale, 0.36 * scale, 7),
      materials.woodDark,
      0,
      SURFACE + 0.18 * scale,
      0,
    ),
  );
  const crown = mesh(
    new THREE.SphereGeometry(0.28 * scale, 14, 12),
    materials.leaf,
    0,
    SURFACE + 0.5 * scale,
    0,
  );
  crown.scale.y = 0.82;
  const side = mesh(
    new THREE.SphereGeometry(0.18 * scale, 12, 10),
    materials.leafDark,
    0.14 * scale,
    SURFACE + 0.42 * scale,
    0.05 * scale,
  );
  group.add(crown, side);
  group.position.set(x, 0, z);
  return group;
}

export function bench(materials, x, z, rotationY = 0) {
  const group = new THREE.Group();
  group.add(mesh(rounded(0.52, 0.05, 0.18, 0.02), materials.wood, 0, SURFACE + 0.28, 0));
  group.add(mesh(rounded(0.52, 0.3, 0.045, 0.02), materials.wood, 0, SURFACE + 0.44, -0.08));
  group.add(
    mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.28, 6), materials.woodDark, -0.18, SURFACE + 0.14, 0.05),
  );
  group.add(
    mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.28, 6), materials.woodDark, 0.18, SURFACE + 0.14, 0.05),
  );
  group.position.set(x, 0, z);
  group.rotation.y = rotationY;
  return group;
}
