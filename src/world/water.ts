import * as THREE from 'three';

export class IslandWater {
  public mesh: THREE.Mesh;
  private geometry: THREE.PlaneGeometry;
  private initialY: Float32Array;

  constructor() {
    const size = 500;
    const segments = 60;
    this.geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    this.geometry.rotateX(-Math.PI / 2);

    const pos = this.geometry.attributes.position;
    this.initialY = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      this.initialY[i] = pos.getY(i);
    }

    const material = new THREE.MeshPhongMaterial({
      color: 0x0284c7, // vibrant Nordic ocean blue
      emissive: 0x013a5a,
      specular: 0xbae6fd,
      shininess: 90,
      transparent: true,
      opacity: 0.82,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.position.y = 0;
    this.mesh.receiveShadow = true;
  }

  public update(time: number) {
    const pos = this.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const wave =
        Math.sin(x * 0.08 + time * 1.8) * 0.25 +
        Math.cos(z * 0.08 + time * 1.4) * 0.25;
      pos.setY(i, this.initialY[i] + wave);
    }
    pos.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }
}
