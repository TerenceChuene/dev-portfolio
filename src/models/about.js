import * as THREE from "three";
import { makeTexture, mesh, rounded, stage, SURFACE } from "./kit.js";

const BOOK_COLORS = ["#1f6b4a", "#c4623a", "#3d4a5c", "#e6c15a", "#f4efe6", "#8d5b34", "#9c3f45"];

function globeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.fillStyle = "#d5ebe3";
  context.fillRect(0, 0, 256, 128);
  context.fillStyle = "#6f9a62";
  context.beginPath();
  context.ellipse(78, 70, 30, 18, 0.4, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(150, 52, 38, 16, -0.4, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(196, 84, 18, 22, 0.2, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(28, 25, 21, 0.18)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, 64);
  context.lineTo(256, 64);
  context.stroke();
  context.beginPath();
  context.moveTo(128, 8);
  context.lineTo(128, 120);
  context.stroke();
  return makeTexture(canvas);
}

function chipTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.fillStyle = "#f7f3ea";
  roundRect(context, 8, 16, 240, 96, 48);
  context.fill();
  context.strokeStyle = "#1c1915";
  context.lineWidth = 6;
  roundRect(context, 8, 16, 240, 96, 48);
  context.stroke();
  context.fillStyle = "#1c1915";
  context.font = "600 64px Outfit, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 128, 68);
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

function figure(materials) {
  const person = new THREE.Group();
  const legGeo = new THREE.CapsuleGeometry(0.07, 0.2, 4, 8);
  person.add(mesh(legGeo, materials.pants, -0.11, 0.2, 0));
  person.add(mesh(legGeo, materials.pants, 0.11, 0.2, 0));
  person.add(mesh(new THREE.SphereGeometry(0.075, 10, 8), materials.ink, -0.11, 0.05, 0.04));
  person.add(mesh(new THREE.SphereGeometry(0.075, 10, 8), materials.ink, 0.11, 0.05, 0.04));
  person.add(mesh(rounded(0.44, 0.3, 0.26, 0.1, 3), materials.pants, 0, 0.48, 0));
  person.add(mesh(rounded(0.5, 0.46, 0.28, 0.12, 3), materials.shirt, 0, 0.84, 0));
  person.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.08, 10), materials.skin, 0, 1.08, 0));
  person.add(mesh(new THREE.SphereGeometry(0.2, 20, 16), materials.skin, 0, 1.26, 0));

  const hair = mesh(new THREE.SphereGeometry(0.19, 20, 16), materials.hair, 0, 1.4, -0.05);
  hair.scale.set(1.08, 0.5, 0.82);
  person.add(hair);

  const sclera = new THREE.MeshBasicMaterial({ color: 0xfff8f2 });
  [-1, 1].forEach((side) => {
    person.add(mesh(new THREE.SphereGeometry(0.042, 10, 8), sclera, side * 0.075, 1.29, 0.15, { shadow: false }));
    person.add(mesh(new THREE.SphereGeometry(0.02, 8, 8), materials.ink, side * 0.078, 1.29, 0.185, { shadow: false }));
  });

  const armGeo = new THREE.CapsuleGeometry(0.05, 0.18, 4, 8);
  const armL = new THREE.Group();
  armL.position.set(-0.3, 1.0, 0);
  armL.rotation.z = 0.18;
  const armLMesh = mesh(armGeo, materials.shirt, 0, -0.16, 0);
  armLMesh.add(mesh(new THREE.SphereGeometry(0.05, 10, 8), materials.skin, 0, -0.16, 0));
  armL.add(armLMesh);

  const armR = new THREE.Group();
  armR.position.set(0.3, 1.02, 0.02);
  armR.rotation.z = -1.65;
  armR.rotation.x = -0.15;
  const armRMesh = mesh(armGeo, materials.shirt, 0, -0.16, 0);
  armRMesh.add(mesh(new THREE.SphereGeometry(0.05, 10, 8), materials.skin, 0, -0.16, 0.02));
  armR.add(armRMesh);
  person.add(armL, armR);
  return person;
}

