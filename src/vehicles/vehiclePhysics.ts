import * as THREE from 'three';
import { VehicleConfig, VehicleInput } from '../types';
import { IslandTerrain } from '../world/terrain';

export type { VehicleInput };

export class VehiclePhysics {
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public yaw: number;
  public pitch: number;
  public roll: number;
  public steerAngle: number;
  public wheelRotation: number;
  public isGrounded: boolean;
  public forwardSpeed: number;
  public suspensionY: number;
  public config: VehicleConfig;

  // Trailer state for articulated towing (tractor hay cart)
  public trailerPos: THREE.Vector3;
  public trailerYaw: number;
  public trailerPitch: number;
  public trailerRoll: number;
  public trailerWheelRot: number;

  // Drift and dynamic handling telemetry
  public driftFactor: number;
  public lateralSlip: number;
  public suspensionCompression: number;

  // Internal kinematic tracking
  private prevForwardSpeed: number;
  private prevHitchPos: THREE.Vector3;
  private waveTimer: number;

  constructor(config: VehicleConfig, startX: number = 0, startZ: number = 0) {
    this.config = config;
    const startY = IslandTerrain.getHeight(startX, startZ);
    const initialY =
      config.id === 'boat'
        ? Math.max(startY, 0.25)
        : Math.max(startY, 0.5) + (config.traits.wheelRadius * 0.85);

    this.position = new THREE.Vector3(startX, initialY, startZ);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.steerAngle = 0;
    this.wheelRotation = 0;
    this.isGrounded = true;
    this.forwardSpeed = 0;
    this.suspensionY = 0;
    this.suspensionCompression = 0;
    this.driftFactor = 0;
    this.lateralSlip = 0;
    this.prevForwardSpeed = 0;
    this.waveTimer = 0;

    // Kinematic trailer setup (hitch offset: 1.95m rear, tongue length: 2.0m, wheel radius: 0.55m)
    const hitchOffset = 1.95;
    const tongueLength = 2.0;
    const trailerWheelRadius = 0.55;

    const hx = startX - Math.sin(0) * hitchOffset;
    const hz = startZ - Math.cos(0) * hitchOffset;
    const hy = IslandTerrain.getHeight(hx, hz) + 0.62;
    this.prevHitchPos = new THREE.Vector3(hx, hy, hz);

    const tx = hx - Math.sin(0) * tongueLength;
    const tz = hz - Math.cos(0) * tongueLength;
    const ty = IslandTerrain.getHeight(tx, tz) + trailerWheelRadius;
    this.trailerPos = new THREE.Vector3(tx, ty, tz);
    this.trailerYaw = 0;
    this.trailerPitch = 0;
    this.trailerRoll = 0;
    this.trailerWheelRot = 0;
  }

