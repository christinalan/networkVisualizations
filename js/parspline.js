// importing these scripts from the web keeps us from having to include them locally
// but also necessitates us using a local server
import * as THREE from "https://unpkg.com/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js";
import { PositionalAudioHelper } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/helpers/PositionalAudioHelper.js";
import { Curves } from "https://unpkg.com/three@0.119.0/examples/jsm/curves/CurveExtras.js";
import { ParallaxBarrierEffect } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/effects/ParallaxBarrierEffect.js";

let scene, camera, renderer, clock;

let mic, context, source, sourceOutput;

let analyser, analyser1, dataFreq, dataFreq1;

let mouse;

let bird, bird1;

let birdGeo, birdMaterial, birdMaterial2;
let texture, dataTexture, dataTexture1;

let flock = [];
let flock1 = [];
let audios = [];
let audios1 = [];
let position, velocity, acceleration;

let posAudio, posAudio1;
let effect;
let data;
let fft = 128;

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

function init() {
  const overlay = document.getElementById("overlay");
  overlay.remove();

  const container = document.getElementById("container");

  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xf82480);

  clock = new THREE.Clock();

  //

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(7, 3, 200);

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

  //reg balls

  const knot = new Curves.HeartCurve();
  birdGeo = new THREE.TubeGeometry(knot, 10, 1, 3, true);
  // birdGeo = new THREE.SphereGeometry(10, 32, 16);

  const textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("objects/images/3GWCDMA.png");

  // audio

  const audioLoader = new THREE.AudioLoader();
  const audioLoader1 = new THREE.AudioLoader();

  const listener = new THREE.AudioListener();
  camera.add(listener);

  audioLoader.load("sounds/vicki/piece1.mp3", function (buffer) {
    for (let i = 0; i < 10; i++) {
      posAudio = new THREE.PositionalAudio(listener);
      posAudio.setBuffer(buffer);

      posAudio.setDistanceModel("exponential");
      posAudio.setRefDistance(500);
      posAudio.setDirectionalCone(90, 200, 0);
      posAudio.rotation.set(0, Math.PI / 2, Math.PI / 2);

      const helper = new PositionalAudioHelper(posAudio, 1);
      posAudio.add(helper);

      const format = renderer.capabilities.isWebGL2
        ? THREE.RedFormat
        : THREE.LuminanceAlphaFormat;

      analyser = new THREE.AudioAnalyser(posAudio, fft);
      dataFreq = analyser.getFrequencyData();

      dataTexture = new THREE.DataTexture(dataFreq, fft / 10, 1, format);

      birdMaterial = new THREE.MeshLambertMaterial({
        color: 0xfdffff,
        opacity: 0.5,
        transparent: true,
        map: texture,
        emissive: 0xffffff,
        emissiveMap: dataTexture,
      });

      bird = new THREE.Mesh(birdGeo, birdMaterial);
      bird.userData.down = false;
      const s = i / 2;
      scene.add(bird);
      bird.position.set(s + 10, 0, 0);
      bird.scale.set(0.5, 0.5, 0.5);
      bird.add(posAudio);

      console.log(bird.position.y);

      flock.push(bird);
      audios.push(posAudio);
    }
    // posAudio.play();
    animate();
  });

  audioLoader1.load("sounds/vicki/piece4.mp3", function (buffer) {
    for (let i = 0; i < 5; i++) {
      posAudio1 = new THREE.PositionalAudio(listener);
      posAudio1.setBuffer(buffer);
      posAudio1.setDistanceModel("exponential");
      posAudio1.setRefDistance(500);
      posAudio1.setDirectionalCone(90, 200, 0);
      posAudio1.rotation.set(0, 0, Math.PI / 2);

      const helper = new PositionalAudioHelper(posAudio1, 1);
      posAudio1.add(helper);

      const format = renderer.capabilities.isWebGL2
        ? THREE.RedFormat
        : THREE.LuminanceAlphaFormat;

      analyser1 = new THREE.AudioAnalyser(posAudio1, fft);
      dataFreq1 = analyser1.getFrequencyData();

      dataTexture1 = new THREE.DataTexture(dataFreq1, fft / 10, 1, format);

      birdMaterial2 = new THREE.MeshLambertMaterial({
        color: 0xfff7f7,
        opacity: 0.5,
        transparent: true,
        map: texture,
        emissive: 0xffffff,
        emissiveMap: dataTexture1,
      });

      bird1 = new THREE.Mesh(birdGeo, birdMaterial2);
      bird1.userData.down = false;
      const s = i / 2;
      scene.add(bird1);
      bird1.position.set(s, 0, 0);
      bird1.scale.set(0.5, 0.5, 0.5);
      bird1.add(posAudio1);

      flock1.push(bird1);
      audios1.push(posAudio1);
    }

    // posAudio1.play();
  });

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(handleSuccess);

  function handleSuccess(stream) {}

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
  controls.maxDistance = 500;

  const width = window.innerWidth || 2;
  const height = window.innerHeight || 2;

  effect = new ParallaxBarrierEffect(renderer);
  effect.setSize(width, height);

  mouse = new THREE.Vector2();

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseDown, false);
}

function onMouseDown(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  //   renderer.setSize(window.innerWidth, window.innerHeight);

  effect.setSize(window.innerWidth, window.innerHeight);
}

function mapRange(value, minf, maxf, mins, maxs) {
  value = (value - minf) / (maxf - minf);
  return mins + value * (maxs - mins);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

let d, audio, audio1, birdheight1, birdheight2;
let audioV = 0.1;

function render() {
  data = analyser.getFrequencyData();

  const dataAvg = analyser.getAverageFrequency();

  const time = clock.getElapsedTime();
  const delta = clock.getDelta();

  for (let i = 0; i < data.length; i++) {
    let value = 1;
    var v = data[i] / 512;
    var y = (v * 300) / 5000;

    var newMap = mapRange(value, 0, 255, 0, v);
    var otherMap = mapRange(value, 0, 1024, window.innerHeight / 5000, dataAvg);

    position = new THREE.Vector3(Math.sin(i + time), Math.sin(time), 0);
    velocity = new THREE.Vector3(0, Math.sin(otherMap), 0);
    acceleration = new THREE.Vector3(0, Math.cos(otherMap), 0);

    for (let i = 0; i < flock.length; i++) {
      bird = flock[i];
      audio = audios[i];
      bird.material.emissiveMap.needsUpdate = true;

      d = velocity.distanceTo(bird.position);
      velocity.add(acceleration);

      if (d > 0 && d < 50) {
        velocity.multiplyScalar(-1);
        bird.rotation.y += Math.sin(time * y);
        const audio = bird.children[0];
        audio.play();

        audio.rotation.set(
          Math.random(Math.sin(time * y)),
          v * audioV,
          Math.sin(time) * 30
        );
      }

      bird.position.add(velocity);

      audioV += Math.sin(otherMap) * time;
    }

    for (let bird1 of flock1) {
      bird1.material.emissiveMap.needsUpdate = true;

      d = velocity.distanceTo(bird1.position);
      velocity.add(acceleration).multiplyScalar(Math.sin(time));

      if (d > 10 && d < 50) {
        velocity.multiplyScalar(-1);
        bird1.rotation.y += Math.sin(v);
        audio1 = bird1.children[0];
        audio1.play();
        audio1.rotation.set(v * audioV, Math.sin(audioV), Math.sin(time) * 10);
      }
      bird1.position.add(velocity);
      audioV += Math.sin(newMap) * time;
    }
  }

  //   renderer.render(scene, camera);
  effect.render(scene, camera);
}