export function about(materials) {
  const group = stage(materials, materials.plaster, 3.15, "ABOUT");

  const back = mesh(rounded(1.85, 1.45, 0.08, 0.04, 3), materials.woodDark, -0.15, SURFACE + 0.9, -1.22);
  group.add(back);

  BOOK_COLORS.forEach((color, index) => {
    const shelf = index < 4 ? 0 : 1;
    const slot = index % 4;
    if (index > 7) return;
    const width = 0.1 + (index % 2) * 0.03;
    const height = 0.28 + (index % 3) * 0.05;
    const y = SURFACE + 0.42 + shelf * 0.48;
    const x = -0.78 + slot * 0.32;
    const book = mesh(rounded(width, height, 0.2, 0.015), materials.clay.clone(), x, y + height / 2, -1.12);
    book.material.color.set(color);
    group.add(book);
  });

  [0, 1].forEach((shelf) => {
    group.add(
      mesh(
        rounded(1.7, 0.05, 0.28, 0.015),
        materials.wood,
        -0.15,
        SURFACE + 0.38 + shelf * 0.48,
        -1.14,
      ),
    );
  });

  const rug = mesh(new THREE.CircleGeometry(0.7, 24), materials.rug, -0.25, SURFACE + 0.012, 0.35, {
    shadow: false,
  });
  rug.rotation.x = -Math.PI / 2;
  rug.receiveShadow = true;
  group.add(rug);

  const person = figure(materials);
  person.position.set(-0.25, SURFACE, 0.32);
  group.add(person);

  const globeMaterial = new THREE.MeshStandardMaterial({
    map: globeTexture(),
    roughness: 0.55,
    metalness: 0.05,
  });
  const globe = mesh(new THREE.SphereGeometry(0.24, 28, 18), globeMaterial, 1.05, SURFACE + 0.78, 0.15);
  group.add(globe);
  group.add(mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.42, 10), materials.brass, 1.05, SURFACE + 0.28, 0.15));
  group.add(mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.06, 16), materials.brass, 1.05, SURFACE + 0.05, 0.15));
  const meridian = mesh(new THREE.TorusGeometry(0.27, 0.012, 8, 28), materials.brass, 1.05, SURFACE + 0.78, 0.15);
  meridian.rotation.y = 0.6;
  group.add(meridian);

  group.add(mesh(new THREE.CylinderGeometry(0.1, 0.085, 0.13, 12), materials.pot, 1.15, SURFACE + 0.08, -0.95));
  group.add(mesh(new THREE.SphereGeometry(0.16, 12, 10), materials.leaf, 1.15, SURFACE + 0.28, -0.95));

  const chips = ["3D", "Web", "UI"].map((label) => {
    const material = new THREE.MeshBasicMaterial({
      map: chipTexture(label),
      transparent: true,
      depthWrite: false,
    });
    const chip = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.36), material);
    chip.userData.noShadow = true;
    group.add(chip);
    return chip;
  });

  group.userData.tick = ({ t, camera, reduce }) => {
    person.position.y = SURFACE + (reduce ? 0 : Math.sin(t * 1.6) * 0.012);
    person.rotation.y = reduce ? 0.15 : 0.15 + Math.sin(t * 0.7) * 0.18;
    globe.rotation.y = reduce ? 0.4 : t * 0.25;
    const spots = [
      [-0.75, 2.15, -0.2],
      [0.1, 2.38, -0.45],
      [0.85, 2.12, 0.15],
    ];
    chips.forEach((chip, index) => {
      const [x, y, z] = spots[index];
      const bob = reduce ? 0 : Math.sin(t * 1.3 + index) * 0.04;
      chip.position.set(x, y + bob, z);
      chip.lookAt(camera.position);
    });
  };

  return group;
}