  public update(dt: number, input: VehicleInput, turboMultiplier: number = 1.0) {
    // Clamp delta time to avoid physics tunneling or instability on lag spikes
    const safeDt = Math.min(dt, 0.05);

    const traits = this.config.traits;
    const isBoat = this.config.id === 'boat';
    const isRocket = this.config.id === 'rocket';
    const isTractor = this.config.id === 'tractor';
    const isJeep = this.config.id === 'jeep';
    const isFire = this.config.id === 'fire';

    // 1. Heading and directional vectors
    const heading = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    // Forward speed (projection along heading)
    this.forwardSpeed = this.velocity.dot(heading);
    const maxSpeed = traits.maxSpeed * turboMultiplier;
    const speedRatio = Math.min(1.0, Math.abs(this.forwardSpeed) / Math.max(1.0, maxSpeed));

    // ----------------------------------------------------
    // 2. SPEED-SENSITIVE STEERING & PROGRESSIVE CENTERING
    // ----------------------------------------------------
    // At low speeds (crawling/parking), steer angle is large (~35-38 deg) for easy, tight turning.
    // At high speeds, steer angle smoothly tapers down (~18-22 deg) for natural stability.
    const lowSpeedLock = isTractor ? 0.65 : isJeep ? 0.62 : isFire ? 0.52 : 0.60;
    const highSpeedLock = isTractor ? 0.40 : isJeep ? 0.34 : isFire ? 0.28 : 0.32;
    const currentMaxSteer = THREE.MathUtils.lerp(lowSpeedLock, highSpeedLock, Math.pow(speedRatio, 0.8));

    const targetSteer = input.steer * currentMaxSteer;
    const isActivelySteering = Math.abs(input.steer) > 0.04;

    if (isActivelySteering) {
      // Responsive turn-in rate tailored per vehicle personality
      const steerResponse = isJeep ? 13.5 : isRocket ? 14.0 : isTractor ? 9.5 : isFire ? 8.5 : 11.0;
      this.steerAngle += (targetSteer - this.steerAngle) * Math.min(1.0, safeDt * steerResponse);
    } else {
      // Natural mechanical caster effect: steering straightens out progressively, faster at speed
      const baseCenterSpeed = isJeep ? 11.0 : isTractor ? 9.0 : isFire ? 8.5 : 10.0;
      const casterSpeed = baseCenterSpeed * (1.0 + Math.min(1.6, Math.abs(this.forwardSpeed) / (maxSpeed * 0.45)));
      this.steerAngle += (0 - this.steerAngle) * Math.min(1.0, safeDt * casterSpeed);
    }

    // ----------------------------------------------------
    // 3. YAW ROTATION / TURNING DYNAMICS
    // ----------------------------------------------------
    if (this.isGrounded || (isBoat && this.position.y <= 0.65)) {
      // Reverse steering logic: reversing steers in opposite direction
      const turnDir = this.forwardSpeed >= -0.2 ? 1 : -1;

      // Crawl assist: ensures a child never feels stuck when turning from a complete standstill
      const crawlAssist = Math.abs(input.throttle) > 0.05 ? 0.35 : 0.0;
      const speedFactor = Math.min(1.0, Math.max(crawlAssist, Math.abs(this.forwardSpeed) / 1.5));

      // High-speed yaw stabilization
      const highSpeedStability = 1.0 - speedRatio * 0.35;
      const turnRate = traits.turnSpeed * highSpeedStability;

      let yawDelta = this.steerAngle * turnRate * turnDir * speedFactor * safeDt;

      // Speedboat water yaw: turning produces a hydrodynamic stern slide
      if (isBoat) {
        yawDelta *= 1.08;
      }

      this.yaw -= yawDelta;
    }

    // ----------------------------------------------------
    // 4. ACCELERATION, ENGINE TORQUE & BRAKING
    // ----------------------------------------------------
    const baseAccel = traits.accel * turboMultiplier;
    // Tractor has high low-end torque bite to effortlessly pull heavy loads
    const torqueMult = isTractor && Math.abs(this.forwardSpeed) < maxSpeed * 0.5 ? 1.35 : 1.0;
    const accel = baseAccel * torqueMult;

    if (this.isGrounded || (isBoat && this.position.y <= 0.65)) {
      if (input.throttle > 0) {
        if (this.forwardSpeed < maxSpeed) {
          this.velocity.addScaledVector(heading, accel * input.throttle * safeDt);
        }
      } else if (input.throttle < 0) {
        if (this.forwardSpeed > -traits.reverseSpeed) {
          this.velocity.addScaledVector(heading, traits.decel * input.throttle * safeDt);
        }
      } else {
        // Natural rolling friction:
        // Fire truck coasts with heavy mass momentum; tractor slows down firmly from engine compression
        let coastFriction = 0.96;
        if (isFire) coastFriction = 0.975;
        else if (isTractor) coastFriction = 0.94;
        else if (isBoat) coastFriction = 0.95;

        if (input.handbrake) {
          coastFriction = isBoat ? 0.90 : 0.86;
        }

        const decay = Math.pow(coastFriction, safeDt * 60.0);
        this.velocity.x *= decay;
        this.velocity.z *= decay;
      }
    } else {
      // In air: aerodynamic drag
      const airDecay = Math.pow(0.985, safeDt * 60.0);
      this.velocity.x *= airDecay;
      this.velocity.z *= airDecay;

      // Rocket lunar hover thrusters in air
      if (isRocket && input.jump) {
        this.velocity.y += 20.0 * safeDt; // Anti-gravity thrust
      }
    }

    // ----------------------------------------------------
    // 5. DRIFT MECHANICS & SMOOTH TRACTION RECOVERY
    // ----------------------------------------------------
    const lateralSpeed = this.velocity.dot(right);
    this.lateralSlip = lateralSpeed;

    const isDrifting = input.handbrake && this.isGrounded && Math.abs(this.forwardSpeed) > 3.0;
    if (isDrifting) {
      // Smoothly engage drift
      this.driftFactor += (1.0 - this.driftFactor) * Math.min(1.0, safeDt * 8.0);

      // Oversteer yaw kick: handbrake slides the rear out when steering into a corner
      if (Math.abs(input.steer) > 0.08) {
        const driftKickRate = isJeep ? 2.3 : isBoat ? 2.5 : isTractor ? 0.9 : 1.6;
        const kickSpeedFactor = Math.min(1.0, Math.abs(this.forwardSpeed) / 7.0);
        this.yaw -= input.steer * driftKickRate * kickSpeedFactor * safeDt;
      }
    } else {
      // Progressive traction recovery: tires hook up gradually without abrupt snap
      const recoverySpeed = isTractor ? 6.5 : isJeep ? 4.5 : 5.0;
      this.driftFactor += (0.0 - this.driftFactor) * Math.min(1.0, safeDt * recoverySpeed);
    }

    // Lateral grip friction calculation
    const baseGrip = isTractor ? 0.96 : isFire ? 0.92 : isJeep ? 0.90 : isBoat ? 0.82 : 0.91;
    const minSlideGrip = isBoat ? 0.25 : isJeep ? 0.28 : isTractor ? 0.55 : 0.35;
    const currentGrip = THREE.MathUtils.lerp(baseGrip, minSlideGrip, this.driftFactor);

    // Apply lateral damping
    const lateralDamp = Math.min(1.0, safeDt * 24.0 * currentGrip);
    this.velocity.addScaledVector(right, -lateralSpeed * lateralDamp);

    // ----------------------------------------------------
    // 6. VERTICAL FORCES, JUMPS & BUOYANCY
    // ----------------------------------------------------
    // Jump
    if (input.jump && this.isGrounded) {
      this.velocity.y = traits.jumpPower;
      this.isGrounded = false;
      this.suspensionY = 0.35;
    }

    // Gravity: Moon Rover has low lunar gravity (11.5 m/s²), others have 24.0 m/s²
    const gravity = isRocket ? 11.5 : 24.0;
    this.velocity.y -= gravity * safeDt;

    // Boat water buoyancy spring & damping
    if (isBoat && this.position.y < 0.4) {
      const depth = 0.4 - this.position.y;
      this.velocity.y += depth * 60.0 * safeDt; // upward buoyant spring
      this.velocity.y *= Math.pow(0.85, safeDt * 60.0); // water vertical damping
      this.isGrounded = true;
    }

    // Integrate position
    this.position.x += this.velocity.x * safeDt;
    this.position.z += this.velocity.z * safeDt;
    this.position.y += this.velocity.y * safeDt;

    // ----------------------------------------------------
    // 7. MULTI-WHEEL SPRING-DAMPER SUSPENSION & TERRAIN
    // ----------------------------------------------------
    const halfL = 1.45;
    const halfW = 1.15;
    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);

