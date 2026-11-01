import * as THREE from 'three';
import { VehicleConfig } from '../types';
import { IslandTerrain } from '../world/terrain';

export interface VehicleInput {
  throttle: number; // -1 (reverse) to 1 (forward)
  steer: number;    // -1 (left) to 1 (right)
  jump: boolean;
  handbrake: boolean;
  action: boolean;  // Water / Nitro / Special
}

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

  // Trailer state for tractor
  public trailerPos: THREE.Vector3;
  public trailerYaw: number;

  constructor(config: VehicleConfig, startX: number = 0, startZ: number = 0) {
    this.config = config;
    const startY = IslandTerrain.getHeight(startX, startZ);
    this.position = new THREE.Vector3(startX, Math.max(startY, 0.5), startZ);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.steerAngle = 0;
    this.wheelRotation = 0;
    this.isGrounded = true;
    this.forwardSpeed = 0;
    this.suspensionY = 0;

    this.trailerPos = new THREE.Vector3(startX, startY, startZ - 3.2);
    this.trailerYaw = 0;
  }

  public update(dt: number, input: VehicleInput, turboMultiplier: number = 1.0) {
    const traits = this.config.traits;
    const isBoat = this.config.id === 'boat';
    const isRocket = this.config.id === 'rocket';

    // 1. Steering interpolation
    const targetSteer = input.steer * 0.45;
    this.steerAngle += (targetSteer - this.steerAngle) * Math.min(1.0, dt * 9.0);

    // 2. Heading vector
    const heading = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    // Calculate current forward speed
    this.forwardSpeed = this.velocity.dot(heading);

    // 3. Acceleration & Braking
    const maxSpeed = traits.maxSpeed * turboMultiplier;
    const accel = traits.accel * turboMultiplier;

    if (this.isGrounded || (isBoat && this.position.y <= 0.6)) {
      if (input.throttle > 0) {
        if (this.forwardSpeed < maxSpeed) {
          this.velocity.addScaledVector(heading, accel * input.throttle * dt);
        }
      } else if (input.throttle < 0) {
        if (this.forwardSpeed > -traits.reverseSpeed) {
          this.velocity.addScaledVector(heading, traits.decel * input.throttle * dt);
        }
      } else {
        // Natural rolling friction
        const friction = input.handbrake ? 0.88 : 0.95;
        this.velocity.x *= friction;
        this.velocity.z *= friction;
      }

      // Turning (only turns when moving forward or backwards)
      if (Math.abs(this.forwardSpeed) > 0.4) {
        const turnDir = this.forwardSpeed >= 0 ? 1 : -1;
        const turnRate = traits.turnSpeed * (1 - Math.min(0.65, Math.abs(this.forwardSpeed) / (maxSpeed * 1.6)));
        this.yaw -= this.steerAngle * turnRate * turnDir * dt;
      }
    } else {
      // In air: slight air drag & gyroscopic self-righting
      this.velocity.x *= 0.985;
      this.velocity.z *= 0.985;

      // Rocket hover thrusters in air!
      if (isRocket && input.jump) {
        this.velocity.y += 18.0 * dt; // Anti-gravity lift
      }
    }

    // 4. Lateral grip / drift cancellation
    const lateralSpeed = this.velocity.dot(right);
    const gripFactor = input.handbrake ? 0.72 : 0.12; // Handbrake enables fun drifting!
    this.velocity.addScaledVector(right, -lateralSpeed * (1.0 - gripFactor));

    // 5. Jump
    if (input.jump && this.isGrounded) {
      this.velocity.y = traits.jumpPower;
      this.isGrounded = false;
      this.suspensionY = 0.4;
    }

    // 6. Gravity & Buoyancy
    const gravity = isRocket ? 11.5 : 24.0;
    this.velocity.y -= gravity * dt;

    // Boat water buoyancy
    if (isBoat && this.position.y < 0.3) {
      const depth = 0.3 - this.position.y;
      this.velocity.y += depth * 55 * dt; // buoyant spring
      this.velocity.y *= 0.88; // water damping
      this.isGrounded = true;
    }

    // 7. Integrate position
    this.position.addScaledVector(this.velocity, dt);

    // 8. Ground Collision & Normal Alignment
    const groundY = IslandTerrain.getHeight(this.position.x, this.position.z);
    const groundNormal = IslandTerrain.getNormal(this.position.x, this.position.z);

    const vehicleBottom = isBoat ? Math.max(groundY, -0.2) : groundY;

    if (this.position.y <= vehicleBottom + 0.1) {
      this.position.y = vehicleBottom;
      this.velocity.y = Math.max(0, this.velocity.y);
      this.isGrounded = true;

      // Target pitch and roll from ground normal
      const forwardSlope = groundNormal.dot(heading);
      const rightSlope = groundNormal.dot(right);

      const targetPitch = -Math.asin(Math.max(-0.85, Math.min(0.85, forwardSlope)));
      const targetRoll = Math.asin(Math.max(-0.85, Math.min(0.85, rightSlope)));

      this.pitch += (targetPitch - this.pitch) * Math.min(1.0, dt * 12.0);
      this.roll += (targetRoll - this.roll) * Math.min(1.0, dt * 12.0);
      this.suspensionY *= 0.85;
    } else {
      this.isGrounded = false;
      // Self-righting toward zero pitch/roll in the air
      this.pitch += (0 - this.pitch) * Math.min(1.0, dt * 3.5);
      this.roll += (0 - this.roll) * Math.min(1.0, dt * 3.5);
    }

    // 9. Wheel rotation
    this.wheelRotation += (this.forwardSpeed / traits.wheelRadius) * dt;

    // 10. Update Trailer (if tractor)
    if (this.config.traits.special === 'trailer') {
      const hitchDistance = 2.8;
      const targetTrailerX = this.position.x - Math.sin(this.yaw) * hitchDistance;
      const targetTrailerZ = this.position.z - Math.cos(this.yaw) * hitchDistance;
      const targetTrailerY = IslandTerrain.getHeight(targetTrailerX, targetTrailerZ);

      this.trailerPos.x += (targetTrailerX - this.trailerPos.x) * Math.min(1.0, dt * 10.0);
      this.trailerPos.y += (targetTrailerY - this.trailerPos.y) * Math.min(1.0, dt * 10.0);
      this.trailerPos.z += (targetTrailerZ - this.trailerPos.z) * Math.min(1.0, dt * 10.0);

      this.trailerYaw += (this.yaw - this.trailerYaw) * Math.min(1.0, dt * 6.0);
    }
  }

  // Set vehicle position (for teleporting or respawning)
  public setPosition(x: number, z: number) {
    const y = IslandTerrain.getHeight(x, z);
    this.position.set(x, Math.max(y, 0.5), z);
    this.velocity.set(0, 0, 0);
    this.pitch = 0;
    this.roll = 0;
  }
}
