import * as THREE from 'three';

export class IslandTerrain {
  public static readonly ISLAND_RADIUS = 135;
  public static readonly WATER_LEVEL = 0;

  // Mathematical height function for the island
  public static getHeight(x: number, z: number): number {
    const dist = Math.sqrt(x * x + z * z);

    // Island boundary falloff: smoothly drop off into ocean
    const maxRadius = IslandTerrain.ISLAND_RADIUS;
    if (dist > maxRadius) {
      return -6;
    }

    const edgeFactor = Math.max(0, 1 - Math.pow(dist / maxRadius, 2.2));

    // Base rolling landscape
    const baseHill1 = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 4.5;
    const baseHill2 = Math.sin(x * 0.07 + 1.2) * Math.sin(z * 0.07 + 0.8) * 2.2;
    const microDetail = Math.cos(x * 0.15) * Math.sin(z * 0.15) * 0.8;

    let height = 2.0 + (baseHill1 + baseHill2 + microDetail);

    // Feature 1: Alpine Stunt Peak (Northwest: x = -50, z = -45)
    const mtnDist = Math.sqrt(Math.pow(x - -50, 2) + Math.pow(z - -45, 2));
    if (mtnDist < 48) {
      const mtnFactor = Math.cos((mtnDist / 48) * (Math.PI / 2));
      height += Math.pow(mtnFactor, 1.8) * 22; // Rises up to ~25m!
    }

    // Feature 2: Lighthouse Bluff (Southeast: x = 65, z = 45)
    const lightDist = Math.sqrt(Math.pow(x - 65, 2) + Math.pow(z - 45, 2));
    if (lightDist < 35) {
      const bluffFactor = Math.cos((lightDist / 35) * (Math.PI / 2));
      height += Math.pow(bluffFactor, 1.5) * 8.5; // Raised bluff
    }

    // Feature 3: Flat Farm Meadow (Center-East: x = 20, z = -15)
    const farmDist = Math.sqrt(Math.pow(x - 20, 2) + Math.pow(z - -15, 2));
    if (farmDist < 30) {
      const farmFactor = Math.cos((farmDist / 30) * (Math.PI / 2));
      height = height * (1 - farmFactor * 0.6) + 3.2 * (farmFactor * 0.6); // smooth flat pasture
    }

    // Apply island edge falloff
    height = height * edgeFactor - (1 - edgeFactor) * 5.0;

    return height;
  }

  // Exact normal vector at any (x, z)
  public static getNormal(x: number, z: number): THREE.Vector3 {
    const delta = 0.5;
    const hL = IslandTerrain.getHeight(x - delta, z);
    const hR = IslandTerrain.getHeight(x + delta, z);
    const hD = IslandTerrain.getHeight(x, z - delta);
    const hU = IslandTerrain.getHeight(x, z + delta);

    const normal = new THREE.Vector3(-(hR - hL) / (2 * delta), 1, -(hU - hD) / (2 * delta));
    return normal.normalize();
  }

  // Create the 3D Island Mesh with vertex colors and material
  public static createMesh(): THREE.Mesh {
    const size = 320;
    const segments = 96; // 64% fewer vertices for silky 60fps mobile performance
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const posAttr = geometry.attributes.position;
    const count = posAttr.count;

    const colors: number[] = [];
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = IslandTerrain.getHeight(x, z);
      posAttr.setY(i, y);

      // Procedural biome vertex coloring
      if (y > 18) {
        // Snowy peak
        color.setRGB(0.95, 0.98, 1.0);
      } else if (y > 11) {
        // Rocky granite slope
        color.setRGB(0.52, 0.55, 0.58);
      } else if (y > 1.2) {
        // Lush Swedish pasture / meadow (lush green)
        const greenVar = (Math.sin(x * 0.1) + Math.cos(z * 0.1)) * 0.05;
        color.setRGB(0.22 + greenVar, 0.58 + greenVar, 0.24);
      } else if (y > -0.6) {
        // Warm sandy beach
        color.setRGB(0.92, 0.82, 0.58);
      } else {
        // Underwater seabed
        color.setRGB(0.25, 0.5, 0.65);
      }

      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = false;

    return mesh;
  }
}
