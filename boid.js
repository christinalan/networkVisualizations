import * as THREE from "https://unpkg.com/three@0.121.1/build/three.module.js";

class Boid {
  constructor() {
    this.position = new THREE.Vector3(
      window.innerWidth / 2,
      window.innerHeight / 2,
      1
    );
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
  }

  show() {
    let bird_geo = new THREE.SphereGeometry(
      0.1,
      this.position.x,
      this.position.y
    );
    let bird_material = new THREE.MeshLambertMaterial({
      color: 0x00ffdf,
      opacity: 0.5,
      transparent: true,
    });
    let bird = new THREE.Mesh(bird_geo, bird_material);
    this.scene.add(bird);
  }
}

export { Boid };