    // 4 wheel contact points in world space
    const flX = this.position.x + sinY * halfL - cosY * halfW;
    const flZ = this.position.z + cosY * halfL + sinY * halfW;
    const hFL = IslandTerrain.getHeight(flX, flZ);

    const frX = this.position.x + sinY * halfL + cosY * halfW;
    const frZ = this.position.z + cosY * halfL - sinY * halfW;
    const hFR = IslandTerrain.getHeight(frX, frZ);

    const rlX = this.position.x - sinY * halfL - cosY * halfW;
    const rlZ = this.position.z - cosY * halfL + sinY * halfW;
    const hRL = IslandTerrain.getHeight(rlX, rlZ);

    const rrX = this.position.x - sinY * halfL + cosY * halfW;
    const rrZ = this.position.z - cosY * halfL - sinY * halfW;
    const hRR = IslandTerrain.getHeight(rrX, rrZ);

    const hCenter = IslandTerrain.getHeight(this.position.x, this.position.z);

    // Average axle & side elevations
    const frontH = (hFL + hFR) * 0.5;
    const rearH = (hRL + hRR) * 0.5;
    const leftH = (hFL + hRL) * 0.5;
    const rightH = (hFR + hRR) * 0.5;
    const avgGroundH = (frontH + rearH) * 0.5;

