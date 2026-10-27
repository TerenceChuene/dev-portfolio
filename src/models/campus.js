import * as THREE from "three";
import { bench, building, makeTexture, mesh, stage, SURFACE, tree } from "./kit.js";

function logoTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, 128, 128);
  context.fillStyle = "#1f6b4a";
  context.beginPath();
  context.arc(64, 64, 54, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#f6f1e7";
  context.font = "600 54px Fraunces, Georgia, serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("N", 64, 70);
  return makeTexture(canvas);
}

export function campus(materials) {
  const group = stage(materials, materials.campusGround, 3.35, "CAMPUS");

  const tower = { w: 0.9, h: 2.05, d: 0.9, color: "#f7f4ee", x: 0, z: -0.72 };
  building(group, tower);
  building(group, { w: 1.2, h: 0.78, d: 0.85, color: "#e7efe8", x: -1.28, z: -0.12 });
  building(group, { w: 1.05, h: 0.96, d: 0.8, color: "#f0e4d4", x: 1.32, z: -0.02 });

  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.32),
    new THREE.MeshBasicMaterial({ map: logoTexture(), transparent: true, depthWrite: false }),
  );
  logo.position.set(0, SURFACE + 1.45, tower.z + tower.d / 2 + 0.02);
  logo.userData.noShadow = true;
  group.add(logo);

  const pole = mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.55, 6),
    materials.metal,
    0,
    SURFACE + tower.h + 0.28,
    tower.z,
  );
  group.add(pole);
  const hinge = new THREE.Group();
  hinge.position.set(0.02, SURFACE + tower.h + 0.48, tower.z);
  const flag = mesh(new THREE.PlaneGeometry(0.36, 0.2), materials.flag, 0.18, 0, 0, { shadow: false });
  hinge.add(flag);
  group.add(hinge);

  const path = mesh(new THREE.BoxGeometry(0.38, 0.03, 1.35), materials.road, 0, SURFACE + 0.02, 0.55, {
    shadow: false,
  });
  path.receiveShadow = true;
  group.add(path);

  group.add(tree(materials, 0.05, 1.15, 1.15));
  group.add(tree(materials, -1.75, 0.95, 0.72));
  group.add(tree(materials, 1.8, 1.05, 0.78));
  group.add(bench(materials, -0.7, 0.85, 0.4));
  group.add(bench(materials, 0.75, 0.9, -0.4));

  [-1.15, -0.55, 0.55, 1.15].forEach((x) => {
    group.add(mesh(new THREE.SphereGeometry(0.1, 10, 8), materials.leafDark, x, SURFACE + 0.1, 1.55));
  });

  group.userData.tick = ({ t, reduce }) => {
    hinge.rotation.y = reduce ? 0.15 : Math.sin(t * 1.6) * 0.35;
  };

  return group;
}
