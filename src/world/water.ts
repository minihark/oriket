import * as THREE from 'three';

export class IslandWater {
  public mesh: THREE.Mesh;

  constructor() {
    const size = 480;
    const segments = 24; // Lightweight low-poly grid (576 vertices instead of 3721!)
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshLambertMaterial({
      color: 0x0284c7, // vibrant Nordic ocean blue
      transparent: true,
      opacity: 0.82,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y = 0;
    this.mesh.receiveShadow = true;
  }

  // Blazing fast 60fps update with ZERO CPU vertex recalculation
  public update(time: number) {
    // Gentle breathing wave motion on ocean height
    this.mesh.position.y = Math.sin(time * 1.6) * 0.16;
  }
}