    // Desired ride height above terrain
    const wheelRad = traits.wheelRadius;
    const rideHeightOffset = isBoat ? 0.2 : wheelRad * 0.85;
    const targetGroundY = isBoat
      ? Math.max(avgGroundH, 0.15)
      : Math.max(avgGroundH, hCenter) + rideHeightOffset;

    // Hard ground contact threshold (prevents wheels submerging on steep slopes)
    const maxContactH = Math.max(hFL, hFR, hRL, hRR, hCenter);
    const hardGroundLimit = isBoat ? Math.max(maxContactH, 0.1) : maxContactH + wheelRad * 0.7;

    // Suspension travel window
    const suspensionTravel = isJeep ? 0.75 : isRocket ? 0.8 : 0.55;
    const distAboveTarget = this.position.y - targetGroundY;

    if (distAboveTarget <= suspensionTravel && this.position.y >= hardGroundLimit - 0.4) {
      this.isGrounded = true;

      // Spring compression (positive when compressed below target ride height)
      const compression = targetGroundY - this.position.y;
      this.suspensionCompression = compression;

      // Continuous spring-damper vertical dynamics (smooths bumps and eliminates triangle jitter)
      const springStiffness = traits.suspensionStiffness * 3.5;
      const dampingCoeff = isJeep ? 6.5 : isFire ? 8.5 : 7.0;

      const springForce = compression * springStiffness;
      const dampForce = -this.velocity.y * dampingCoeff;
      const netSuspensionAccel = springForce + dampForce;

      this.velocity.y += netSuspensionAccel * safeDt;

      // Ground safety barrier: softly push chassis up without instantaneous vertex snapping
      if (this.position.y < hardGroundLimit) {
        this.position.y += (hardGroundLimit - this.position.y) * Math.min(1.0, safeDt * 22.0);
        if (this.velocity.y < 0) this.velocity.y = 0;
      }

      // Visual suspension displacement for chassis bounce
      this.suspensionY += (-compression * 0.35 - this.suspensionY) * Math.min(1.0, safeDt * 14.0);
    } else {
      this.isGrounded = false;
      this.suspensionCompression = 0;
      this.suspensionY += (0 - this.suspensionY) * Math.min(1.0, safeDt * 8.0);
    }

    // ----------------------------------------------------
    // 8. PITCH & ROLL SMOOTHING + DYNAMIC BODY WEIGHT
    // ----------------------------------------------------
    // Terrain slope orientation
    const targetPitchSlope = -Math.atan2(frontH - rearH, halfL * 2.0);
    const targetRollSlope = Math.atan2(rightH - leftH, halfW * 2.0);

    // Dynamic pitch: acceleration squat and braking dive
    const forwardAccel = (this.forwardSpeed - this.prevForwardSpeed) / Math.max(0.001, safeDt);
    this.prevForwardSpeed = this.forwardSpeed;
    const dynamicPitch = THREE.MathUtils.clamp(-forwardAccel * 0.004, -0.15, 0.15);

