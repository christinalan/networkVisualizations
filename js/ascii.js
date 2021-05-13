// importing these scripts from the web keeps us from having to include them locally
// but also necessitates us using a local server
import * as THREE from "https://unpkg.com/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js";
import { AsciiEffect } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/effects/AsciiEffect.js";
import { TrackballControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/TrackballControls.js";

let scene, camera, renderer, clock, effect, controls;

let mic, context, source, sourceOutput;

const start = Date.now();

let analyser;
let data, dataFreq, dataTexture;
let mouse;
let fft = 128;

let texture;

let wires = [];

let ball;

let ballGeometry, ballMaterial;

// let raycaster, mouse;

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

function init() {
  const overlay = document.getElementById("overlay");
  overlay.remove();

  const container = document.getElementById("container");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0, 0, 0);

  clock = new THREE.Clock();

  //

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(7, 5, 0);

  // lights

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xfffff, 2);
  directionalLight.position.set(0, 8, 5);
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

  const textureLoader = new THREE.TextureLoader();
  texture = textureLoader.load("objects/images/dataIS!.png");

  ballGeometry = new THREE.CubeGeometry(0.1, 0.1, 0.1);
  ballGeometry.translate(0, 0, 0);

  // audio

  const audioLoader = new THREE.AudioLoader();

  const listener = new THREE.AudioListener();
  camera.add(listener);

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(handleSuccess);

  function handleSuccess(stream) {
    mic = new THREE.Audio(listener);
    listener.gain.disconnect();
    context = listener.context;

    source = context.createMediaStreamSource(stream);

    mic.setNodeSource(source);

    sourceOutput = context.createMediaStreamDestination();
    mic.connect(sourceOutput);

    analyser = new THREE.AudioAnalyser(mic, 256);
    dataFreq = analyser.getFrequencyData();
    const format = renderer.capabilities.isWebGL2
      ? THREE.LuminanceAlphaFormat
      : THREE.RedFormat;

    dataTexture = new THREE.DataTexture(dataFreq, fft / 3, 1, format);

    ballMaterial = new THREE.MeshPhongMaterial({
      opacity: 0.7,
      transparent: true,
      flatShading: true,
    });

    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0, 0);
    ball.rotation.set(0, 0, 0);
    scene.add(ball);

    // wires.push(ball);

    animate();
  }

  // create objects when audio buffer is loaded

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  //   renderer.setClearColor(0x000000);
  //   renderer.setPixelRatio(window.devicePixelRatio);
  //   container.appendChild(renderer.domElement);

  //

  //   const controls = new OrbitControls(camera, renderer.domElement);
  //   controls.minDistance = 0.1;
  //   controls.maxDistance = 700;

  //

  effect = new AsciiEffect(renderer, " .:-+*=%@#", { invert: true });
  effect.setSize(window.innerWidth, window.innerHeight);
  effect.domElement.style.color = "white";
  effect.domElement.style.backgroundColor = "black";
  container.appendChild(effect.domElement);

  mouse = new THREE.Vector2();

  controls = new TrackballControls(camera, effect.domElement);

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

let angle = 0;
let angleV = 0;
let angleA = 0;

let d, speed;

function render() {
  data = analyser.getFrequencyData();

  //   ball.material.emissiveMap.needsUpdate = true;

  const displacement = new THREE.Vector3(0, speed, 0);
  const target = new THREE.Vector3();
  const velocity = new THREE.Vector3();

  speed += angleA;

  const time = clock.getElapsedTime();
  const timer = Date.now() - start;
  const delta = clock.getDelta();

  const raycaster = new THREE.Raycaster();

  raycaster.setFromCamera(mouse, camera);

  data = analyser.getFrequencyData();

  const dataAvg = analyser.getAverageFrequency();

  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    const intersect = intersects[0];
    // intersects[i].object.material.emissive.setHex(0xffffff);

    //displacement
    displacement.copy(velocity).multiplyScalar(delta);
    //target
    target.copy(intersect.point).add(displacement);

    ball.position.copy(target);

    const newBall = new THREE.Mesh(ballGeometry, ballMaterial);
    newBall.position.copy(target).add(intersect.face.normal);

    scene.add(newBall);

    wires.push(newBall);
  }

  for (let i = 0; i < data.length; i++) {
    let value = 1;
    var v = data[i] / 2048;
    var y = (v * 300) / 5000;

    var newMap = mapRange(value, 0, 255, 0, v);
    var otherMap = mapRange(value, 0, 1024, window.innerHeight / 5000, dataAvg);

    let velocity = new THREE.Vector3(v, Math.cos(v), v);
    let acceleration = new THREE.Vector3(
      Math.sqrt(newMap * y + otherMap * y),
      Math.cos(Math.sin(otherMap)),
      Math.sin(v)
    );
    // let acceleration = new THREE.Vector3(0, Math.cos(Math.sin(otherMap)), 0);

    for (let i = 0; i < wires.length; i++) {
      d = velocity.distanceTo(wires[i].position);

      //   wires[i].rotation.z = angle * 0.0001;
      //   wires[i].rotation.x += y * 0.1;

      if (d > 0 && d < 10) {
        velocity.multiplyScalar(-1);
        acceleration.multiplyScalar(-1);
      }

      wires[i].scale.y = Math.abs(Math.sin(timer * v)) * 100;
      wires[i].scale.z = Math.abs(Math.cos(timer * v)) * 100;
      wires[i].rotation.x = Math.sin(v * timer);
      wires[i].position.add(velocity);
      velocity.add(acceleration);

      // wires[i].scale.y += Math.sin(newMap);

      // wires[i].position.z = 2 * Math.sin(angle);
      //   angle += Math.sin(newMap * 0.1);
      // angle += angleV;
      // angleV += otherMap;
      // wires[i].rotation.z = Math.sin(newMap + Math.sqrt(a * a + b * b));
    }
  }

  controls.update();
  effect.render(scene, camera);
  //   renderer.render(scene, camera);
}
