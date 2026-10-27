import * as THREE from "three";
import { makeTexture, mesh, rounded, stage, SURFACE } from "./kit.js";
import { tint } from "../materials.js";

const CROWD = ["#1c1915", "#f4efe6", "#1f6b4a", "#c4623a", "#3d4a5c", "#e6c15a"];

function scoreTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  context.fillStyle = "#14261f";
  context.fillRect(0, 0, 256, 96);
  context.fillStyle = "#f6f1e7";
  context.font = "600 46px Outfit, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("2  –  1", 128, 52);
  return makeTexture(canvas);
}

function goal(materials, z) {
  const group = new THREE.Group();
  const height = 0.42;
  const spread = 0.62;
  const post = new THREE.CylinderGeometry(0.015, 0.015, height, 6);
  group.add(mesh(post, materials.metal, -spread, SURFACE + height / 2, z));
  group.add(mesh(post, materials.metal, spread, SURFACE + height / 2, z));
  const bar = mesh(new THREE.CylinderGeometry(0.012, 0.012, spread * 2, 6), materials.metal, 0, SURFACE + height, z);
  bar.rotation.z = Math.PI / 2;
  group.add(bar);
  return group;
}

export function stadium(materials) {
  const group = stage(materials, materials.track, 3.45, "STADIUM");

  const field = mesh(new THREE.CircleGeometry(1.42, 48), materials.field, 0, SURFACE + 0.025, 0, {
    shadow: false,
  });
  field.rotation.x = -Math.PI / 2;
  field.scale.set(1.38, 1.05, 1);
  field.receiveShadow = true;
  group.add(field);

  const center = mesh(new THREE.RingGeometry(0.28, 0.32, 32), materials.line, 0, SURFACE + 0.03, 0, {
    shadow: false,
  });
  center.rotation.x = -Math.PI / 2;
  group.add(center);
  const spot = mesh(new THREE.CircleGeometry(0.06, 16), materials.line, 0, SURFACE + 0.032, 0, {
    shadow: false,
  });
  spot.rotation.x = -Math.PI / 2;
  group.add(spot);
  const halfway = mesh(new THREE.BoxGeometry(2.7, 0.008, 0.035), materials.line, 0, SURFACE + 0.03, 0, {
    shadow: false,
  });
  group.add(halfway);

  group.add(goal(materials, 1.15));
  group.add(goal(materials, -1.15));

  for (let ring = 0; ring < 2; ring += 1) {
    const count = 22;
    const radiusX = 2.25 + ring * 0.48;
    const radiusZ = 1.78 + ring * 0.38;
    const height = 0.34 + ring * 0.28;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const cx = Math.cos(angle);
      const sz = Math.sin(angle);
      if (ring === 0 && sz > 0.78 && Math.abs(cx) < 0.38) continue;
      const material = (index + ring) % 2 === 0 ? materials.seat : materials.seatAlt;
      const stand = mesh(rounded(0.36, height, 0.4, 0.05), material, cx * radiusX, SURFACE + height / 2, sz * radiusZ);
      stand.lookAt(0, stand.position.y, 0);
      group.add(stand);
    }
  }

  const crowdMaterials = CROWD.map((color) => tint(materials.clay, color));
  for (let index = 0; index < 18; index += 1) {
    const angle = (index / 18) * Math.PI * 2 + 0.2;
    const cx = Math.cos(angle);
    const sz = Math.sin(angle);
    if (sz > 0.72 && Math.abs(cx) < 0.45) continue;
    const head = mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      crowdMaterials[index % crowdMaterials.length],
      cx * 2.05,
      SURFACE + 0.48,
      sz * 1.62,
      { shadow: false },
    );
    group.add(head);
  }

  const lights = [
    [-2.55, -1.55],
    [2.55, -1.55],
    [-2.55, 1.35],
    [2.55, 1.35],
  ];
  const bulbMaterial = materials.bulb.clone();
  lights.forEach(([x, z]) => {
    group.add(mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.15, 8), materials.metal, x, SURFACE + 0.58, z));
    const head = mesh(rounded(0.28, 0.08, 0.16, 0.03), materials.ink, x, SURFACE + 1.2, z);
    head.lookAt(0, SURFACE + 0.4, 0);
    group.add(head);
    group.add(mesh(rounded(0.18, 0.04, 0.1, 0.015), bulbMaterial, x, SURFACE + 1.16, z, { shadow: false }));
    const light = new THREE.PointLight(0xfff1cc, 0.7, 4.5, 2);
    light.position.set(x, SURFACE + 1.05, z);
    group.add(light);
  });

  const board = mesh(rounded(1.05, 0.42, 0.08, 0.04), materials.ink, 0, SURFACE + 1.35, -2.15);
  group.add(board);
  const scoreMaterial = new THREE.MeshBasicMaterial({ map: scoreTexture() });
  const boardScreen = mesh(new THREE.PlaneGeometry(0.86, 0.26), scoreMaterial, 0, SURFACE + 1.35, -2.1, {
    shadow: false,
  });
  group.add(boardScreen);
  group.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), materials.metal, -0.35, SURFACE + 0.85, -2.15));
  group.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), materials.metal, 0.35, SURFACE + 0.85, -2.15));

  group.userData.tick = ({ t, reduce }) => {
    bulbMaterial.emissiveIntensity = reduce ? 0.7 : 0.65 + Math.sin(t * 2.2) * 0.15;
  };

  return group;
}