    // Dynamic roll: boat planing banking / car centrifugal lean
    let dynamicRoll = 0;
    if (isBoat) {
      // Planing hull banking inward into turns
      dynamicRoll = -this.steerAngle * Math.min(1.0, Math.abs(this.forwardSpeed) / (maxSpeed * 0.5)) * 0.28;
      this.waveTimer += safeDt;
      dynamicRoll += Math.sin(this.waveTimer * 2.2) * 0.035; // gentle ocean wave roll
    } else {
      // Centrifugal chassis body lean
      const yawRateEst = this.steerAngle * traits.turnSpeed * (this.forwardSpeed / maxSpeed);
      dynamicRoll = THREE.MathUtils.clamp(-yawRateEst * 0.08, -0.12, 0.12);
    }

    if (this.isGrounded || (isBoat && this.position.y <= 0.65)) {
      const finalTargetPitch = targetPitchSlope + dynamicPitch;
      const finalTargetRoll = targetRollSlope + dynamicRoll;

      const alignSpeed = isJeep ? 13.0 : isFire ? 9.5 : 11.0;
      this.pitch += (finalTargetPitch - this.pitch) * Math.min(1.0, safeDt * alignSpeed);
      this.roll += (finalTargetRoll - this.roll) * Math.min(1.0, safeDt * alignSpeed);
    } else {
      // Self-righting in mid-air
      this.pitch += (0 - this.pitch) * Math.min(1.0, safeDt * 3.5);
      this.roll += (0 - this.roll) * Math.min(1.0, safeDt * 3.5);
    }

    // ----------------------------------------------------
    // 9. WHEEL ROTATION
    // ----------------------------------------------------
    this.wheelRotation += (this.forwardSpeed / traits.wheelRadius) * safeDt;

