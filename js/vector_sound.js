// importing these scripts from the web keeps us from having to include them locally
// but also necessitates us using a local server
import * as THREE from "https://unpkg.com/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js";
import { PositionalAudioHelper } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/helpers/PositionalAudioHelper.js";
import { GLTFLoader } from "https://unpkg.com/three@0.119.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, clock;

let mic, context, source, sourceOutput;

let analyser, fft;
let data;
let mouse;

let bird, bird1;

let birdGeo, birdMaterial, birdMaterial2;

let flock = [];
let position, velocity, velocity1, acceleration;
let texture, dataTexture;

let posAudio, posAudio1;

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

function init() {
  const overlay = document.getElementById("overlay");
  overlay.remove();

  const container = document.getElementById("container");

  scene = new THREE.Scene();
  //   scene.background = new THREE.Color(0xf82480);

  clock = new THREE.Clock();

  //

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(15, 10, 30);

  // lights

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xf800ff, 0.9);
  directionalLight.position.set(0, 5, 5);
  scene.add(directionalLight);

  const d = 5;
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.bottom = -d;

  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 20;

  directionalLight.shadow.mapSize.x = 1024;
  directionalLight.shadow.mapSize.y = 1024;

  // floor

  //reg balls
  // audio
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const audioLoader = new THREE.AudioLoader();

  audioLoader.load("sounds/contact/plume.mp3", function (buffer) {
    posAudio = new THREE.PositionalAudio(listener);
    posAudio.setBuffer(buffer);
    // posAudio.play();

    posAudio.setDistanceModel("exponential");
    posAudio.setRefDistance(500);
    posAudio.setDirectionalCone(90, 200, 0);
    posAudio.rotation.set(0, Math.PI / 2, Math.PI / 2);

    const helper = new PositionalAudioHelper(posAudio, 5);
    posAudio.add(helper);

    fft = 128;

    analyser = new THREE.AudioAnalyser(posAudio, fft);
    data = analyser.getFrequencyData();

    const format = renderer.capabilities.isWebGL2
      ? THREE.RedFormat
      : THREE.LuminanceFormat;

    const textureLoader = new THREE.TextureLoader();
    texture = textureLoader.load("objects/images/texture.jpeg");

    dataTexture = new THREE.DataTexture(data, fft / 100, 1, format);

    birdGeo = new THREE.CylinderGeometry(1, 1, 30, 30);
    birdMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      opacity: 0.3,
      transparent: true,
      map: texture,
      emissive: 0xffffff,
      emissiveMap: dataTexture,
    });

    bird = new THREE.Mesh(birdGeo, birdMaterial);
    bird.position.set(0, 0, 0);
    bird.rotation.set(0, Math.PI / 2, Math.PI / 2);

    scene.add(bird);

    bird.add(posAudio);

    animate();
  });

  audioLoader.load("sounds/contact/snippet.mp3", function (buffer) {
    posAudio1 = new THREE.PositionalAudio(listener);
    posAudio1.setBuffer(buffer);

    posAudio1.setDistanceModel("exponential");
    posAudio1.setRefDistance(500);
    posAudio1.setDirectionalCone(90, 200, 0);
    posAudio1.rotation.set(0, 0, Math.PI / 2);

    const helper = new PositionalAudioHelper(posAudio1, 5);
    posAudio1.add(helper);

    fft = 128;

    analyser = new THREE.AudioAnalyser(posAudio1, fft);
    data = analyser.getFrequencyData();

    const format = renderer.capabilities.isWebGL2
      ? THREE.RedFormat
      : THREE.LuminanceFormat;

    const textureLoader = new THREE.TextureLoader();
    texture = textureLoader.load("objects/images/texture.jpeg");

    dataTexture = new THREE.DataTexture(data, fft / 100, 1, format);

    birdGeo = new THREE.CylinderGeometry(1, 1, 30, 30);
    birdMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      opacity: 0.3,
      transparent: true,
      map: texture,
      emissive: 0xffffff,
      emissiveMap: dataTexture,
    });

    bird1 = new THREE.Mesh(birdGeo, birdMaterial);
    bird1.position.set(10, 0, 0);
    bird1.rotation.set(0, Math.PI / 2, Math.PI / 2);

    scene.add(bird1);

    bird1.add(posAudio1);
  });

  // create objects when audio buffer is loaded

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  //

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.1;
  controls.maxDistance = 1000;

  //

  mouse = new THREE.Vector2();

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseDown, false);
}

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function mapRange(value, minf, maxf, mins, maxs) {
  value = (value - minf) / (maxf - minf);
  return mins + value * (maxs - mins);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

let d;
let angle = 0;
let angleV = 0;
let angleA = 0;

let speed;
let barHeight;

function render() {
  let audio = bird.children[0];
  let audio1 = bird1.children[0];
  analyser.getFrequencyData();
  const dataAvg = analyser.getAverageFrequency();

  bird.material.emissiveMap.needsUpdate = true;
  bird1.material.emissiveMap.needsUpdate = true;

  for (let i = 0; i < data.length; i += 100) {
    let value = 1;
    var v = data[i] / 2048;
    var y = (v * 300) / 5000;

    var newMap = mapRange(value, 0, 100, 0, v);
    var otherMap = mapRange(value, 0, 1024, window.innerHeight / 5000, dataAvg);

    barHeight = data[i] / 5000;

    d = bird.position.distanceTo(bird1.position);

    const newVector = new THREE.Vector3(barHeight * 2, 0, 0);
    const newVector1 = new THREE.Vector3(barHeight * -2, 0, 0);

    if (d <= 0.1 && d >= 0) {
      velocity = new THREE.Vector3(0, 0, 0);
      velocity1 = new THREE.Vector3(0, 0, 0);
      //   bird.scale.y += newMap * 10;
      //   bird1.scale.y += newMap * 10;
      bird.rotation.x = 10 * Math.sin(Math.sin(angleV)) * Math.random(angle);
      bird1.rotation.y = 10 * Math.sin(angle);

      //   acceleration = new THREE.Vector3(0, barHeight, 0);
      //   velocity.add(acceleration).random();
    } else {
      // position = new THREE.Vector3(window.innerWidth - 20, 0, 0);
      velocity = new THREE.Vector3().add(newVector);
      velocity1 = new THREE.Vector3().add(newVector1);
      bird.position.add(velocity);
      bird1.position.add(velocity1);
    }
    angle += Math.sin(otherMap);
    angle += angleV;
    angleV += newMap;
  }

  audio.play();
  audio1.play();
  renderer.render(scene, camera);
}
