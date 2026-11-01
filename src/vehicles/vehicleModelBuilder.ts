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
  trailerWheels?: THREE.Group[];
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

  // =========================================================================
  // 1. BRANDBILEN BUSTER (Fire Truck)
  // =========================================================================
  private static buildFireTruck(): VehicleModelInstance {
    const root = new THREE.Group();

    // Red Main Body
    const bodyGeo = new THREE.BoxGeometry(2.2, 1.35, 4.4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.15;
    body.castShadow = true;
    body.receiveShadow = true;
    root.add(body);

    // Clean white cab band
    const cabGeo = new THREE.BoxGeometry(2.24, 0.95, 1.9);
    const cabMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0, 1.9, 0.8);
    cab.castShadow = true;
    root.add(cab);

    // Front Silver Bumper
    const bumperGeo = new THREE.BoxGeometry(2.35, 0.35, 0.35);
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const bumper = new THREE.Mesh(bumperGeo, chromeMat);
    bumper.position.set(0, 0.65, 2.3);
    root.add(bumper);

    // Radiator Grille
    const grilleGeo = new THREE.BoxGeometry(1.4, 0.55, 0.08);
    const grilleMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const grille = new THREE.Mesh(grilleGeo, grilleMat);
    grille.position.set(0, 1.05, 2.22);
    root.add(grille);

    // Windshield (Sky Blue Glass)
    const glassGeo = new THREE.BoxGeometry(2.0, 0.75, 0.08);
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 1.95, 1.76);
    root.add(glass);

    // Buster's Friendly Big Eyes
    const eyeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 12).rotateX(Math.PI / 2);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    [-0.55, 0.55].forEach((ex) => {
      const eyeW = new THREE.Mesh(eyeGeo, eyeWhiteMat);
      eyeW.position.set(ex, 1.95, 1.78);
      root.add(eyeW);

      const eyeB = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 12).rotateX(Math.PI / 2), eyeBlackMat);
      eyeB.position.set(ex + 0.03, 1.95, 1.8);
      root.add(eyeB);
    });

    // Dual Emergency Sirens on Chrome Risers
    const sirenGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.3, 10);
    const sirenBlueMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const sirenRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const sirenL = new THREE.Mesh(sirenGeo, sirenBlueMat);
    sirenL.position.set(-0.65, 2.5, 0.8);
    root.add(sirenL);

    const sirenR = new THREE.Mesh(sirenGeo, sirenRedMat);
    sirenR.position.set(0.65, 2.5, 0.8);
    root.add(sirenR);

    // Water Cannon Turret on Roof
    const turretGeo = new THREE.CylinderGeometry(0.38, 0.45, 0.35, 12);
    const turretMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const turret = new THREE.Mesh(turretGeo, turretMat);
    turret.position.set(0, 2.45, -0.6);
    root.add(turret);

    const nozzleGeo = new THREE.CylinderGeometry(0.1, 0.16, 1.1, 10).rotateX(Math.PI / 2.7);
    const nozzleMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(0, 2.75, -0.35);
    root.add(nozzle);

    const waterNozzle = new THREE.Object3D();
    waterNozzle.position.set(0, 2.95, 0.3);
    root.add(waterNozzle);

    // Emergency Rescue Ladder on Roof
    const ladderGroup = new THREE.Group();
    const ladderSideGeo = new THREE.BoxGeometry(0.08, 0.08, 2.6);
    const ladderMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });

    const lRail1 = new THREE.Mesh(ladderSideGeo, ladderMat);
    lRail1.position.x = -0.3;
    ladderGroup.add(lRail1);

    const lRail2 = new THREE.Mesh(ladderSideGeo, ladderMat);
    lRail2.position.x = 0.3;
    ladderGroup.add(lRail2);

    const rungGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6).rotateZ(Math.PI / 2);
    for (let r = -1.1; r <= 1.1; r += 0.35) {
      const rung = new THREE.Mesh(rungGeo, ladderMat);
      rung.position.set(0, 0, r);
      ladderGroup.add(rung);
    }
    ladderGroup.position.set(0.7, 2.45, -0.8);
    root.add(ladderGroup);

    // Side Equipment Lockers (Silver slats)
    const lockerGeo = new THREE.BoxGeometry(0.08, 0.8, 1.8);
    const lockerMat = new THREE.MeshLambertMaterial({ color: 0xcfd8dc });
    const lockerL = new THREE.Mesh(lockerGeo, lockerMat);
    lockerL.position.set(-1.12, 1.1, -0.9);
    root.add(lockerL);

    const lockerR = new THREE.Mesh(lockerGeo, lockerMat);
    lockerR.position.set(1.12, 1.1, -0.9);
    root.add(lockerR);

    // Headlights
    const { hlL, hlR } = VehicleModelBuilder.createHeadlights(root, 2.22);

    // Heavy Emergency Wheels
    const { fl, fr, rl, rr, all } = VehicleModelBuilder.createWheels(root, 0.65, 1.25, 1.45, 0x1e293b, 0xdc2626);

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

  // =========================================================================
  // 2. TRAKTORN TURE & HÖVAGN (Tractor & Hay Trailer)
  // =========================================================================
  private static buildTractor(): VehicleModelInstance {
    const root = new THREE.Group();

    // Chassis frame
    const chassisGeo = new THREE.BoxGeometry(1.4, 0.4, 3.2);
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const chassis = new THREE.Mesh(chassisGeo, darkMat);
    chassis.position.set(0, 0.6, 0);
    root.add(chassis);

    // Pine Green Engine Hood
    const hoodGeo = new THREE.BoxGeometry(1.5, 1.15, 2.1);
    const greenMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
    const hood = new THREE.Mesh(hoodGeo, greenMat);
    hood.position.set(0, 1.15, 0.85);
    hood.castShadow = true;
    root.add(hood);

    // Yellow accent stripe on hood
    const stripeGeo = new THREE.BoxGeometry(1.52, 0.12, 2.12);
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const stripe = new THREE.Mesh(stripeGeo, yellowMat);
    stripe.position.set(0, 1.2, 0.85);
    root.add(stripe);

    // Front Radiator Grille
    const grilleGeo = new THREE.BoxGeometry(1.3, 0.85, 0.1);
    const grilleMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const grille = new THREE.Mesh(grilleGeo, grilleMat);
    grille.position.set(0, 1.15, 1.91);
    root.add(grille);

    // Classic Chrome Round Headlights on hood sides
    const lampGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.15, 12).rotateX(Math.PI / 2);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });

    [-0.65, 0.65].forEach((hx) => {
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12).rotateX(Math.PI / 2), chromeMat);
      rim.position.set(hx, 1.1, 1.88);
      root.add(rim);

      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(hx, 1.1, 1.92);
      root.add(lamp);
    });

    const hl = new THREE.SpotLight(0xfef08a, 2.8, 48, Math.PI / 5, 0.4, 1.0);
    hl.position.set(0, 1.1, 1.95);
    hl.target.position.set(0, 0, 26);
    root.add(hl);
    root.add(hl.target);

    // Vertical Diesel Exhaust Stack with flapper lid
    const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 10);
    const pipeMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.position.set(0.65, 2.15, 1.25);
    root.add(pipe);

    const flapperGeo = new THREE.BoxGeometry(0.24, 0.04, 0.24);
    const flapper = new THREE.Mesh(flapperGeo, pipeMat);
    flapper.position.set(0.65, 2.92, 1.25);
    flapper.rotation.z = 0.2;
    root.add(flapper);

    const exhaustL = new THREE.Object3D();
    exhaustL.position.set(0.65, 2.95, 1.25);
    root.add(exhaustL);

    // Open Cabin ROPS Safety Arch
    const ropsArchGeo = new THREE.BoxGeometry(1.65, 0.12, 0.12);
    const ropsPostGeo = new THREE.BoxGeometry(0.12, 1.6, 0.12);
    const ropsMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    const postL = new THREE.Mesh(ropsPostGeo, ropsMat);
    postL.position.set(-0.8, 1.9, -0.6);
    root.add(postL);

    const postR = new THREE.Mesh(ropsPostGeo, ropsMat);
    postR.position.set(0.8, 1.9, -0.6);
    root.add(postR);

    const arch = new THREE.Mesh(ropsArchGeo, ropsMat);
    arch.position.set(0, 2.7, -0.6);
    root.add(arch);

    // Weather visor roof
    const visorGeo = new THREE.BoxGeometry(1.75, 0.08, 1.1);
    const visor = new THREE.Mesh(visorGeo, greenMat);
    visor.position.set(0, 2.74, -0.3);
    root.add(visor);

    // Vintage Tractor Pan Seat (Cognac Brown)
    const seatGeo = new THREE.BoxGeometry(0.7, 0.18, 0.65);
    const seatMat = new THREE.MeshLambertMaterial({ color: 0x9a3412 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 1.1, -0.65);
    root.add(seat);

    const seatBackGeo = new THREE.BoxGeometry(0.7, 0.5, 0.12);
    const seatBack = new THREE.Mesh(seatBackGeo, seatMat);
    seatBack.position.set(0, 1.4, -0.95);
    root.add(seatBack);

    // 3-Spoke Steering Wheel
    const colGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6).rotateX(-Math.PI / 4);
    const col = new THREE.Mesh(colGeo, darkMat);
    col.position.set(0, 1.35, -0.15);
    root.add(col);

    const wheelGeo = new THREE.TorusGeometry(0.3, 0.04, 6, 16);
    wheelGeo.rotateX(Math.PI / 3);
    const wheelMesh = new THREE.Mesh(wheelGeo, darkMat);
    wheelMesh.position.set(0, 1.6, -0.35);
    root.add(wheelMesh);

    // Massive Green Rear Fenders / Mudguards
    const fenderGeo = new THREE.BoxGeometry(0.45, 1.1, 1.6);
    [-1.25, 1.25].forEach((fx) => {
      const fen = new THREE.Mesh(fenderGeo, greenMat);
      fen.position.set(fx, 1.35, -0.85);
      fen.castShadow = true;
      root.add(fen);
    });

    // Rear Tow Hitch with Chrome Ball Coupling
    const hitchDrawbar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.6), darkMat);
    hitchDrawbar.position.set(0, 0.55, -1.7);
    root.add(hitchDrawbar);

    const hitchBall = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), chromeMat);
    hitchBall.position.set(0, 0.62, -1.95);
    root.add(hitchBall);

    // Tactile Tractor Wheels: Smaller ribbed front, huge chevron-lug rear
    const fl = VehicleModelBuilder.createDetailedWheel(0.55, 0.4, 0x1e293b, 0xf59e0b, false);
    fl.position.set(-1.05, 0.55, 1.2);
    root.add(fl);

    const fr = VehicleModelBuilder.createDetailedWheel(0.55, 0.4, 0x1e293b, 0xf59e0b, false);
    fr.position.set(1.05, 0.55, 1.2);
    root.add(fr);

    const rl = VehicleModelBuilder.createDetailedWheel(0.98, 0.65, 0x1e293b, 0xf59e0b, true);
    rl.position.set(-1.22, 0.98, -0.85);
    root.add(rl);

    const rr = VehicleModelBuilder.createDetailedWheel(0.98, 0.65, 0x1e293b, 0xf59e0b, true);
    rr.position.set(1.22, 0.98, -0.85);
    root.add(rr);

    // Build the Hay Trailer as a completely independent group (NOT added to root!)
    const { trailer, trailerWheels } = VehicleModelBuilder.buildTrailer();

    return {
      root,
      wheels: [fl, fr, rl, rr],
      frontLeftWheel: fl,
      frontRightWheel: fr,
      rearLeftWheel: rl,
      rearRightWheel: rr,
      headlightL: hl,
      headlightR: hl,
      trailer,
      trailerWheels,
      exhaustL,
    };
  }

  // Independent Nordic Wooden Hay Trailer
  private static buildTrailer(): { trailer: THREE.Group; trailerWheels: THREE.Group[] } {
    const trailer = new THREE.Group();
    // Origin of trailer group is the trailer axle center!

    const darkSteelMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const woodBedMat = new THREE.MeshLambertMaterial({ color: 0x92400e }); // Golden oak plank
    const woodSlatMat = new THREE.MeshLambertMaterial({ color: 0xb45309 }); // Side slats
    const hayMat = new THREE.MeshLambertMaterial({ color: 0xfacc15, flatShading: true });
    const twineMat = new THREE.MeshLambertMaterial({ color: 0x78350f });

    // 1. Long Steel Drawbar Tongue reaching forward to hitch ball (~1.9m)
    const tongueGeo = new THREE.BoxGeometry(0.12, 0.12, 2.0);
    const tongue = new THREE.Mesh(tongueGeo, darkSteelMat);
    tongue.position.set(0, 0, 1.0);
    trailer.add(tongue);

    // Hitch Coupler Ring at front of tongue
    const couplerGeo = new THREE.TorusGeometry(0.12, 0.04, 6, 12).rotateX(Math.PI / 2);
    const coupler = new THREE.Mesh(couplerGeo, darkSteelMat);
    coupler.position.set(0, 0, 2.0);
    trailer.add(coupler);

    // 2. Chassis Bed Subframe
    const subframeGeo = new THREE.BoxGeometry(1.9, 0.15, 2.6);
    const subframe = new THREE.Mesh(subframeGeo, darkSteelMat);
    subframe.position.set(0, 0.1, 0);
    trailer.add(subframe);

    // 3. Wooden Bed Floor
    const bedGeo = new THREE.BoxGeometry(2.1, 0.12, 2.7);
    const bed = new THREE.Mesh(bedGeo, woodBedMat);
    bed.position.set(0, 0.22, 0);
    bed.castShadow = true;
    bed.receiveShadow = true;
    trailer.add(bed);

    // 4. Wooden Side Stake Rails (Vertical posts + horizontal slats)
    const postGeo = new THREE.BoxGeometry(0.08, 0.8, 0.08);
    const slatLongGeo = new THREE.BoxGeometry(0.05, 0.15, 2.7);
    const slatShortGeo = new THREE.BoxGeometry(2.1, 0.15, 0.05);

    // Corner & middle posts
    const postPositions = [
      [-1.02, 0.6, -1.3],
      [-1.02, 0.6, 0],
      [-1.02, 0.6, 1.3],
      [1.02, 0.6, -1.3],
      [1.02, 0.6, 0],
      [1.02, 0.6, 1.3],
    ];
    postPositions.forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(postGeo, woodSlatMat);
      post.position.set(px, py, pz);
      trailer.add(post);
    });

    // Horizontal wooden slats (2 rows per side)
    [0.45, 0.8].forEach((sy) => {
      // Left side
      const sL = new THREE.Mesh(slatLongGeo, woodSlatMat);
      sL.position.set(-1.04, sy, 0);
      trailer.add(sL);

      // Right side
      const sR = new THREE.Mesh(slatLongGeo, woodSlatMat);
      sR.position.set(1.04, sy, 0);
      trailer.add(sR);

      // Front headboard
      const sF = new THREE.Mesh(slatShortGeo, woodSlatMat);
      sF.position.set(0, sy, 1.32);
      trailer.add(sF);
    });

    // 5. Four Tactile Golden Hay Bales with twine ties
    const hayBaleGeo = new THREE.BoxGeometry(0.85, 0.55, 1.15);
    const twineXGeo = new THREE.BoxGeometry(0.87, 0.03, 0.03);

    const balePositions = [
      [-0.45, 0.55, -0.6],
      [0.45, 0.55, -0.6],
      [-0.45, 0.55, 0.55],
      [0.45, 0.55, 0.55],
      [0, 1.08, -0.1], // Top crowned fifth bale!
    ];

    balePositions.forEach(([bx, by, bz]) => {
      const bale = new THREE.Mesh(hayBaleGeo, hayMat);
      bale.position.set(bx, by, bz);
      bale.castShadow = true;
      trailer.add(bale);

      // Twine strapping ties
      [-0.25, 0.25].forEach((tz) => {
        const twX = new THREE.Mesh(twineXGeo, twineMat);
        twX.position.set(bx, by + 0.28, bz + tz);
        trailer.add(twX);
      });
    });

    // 6. Rear Red Safety Reflectors
    const refGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.04, 10).rotateX(Math.PI / 2);
    const refMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    [-0.85, 0.85].forEach((rx) => {
      const reflector = new THREE.Mesh(refGeo, refMat);
      reflector.position.set(rx, 0.45, -1.36);
      trailer.add(reflector);
    });

    // 7. Trailer Wheels on Heavy Axle
    const twL = VehicleModelBuilder.createDetailedWheel(0.55, 0.4, 0x1e293b, 0xf59e0b, false);
    twL.position.set(-1.18, 0, 0);
    trailer.add(twL);

    const twR = VehicleModelBuilder.createDetailedWheel(0.55, 0.4, 0x1e293b, 0xf59e0b, false);
    twR.position.set(1.18, 0, 0);
    trailer.add(twR);

    return { trailer, trailerWheels: [twL, twR] };
  }

  // =========================================================================
  // 3. ÄVENTYRS-JEEPEN JACK (Adventure Jeep)
  // =========================================================================
  private static buildJeep(): VehicleModelInstance {
    const root = new THREE.Group();

    // Aggressive Trail Orange Body
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.95, 3.8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.05;
    body.castShadow = true;
    root.add(body);

    // Matte Black Flared Wheel Arches
    const fenderMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const fenFGeo = new THREE.BoxGeometry(2.35, 0.35, 1.2);
    const fenF = new THREE.Mesh(fenFGeo, fenderMat);
    fenF.position.set(0, 0.95, 1.25);
    root.add(fenF);

    const fenRGeo = new THREE.BoxGeometry(2.35, 0.35, 1.3);
    const fenR = new THREE.Mesh(fenRGeo, fenderMat);
    fenR.position.set(0, 0.95, -1.25);
    root.add(fenR);

    // Front Steel Bull-Bar with Winch
    const bumperGeo = new THREE.BoxGeometry(2.3, 0.3, 0.35);
    const steelMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const bumper = new THREE.Mesh(bumperGeo, steelMat);
    bumper.position.set(0, 0.7, 2.05);
    root.add(bumper);

    const winchGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 10).rotateZ(Math.PI / 2);
    const winch = new THREE.Mesh(winchGeo, steelMat);
    winch.position.set(0, 0.85, 2.15);
    root.add(winch);

    // Tubular Roll Cage & Roof Rack
    const cageGeo = new THREE.BoxGeometry(1.9, 1.15, 2.1);
    const cageMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    cage.position.set(0, 1.85, -0.2);
    cage.castShadow = true;
    root.add(cage);

    // Windshield
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.8, 0.08), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }));
    glass.position.set(0, 1.85, 0.86);
    root.add(glass);

    // Roof Safari Expedition Basket
    const rackGeo = new THREE.BoxGeometry(1.75, 0.2, 1.8);
    const rackMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0, 2.5, -0.2);
    root.add(rack);

    // Mounted Spare Mud Tire on Roof Rack
    const spareTire = VehicleModelBuilder.createDetailedWheel(0.55, 0.38, 0x0f172a, 0xf59e0b, true);
    spareTire.rotation.x = Math.PI / 2;
    spareTire.position.set(-0.25, 2.75, -0.3);
    root.add(spareTire);

    // Dual Expedition Jerry Cans (NATO Red & Olive Green)
    const canGeo = new THREE.BoxGeometry(0.3, 0.45, 0.25);
    const canRed = new THREE.Mesh(canGeo, new THREE.MeshLambertMaterial({ color: 0xdc2626 }));
    canRed.position.set(0.6, 2.75, -0.1);
    root.add(canRed);

    const canGreen = new THREE.Mesh(canGeo, new THREE.MeshLambertMaterial({ color: 0x4d7c0f }));
    canGreen.position.set(0.6, 2.75, -0.45);
    root.add(canGreen);

    // Quad Safari Spotlights across roof visor
    const spotGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 10).rotateX(Math.PI / 2);
    const spotMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-0.6, -0.2, 0.2, 0.6].forEach((sx) => {
      const spot = new THREE.Mesh(spotGeo, spotMat);
      spot.position.set(sx, 2.55, 0.75);
      root.add(spot);
    });

    // Twin Nitro Chrome Exhausts at rear
    const exhaustL = new THREE.Object3D();
    exhaustL.position.set(-0.6, 0.7, -2.0);
    root.add(exhaustL);

    const exhaustR = new THREE.Object3D();
    exhaustR.position.set(0.6, 0.7, -2.0);
    root.add(exhaustR);

    // Headlights
    const { hlL, hlR } = VehicleModelBuilder.createHeadlights(root, 1.95);

    // Huge All-Terrain Knobby Wheels
    const { fl, fr, rl, rr, all } = VehicleModelBuilder.createWheels(root, 0.72, 1.25, 1.35, 0x0f172a, 0xf59e0b, true);

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

  // =========================================================================
  // 4. MÅNROVERN NOVA (Moon Rover)
  // =========================================================================
  private static buildMoonRover(): VehicleModelInstance {
    const root = new THREE.Group();

    // Futuristic Cyan Pod Body
    const podGeo = new THREE.DodecahedronGeometry(1.35, 1);
    const podMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4 });
    const pod = new THREE.Mesh(podGeo, podMat);
    pod.scale.set(1.0, 0.8, 1.55);
    pod.position.y = 1.15;
    pod.castShadow = true;
    root.add(pod);

    // Glowing Dome Cockpit (Amethyst Glass)
    const domeGeo = new THREE.SphereGeometry(0.88, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.85 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, 1.55, 0.2);
    root.add(dome);

    // Articulated Satellite Comms Dish at rear mast
    const mastGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6);
    const mastMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 1.95, -1.1);
    root.add(mast);

    const dishGeo = new THREE.CylinderGeometry(0.4, 0.05, 0.12, 12).rotateX(Math.PI / 4);
    const dishMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 2.4, -1.2);
    root.add(dish);

    // Dual Rear Ion Thruster Rings
    const ringGeo = new THREE.TorusGeometry(0.35, 0.12, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    [-0.45, 0.45].forEach((rx) => {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(rx, 1.15, -1.65);
      root.add(ring);
    });

    const exhaustL = new THREE.Object3D();
    exhaustL.position.set(-0.45, 1.15, -1.75);
    root.add(exhaustL);

    const exhaustR = new THREE.Object3D();
    exhaustR.position.set(0.45, 1.15, -1.75);
    root.add(exhaustR);

    // Headlights
    const { hlL, hlR } = VehicleModelBuilder.createHeadlights(root, 1.65);

    // Purple Glowing Tech Wheels
    const { fl, fr, rl, rr, all } = VehicleModelBuilder.createWheels(root, 0.65, 1.2, 1.25, 0x3b0764, 0x8b5cf6, false);

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

  // =========================================================================
  // 5. SPEEDBÅTEN SALLY (Sally the Speedboat)
  // =========================================================================
  private static buildSpeedboat(): VehicleModelInstance {
    const root = new THREE.Group();

    // V-shaped Marine Blue Hull
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-1.25, -2.1);
    hullShape.lineTo(1.25, -2.1);
    hullShape.lineTo(1.15, 1.0);
    hullShape.lineTo(0, 2.5); // Pointed bow
    hullShape.lineTo(-1.15, 1.0);
    hullShape.closePath();

    const extrudeSettings = { depth: 0.95, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.1 };
    const hullGeo = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    hullGeo.rotateX(Math.PI / 2);
    hullGeo.center();

    const hullMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0.6;
    hull.castShadow = true;
    root.add(hull);

    // Scandinavian Mahogany Wood Deck
    const deckGeo = new THREE.BoxGeometry(1.7, 0.2, 2.3);
    const deckMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 1.02, -0.4);
    root.add(deck);

    // Foredeck Wood Bow Cover
    const bowDeckGeo = new THREE.BoxGeometry(1.6, 0.2, 1.4);
    const bowDeck = new THREE.Mesh(bowDeckGeo, deckMat);
    bowDeck.position.set(0, 1.02, 1.1);
    root.add(bowDeck);

    // Twin Cream Leather Bucket Seats
    const seatMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7 });
    const seatGeo = new THREE.BoxGeometry(0.55, 0.5, 0.5);
    [-0.45, 0.45].forEach((sx) => {
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.set(sx, 1.25, -0.3);
      root.add(seat);
    });

    // Tinted Marine Windshield with Chrome Frame
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.55, 0.08), new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
    glass.position.set(0, 1.28, 0.65);
    glass.rotation.x = -0.35;
    root.add(glass);

    // Dual Outboard V6 Motors at stern
    const motorMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const propMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    [-0.55, 0.55].forEach((mx) => {
      const motor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.55), motorMat);
      motor.position.set(mx, 0.75, -2.2);
      root.add(motor);

      // Propeller hub
      const prop = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 6).rotateX(Math.PI / 2), propMat);
      prop.position.set(mx, 0.4, -2.5);
      root.add(prop);
    });

    const exhaustL = new THREE.Object3D();
    exhaustL.position.set(-0.55, 0.35, -2.4);
    root.add(exhaustL);

    const exhaustR = new THREE.Object3D();
    exhaustR.position.set(0.55, 0.35, -2.4);
    root.add(exhaustR);

    // Headlights
    const { hlL, hlR } = VehicleModelBuilder.createHeadlights(root, 2.3);

    // Hidden wheels under hull for smooth roll on beach/ramps
    const { fl, fr, rl, rr, all } = VehicleModelBuilder.createWheels(root, 0.45, 1.0, 1.4, 0x1e293b, 0x1d4ed8);
    all.forEach((w) => (w.visible = false));

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

  // =========================================================================
  // REUSABLE BUILDER HELPERS
  // =========================================================================

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

  // Helper to create detailed wheel with tire tread and rim bolts
  public static createDetailedWheel(
    r: number,
    width: number,
    tireColor: number = 0x1e293b,
    rimColor: number = 0xf59e0b,
    hasLugs: boolean = false
  ): THREE.Group {
    const group = new THREE.Group();

    // Tire cylinder
    const tireGeo = new THREE.CylinderGeometry(r, r, width, 18);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshLambertMaterial({ color: tireColor, flatShading: true });
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    group.add(tire);

    // Rim
    const rimGeo = new THREE.CylinderGeometry(r * 0.58, r * 0.58, width * 1.04, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMat = new THREE.MeshLambertMaterial({ color: rimColor, flatShading: true });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    group.add(rim);

    // Center Hubcap nut
    const nutGeo = new THREE.CylinderGeometry(r * 0.22, r * 0.22, width * 1.12, 6);
    nutGeo.rotateZ(Math.PI / 2);
    const nutMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const nut = new THREE.Mesh(nutGeo, nutMat);
    group.add(nut);

    // Tractor / Mud lugs if requested
    if (hasLugs) {
      const lugCount = 10;
      const lugGeo = new THREE.BoxGeometry(width * 0.85, r * 0.18, r * 0.2);
      const lugMat = new THREE.MeshLambertMaterial({ color: tireColor, flatShading: true });
      for (let i = 0; i < lugCount; i++) {
        const angle = (i / lugCount) * Math.PI * 2;
        const lug = new THREE.Mesh(lugGeo, lugMat);
        lug.position.set(0, Math.sin(angle) * (r * 0.95), Math.cos(angle) * (r * 0.95));
        lug.rotation.x = -angle;
        group.add(lug);
      }
    }

    return group;
  }

  // Helper to create 4 standard wheels
  private static createWheels(
    root: THREE.Group,
    r: number,
    halfW: number,
    halfL: number,
    tireCol: number,
    rimCol: number = 0xf8fafc,
    hasLugs: boolean = false
  ) {
    const fl = VehicleModelBuilder.createDetailedWheel(r, 0.45, tireCol, rimCol, hasLugs);
    fl.position.set(-halfW, r, halfL);
    root.add(fl);

    const fr = VehicleModelBuilder.createDetailedWheel(r, 0.45, tireCol, rimCol, hasLugs);
    fr.position.set(halfW, r, halfL);
    root.add(fr);

    const rl = VehicleModelBuilder.createDetailedWheel(r, 0.45, tireCol, rimCol, hasLugs);
    rl.position.set(-halfW, r, -halfL);
    root.add(rl);

    const rr = VehicleModelBuilder.createDetailedWheel(r, 0.45, tireCol, rimCol, hasLugs);
    rr.position.set(halfW, r, -halfL);
    root.add(rr);

    return { fl, fr, rl, rr, all: [fl, fr, rl, rr] };
  }
}
