// importing these scripts from the web keeps us from having to include them locally
// but also necessitates us using a local server
import * as THREE from "https://unpkg.com/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js";
import { PositionalAudioHelper } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/helpers/PositionalAudioHelper.js";
import { Curves } from "https://unpkg.com/three@0.119.0/examples/jsm/curves/CurveExtras.js";

let scene, camera, renderer, clock;

let mic, context, source, sourceOutput;

let analyser, analyser1, dataFreq, dataFreq1;

let mouse;

let bird, bird1;

let birdGeo, birdMaterial, birdMaterial2;
let texture, dataTexture, dataTexture1;

let flock = [];
let flock1 = [];
let position, velocity, acceleration;

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
    500
  );
  camera.position.set(7, 3, 20);

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

  const knot = new Curves.GrannyKnot();
  birdGeo = new THREE.TubeGeometry(knot, 50, 1, 3, true);

  const textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("objects/images/Mpp4800.png");

  // audio

  const audioLoader = new THREE.AudioLoader();
  const audioLoader1 = new THREE.AudioLoader();

  const listener = new THREE.AudioListener();
  camera.add(listener);

  audioLoader.load("sounds/gqrx/short.m4a", function (buffer) {
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

      analyser = new THREE.AudioAnalyser(posAudio, 256);
      dataFreq = analyser.getFrequencyData();

      dataTexture = new THREE.DataTexture(dataFreq, 30, 1, format);

      birdMaterial = new THREE.MeshLambertMaterial({
        color: 0xff004c,
        opacity: 0.8,
        transparent: true,
        map: texture,
        emissive: 0xffffff,
        emissiveMap: dataTexture,
      });

      bird = new THREE.Mesh(birdGeo, birdMaterial);
      const s = i / 2;
      scene.add(bird);
      bird.position.set(s, 0, 0);
      bird.add(posAudio);
      flock.push(bird);
      posAudio.play();
    }

    animate();
  });

  audioLoader1.load("sounds/gqrx/shortb.m4a", function (buffer) {
    for (let i = 0; i < 20; i++) {
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

      analyser1 = new THREE.AudioAnalyser(posAudio1, 256);
      dataFreq1 = analyser1.getFrequencyData();

      dataTexture1 = new THREE.DataTexture(dataFreq1, 128, 1, format);

      birdMaterial2 = new THREE.MeshLambertMaterial({
        color: 0xff004c,
        opacity: 0.8,
        transparent: true,
        map: texture,
        emissive: 0xffffff,
        emissiveMap: dataTexture1,
      });

      bird1 = new THREE.Mesh(birdGeo, birdMaterial2);
      const s = i / 2;
      scene.add(bird1);
      bird1.position.set(s - 20, 0, 0);
      bird1.add(posAudio1);
      flock1.push(bird1);

      posAudio1.play();
    }
  });

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(handleSuccess);

  function handleSuccess(stream) {
    // mic = new THREE.Audio(listener);
    // listener.gain.disconnect();
    // context = listener.context;
    // source = context.createMediaStreamSource(stream);
    // mic.setNodeSource(source);
    // sourceOutput = context.createMediaStreamDestination();
    // mic.connect(sourceOutput);
    // analyser = context.createAnalyser();
    // analyser = new THREE.AudioAnalyser(mic, 256);
  }

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
  controls.maxDistance = 300;

  //

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

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

let d, audio, audio1;
let audioV = 0.1;

function render() {
  analyser.getFrequencyData();

  const time = clock.getElapsedTime();
  const delta = clock.getDelta();

  position = new THREE.Vector3(
    window.innerWidth / 20,
    window.innerHeight / 10,
    0
  );
  velocity = new THREE.Vector3(Math.sin(time), Math.sin(time), 0);
  acceleration = new THREE.Vector3().random();

  for (let bird of flock) {
    bird.material.emissiveMap.needsUpdate = true;
    bird.position.add(velocity);
    d = velocity.distanceTo(bird.position);
    velocity.add(acceleration).multiplyScalar(Math.sin(time));

    if (d > 10 && d < 100) {
      velocity.multiplyScalar(-1);
      audio = bird.children[0];
      audio.rotation.set(
        Math.random(Math.sin(time * audioV)),
        Math.sin(audioV),
        Math.sin(time) * 30
      );
    }
    audioV += 5;
  }

  for (let bird1 of flock1) {
    analyser1.getFrequencyData();
    bird1.material.emissiveMap.needsUpdate = true;
    bird1.position.add(velocity);
    d = velocity.distanceTo(bird1.position);
    velocity.add(acceleration).multiplyScalar(Math.sin(time));

    if (d > 10 && d < 75) {
      velocity.multiplyScalar(-1);
      audio1 = bird1.children[0];
      audio1.rotation.set(
        Math.random(Math.sin(time * audioV)),
        Math.sin(audioV),
        Math.sin(time) * 30
      );
    }
    audioV += 5;
  }

  renderer.render(scene, camera);
}
