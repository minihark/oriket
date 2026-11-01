import * as THREE from 'three';
import { IslandTerrain } from './terrain';
import { GoldenStar, CampfireTarget, AnimalProp, BoostPad, StuntRamp } from '../types';

export interface WorldObjects {
  group: THREE.Group;
  stars: GoldenStar[];
  campfires: CampfireTarget[];
  animals: AnimalProp[];
  boostPads: BoostPad[];
  stuntRamps: StuntRamp[];
  lighthouseBeacon?: THREE.SpotLight;
  lighthouseLampMesh?: THREE.Mesh;
  starMeshes: Map<string, THREE.Group>;
  campfireMeshes: Map<string, THREE.Group>;
  animalMeshes: Map<string, THREE.Group>;
}

export class WorldBuilder {
  public static buildWorld(): WorldObjects {
    const group = new THREE.Group();
    const starMeshes = new Map<string, THREE.Group>();
    const campfireMeshes = new Map<string, THREE.Group>();
    const animalMeshes = new Map<string, THREE.Group>();

    // 1. Build The Red Swedish Barn & Silo (x = 22, z = -18)
    const barnGroup = WorldBuilder.createSwedishBarn();
    const barnY = IslandTerrain.getHeight(22, -18);
    barnGroup.position.set(22, barnY, -18);
    barnGroup.rotation.y = 0.4;
    group.add(barnGroup);

    // Hay bales near barn
    const hayCoords = [
      { x: 30, z: -15 },
      { x: 32, z: -16 },
      { x: 31, z: -18 },
      { x: 28, z: -25 },
    ];
    hayCoords.forEach((hc) => {
      const hay = WorldBuilder.createHayBale();
      const hy = IslandTerrain.getHeight(hc.x, hc.z);
      hay.position.set(hc.x, hy, hc.z);
      group.add(hay);
    });

    // Wooden fences around pasture
    for (let fx = 5; fx <= 35; fx += 5) {
      const fence = WorldBuilder.createFencePost();
      const fy = IslandTerrain.getHeight(fx, -32);
      fence.position.set(fx, fy, -32);
      group.add(fence);
    }

    // 2. Build Swedish Red Cottages (Falu Stugor) in a village cluster
    const cottagePositions = [
      { x: -15, z: 20, rot: 0.2 },
      { x: -28, z: 28, rot: -0.4 },
      { x: -5, z: 35, rot: 1.1 },
      { x: 10, z: 40, rot: -1.2 },
      { x: -35, z: -10, rot: 0.8 },
    ];
    cottagePositions.forEach((pos) => {
      const cottage = WorldBuilder.createSwedishCottage();
      const cy = IslandTerrain.getHeight(pos.x, pos.z);
      cottage.position.set(pos.x, cy, pos.z);
      cottage.rotation.y = pos.rot;
      group.add(cottage);
    });

    // 3. Build The Iconic Lighthouse (x = 65, z = 45)
    const lighthouseGroup = new THREE.Group();
    const lightY = IslandTerrain.getHeight(65, 45);
    lighthouseGroup.position.set(65, lightY, 45);

    const { group: lhMesh, beacon, lamp } = WorldBuilder.createLighthouse();
    lighthouseGroup.add(lhMesh);
    group.add(lighthouseGroup);

    // 4. Build Pier and Boat Dock at the harbor (x = -15, z = 65)
    const pier = WorldBuilder.createWoodenPier();
    pier.position.set(-15, 0.4, 65);
    pier.rotation.y = 0.3;
    group.add(pier);

    // 5. Populate Nordic Pine & Birch Trees
    const treeCoords = [
      // Pine forest near mountain
      { x: -30, z: -30, type: 'pine', s: 1.2 },
      { x: -38, z: -25, type: 'pine', s: 1.0 },
      { x: -25, z: -40, type: 'pine', s: 1.3 },
      { x: -45, z: -20, type: 'pine', s: 1.1 },
      { x: -20, z: -22, type: 'pine', s: 0.9 },
      { x: -12, z: -35, type: 'birch', s: 1.0 },
      { x: -18, z: -48, type: 'pine', s: 1.2 },
      // Trees along coastal roads
      { x: 40, z: 15, type: 'pine', s: 1.1 },
      { x: 45, z: 25, type: 'birch', s: 1.2 },
      { x: 50, z: 35, type: 'pine', s: 1.0 },
      { x: 35, z: 30, type: 'pine', s: 0.9 },
      { x: -2, z: 12, type: 'birch', s: 1.1 },
      { x: 12, z: 8, type: 'pine', s: 1.2 },
      { x: -40, z: 10, type: 'pine', s: 1.0 },
      { x: -50, z: 5, type: 'birch', s: 1.1 },
      { x: -22, z: 45, type: 'pine', s: 1.3 },
      { x: -8, z: 52, type: 'pine', s: 0.9 },
      // Southern woods
      { x: 18, z: 55, type: 'pine', s: 1.2 },
      { x: 28, z: 50, type: 'pine', s: 1.1 },
      { x: 55, z: -5, type: 'birch', s: 1.0 },
      { x: 48, z: -15, type: 'pine', s: 1.2 },
      { x: -60, z: -15, type: 'pine', s: 1.4 },
    ];
    treeCoords.forEach((tc) => {
      const tree =
        tc.type === 'pine'
          ? WorldBuilder.createPineTree(tc.s)
          : WorldBuilder.createBirchTree(tc.s);
      const ty = IslandTerrain.getHeight(tc.x, tc.z);
      tree.position.set(tc.x, ty, tc.z);
      group.add(tree);
    });

    // 6. Granite Boulders
    const rocks = [
      { x: 58, z: 40, s: 2.2 },
      { x: 72, z: 48, s: 1.8 },
      { x: -55, z: -55, s: 3.5 },
      { x: -62, z: -35, s: 2.8 },
      { x: -35, z: 62, s: 2.0 },
      { x: -45, z: 55, s: 1.5 },
      { x: 70, z: 10, s: 2.5 },
      { x: 25, z: 70, s: 2.1 },
    ];
    rocks.forEach((rc) => {
      const boulder = WorldBuilder.createBoulder(rc.s);
      const by = IslandTerrain.getHeight(rc.x, rc.z);
      boulder.position.set(rc.x, by, rc.z);
      group.add(boulder);
    });

    // 7. Stunt Ramps & Mega Bounces
    const stuntRamps: StuntRamp[] = [
      { id: 'ramp-1', x: -35, y: IslandTerrain.getHeight(-35, -35), z: -35, angle: -0.6, width: 6, height: 2.4, length: 7 },
      { id: 'ramp-2', x: 15, y: IslandTerrain.getHeight(15, 22), z: 22, angle: 1.8, width: 5.5, height: 2.2, length: 6.5 },
      { id: 'ramp-3', x: 45, y: IslandTerrain.getHeight(45, 10), z: 10, angle: 0.8, width: 6, height: 3.0, length: 8 },
    ];
    stuntRamps.forEach((r) => {
      const rMesh = WorldBuilder.createStuntRampMesh(r.width, r.height, r.length);
      rMesh.position.set(r.x, r.y, r.z);
      rMesh.rotation.y = r.angle;
      group.add(rMesh);
    });

    // 8. Speed Boost Pads
    const boostPads: BoostPad[] = [
      { id: 'boost-1', x: -28, y: IslandTerrain.getHeight(-28, -30), z: -30, angle: -0.6 },
      { id: 'boost-2', x: 22, y: IslandTerrain.getHeight(22, 16), z: 16, angle: 1.8 },
      { id: 'boost-3', x: 38, y: IslandTerrain.getHeight(38, 5), z: 5, angle: 0.8 },
    ];
    boostPads.forEach((bp) => {
      const padMesh = WorldBuilder.createBoostPadMesh();
      padMesh.position.set(bp.x, bp.y + 0.1, bp.z);
      padMesh.rotation.y = bp.angle;
      group.add(padMesh);
    });

    // 9. Burning Campfires (Targets for Buster the Fire Truck)
    const campfires: CampfireTarget[] = [
      { id: 'fire-1', x: -22, y: IslandTerrain.getHeight(-22, -15), z: -15, extinguished: false },
      { id: 'fire-2', x: 35, y: IslandTerrain.getHeight(35, 42), z: 42, extinguished: false },
      { id: 'fire-3', x: -12, y: IslandTerrain.getHeight(-12, 48), z: 48, extinguished: false },
    ];
    campfires.forEach((cf) => {
      const cfMesh = WorldBuilder.createCampfireMesh();
      cfMesh.position.set(cf.x, cf.y, cf.z);
      campfireMeshes.set(cf.id, cfMesh);
      group.add(cfMesh);
    });

    // 10. Interactive Farm Animals
    const animals: AnimalProp[] = [
      { id: 'cow-1', type: 'cow', x: 12, y: IslandTerrain.getHeight(12, -22), z: -22, angle: 0, targetX: 12, targetZ: -22, timer: 0, jumpY: 0, jumpVy: 0, nameSv: 'Maja Ko' },
      { id: 'cow-2', type: 'cow', x: 18, y: IslandTerrain.getHeight(18, -26), z: -26, angle: 1.2, targetX: 18, targetZ: -26, timer: 0, jumpY: 0, jumpVy: 0, nameSv: 'Klara Ko' },
      { id: 'sheep-1', type: 'sheep', x: 25, y: IslandTerrain.getHeight(25, -28), z: -28, angle: -0.5, targetX: 25, targetZ: -28, timer: 0, jumpY: 0, jumpVy: 0, nameSv: 'Ulla Ulltuss' },
      { id: 'sheep-2', type: 'sheep', x: 30, y: IslandTerrain.getHeight(30, -22), z: -22, angle: 2.1, targetX: 30, targetZ: -22, timer: 0, jumpY: 0, jumpVy: 0, nameSv: 'Bäcke Lamm' },
      { id: 'sheep-3', type: 'sheep', x: 55, y: IslandTerrain.getHeight(55, 38), z: 38, angle: -1.0, targetX: 55, targetZ: 38, timer: 0, jumpY: 0, jumpVy: 0, nameSv: 'Vilsne Ville' }, // Lost sheep on bluff!
      { id: 'chicken-1', type: 'chicken', x: 16, y: IslandTerrain.getHeight(16, -14), z: -14, angle: 0, targetX: 16, targetZ: -14, timer: 0, jumpY: 0, jumpVy: 0, nameSv: 'Pia Höna' },
      { id: 'chicken-2', type: 'chicken', x: 26, y: IslandTerrain.getHeight(26, -12), z: -12, angle: 1.5, targetX: 26, targetZ: -12, timer: 0, jumpY: 0, jumpVy: 0, nameSv: 'Kackla' },
    ];
    animals.forEach((a) => {
      const aMesh = WorldBuilder.createAnimalMesh(a.type);
      aMesh.position.set(a.x, a.y, a.z);
      animalMeshes.set(a.id, aMesh);
      group.add(aMesh);
    });

    // 11. Golden Stars ⭐ (20 Hidden Stars across the Archipelago!)
    const starLocations = [
      { id: 'star-1', x: 0, z: 0, nameSv: 'Öns mittpunkt', nameEn: 'Island Center' },
      { id: 'star-2', x: 22, z: -18, nameSv: 'Ladugårdens tak', nameEn: 'Barn Roof' },
      { id: 'star-3', x: 65, z: 45, nameSv: 'Fyrens topp', nameEn: 'Lighthouse Summit' },
      { id: 'star-4', x: -50, z: -45, nameSv: 'Fjälltoppen', nameEn: 'Mountain Peak' },
      { id: 'star-5', x: -35, z: -32, nameSv: 'Stora Hopprampen', nameEn: 'Mega Jump Ramp' },
      { id: 'star-6', x: 15, z: 25, nameSv: 'Byskogen', nameEn: 'Village Woods' },
      { id: 'star-7', x: -15, z: 68, nameSv: 'Båtbryggan', nameEn: 'Boat Pier' },
      { id: 'star-8', x: 55, z: 38, nameSv: 'Klippudden', nameEn: 'Cliff Bluff' },
      { id: 'star-9', x: -28, z: 28, nameSv: 'Röda stugan', nameEn: 'Red Cottage' },
      { id: 'star-10', x: 30, z: -15, nameSv: 'Höbalarna', nameEn: 'Haystack' },
      { id: 'star-11', x: 45, z: 12, nameSv: 'Soliga slänten', nameEn: 'Sunny Slope' },
      { id: 'star-12', x: -45, z: 15, nameSv: 'Furuskogen', nameEn: 'Pine Forest' },
      { id: 'star-13', x: -62, z: -25, nameSv: 'Västkusten', nameEn: 'West Coast Beach' },
      { id: 'star-14', x: 70, z: 10, nameSv: 'Östra sandstranden', nameEn: 'East Beach' },
      { id: 'star-15', x: -10, z: -55, nameSv: 'Norra klipporna', nameEn: 'North Rocks' },
      { id: 'star-16', x: 25, z: 65, nameSv: 'Södra sundet', nameEn: 'South Bay' },
      { id: 'star-17', x: -22, z: -15, nameSv: 'Skogslägret', nameEn: 'Forest Camp' },
      { id: 'star-18', x: 35, z: 42, nameSv: 'Blommande ängen', nameEn: 'Flower Meadow' },
      { id: 'star-19', x: 5, z: -35, nameSv: 'Fårhagen', nameEn: 'Sheep Pasture' },
      { id: 'star-20', x: 45, z: -40, nameSv: 'Trolldalen', nameEn: 'Troll Valley' },
    ];

    const stars: GoldenStar[] = starLocations.map((loc) => {
      let groundY = IslandTerrain.getHeight(loc.x, loc.z);
      if (loc.id === 'star-2') groundY += 7.5; // atop barn
      if (loc.id === 'star-3') groundY += 16.0; // atop lighthouse
      if (loc.id === 'star-5') groundY += 4.5; // in air over ramp

      const starData: GoldenStar = {
        id: loc.id,
        x: loc.x,
        y: groundY + 1.2,
        z: loc.z,
        collected: false,
        nameSv: loc.nameSv,
        nameEn: loc.nameEn,
      };

      const starMesh = WorldBuilder.createStarMesh();
      starMesh.position.set(starData.x, starData.y, starData.z);
      starMeshes.set(loc.id, starMesh);
      group.add(starMesh);

      return starData;
    });

    return {
      group,
      stars,
      campfires,
      animals,
      boostPads,
      stuntRamps,
      lighthouseBeacon: beacon,
      lighthouseLampMesh: lamp,
      starMeshes,
      campfireMeshes,
      animalMeshes,
    };
  }

