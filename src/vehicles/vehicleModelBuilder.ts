import * as THREE from 'three';
import { VehicleId } from '../types';

export interface VehicleModelInstance {
  root: THREE.Group;
  wheels: THREE.Group[];
  frontLeftWheel: THREE.Group;
  frontRightWheel: THREE.Group;
  rearLeftWheel: THREE.Group;
  rearRightWheel: THREE.Group;
  headlightL: THREE.SpotLight;
  headlightR: THREE.SpotLight;
  sirenL?: THREE.Mesh;
  sirenR?: THREE.Mesh;
  trailer?: THREE.Group;
  waterNozzle?: THREE.Object3D;
  exhaustL?: THREE.Object3D;
  exhaustR?: THREE.Object3D;
}

export class VehicleModelBuilder {
  public static buildVehicle(id: VehicleId): VehicleModelInstance {
    switch (id) {
      case 'fire':
        return VehicleModelBuilder.buildFireTruck();
      case 'tractor':
        return VehicleModelBuilder.buildTractor();
      case 'jeep':
        return VehicleModelBuilder.buildJeep();
      case 'rocket':
        return VehicleModelBuilder.buildMoonRover();
      case 'boat':
        return VehicleModelBuilder.buildSpeedboat();
    }
  }

  // 1. BRANDBILEN BUSTER
  private static buildFireTruck(): VehicleModelInstance {
    const root = new THREE.Group();

    // Red Box Body
    const bodyGeo = new THREE.BoxGeometry(2.2, 1.4, 4.4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    body.castShadow = true;
    body.receiveShadow = true;
    root.add(body);

    // White cabin stripe
    const cabGeo = new THREE.BoxGeometry(2.22, 0.9, 1.8);
    const cabMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.85, 0.8);
    cab.castShadow = true;
    root.add(cab);

    // Windshield (Light blue)
    const glassGeo = new THREE.BoxGeometry(2.0, 0.7, 0.1);
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 1.9, 1.72);
    root.add(glass);

