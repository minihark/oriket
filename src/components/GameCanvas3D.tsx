import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { VehicleId, VehicleConfig, GoldenStar, CampfireTarget, AnimalProp, FloatingText3D } from '../types';
import { IslandTerrain } from '../world/terrain';
import { IslandWater } from '../world/water';
import { WorldBuilder, WorldObjects } from '../world/worldBuilder';
import { VehicleModelBuilder, VehicleModelInstance } from '../vehicles/vehicleModelBuilder';
import { VehiclePhysics, VehicleInput } from '../vehicles/vehiclePhysics';
import { sounds } from '../audio/soundEngine';

interface GameCanvas3DProps {
  currentVehicle: VehicleConfig;
  onStarCollected: (starId: string, totalCount: number) => void;
  starsCollected: Set<string>;
  inputState: VehicleInput;
  hornTrigger: number;
  onVehicleChangeRequest?: (id: VehicleId) => void;
  lang: 'sv' | 'en';
  onShowMessage: (text: string) => void;
}

export const GameCanvas3D: React.FC<GameCanvas3DProps> = ({
  currentVehicle,
  onStarCollected,
  starsCollected,
  inputState,
  hornTrigger,
  lang,
  onShowMessage,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // References to keep game loop and physics state synced without restarting Three.js
  const stateRef = useRef({
    currentVehicle,
    inputState,
    hornTrigger,
    starsCollected,
    physics: null as VehiclePhysics | null,
    vehicleModel: null as VehicleModelInstance | null,
    world: null as WorldObjects | null,
    water: null as IslandWater | null,
    turboTimer: 0,
    waterSprayTimer: 0,
    floatingTexts: [] as FloatingText3D[],
    nextTextId: 1,
    cameraAngle: 0,
    cameraPitch: 0.28,
  });

  // Keep props updated in ref
  useEffect(() => {
    stateRef.current.inputState = inputState;
  }, [inputState]);

  useEffect(() => {
    stateRef.current.starsCollected = starsCollected;
  }, [starsCollected]);

  // Handle Horn Trigger
  useEffect(() => {
    if (hornTrigger > 0) {
      const v = stateRef.current.currentVehicle;
      sounds.playHorn(v.honkSound);

      const state = stateRef.current;
      if (!state.physics || !state.world) return;

      // Special action on horn for Fire Truck: Spray water!
      if (v.traits.special === 'water') {
        state.waterSprayTimer = 1.4;
        sounds.playWaterSpray();
      } else if (v.traits.special === 'nitro') {
        state.turboTimer = 2.2;
        sounds.playTurbo();
      }

      // Animals jump and make cute sounds when honked at!
      const p = state.physics.position;
      state.world.animals.forEach((animal) => {
        const dx = animal.x - p.x;
        const dz = animal.z - p.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 22) {
          animal.jumpVy = 7.5;
          sounds.playAnimalSound(animal.type);
        }
      });
    }
  }, [hornTrigger]);

  // Main Three.js Setup & Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbe8fb); // Nordic sunlit sky
    scene.fog = new THREE.FogExp2(0xbbe8fb, 0.0035);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.5,
      800
    );

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    sunLight.position.set(80, 120, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    const shadowD = 90;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    scene.add(sunLight);

    // 4. Island Terrain & Ocean Water
    const terrainMesh = IslandTerrain.createMesh();
    scene.add(terrainMesh);

    const water = new IslandWater();
    scene.add(water.mesh);
    stateRef.current.water = water;

    // 5. World Objects (Barn, Houses, Lighthouse, Trees, Rocks, Ramps, Stars, Animals)
    const world = WorldBuilder.buildWorld();
    scene.add(world.group);
    stateRef.current.world = world;

    // 6. Active Vehicle
    let currentVId = currentVehicle.id;
    let physics = new VehiclePhysics(currentVehicle, 0, 0);
    let vehicleModel = VehicleModelBuilder.buildVehicle(currentVId);
    scene.add(vehicleModel.root);

    stateRef.current.physics = physics;
    stateRef.current.vehicleModel = vehicleModel;
    stateRef.current.currentVehicle = currentVehicle;

    // Start engine hum
    sounds.startEngine(currentVId);

    // 7. Particle Systems (Water spray, exhaust flames, tire dust)
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    interface ActiveParticle {
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      life: number;
      maxLife: number;
      type: 'water' | 'smoke' | 'flame' | 'sparkle';
    }
    const particles: ActiveParticle[] = [];

    const waterGeo = new THREE.DodecahedronGeometry(0.25, 0);
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const flameGeo = new THREE.DodecahedronGeometry(0.3, 0);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });

    const smokeGeo = new THREE.DodecahedronGeometry(0.35, 0);
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.65 });

    const spawnParticle = (
      pos: THREE.Vector3,
      vel: THREE.Vector3,
      type: 'water' | 'smoke' | 'flame' | 'sparkle',
      maxLife: number = 0.6
    ) => {
      const geo = type === 'water' ? waterGeo : type === 'flame' ? flameGeo : smokeGeo;
      const mat = type === 'water' ? waterMat : type === 'flame' ? flameMat : smokeMat;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      particleGroup.add(mesh);
      particles.push({ mesh, vel, life: 0, maxLife, type });
    };

    // Camera follow state
    const camTarget = new THREE.Vector3();
    const camIdealPos = new THREE.Vector3();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Touch / Mouse camera orbit drag
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const onPointerDown = (e: PointerEvent) => {
      // Don't drag if tapping UI controls (handled via touch controls)
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevPointerX;
      const dy = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      stateRef.current.cameraAngle -= dx * 0.006;
      stateRef.current.cameraPitch = Math.max(
        0.1,
        Math.min(0.85, stateRef.current.cameraPitch + dy * 0.004)
      );
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 8. Main 60fps Game Simulation Loop
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const state = stateRef.current;
      const phys = state.physics;
      const model = state.vehicleModel;
      const curWorld = state.world;

      if (phys && model && curWorld) {
        // Handle Turbo / Boost countdown
        if (state.turboTimer > 0) state.turboTimer -= dt;
        const turboMult = state.turboTimer > 0 ? 1.6 : 1.0;

        // Physics step
        phys.update(dt, state.inputState, turboMult);

        // Audio engine update
        const speedRatio = Math.abs(phys.forwardSpeed) / (phys.config.traits.maxSpeed * turboMult);
        sounds.updateEngine(speedRatio, Math.abs(state.inputState.throttle) > 0.1);

        // Sync 3D Vehicle Model with Physics state
        model.root.position.copy(phys.position);
        model.root.position.y += phys.suspensionY;
        model.root.rotation.set(0, 0, 0);
        model.root.rotateY(phys.yaw);
        model.root.rotateX(phys.pitch);
        model.root.rotateZ(phys.roll);

        // Steer front wheels & spin all wheels
        model.frontLeftWheel.rotation.y = phys.steerAngle;
        model.frontRightWheel.rotation.y = phys.steerAngle;
        model.wheels.forEach((w) => {
          w.rotation.x = phys.wheelRotation;
        });

        // Trailer sync (if tractor)
        if (model.trailer && phys.config.traits.special === 'trailer') {
          model.trailer.position.copy(phys.trailerPos);
          model.trailer.rotation.set(0, 0, 0);
          model.trailer.rotateY(phys.trailerYaw);
        }

        // Fire truck siren flashing animation
        if (model.sirenL && model.sirenR) {
          const blink = Math.floor(time * 0.008) % 2 === 0;
          (model.sirenL.material as THREE.MeshBasicMaterial).color.setHex(blink ? 0x3b82f6 : 0x1d4ed8);
          (model.sirenR.material as THREE.MeshBasicMaterial).color.setHex(!blink ? 0xef4444 : 0xb91c1c);
        }

        // Water Cannon Spray Particles
        if (state.waterSprayTimer > 0 && model.waterNozzle) {
          state.waterSprayTimer -= dt;
          const nozzleWorldPos = new THREE.Vector3();
          model.waterNozzle.getWorldPosition(nozzleWorldPos);

          const forwardDir = new THREE.Vector3(Math.sin(phys.yaw), 0.35, Math.cos(phys.yaw)).normalize();

          for (let i = 0; i < 2; i++) {
            const spread = new THREE.Vector3(
              (Math.random() - 0.5) * 2.5,
              Math.random() * 2.0,
              (Math.random() - 0.5) * 2.5
            );
            const pVel = forwardDir.clone().multiplyScalar(22).add(spread);
            spawnParticle(nozzleWorldPos, pVel, 'water', 0.8);
          }
        }

        // Nitro / Turbo flames
        if (state.turboTimer > 0 && model.exhaustL) {
          const exWorldPos = new THREE.Vector3();
          model.exhaustL.getWorldPosition(exWorldPos);
          const backDir = new THREE.Vector3(-Math.sin(phys.yaw), 0.1, -Math.cos(phys.yaw));
          spawnParticle(exWorldPos, backDir.multiplyScalar(8), 'flame', 0.25);
        }

        // Tire skid / smoke particles when moving fast or handbraking
        if (phys.isGrounded && Math.abs(phys.forwardSpeed) > 8 && Math.random() < 0.35) {
          const rearPos = phys.position.clone().add(new THREE.Vector3(0, 0.2, 0));
          spawnParticle(rearPos, new THREE.Vector3(0, 0.5, 0), 'smoke', 0.4);
        }

        // ----------------------------------------------------
        // GAMEPLAY CHECKS & INTERACTIONS
        // ----------------------------------------------------

        // 1. Checkpoint / Golden Stars Collection
        curWorld.stars.forEach((star) => {
          if (!star.collected && !state.starsCollected.has(star.id)) {
            const dx = phys.position.x - star.x;
            const dy = phys.position.y - star.y;
            const dz = phys.position.z - star.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < 3.2) {
              star.collected = true;
              state.starsCollected.add(star.id);

              sounds.playStarCollect(state.starsCollected.size);
              onStarCollected(star.id, state.starsCollected.size);
              onShowMessage(`⭐ ${star.nameSv}! (${state.starsCollected.size}/20)`);

              // Remove star mesh from scene
              const sMesh = curWorld.starMeshes.get(star.id);
              if (sMesh) sMesh.visible = false;
            }
          }
        });

        // 2. Rotate Golden Stars
        curWorld.starMeshes.forEach((mesh) => {
          mesh.rotation.y += dt * 2.2;
        });

        // 3. Rotate Lighthouse Spotlight
        if (curWorld.lighthouseBeacon) {
          const lightAngle = time * 0.0012;
          curWorld.lighthouseBeacon.target.position.set(
            65 + Math.cos(lightAngle) * 50,
            IslandTerrain.getHeight(65, 45) + 14,
            45 + Math.sin(lightAngle) * 50
          );
        }

        // 4. Speed Boost Pads Detection
        curWorld.boostPads.forEach((bp) => {
          const dx = phys.position.x - bp.x;
          const dz = phys.position.z - bp.z;
          if (Math.abs(dx) < 2.5 && Math.abs(dz) < 2.5 && phys.isGrounded) {
            if (state.turboTimer <= 0) {
              state.turboTimer = 2.4;
              sounds.playTurbo();
              onShowMessage('⚡ TURBO-BOOST!');
            }
          }
        });

        // 5. Extinguish Campfires with Buster's Water Cannon
        if (state.waterSprayTimer > 0) {
          curWorld.campfires.forEach((cf) => {
            if (!cf.extinguished) {
              const dx = phys.position.x - cf.x;
              const dz = phys.position.z - cf.z;
              const dist = Math.sqrt(dx * dx + dz * dz);
              if (dist < 12) {
                cf.extinguished = true;
                sounds.playExtinguish();
                onShowMessage('💦 SLÄCKTE LÄGERELDEN!');

                const cfMesh = curWorld.campfireMeshes.get(cf.id);
                if (cfMesh) {
                  const flame = cfMesh.getObjectByName('flame');
                  const light = cfMesh.getObjectByName('fireLight');
                  if (flame) flame.visible = false;
                  if (light) light.visible = false;
                }
              }
            }
          });
        }

        // 6. Animals Grazing & Reacting
        curWorld.animals.forEach((animal) => {
          animal.timer += dt;
          if (animal.timer > 3.0 + Math.random() * 4.0) {
            animal.timer = 0;
            animal.targetX = animal.x + (Math.random() - 0.5) * 5;
            animal.targetZ = animal.z + (Math.random() - 0.5) * 5;
            animal.angle = Math.atan2(animal.targetX - animal.x, animal.targetZ - animal.z);
          }

          // Move gently towards target
          animal.x += (animal.targetX - animal.x) * dt * 0.4;
          animal.z += (animal.targetZ - animal.z) * dt * 0.4;
          const groundY = IslandTerrain.getHeight(animal.x, animal.z);

          if (animal.jumpY > 0 || animal.jumpVy !== 0) {
            animal.jumpVy -= 20 * dt;
            animal.jumpY += animal.jumpVy * dt;
            if (animal.jumpY <= 0) {
              animal.jumpY = 0;
              animal.jumpVy = 0;
            }
          }

          const aMesh = curWorld.animalMeshes.get(animal.id);
          if (aMesh) {
            aMesh.position.set(animal.x, groundY + animal.jumpY, animal.z);
            aMesh.rotation.y = animal.angle;
          }
        });

        // ----------------------------------------------------
        // CAMERA CHASE FOLLOW
        // ----------------------------------------------------
        const camDistance = 8.8 + Math.min(6.0, Math.abs(phys.forwardSpeed) * 0.25);
        const camHeight = 3.6 + state.cameraPitch * 5.0;

        // Dynamic angle combining vehicle yaw + manual swipe orbit
        const totalAngle = phys.yaw + state.cameraAngle;

        camIdealPos.set(
          phys.position.x - Math.sin(totalAngle) * camDistance,
          phys.position.y + camHeight,
          phys.position.z - Math.cos(totalAngle) * camDistance
        );

        camera.position.lerp(camIdealPos, Math.min(1.0, dt * 6.5));

        camTarget.set(phys.position.x, phys.position.y + 1.2, phys.position.z);
        camera.lookAt(camTarget);

        // Sun light follows vehicle shadow area
        sunLight.position.set(phys.position.x + 50, 80, phys.position.z + 40);
        sunLight.target.position.copy(phys.position);
      }

      // 7. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.mesh.position.addScaledVector(p.vel, dt);
        p.life += dt;
        const progress = p.life / p.maxLife;

        if (p.type === 'water') {
          p.vel.y -= 14 * dt; // gravity on water
        } else if (p.type === 'smoke') {
          p.vel.y += 1.5 * dt; // smoke rises
          const scale = 1.0 + progress * 2.0;
          p.mesh.scale.set(scale, scale, scale);
        }

        if (p.life >= p.maxLife) {
          particleGroup.remove(p.mesh);
          particles.splice(i, 1);
        }
      }

      // Update ocean waves
      if (state.water) {
        state.water.update(time * 0.001);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      sounds.stopEngine();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentVehicle.id]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden"
    />
  );
};