    // ----------------------------------------------------
    // 10. REALISTIC TRAILER KINEMATICS (HAY CART TOWING)
    // ----------------------------------------------------
    if (this.config.traits.special === 'trailer') {
      const hitchOffset = 1.95;        // Rear hitch distance from tractor chassis center
      const hitchHeightOffset = 0.62; // Hitch ball mount height
      const tongueLength = 2.0;       // Rigid drawbar tongue length to trailer axle
      const trailerWheelRadius = 0.55;

      // Current hitch world position
      const tractorFwdX = Math.sin(this.yaw);
      const tractorFwdZ = Math.cos(this.yaw);

      const hitchX = this.position.x - tractorFwdX * hitchOffset;
      const hitchZ = this.position.z - tractorFwdZ * hitchOffset;
      const hitchY = this.position.y + hitchHeightOffset + this.suspensionY;
      const currentHitchPos = new THREE.Vector3(hitchX, hitchY, hitchZ);

      // Hitch motion delta this frame
      const deltaHitchX = currentHitchPos.x - this.prevHitchPos.x;
      const deltaHitchZ = currentHitchPos.z - this.prevHitchPos.z;
      this.prevHitchPos.copy(currentHitchPos);

      // Trailer heading & normal vectors
      const uTx = Math.sin(this.trailerYaw);
      const uTz = Math.cos(this.trailerYaw);
      const nTx = Math.cos(this.trailerYaw);
      const nTz = -Math.sin(this.trailerYaw);

      // Lateral movement of hitch rotates trailer tongue about its axle (nonholonomic trailer kinematics)
      const lateralMove = deltaHitchX * nTx + deltaHitchZ * nTz;
      const deltaYaw = lateralMove / tongueLength;
      this.trailerYaw += deltaYaw;

      // Realistic jackknife limit: clamp relative trailer angle to +/- 75 degrees
      let relAngle = THREE.MathUtils.euclideanModulo(this.trailerYaw - this.yaw + Math.PI, Math.PI * 2) - Math.PI;
      const maxJackknife = 75 * (Math.PI / 180);
      if (relAngle > maxJackknife) {
        this.trailerYaw = this.yaw + maxJackknife;
      } else if (relAngle < -maxJackknife) {
        this.trailerYaw = this.yaw - maxJackknife;
      }

      // Constrain trailer axle rigidly behind hitch along drawbar heading
      const newUTx = Math.sin(this.trailerYaw);
      const newUTz = Math.cos(this.trailerYaw);
      const newAxleX = hitchX - newUTx * tongueLength;
      const newAxleZ = hitchZ - newUTz * tongueLength;

      // Calculate true trailer wheel spin based on axle travel
      const moveDistX = newAxleX - this.trailerPos.x;
      const moveDistZ = newAxleZ - this.trailerPos.z;
      const distMoved = Math.sqrt(moveDistX * moveDistX + moveDistZ * moveDistZ);
      const travelSign = moveDistX * newUTx + moveDistZ * newUTz >= 0 ? 1 : -1;
      this.trailerWheelRot += (distMoved * travelSign) / trailerWheelRadius;

      this.trailerPos.x = newAxleX;
      this.trailerPos.z = newAxleZ;

      // Multi-point ground elevation for trailer wheels
      const halfTrack = 1.15;
      const rightUTx = Math.cos(this.trailerYaw);
      const rightUTz = -Math.sin(this.trailerYaw);

      const twLx = this.trailerPos.x - rightUTx * halfTrack;
      const twLz = this.trailerPos.z - rightUTz * halfTrack;
      const hTwL = IslandTerrain.getHeight(twLx, twLz);

      const twRx = this.trailerPos.x + rightUTx * halfTrack;
      const twRz = this.trailerPos.z + rightUTz * halfTrack;
      const hTwR = IslandTerrain.getHeight(twRx, twRz);

      const hAxle = (hTwL + hTwR) * 0.5;
      const targetTrailerY = hAxle + trailerWheelRadius;

      // Trailer roll across left/right wheels
      const targetTrailerRoll = Math.atan2(hTwR - hTwL, halfTrack * 2.0);

      // Trailer pitch along the drawbar from hitch down to axle
      const targetTrailerPitch = -Math.atan2(hitchY - targetTrailerY, tongueLength);

      // Smooth terrain adaptation
      this.trailerPos.y += (targetTrailerY - this.trailerPos.y) * Math.min(1.0, safeDt * 16.0);
      this.trailerPitch += (targetTrailerPitch - this.trailerPitch) * Math.min(1.0, safeDt * 16.0);
      this.trailerRoll += (targetTrailerRoll - this.trailerRoll) * Math.min(1.0, safeDt * 16.0);
    }
  }

  // Set vehicle position (teleporting, mission checkpoints or respawn)
  public setPosition(x: number, z: number, yaw: number = 0) {
    const y = IslandTerrain.getHeight(x, z);
    const initialY =
      this.config.id === 'boat'
        ? Math.max(y, 0.25)
        : Math.max(y, 0.5) + (this.config.traits.wheelRadius * 0.85);

    this.position.set(x, initialY, z);
    this.velocity.set(0, 0, 0);
    this.yaw = yaw;
    this.pitch = 0;
    this.roll = 0;
    this.steerAngle = 0;
    this.forwardSpeed = 0;
    this.prevForwardSpeed = 0;
    this.suspensionY = 0;
    this.suspensionCompression = 0;
    this.driftFactor = 0;
    this.lateralSlip = 0;

    // Reset hitch and trailer kinematically behind vehicle
    const hitchOffset = 1.95;
    const tongueLength = 2.0;
    const trailerWheelRadius = 0.55;

    const hx = x - Math.sin(yaw) * hitchOffset;
    const hz = z - Math.cos(yaw) * hitchOffset;
    const hy = IslandTerrain.getHeight(hx, hz) + 0.62;
    this.prevHitchPos.set(hx, hy, hz);

    const tx = hx - Math.sin(yaw) * tongueLength;
    const tz = hz - Math.cos(yaw) * tongueLength;
    const ty = IslandTerrain.getHeight(tx, tz) + trailerWheelRadius;
    this.trailerPos.set(tx, ty, tz);
    this.trailerYaw = yaw;
    this.trailerPitch = 0;
    this.trailerRoll = 0;
    this.trailerWheelRot = 0;
  }
}