    // Cute Googly Eyes
    const eyeGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12);
    eyeGeo.rotateX(Math.PI / 2);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    [-0.55, 0.55].forEach((ex) => {
      const eyeW = new THREE.Mesh(eyeGeo, eyeWhiteMat);
      eyeW.position.set(ex, 1.9, 1.74);
      root.add(eyeW);

      const eyeB = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12).rotateX(Math.PI / 2), eyeBlackMat);
      eyeB.position.set(ex + 0.04, 1.9, 1.76);
      root.add(eyeB);
    });

    // Dual Roof Sirens
    const sirenGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.35, 8);
    const sirenBlueMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const sirenRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const sirenL = new THREE.Mesh(sirenGeo, sirenBlueMat);
    sirenL.position.set(-0.6, 2.45, 0.8);
    root.add(sirenL);

    const sirenR = new THREE.Mesh(sirenGeo, sirenRedMat);
    sirenR.position.set(0.6, 2.45, 0.8);
    root.add(sirenR);

    // Water Cannon Turret on Roof
    const turretGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.4, 8);
    const turretMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const turret = new THREE.Mesh(turretGeo, turretMat);
    turret.position.set(0, 2.5, -0.6);
    root.add(turret);

    const nozzleGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.9, 8);
    nozzleGeo.rotateX(Math.PI / 2.8);
    const nozzle = new THREE.Mesh(nozzleGeo, turretMat);
    nozzle.position.set(0, 2.7, -0.4);
    root.add(nozzle);

    const waterNozzle = new THREE.Object3D();
    waterNozzle.position.set(0, 2.9, 0.2);
    root.add(waterNozzle);

    // Headlights
    const { hlL, hlR } = VehicleModelBuilder.createHeadlights(root, 2.2);

    // Wheels
    const { fl, fr, rl, rr, all } = VehicleModelBuilder.createWheels(root, 0.65, 1.25, 1.45, 0x1e293b);

    return {
      root,
      wheels: all,
      frontLeftWheel: fl,
      frontRightWheel: fr,
      rearLeftWheel: rl,
      rearRightWheel: rr,
      headlightL: hlL,
      headlightR: hlR,
      sirenL,
      sirenR,
      waterNozzle,
    };
  }

  // 2. TRAKTORN TURE
  private static buildTractor(): VehicleModelInstance {
    const root = new THREE.Group();

    // Green Engine Hood
    const hoodGeo = new THREE.BoxGeometry(1.6, 1.2, 2.2);
    const hoodMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(0, 1.1, 0.8);
    hood.castShadow = true;
    root.add(hood);

    // Cabin
    const cabGeo = new THREE.BoxGeometry(1.8, 1.6, 1.4);
    const cab = new THREE.Mesh(cabGeo, hoodMat);
    cab.position.set(0, 1.9, -0.7);
    cab.castShadow = true;
    root.add(cab);

    // Windshield & Cute Eyes
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.1), new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
    glass.position.set(0, 2.0, 0.02);
    root.add(glass);

    // Vertical Diesel Exhaust Pipe
    const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.6, 8);
    const pipeMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.set(0.65, 2.1, 1.2);
    root.add(pipe);

    const exhaustL = new THREE.Object3D();
    exhaustL.position.set(0.65, 2.9, 1.2);
    root.add(exhaustL);

    // Headlights
    const { hlL, hlR } = VehicleModelBuilder.createHeadlights(root, 1.9);

    // Large Tractor Wheels (Rear wheels are huge, front are smaller)
    const fl = VehicleModelBuilder.createWheel(0.55, 0x334155, 0xf59e0b);
    fl.position.set(-1.05, 0.55, 1.2);
    root.add(fl);

    const fr = VehicleModelBuilder.createWheel(0.55, 0x334155, 0xf59e0b);
    fr.position.set(1.05, 0.55, 1.2);
    root.add(fr);

    const rl = VehicleModelBuilder.createWheel(0.95, 0x334155, 0xf59e0b);
    rl.position.set(-1.15, 0.95, -0.9);
    root.add(rl);

    const rr = VehicleModelBuilder.createWheel(0.95, 0x334155, 0xf59e0b);
    rr.position.set(1.15, 0.95, -0.9);
    root.add(rr);

    // Trailing Hay Cart
    const trailer = new THREE.Group();
    trailer.position.set(0, 0.8, -3.2);

    // Hitch Bar
    const hitch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6).rotateX(Math.PI / 2), pipeMat);
    hitch.position.set(0, 0, 0.9);
    trailer.add(hitch);

    // Wooden cart bed
    const cartGeo = new THREE.BoxGeometry(2.0, 0.8, 2.4);
    const cartMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.castShadow = true;
    trailer.add(cart);

    // Yellow Hay Bales inside trailer
    const hayGeo = new THREE.BoxGeometry(1.6, 0.9, 2.0);
    const hayMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
    const hay = new THREE.Mesh(hayGeo, hayMat);
    hay.position.y = 0.6;
    trailer.add(hay);

    // Trailer Wheels
    const twL = VehicleModelBuilder.createWheel(0.5, 0x334155, 0x92400e);
    twL.position.set(-1.15, 0, 0);
    trailer.add(twL);

    const twR = VehicleModelBuilder.createWheel(0.5, 0x334155, 0x92400e);
    twR.position.set(1.15, 0, 0);
    trailer.add(twR);

    root.add(trailer);

    return {
      root,
      wheels: [fl, fr, rl, rr],
      frontLeftWheel: fl,
      frontRightWheel: fr,
      rearLeftWheel: rl,
      rearRightWheel: rr,
      headlightL: hlL,
      headlightR: hlR,
      trailer,
      exhaustL,
    };
  }

  // 3. ÄVENTYRS-JEEPEN JACK
  private static buildJeep(): VehicleModelInstance {
    const root = new THREE.Group();

    // Orange Sport Chassis
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.9, 3.8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    root.add(body);

    // Black Roll Cage / Roof
    const cageGeo = new THREE.BoxGeometry(1.9, 1.1, 1.8);
    const cageMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    cage.position.set(0, 1.8, -0.3);
    cage.castShadow = true;
    root.add(cage);

    // Windshield
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.75, 0.1), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }));
    glass.position.set(0, 1.8, 0.62);
    root.add(glass);

    // Twin Nitro Exhausts at rear
    const exhaustL = new THREE.Object3D();
    exhaustL.position.set(-0.6, 0.7, -1.95);
    root.add(exhaustL);

    const exhaustR = new THREE.Object3D();
    exhaustR.position.set(0.6, 0.7, -1.95);
    root.add(exhaustR);

    // Headlights
    const { hlL, hlR } = VehicleModelBuilder.createHeadlights(root, 1.95);

    // Big All-Terrain Wheels
    const { fl, fr, rl, rr, all } = VehicleModelBuilder.createWheels(root, 0.7, 1.25, 1.35, 0x0f172a);

    return {
      root,
      wheels: all,
      frontLeftWheel: fl,
      frontRightWheel: fr,
      rearLeftWheel: rl,
      rearRightWheel: rr,
      headlightL: hlL,
      headlightR: hlR,
      exhaustL,
      exhaustR,
    };
  }

  // 4. MÅNROVERN NOVA
  private static buildMoonRover(): VehicleModelInstance {
    const root = new THREE.Group();

    // Futuristic Cyan Pod Body
    const podGeo = new THREE.DodecahedronGeometry(1.3, 1);
    const podMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4 });
    const pod = new THREE.Mesh(podGeo, podMat);
    pod.scale.set(1.0, 0.8, 1.5);
    pod.position.y = 1.1;
    pod.castShadow = true;
    root.add(pod);

    // Glowing Dome Cockpit
    const domeGeo = new THREE.SphereGeometry(0.85, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.85 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, 1.5, 0.2);
    root.add(dome);

    // Rear Ion Thruster Rings
    const ringGeo = new THREE.TorusGeometry(0.35, 0.12, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 1.1, -1.6);
    root.add(ring);

    const exhaustL = new THREE.Object3D();
    exhaustL.position.set(0, 1.1, -1.7);
    root.add(exhaustL);

    // Headlights
    const { hlL, hlR } = VehicleModelBuilder.createHeadlights(root, 1.6);

    // Purple Glowing Tech Wheels
    const { fl, fr, rl, rr, all } = VehicleModelBuilder.createWheels(root, 0.65, 1.2, 1.25, 0x581c87);

    return {
      root,
      wheels: all,
      frontLeftWheel: fl,
      frontRightWheel: fr,
      rearLeftWheel: rl,
      rearRightWheel: rr,
      headlightL: hlL,
      headlightR: hlR,
      exhaustL,
    };
  }

  // 5. SPEEDBÅTEN SALLY
  private static buildSpeedboat(): VehicleModelInstance {
    const root = new THREE.Group();

    // V-shaped Boat Hull
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-1.2, -2.0);
    hullShape.lineTo(1.2, -2.0);
    hullShape.lineTo(1.1, 1.0);
    hullShape.lineTo(0, 2.4); // pointed bow
    hullShape.lineTo(-1.1, 1.0);
    hullShape.closePath();

    const extrudeSettings = { depth: 0.9, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.1 };
    const hullGeo = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    hullGeo.rotateX(Math.PI / 2);
    hullGeo.center();

    const hullMat = new THREE.MeshLambertMaterial({ color: 0x2563eb });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0.55;
    hull.castShadow = true;
    root.add(hull);

    // Red racing stripe deck
    const deckGeo = new THREE.BoxGeometry(1.6, 0.25, 2.2);
    const deckMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 0.95, -0.4);
    root.add(deck);

    // Tinted Windshield
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.1), new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
    glass.position.set(0, 1.2, 0.6);
    glass.rotation.x = -0.3;
    root.add(glass);

    // Outboard Motor at stern
    const motorGeo = new THREE.BoxGeometry(0.5, 0.9, 0.6);
    const motorMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.set(0, 0.7, -2.1);
    root.add(motor);

    const exhaustL = new THREE.Object3D();
    exhaustL.position.set(0, 0.3, -2.2);
    root.add(exhaustL);

    // Headlights
    const { hlL, hlR } = VehicleModelBuilder.createHeadlights(root, 2.2);

    // Hidden wheels under hull so boat drives smoothly on water and beach ramps
    const { fl, fr, rl, rr, all } = VehicleModelBuilder.createWheels(root, 0.45, 1.0, 1.4, 0x1e293b);
    all.forEach((w) => (w.visible = false)); // Boat wheels are tucked under hull

    return {
      root,
      wheels: all,
      frontLeftWheel: fl,
      frontRightWheel: fr,
      rearLeftWheel: rl,
      rearRightWheel: rr,
      headlightL: hlL,
      headlightR: hlR,
      exhaustL,
    };
  }

  // Helper to create headlights
  private static createHeadlights(root: THREE.Group, frontZ: number) {
    const lampGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12).rotateX(Math.PI / 2);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const lampL = new THREE.Mesh(lampGeo, lampMat);
    lampL.position.set(-0.7, 0.9, frontZ);
    root.add(lampL);

    const lampR = new THREE.Mesh(lampGeo, lampMat);
    lampR.position.set(0.7, 0.9, frontZ);
    root.add(lampR);

    // Single unified forward spotlight for 60fps mobile efficiency
    const hl = new THREE.SpotLight(0xfef08a, 2.8, 48, Math.PI / 5, 0.4, 1.0);
    hl.position.set(0, 0.9, frontZ);
    hl.target.position.set(0, 0, frontZ + 25);
    root.add(hl);
    root.add(hl.target);

    return { hlL: hl, hlR: hl };
  }

  // Helper to create single wheel group
  private static createWheel(r: number, tireColor: number = 0x1e293b, hubColor: number = 0xf8fafc): THREE.Group {
    const group = new THREE.Group();

    // Tire
    const tireGeo = new THREE.CylinderGeometry(r, r, 0.45, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshLambertMaterial({ color: tireColor, flatShading: true });
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    group.add(tire);

    // Hubcap
    const hubGeo = new THREE.CylinderGeometry(r * 0.5, r * 0.5, 0.48, 8);
    hubGeo.rotateZ(Math.PI / 2);
    const hubMat = new THREE.MeshLambertMaterial({ color: hubColor });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    group.add(hub);

    return group;
  }

  // Helper to create 4 standard wheels
  private static createWheels(root: THREE.Group, r: number, halfW: number, halfL: number, tireCol: number) {
    const fl = VehicleModelBuilder.createWheel(r, tireCol);
    fl.position.set(-halfW, r, halfL);
    root.add(fl);

    const fr = VehicleModelBuilder.createWheel(r, tireCol);
    fr.position.set(halfW, r, halfL);
    root.add(fr);

    const rl = VehicleModelBuilder.createWheel(r, tireCol);
    rl.position.set(-halfW, r, -halfL);
    root.add(rl);

    const rr = VehicleModelBuilder.createWheel(r, tireCol);
    rr.position.set(halfW, r, -halfL);
    root.add(rr);

    return { fl, fr, rl, rr, all: [fl, fr, rl, rr] };
  }
}
