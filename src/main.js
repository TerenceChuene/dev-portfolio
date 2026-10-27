import * as THREE from "three";
import { scenes, SPACING } from "./content.js";
import { createMaterials } from "./materials.js";
import { builders } from "./models/index.js";
import "./style.css";

const panel = document.querySelector("#panel");
const indexEl = document.querySelector("#index");
const kickerEl = document.querySelector("#kicker");
const titleEl = document.querySelector("#title");
const bodyEl = document.querySelector("#body");
const pointsEl = document.querySelector("#points");
const actionsEl = document.querySelector("#actions");
const rail = document.querySelector("#rail");
const canvas = document.querySelector("#view");

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const railButtons = [];
let target = 0;
let current = 0;
let shown = 0;
let fadeToken = 0;
let theta = 0.62;
let phi = 1.06;
let dragging = false;
let lastX = 0;
let lastY = 0;
let dragX = 0;
let dragY = 0;
const pointer = { x: 0.5, y: 0.5 };
const coarse = window.matchMedia("(pointer: coarse)").matches;

const focus = new THREE.Vector3();
const look = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3();
const background = new THREE.Color();

function clampIndex(index) {
  return Math.max(0, Math.min(scenes.length - 1, index));
}

function renderCopy(index) {
  const scene = scenes[index];
  indexEl.textContent = `${scene.indexLabel}  /  ${String(scenes.length).padStart(2, "0")}`;
  kickerEl.textContent = scene.kicker;
  titleEl.replaceChildren();
  scene.title.forEach((line, lineIndex) => {
    if (lineIndex) titleEl.append(document.createElement("br"));
    titleEl.append(document.createTextNode(line));
  });
  bodyEl.textContent = scene.body;
  pointsEl.replaceChildren();
  scene.points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    pointsEl.append(item);
  });
  actionsEl.replaceChildren();
  const primary = document.createElement(scene.action.type === "mail" ? "a" : "button");
  primary.className = "primary";
  primary.textContent = scene.action.label;
  if (scene.action.type === "mail") {
    primary.href = scene.action.href;
  } else if (scene.action.type === "go") {
    primary.addEventListener("click", () => go(scene.action.index));
  } else {
    primary.type = "button";
    primary.addEventListener("click", () => go(target + 1));
  }
  actionsEl.append(primary);
  document.title = `${scene.rail} — Nano Folio`;

  railButtons.forEach((button) => {
    const active = Number(button.dataset.index) === index;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });

  document.querySelectorAll("[data-go]").forEach((button) => {
    const value = button.dataset.go;
    const active = value === "work" ? index >= 2 && index <= 4 : Number(value) === index;
    button.classList.toggle("is-active", active);
  });
}

function fadeTo(index) {
  const token = ++fadeToken;
  panel.classList.add("is-out");
  window.setTimeout(() => {
    if (token !== fadeToken) return;
    renderCopy(index);
    panel.classList.remove("is-out");
  }, reduce ? 0 : 180);
}

function go(index) {
  const next = clampIndex(index);
  target = next;
  if (shown === next) return;
  shown = next;
  fadeTo(next);
}

function bootUI() {
  scenes.forEach((scene, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "rail-btn";
    button.dataset.index = String(index);
    const number = document.createElement("span");
    number.className = "num";
    number.textContent = scene.indexLabel;
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = scene.rail;
    button.append(number, label);
    button.addEventListener("click", () => go(index));
    rail.append(button);
    railButtons.push(button);
  });

  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      go(button.dataset.go === "work" ? 2 : Number(button.dataset.go));
    });
  });

  renderCopy(0);
}

