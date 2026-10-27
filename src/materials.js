import * as THREE from "three";

function standard(color, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.74,
    metalness: 0.03,
    ...extras,
  });
}

function decal(material) {
  material.polygonOffset = true;
  material.polygonOffsetFactor = -2;
  material.polygonOffsetUnits = -2;
  return material;
}

export function createMaterials() {
  return {
    stone: standard(0xd9cfc2, { roughness: 0.9 }),
    woodTop: standard(0xe4c396, { roughness: 0.62 }),
    wood: standard(0xc48a55, { roughness: 0.58 }),
    woodDark: standard(0x8d5b34, { roughness: 0.66 }),
    grass: standard(0x8aaa72, { roughness: 0.94 }),
    plaster: standard(0xefe2d4, { roughness: 0.92 }),
    track: standard(0xd9c7a8, { roughness: 0.88 }),
    campusGround: standard(0xd5ddd4, { roughness: 0.92 }),
    sand: standard(0xe7d7c3, { roughness: 0.92 }),
    clay: standard(0xf4f0e8, { roughness: 0.82 }),
    leaf: standard(0x3f7d49, { roughness: 0.88 }),
    leafDark: standard(0x2c6840, { roughness: 0.9 }),
    pot: standard(0xc4623a, { roughness: 0.72 }),
    soil: standard(0x6b4a32, { roughness: 0.96 }),
    brass: standard(0xd2a15e, { roughness: 0.32, metalness: 0.84 }),
    metal: standard(0x8e98a3, { roughness: 0.34, metalness: 0.74 }),
    ink: standard(0x1c1915, { roughness: 0.52 }),
    leather: standard(0x7c3f36, { roughness: 0.64 }),
    coffee: standard(0x3b2419, { roughness: 0.42 }),
    shade: standard(0xf6e2b8, {
      emissive: 0xffb25a,
      emissiveIntensity: 0.5,
      roughness: 0.42,
      side: THREE.DoubleSide,
    }),
    water: decal(standard(0x7eb0c2, { roughness: 0.16, metalness: 0.14 })),
    road: decal(standard(0x5e5954, { roughness: 0.94 })),
    rug: decal(standard(0x9c3f45, { roughness: 0.86 })),
    field: decal(standard(0x3e8d4c, { roughness: 0.92 })),
    line: decal(new THREE.MeshBasicMaterial({ color: 0xf4f7f2 })),
    seat: standard(0xc4623a, { roughness: 0.8 }),
    seatAlt: standard(0xf3eadc, { roughness: 0.82 }),
    skin: standard(0xf0c7a8, { roughness: 0.58 }),
    shirt: standard(0x1f6b4a, { roughness: 0.74 }),
    pants: standard(0x3d4a5c, { roughness: 0.76 }),
    hair: standard(0x2a2420, { roughness: 0.82 }),
    mail: standard(0xc2453a, { roughness: 0.56 }),
    mailDark: standard(0x8e2f2c, { roughness: 0.6 }),
    envelope: standard(0xf7f3ea, { roughness: 0.76 }),
    flower: standard(0xe15b4c, { roughness: 0.58 }),
    bulb: standard(0xfff4d2, {
      emissive: 0xffe1a0,
      emissiveIntensity: 0.85,
      roughness: 0.32,
    }),
    sun: new THREE.MeshBasicMaterial({ color: 0xffd56a }),
    cloud: standard(0xf7f5f0, { roughness: 1, metalness: 0 }),
    steam: new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    }),
    glint: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    flag: standard(0x1f6b4a, { roughness: 0.7, side: THREE.DoubleSide }),
  };
}

export function tint(material, color) {
  const next = material.clone();
  next.color = new THREE.Color(color);
  return next;
}
