import * as THREE from "three";
import { mesh, rounded, stage, SURFACE } from "./kit.js";
import { tint } from "../materials.js";

export function letterbox(materials) {
  const group = stage(materials, materials.sand, 2.55, "POST");

  group.add(mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.7, 10), materials.woodDark, 0, SURFACE + 0.35, 0));

  const boxY = SURFACE + 0.86;
  group.add(mesh(rounded(0.62, 0.4, 0.42, 0.08, 3), materials.mail, 0, boxY, 0));
  const dome = mesh(
    new THREE.SphereGeometry(0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    materials.mail,
    0,
    boxY + 0.18,
    0,
  );
  group.add(dome);
  group.add(mesh(rounded(0.28, 0.045, 0.02, 0.01), materials.ink, 0, boxY + 0.02, 0.22));

  const hinge = new THREE.Group();
  hinge.position.set(0.32, boxY + 0.12, 0);
  const flag = mesh(rounded(0.28, 0.12, 0.025, 0.02), tint(materials.clay, "#f4efe6"), 0.14, 0, 0);
  hinge.add(flag);
  hinge.rotation.z = -0.8;
  group.add(hinge);

  const envelope = mesh(rounded(0.34, 0.22, 0.025, 0.02), materials.envelope, 0.32, SURFACE + 0.16, 0.48);
  envelope.rotation.x = -0.4;
  envelope.rotation.z = 0.08;
  group.add(envelope);

  const parcel = mesh(rounded(0.32, 0.22, 0.28, 0.04), materials.shirt, -0.55, SURFACE + 0.12, 0.25);
  group.add(parcel);
  group.add(mesh(rounded(0.34, 0.05, 0.3, 0.01), materials.mail, -0.55, SURFACE + 0.2, 0.25));

  group.add(mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.28, 6), materials.leafDark, 0.85, SURFACE + 0.16, -0.15));
  group.add(mesh(new THREE.SphereGeometry(0.09, 10, 8), materials.flower, 0.85, SURFACE + 0.34, -0.15));
  group.add(mesh(new THREE.SphereGeometry(0.06, 8, 6), materials.leaf, 0.78, SURFACE + 0.22, -0.08, { shadow: false }));

  group.userData.tick = ({ t, reduce }) => {
    hinge.rotation.z = reduce ? -0.8 : -0.72 + Math.sin(t * 1.4) * 0.12;
  };

  return group;
}