  // ----------------------------------------------------
  // PROCEDURAL 3D MESH BUILDERS
  // ----------------------------------------------------

  public static createSwedishCottage(): THREE.Group {
    const group = new THREE.Group();

    // Red timber body
    const bodyGeo = new THREE.BoxGeometry(6, 4, 4.5);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xb91c1c });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // White corner trims
    const trimMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const trimGeo = new THREE.BoxGeometry(0.35, 4.1, 0.35);
    const offsets = [
      [-3, 2, -2.25],
      [3, 2, -2.25],
      [-3, 2, 2.25],
      [3, 2, 2.25],
    ];
    offsets.forEach(([ox, oy, oz]) => {
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.set(ox, oy, oz);
      group.add(trim);
    });

    // Dark pitched roof
    const roofGeo = new THREE.ConeGeometry(4.8, 2.2, 4);
    roofGeo.rotateY(Math.PI / 4);
    roofGeo.scale(1.0, 1.0, 0.85);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5.0;
    roof.castShadow = true;
    group.add(roof);

    // Chimney
    const chimGeo = new THREE.BoxGeometry(0.7, 1.8, 0.7);
    const chimMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const chim = new THREE.Mesh(chimGeo, chimMat);
    chim.position.set(1.4, 5.5, 0.6);
    group.add(chim);

    // Yellow lit window
    const winGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const winMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(0, 2.2, 2.26);
    group.add(win);

    return group;
  }

  public static createSwedishBarn(): THREE.Group {
    const group = new THREE.Group();

    // Red Barn Hall
    const barnGeo = new THREE.BoxGeometry(14, 7, 9);
    const barnMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
    const barn = new THREE.Mesh(barnGeo, barnMat);
    barn.position.y = 3.5;
    barn.castShadow = true;
    barn.receiveShadow = true;
    group.add(barn);

    // Barn Roof
    const roofGeo = new THREE.ConeGeometry(9.5, 3.8, 4);
    roofGeo.rotateY(Math.PI / 4);
    roofGeo.scale(1.15, 1.0, 0.85);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 8.8;
    roof.castShadow = true;
    group.add(roof);

    // White Big Barn Double Doors
    const doorGeo = new THREE.PlaneGeometry(4.5, 5);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 2.5, 4.52);
    group.add(door);

    // Grain Silo
    const siloGeo = new THREE.CylinderGeometry(2.2, 2.2, 10, 16);
    const siloMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });
    const silo = new THREE.Mesh(siloGeo, siloMat);
    silo.position.set(9.5, 5, 0);
    silo.castShadow = true;
    group.add(silo);

    const siloCapGeo = new THREE.SphereGeometry(2.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const siloCap = new THREE.Mesh(siloCapGeo, siloMat);
    siloCap.position.set(9.5, 10, 0);
    group.add(siloCap);

    return group;
  }

  public static createLighthouse(): { group: THREE.Group; beacon: THREE.SpotLight; lamp: THREE.Mesh } {
    const group = new THREE.Group();

    // 4 alternating red and white cylindrical sections
    const heights = [3.5, 3.5, 3.5, 3.5];
    const colors = [0xdc2626, 0xffffff, 0xdc2626, 0xffffff];
    let currentY = 0;

    for (let i = 0; i < 4; i++) {
      const rTop = 2.4 - i * 0.25;
      const rBottom = 2.65 - i * 0.25;
      const h = heights[i];
      const secGeo = new THREE.CylinderGeometry(rTop, rBottom, h, 16);
      const secMat = new THREE.MeshLambertMaterial({ color: colors[i] });
      const sec = new THREE.Mesh(secGeo, secMat);
      sec.position.y = currentY + h / 2;
      sec.castShadow = true;
      group.add(sec);
      currentY += h;
    }

    // Gallery catwalk
    const catGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.4, 16);
    const catMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const cat = new THREE.Mesh(catGeo, catMat);
    cat.position.y = currentY + 0.2;
    group.add(cat);

    // Glass lantern room
    const glassGeo = new THREE.CylinderGeometry(1.4, 1.4, 2.0, 12);
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = currentY + 1.2;
    group.add(glass);

    // Conical Roof
    const roofGeo = new THREE.ConeGeometry(1.6, 1.4, 16);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = currentY + 2.8;
    group.add(roof);

    // Rotating 3D Spotlight Beacon
    const beacon = new THREE.SpotLight(0xfef08a, 4.0, 160, Math.PI / 7, 0.35, 1.2);
    beacon.position.set(0, currentY + 1.2, 0);
    beacon.target.position.set(40, currentY + 1.2, 0);
    group.add(beacon);
    group.add(beacon.target);

    return { group, beacon, lamp: glass };
  }

  public static createPineTree(scale: number = 1.0): THREE.Group {
    const group = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35 * scale, 0.45 * scale, 2.2 * scale, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = (2.2 * scale) / 2;
    trunk.castShadow = true;
    group.add(trunk);

    // 3 tiered pine cones
    const needleMat = new THREE.MeshLambertMaterial({ color: 0x166534, flatShading: true });
    const tiers = [
      { r: 2.2 * scale, h: 2.5 * scale, y: 2.0 * scale },
      { r: 1.7 * scale, h: 2.2 * scale, y: 3.4 * scale },
      { r: 1.2 * scale, h: 1.8 * scale, y: 4.6 * scale },
    ];

    tiers.forEach((t) => {
      const coneGeo = new THREE.ConeGeometry(t.r, t.h, 7);
      const cone = new THREE.Mesh(coneGeo, needleMat);
      cone.position.y = t.y;
      cone.castShadow = true;
      group.add(cone);
    });

    return group;
  }

  public static createBirchTree(scale: number = 1.0): THREE.Group {
    const group = new THREE.Group();

    // White Birch Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.28 * scale, 0.35 * scale, 3.2 * scale, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = (3.2 * scale) / 2;
    trunk.castShadow = true;
    group.add(trunk);

    // Airy foliage spheres
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x4ade80, flatShading: true });
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6 * scale, 0), foliageMat);
    crown.position.y = 3.6 * scale;
    crown.castShadow = true;
    group.add(crown);

    return group;
  }

  public static createBoulder(scale: number = 1.0): THREE.Mesh {
    const geo = new THREE.DodecahedronGeometry(scale, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0x64748b, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(1.2, 0.85, 1.0);
    mesh.position.y = scale * 0.6;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  public static createHayBale(): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(1.1, 1.1, 1.8, 12);
    geo.rotateZ(Math.PI / 2);
    const mat = new THREE.MeshLambertMaterial({ color: 0xfacc15, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 1.1;
    mesh.castShadow = true;
    return mesh;
  }

  public static createFencePost(): THREE.Group {
    const group = new THREE.Group();
    const postGeo = new THREE.BoxGeometry(0.3, 1.4, 0.3);
    const railGeo = new THREE.BoxGeometry(5.0, 0.18, 0.12);
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x92400e });

    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.y = 0.7;
    group.add(post);

    const rail1 = new THREE.Mesh(railGeo, woodMat);
    rail1.position.set(2.5, 0.9, 0);
    group.add(rail1);

    const rail2 = new THREE.Mesh(railGeo, woodMat);
    rail2.position.set(2.5, 0.45, 0);
    group.add(rail2);

    return group;
  }

  public static createWoodenPier(): THREE.Group {
    const group = new THREE.Group();
    const plankMat = new THREE.MeshLambertMaterial({ color: 0x78350f });

    // Deck
    const deckGeo = new THREE.BoxGeometry(5, 0.4, 24);
    const deck = new THREE.Mesh(deckGeo, plankMat);
    deck.position.set(0, 0, 12);
    deck.receiveShadow = true;
    group.add(deck);

    // Support pillars into water
    const pillarGeo = new THREE.CylinderGeometry(0.25, 0.25, 4.0, 8);
    for (let z = 2; z <= 22; z += 5) {
      [-2.2, 2.2].forEach((x) => {
        const p = new THREE.Mesh(pillarGeo, plankMat);
        p.position.set(x, -1.8, z);
        group.add(p);
      });
    }

    return group;
  }

  public static createStuntRampMesh(w: number, h: number, l: number): THREE.Group {
    const group = new THREE.Group();

    // Wedge shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(l, h);
    shape.lineTo(l, 0);
    shape.closePath();

    const extrudeSettings = { depth: w, bevelEnabled: false };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.translate(-l / 2, 0, -w / 2);

    const mat = new THREE.MeshLambertMaterial({ color: 0xd97706, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Warning hazard stripes on sides
    const edgeGeo = new THREE.BoxGeometry(l * 0.95, 0.35, 0.1);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const edgeL = new THREE.Mesh(edgeGeo, edgeMat);
    edgeL.position.set(0, h * 0.45, -w / 2 - 0.05);
    edgeL.rotation.z = Math.atan2(h, l);
    group.add(edgeL);

    return group;
  }

  public static createBoostPadMesh(): THREE.Group {
    const group = new THREE.Group();
    const padGeo = new THREE.BoxGeometry(4.5, 0.15, 3.5);
    const padMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const pad = new THREE.Mesh(padGeo, padMat);
    group.add(pad);

    // Glowing Chevrons
    const chevGeo = new THREE.ConeGeometry(0.8, 1.4, 3);
    chevGeo.rotateX(-Math.PI / 2);
    const chevMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    for (let i = -1; i <= 1; i++) {
      const chev = new THREE.Mesh(chevGeo, chevMat);
      chev.position.set(i * 1.2, 0.12, 0);
      group.add(chev);
    }

    return group;
  }

  public static createCampfireMesh(): THREE.Group {
    const group = new THREE.Group();

    // Stone ring
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), stoneMat);
      s.position.set(Math.cos(a) * 0.9, 0.2, Math.sin(a) * 0.9);
      group.add(s);
    }

    // Wood logs
    const logMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const logGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.4, 6);
    logGeo.rotateZ(Math.PI / 4);
    const log1 = new THREE.Mesh(logGeo, logMat);
    log1.position.y = 0.25;
    group.add(log1);

    const log2 = new THREE.Mesh(logGeo, logMat);
    log2.rotation.y = Math.PI / 2;
    log2.position.y = 0.25;
    group.add(log2);

    // Glowing Flame mesh
    const flameGeo = new THREE.ConeGeometry(0.55, 1.2, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 0.8;
    flame.name = 'flame';
    group.add(flame);

    return group;
  }

  public static createAnimalMesh(type: 'cow' | 'sheep' | 'chicken'): THREE.Group {
    const group = new THREE.Group();

    if (type === 'cow') {
      // White & Black spotted cow
      const bodyGeo = new THREE.BoxGeometry(2.4, 1.4, 1.2);
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.3;
      body.castShadow = true;
      group.add(body);

      // Black patch
      const patch = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1.22), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
      patch.position.set(0.3, 1.3, 0);
      group.add(patch);

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.9), bodyMat);
      head.position.set(1.4, 1.8, 0);
      group.add(head);

      // Pink muzzle
      const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.8), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
      muzzle.position.set(1.85, 1.6, 0);
      group.add(muzzle);

      // 4 Legs
      const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
      const legMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      [
        [-0.8, 0.4, -0.4],
        [0.8, 0.4, -0.4],
        [-0.8, 0.4, 0.4],
        [0.8, 0.4, 0.4],
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        group.add(leg);
      });
    } else if (type === 'sheep') {
      // Fluffy white wool body
      const bodyGeo = new THREE.DodecahedronGeometry(1.1, 1);
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc, flatShading: true });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.1;
      body.castShadow = true;
      group.add(body);

      // Dark cute head
      const headMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), headMat);
      head.position.set(1.1, 1.3, 0);
      group.add(head);

      // 4 thin black legs
      const legMat = headMat;
      const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 6);
      [
        [-0.5, 0.35, -0.4],
        [0.5, 0.35, -0.4],
        [-0.5, 0.35, 0.4],
        [0.5, 0.35, 0.4],
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        group.add(leg);
      });
    } else {
      // Yellow cute chicken
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0xfacc15, flatShading: true });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), bodyMat);
      body.position.y = 0.5;
      group.add(body);

      // Orange beak & red comb
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), new THREE.MeshLambertMaterial({ color: 0xf97316 }));
      beak.rotateZ(-Math.PI / 2);
      beak.position.set(0.45, 0.55, 0);
      group.add(beak);

      const comb = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.08), new THREE.MeshLambertMaterial({ color: 0xef4444 }));
      comb.position.set(0.1, 0.85, 0);
      group.add(comb);
    }

    return group;
  }

  public static createStarMesh(): THREE.Group {
    const group = new THREE.Group();

    // 5-point 3D Star
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.0;
    const innerRadius = 0.45;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = { depth: 0.35, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 1 };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();

    const mat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8,
    });

    const starMesh = new THREE.Mesh(geo, mat);
    starMesh.name = 'starBody';
    group.add(starMesh);

    return group;
  }
}
