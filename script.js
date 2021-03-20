// importing these scripts from the web keeps us from having to include them locally
// but also necessitates us using a local server
import * as THREE from "https://unpkg.com/three@0.121.1/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js";
import { PositionalAudioHelper } from "https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/helpers/PositionalAudioHelper.js";
import { GLTFLoader } from "https://unpkg.com/three@0.119.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer;

let lime, lime2;
let web1, web2, web3, web4, web5, web6;
let uweb1, uweb2, uweb3, uweb4, uweb5, uweb6;

const startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

function init() {
  let overlay = document.getElementById("overlay");
  overlay.remove();

  const container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(3, 2, 3); // our starting view position

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0); // background color
  scene.fog = new THREE.Fog(0xa0a0a0, 2, 20); // fog is interesting, try commenting it out

  // boiler plate - now we add lights to the scene
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0); // this will be overhead
  scene.add(hemiLight);

  // boiler plate - this light will determined the shadow that we see on our objects
  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(5, 5, 0);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 1;
  dirLight.shadow.camera.bottom = -1;
  dirLight.shadow.camera.left = -1;
  dirLight.shadow.camera.right = 1;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 20;
  scene.add(dirLight);

  // this mesh plane is our floor
  const floorGeometry = new THREE.PlaneGeometry(50, 50);
  const floorMaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    depthWrite: false,
  });
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true; // to show the shadow from our objects
  scene.add(floorMesh);

  // helping us percieve the 3D layout of the space we're creating
  const grid = new THREE.GridHelper(50, 50, 0x888888, 0x888888);
  scene.add(grid);

  //audio
  const listener = new THREE.AudioListener();
  camera.add(listener);

  //*METAL SOUNDS
  const uMetal = document.getElementById("track1");

  //position the audio in space!
  const uMetalPos = new THREE.PositionalAudio(listener);
  uMetalPos.setMediaElementSource(uMetal);
  // RefDistance determines how far away from the source we must be before the sound
  // starts to decrease in volume
  // there is also .setRollOffFactor which we can play with
  uMetalPos.setRefDistance(0.05);
  //inner angle, outer angle, and inner gain
  // determines how the audio will respond in relation to the angle of the listener
  uMetalPos.setDirectionalCone(90, 230, 0);
  // uMetal.play();

  //visualize the directional cone
  const helper = new PositionalAudioHelper(uMetalPos, 10);
  // we add it to our positionalAudio object to link their positions
  uMetalPos.add(helper);

  const nMetal = document.getElementById("track2");

  const nMetalPos = new THREE.PositionalAudio(listener);
  nMetalPos.setMediaElementSource(nMetal);
  nMetalPos.setRefDistance(0.05);
  nMetalPos.setDirectionalCone(90, 230, 0);
  // nMetal.play();

  const nhelper = new PositionalAudioHelper(nMetalPos, 10);
  nMetalPos.add(nhelper);

  //first lime
  // const limeLoader = new GLTFLoader();
  // limeLoader.load(
  //   "objects/lime/half.glb",
  //   function (gltf) {
  //     lime = gltf.scene;
  //     scene.add(lime);
  //     // gltf.scene.rotation.y = Math.PI;
  //     lime.position.set(0, 0, 0);
  //     lime.scale.set(0.01, 0.01, 0.01);

  //     lime.add(uMetalPos);
  //   },
  //   undefined,
  //   function (error) {
  //     console.error(error);
  //   }
  // );

  //2nd lime
  // const lime2Loader = new GLTFLoader();
  // lime2Loader.load("objects/lime/half.glb", function (gltf) {
  //   lime2 = gltf.scene;
  //   scene.add(lime2);
  //   lime2.position.set(0.1, 0, 0.1);
  //   lime2.rotation.y = Math.PI;
  //   lime2.scale.set(0.01, 0.01, 0.01);
  //   lime2.add(nMetalPos);
  // });

  //loading web !!!!! natural
  const glass = document.getElementById("track15");

  const glassPos = new THREE.PositionalAudio(listener);
  glassPos.setMediaElementSource(glass);
  glassPos.setRefDistance(1);
  glassPos.setDirectionalCone(90, 230, 0);
  glass.play();

  const ghelper = new PositionalAudioHelper(glassPos, 400);
  glassPos.add(ghelper);

  //2 unnatural
  const glass1 = document.getElementById("track16");

  const glassPos1 = new THREE.PositionalAudio(listener);
  glassPos1.setMediaElementSource(glass1);
  glassPos1.setRefDistance(0.5);
  glassPos1.setDirectionalCone(90, 230, 0);
  glass1.play();

  const ghelper1 = new PositionalAudioHelper(glassPos1, 400);
  glassPos1.add(ghelper1);

  //3
  // const g2 = document.getElementById("track5");

  // const g2P = new THREE.PositionalAudio(listener);
  // g2P.setMediaElementSource(g2);
  // g2P.setRefDistance(0.05);
  // g2P.setDirectionalCone(90, 230, 0);
  // g2.play();

  // const gh2 = new PositionalAudioHelper(g2P, 20);
  // g2P.add(gh2);

  //natural
  const web1Loader = new GLTFLoader();
  web1Loader.load("objects/web/newWeb.gltf", function (gltf) {
    web1 = gltf.scene;
    scene.add(web1);
    web1.position.set(0, 0, 0);
    web1.rotation.y = Math.PI;
    web1.scale.set(0.001, 0.001, 0.001);
    web1.add(glassPos);
  });

  //unnatural
  const web2Loader = new GLTFLoader();
  web2Loader.load("objects/web/newWeb.gltf", function (gltf) {
    web2 = gltf.scene;
    scene.add(web2);
    web2.position.set(0, 0, -0.5);
    // web2.rotation.y = Math.PI;
    web2.scale.set(0.001, 0.001, 0.001);
    web2.add(glassPos1);
  });

  // boiler plate - setting up rendering from 3D to 2D
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // boiler plate - setting up the basic controls for navigation
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.1, 0);
  controls.update();
  controls.minDistance = 0.05;
  controls.maxDistance = 20;
  controls.maxPolarAngle = 0.5 * Math.PI;

  window.addEventListener("resize", onWindowResize);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
