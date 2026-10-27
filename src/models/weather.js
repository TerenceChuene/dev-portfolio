import * as THREE from "three";
import { bench, building, mesh, stage, SURFACE, tree } from "./kit.js";

function cloudCluster(material, x, y, z, scale) {
  const cluster = new THREE.Group();
  const puffs = [
    [0, 0, 0, 0.28],
    [0.24, 0.04, 0.02, 0.2],
    [-0.22, 0.02, 0.04, 0.18],
    [0.06, 0.12, -0.04, 0.16],
  ];
  puffs.forEach(([px, py, pz, radius]) => {
    const puff = mesh(new THREE.SphereGeometry(radius, 12, 10), material, px, py, pz, { shadow: false });
    cluster.add(puff);
  });
  cluster.position.set(x, y, z);
  cluster.scale.setScalar(scale);
  return cluster;
}

export function weather(materials) {
  const group = stage(materials, materials.grass, 3.25, "WEATHER");

  const blocks = [
    { w: 0.74, h: 1.45, d: 0.74, color: "#f4efe4", x: -1.05, z: -0.7 },
    { w: 0.68, h: 1.95, d: 0.68, color: "#e7d3bc", x: 0.05, z: -0.85 },
    { w: 0.72, h: 1.1, d: 0.64, color: "#d9896a", x: 1.05, z: -0.35 },
    { w: 0.86, h: 0.82, d: 0.7, color: "#f7f4ee", x: -1.2, z: 0.45 },
    { w: 0.78, h: 1.2, d: 0.68, color: "#d7e0d4", x: 0.15, z: 0.25 },
    { w: 0.56, h: 0.7, d: 0.56, color: "#efe2cf", x: 1.2, z: 0.7 },
  ];
  blocks.forEach((block) => building(group, block));

  const tall = blocks[1];
  group.add(
    mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.32, 6),
      materials.metal,
      tall.x,
      SURFACE + tall.h + 0.2,
      tall.z,
    ),
  );

  const pond = mesh(new THREE.CircleGeometry(0.62, 28), materials.water, -0.15, SURFACE + 0.02, 1.2, {
    shadow: false,
  });
  pond.rotation.x = -Math.PI / 2;
  pond.receiveShadow = true;
  group.add(pond);
  [0.2, 1.2, 2.4].forEach((angle) => {
    const pad = mesh(
      new THREE.CircleGeometry(0.08, 12),
      materials.leaf,
      -0.15 + Math.cos(angle) * 0.28,
      SURFACE + 0.03,
      1.2 + Math.sin(angle) * 0.22,
      { shadow: false },
    );
    pad.rotation.x = -Math.PI / 2;
    group.add(pad);
  });

  const path = mesh(new THREE.BoxGeometry(0.32, 0.03, 1.15), materials.road, 0.35, SURFACE + 0.02, 0.85, {
    shadow: false,
  });
  path.receiveShadow = true;
  group.add(path);
  group.add(tree(materials, 1.35, 1.35, 0.95));
  group.add(tree(materials, -1.45, 1.2, 0.8));
  group.add(tree(materials, 1.45, -1.35, 0.7));
  group.add(bench(materials, -0.95, 1.15, 0.6));

  const clouds = new THREE.Group();
  clouds.add(cloudCluster(materials.cloud, -0.8, 2.85, -0.4, 1));
  clouds.add(cloudCluster(materials.cloud, 1.1, 3.05, 0.3, 0.8));
  clouds.add(cloudCluster(materials.cloud, 0.1, 2.7, 1.1, 0.55));
  group.add(clouds);

  const sun = mesh(new THREE.SphereGeometry(0.22, 18, 14), materials.sun, -1.7, 2.55, -1.55, {
    shadow: false,
  });
  group.add(sun);

  group.userData.tick = ({ t, reduce }) => {
    if (reduce) return;
    clouds.position.x = Math.sin(t * 0.22) * 0.18;
    clouds.position.z = Math.cos(t * 0.16) * 0.08;
    sun.position.y = 2.55 + Math.sin(t * 0.4) * 0.05;
  };

  return group;
}
