export type VehicleId = 'fire' | 'tractor' | 'jeep' | 'rocket' | 'boat';

export interface VehicleInput {
  throttle: number; // -1 (reverse) to 1 (forward)
  steer: number;    // -1 (left) to 1 (right)
  jump: boolean;
  handbrake: boolean;
  action: boolean;  // Water / Nitro / Special
}

export interface VehicleTraits {
  maxSpeed: number;
  reverseSpeed: number;
  accel: number;
  decel: number;
  turnSpeed: number;
  jumpPower: number;
  suspensionStiffness: number;
  mass: number;
  wheelRadius: number;
  special: 'water' | 'trailer' | 'nitro' | 'hover' | 'buoyancy';
  specialNameSv: string;
  specialNameEn: string;
  driftGrip?: number;
  suspensionDamping?: number;
  suspensionTravel?: number;
}

export interface VehicleConfig {
  id: VehicleId;
  nameSv: string;
  nameEn: string;
  emoji: string;
  bodyColor: string;
  accentColor: string;
  wheelColor: string;
  honkSound: 'siren' | 'quack' | 'horn' | 'boing';
  hornEmoji: string;
  descriptionSv: string;
  traits: VehicleTraits;
}

export interface GoldenStar {
  id: string;
  x: number;
  y: number;
  z: number;
  collected: boolean;
  nameSv: string;
  nameEn: string;
}

export interface CampfireTarget {
  id: string;
  x: number;
  y: number;
  z: number;
  extinguished: boolean;
}

export interface AnimalProp {
  id: string;
  type: 'cow' | 'sheep' | 'chicken';
  x: number;
  y: number;
  z: number;
  angle: number;
  targetX: number;
  targetZ: number;
  timer: number;
  jumpY: number;
  jumpVy: number;
  nameSv: string;
}

export interface BoostPad {
  id: string;
  x: number;
  y: number;
  z: number;
  angle: number;
}

export interface StuntRamp {
  id: string;
  x: number;
  y: number;
  z: number;
  angle: number;
  width: number;
  height: number;
  length: number;
}

export interface IslandMission {
  id: string;
  titleSv: string;
  titleEn: string;
  descriptionSv: string;
  descriptionEn: string;
  icon: string;
  completed: boolean;
  current: number;
  target: number;
}

export interface FloatingText3D {
  id: number;
  text: string;
  x: number;
  y: number;
  z: number;
  alpha: number;
  color: string;
  scale: number;
}