function init() {
  bootUI();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  if (!renderer.getContext()) {
    bodyEl.textContent = "WebGL is unavailable in this browser, so the models cannot be shown.";
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
  const materials = createMaterials();
  const groups = scenes.map((entry, index) => {
    const build = builders[entry.id];
    if (!build) throw new Error(`Missing model: ${entry.id}`);
    const group = build(materials);
    group.name = entry.id;
    group.position.x = index * SPACING;
    scene.add(group);
    return group;
  });

  const hemi = new THREE.HemisphereLight(0xfff6ea, 0xd9c3a4, 1.15);
  const key = new THREE.DirectionalLight(0xfff4e8, 2.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.03;
  const shadowCamera = key.shadow.camera;
  shadowCamera.near = 0.5;
  shadowCamera.far = 32;
  shadowCamera.left = -7;
  shadowCamera.right = 7;
  shadowCamera.top = 7;
  shadowCamera.bottom = -7;
  const fill = new THREE.DirectionalLight(0xfff1dd, 0.55);
  fill.position.set(-7, 6, 8);
  const rim = new THREE.DirectionalLight(0xd7e6ff, 0.7);
  rim.position.set(-8, 7, -6);
  scene.add(hemi, key, key.target, fill, rim);

  const clock = new THREE.Clock();
  const ctx = { t: 0, dt: 0, camera, reduce };
  const colors = scenes.map((entry) => new THREE.Color(entry.background));

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function frameCamera(delta) {
    const blend = 1 - Math.exp(-delta * (reduce ? 12 : 4.4));
    current += (target - current) * blend;
    const base = Math.min(scenes.length - 2, Math.max(0, Math.floor(current)));
    const span = scenes.length === 1 ? 0 : THREE.MathUtils.clamp(current - base, 0, 1);
    const next = Math.min(scenes.length - 1, base + 1);

    focus.lerpVectors(groups[base].position, groups[next].position, span);
    focus.y = 0.72;
    const radius =
      THREE.MathUtils.lerp(scenes[base].radius, scenes[next].radius, span) *
      (window.innerHeight < 520 ? 0.78 : window.innerWidth >= 900 && window.innerHeight >= 640 ? 1 : 0.9);
    const parallax = dragging || reduce ? 0 : 1;
    const useTheta = theta + (pointer.x - 0.5) * 0.08 * parallax;
    const usePhi = THREE.MathUtils.clamp(phi + (pointer.y - 0.5) * 0.05 * parallax, 0.78, 1.28);
    const sinPhi = Math.sin(usePhi);
    camera.position.set(
      focus.x + radius * sinPhi * Math.sin(useTheta),
      focus.y + radius * Math.cos(usePhi),
      focus.z + radius * sinPhi * Math.cos(useTheta),
    );
    camera.lookAt(focus);
    camera.updateMatrixWorld();
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);
    const narrowSheet = window.innerWidth < 900 && window.innerHeight >= 640;
    look
      .copy(focus)
      .addScaledVector(right, narrowSheet ? 0 : -1.15)
      .addScaledVector(up, narrowSheet ? -0.75 : 0.05);
    camera.lookAt(look);

    key.position.set(focus.x + 6.2, focus.y + 11, focus.z + 4.6);
    key.target.position.set(focus.x, focus.y, focus.z);

    background.copy(colors[base]).lerp(colors[next], span);
    scene.background = background;
    const paper = `#${background.getHexString()}`;
    document.documentElement.style.setProperty("--paper", paper);
    document.body.style.background = paper;
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    dragX = 0;
    dragY = 0;
    canvas.classList.add("is-dragging");
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX / window.innerWidth;
    pointer.y = event.clientY / window.innerHeight;
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    dragX += dx;
    dragY += dy;
    theta -= dx * 0.005;
    phi = THREE.MathUtils.clamp(phi + dy * 0.0032, 0.78, 1.28);
    lastX = event.clientX;
    lastY = event.clientY;
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("is-dragging");
    if (coarse && Math.abs(dragY) > 80 && Math.abs(dragY) > Math.abs(dragX) * 1.4) {
      go(target + (dragY < 0 ? 1 : -1));
    }
  }

  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  let wheel = 0;
  let wheelLock = 0;
  window.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const now = performance.now();
      if (now < wheelLock) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      wheel += delta;
      if (Math.abs(wheel) < 60) return;
      const direction = Math.sign(wheel);
      wheel = 0;
      wheelLock = now + 680;
      go(target + direction);
    },
    { passive: false },
  );

  window.addEventListener("keydown", (event) => {
    if (["ArrowRight", "ArrowDown", "PageDown"].includes(event.key)) {
      event.preventDefault();
      go(target + 1);
    } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      go(target - 1);
    } else if (event.key === "Home") {
      go(0);
    } else if (event.key === "End") {
      go(scenes.length - 1);
    }
  });

  window.addEventListener("resize", resize);
  resize();

  function animate() {
    const delta = Math.min(clock.getDelta(), 0.05);
    ctx.t = clock.elapsedTime;
    ctx.dt = delta;
    frameCamera(delta);
    groups.forEach((group) => group.userData.tick?.(ctx));
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
  document.body.classList.add("is-ready");
}

boot();

async function boot() {
  try {
    await document.fonts.ready;
  } catch {
    // Canvas labels fall back to Georgia or sans-serif.
  }
  init();
}
