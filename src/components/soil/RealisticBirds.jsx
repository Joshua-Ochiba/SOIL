import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

/**
 * RealisticBirds — cohesive boids flock rendered with real dove models.
 *
 * MOTION: a weighted-steering boids model tuned to read like Vanta BIRDS but
 * as one cohesive organism rather than scattered agents — large perception
 * radius, cohesion-dominant weights, a small separation radius, and a weak
 * global pull to the live centroid. Velocity is LERPed toward the steering
 * target so turns flow (large-scale, wave-like) instead of darting.
 *
 * ORIENTATION: derived from a pitch-clamped flight vector (stays level, never
 * vertical → no lookAt flips), with gentle turn-rate banking, slerped each
 * frame for stable, animal-like flight. See the constants block for tuning.
 *
 * Decorative → aria-hidden; honors prefers-reduced-motion (damped, not frozen).
 */

const MODELS = ['/models/Parrot.glb'];   // compact-bodied → reads as a dove

// ── Flock constants ─────────────────────────────────────────────────────────
const BOUNDS      = 800;
const BOUNDS_HALF = BOUNDS / 2;
const SPEED_LIMIT = 3.5;
const POS_FACTOR  = 15;
const PREY_RADIUS = 150;
const PREY_RADIUS_SQ = PREY_RADIUS * PREY_RADIUS;
const PI_2           = Math.PI * 2;

// ── Cohesive boids tuning ────────────────────────────────────────────────────
// The verbatim Vanta port used a 60-unit perception zone, which is tiny in this
// scene's ~±260 roam box — so birds rarely saw each other and the flock split
// into scattered agents. We switch to a weighted-steering boids model with a
// large perception radius so the whole flock behaves as one organism:
//   - big PERCEPTION → each bird reacts to most of the flock (alignment/cohesion)
//   - small SEP_RADIUS → birds tolerate flying close; only push when crowded
//   - cohesion-dominant weights → the group compresses/expands, never sprays apart
//   - weak GLOBAL pull to the live flock centroid → keeps it from drifting apart
//   - velocity is LERPed toward the steering target → smooth, flowing turns
const PERCEPTION    = 120;                     // LOCAL neighbourhood (not the whole
const PERCEPTION_SQ = PERCEPTION * PERCEPTION;  //   box) → a flock, not one blob
const SEP_RADIUS    = 74;                       // keep comfortable spacing
const SEP_W         = 1.2;                      // separation (distance-weighted, not
                                                //   normalized) → real anti-stacking
const ALI_W         = 1.3;                      // alignment weight
const COH_W         = 1.1;                      // cohesion — groups without collapsing
const GLOBAL_W      = 0.05;                     // very weak centroid pull (anti-drift)
const FLEE_W        = 3.0;                      // cursor/predator scatter strength
const STEER_LERP    = 1.5;                      // velocity.lerp(target, delta·this)
const MAX_TURN_RATE = 3.0;                      // rad/s — birds can't pivot their
                                                //   travel direction instantly, so
                                                //   they never move tail-first

const FORWARD_OFFSET = Math.PI / 2;  // native model nose = +X → map to lookAt −Z
const TINT           = '#b5985a';    // muted antique gold — sits in the dark earth
                                     // palette, echoes #D9A036 without glowing
const Z_CLAMP        = 235;           // keep big 3D birds in front of the z=350 cam

// ── Flight stabilization (realistic orientation) ────────────────────────────
// Real birds stay fairly level and only lean gently into turns. We derive the
// model's facing from a PITCH-CLAMPED flight vector (so it never approaches
// vertical, which is what made the up-locked lookAt flip birds upside-down /
// sideways), add a small turn-rate-driven bank, and SLERP toward that target
// each frame instead of snapping — that smoothing is the "flight stabilization".
const MAX_PITCH = 0.26;   // rad (~15°) — never points steeply up/down
const MAX_BANK  = 0.48;   // rad (~27°) — gentle lean into turns, never knife-edge
const BANK_GAIN = 7.0;    // per-frame heading change → bank amount
const TURN_LERP = 0.2;    // orientation slerp factor — high enough that birds turn
                          // to FACE their heading before it visibly reverses
const HEADING_MIN_SPEED = 0.6;  // below this horizontal speed (steep climb/dive)
                                // the heading is noise → HOLD the last yaw so the
                                // mesh never snaps 180° tail-first during surges
const BANK_LERP = 0.07;   // bank smoothing

function Flock({ count, targetSize }) {
    const prefersReducedMotion = useReducedMotion();
    const gltfs = MODELS.map((m) => useGLTF(m));
    const { camera, gl, size } = useThree();

    const pointerFrac = useRef(new THREE.Vector2(0, 0));
    const pointerActive = useRef(false);
    useEffect(() => {
        const onMove = (e) => {
            const r = gl.domElement.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
                pointerActive.current = false;
                return;
            }
            pointerFrac.current.set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
            pointerActive.current = true;
        };
        const onLeave = () => { pointerActive.current = false; };
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mouseout', onLeave, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseout', onLeave);
        };
    }, [gl]);

    // Correction: lookAt aligns local −Z to flight; rotate so the model's
    // native +X nose ends up pointing where −Z does.
    const correction = useMemo(
        () => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, FORWARD_OFFSET, 0)),
        [],
    );

    const birds = useMemo(() => {
        const tmpBox = new THREE.Box3();
        const tmpSize = new THREE.Vector3();

        return Array.from({ length: count }, (_, i) => {
            const gltf = gltfs[i % gltfs.length];
            const scene = cloneSkeleton(gltf.scene);

            tmpBox.setFromObject(scene);
            tmpBox.getSize(tmpSize);
            const maxDim = Math.max(tmpSize.x, tmpSize.y, tmpSize.z) || 1;
            scene.scale.setScalar(targetSize / maxDim);

            // Per-bird golden tint with a SUBTLE hue/brightness jitter so the flock
            // isn't a flat uniform colour — but it stays tightly within the gold
            // family so no bird ever reads as an out-of-place stray colour.
            const tint = new THREE.Color(TINT);
            const hsl = {}; tint.getHSL(hsl);
            tint.setHSL(
                hsl.h + (Math.random() - 0.5) * 0.04,                          // ±0.02 hue
                THREE.MathUtils.clamp(hsl.s + (Math.random() - 0.5) * 0.12, 0, 1),
                THREE.MathUtils.clamp(hsl.l + (Math.random() - 0.5) * 0.16, 0, 1),
            );
            const glow = 0.12 + Math.random() * 0.08;   // subtle per-bird glow variance
                                                        // (low → muted, not neon)

            scene.traverse((o) => {
                if (o.isMesh) {
                    o.material = new THREE.MeshStandardMaterial({
                        color: tint.clone(), roughness: 0.55, metalness: 0,
                        // Emissive = the bird's own gold → a soft self-lit glow
                        // (no post-process bloom needed, stays cheap).
                        emissive: tint.clone(), emissiveIntensity: glow,
                        transparent: true, opacity: 0.94,
                    });
                    o.frustumCulled = false;
                }
            });

            const mixer = new THREE.AnimationMixer(scene);
            let action = null;
            if (gltf.animations[0]) {
                action = mixer.clipAction(gltf.animations[0]);
                action.play();
                action.time = Math.random() * 2;
            }

            const position = new THREE.Vector3(
                Math.random() * BOUNDS - BOUNDS_HALF,
                Math.random() * BOUNDS - BOUNDS_HALF,
                (Math.random() * 2 - 1) * Z_CLAMP * 0.7,
            );
            const velocity = new THREE.Vector3(
                Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5,
            ).multiplyScalar(SPEED_LIMIT);

            scene.position.copy(position);
            return { scene, mixer, action, position, velocity, newVel: new THREE.Vector3(), yaw: 0, bank: 0 };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, targetSize]);

    const v = useMemo(() => ({
        dir: new THREE.Vector3(), predator: new THREE.Vector3(),
        ndc: new THREE.Vector3(), camDir: new THREE.Vector3(),
        tgt: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0),
        m4: new THREE.Matrix4(),
        fwd: new THREE.Vector3(), qTarget: new THREE.Quaternion(), qBank: new THREE.Quaternion(),
        center: new THREE.Vector3(), sep: new THREE.Vector3(), ali: new THREE.Vector3(),
        coh: new THREE.Vector3(), target: new THREE.Vector3(),
    }), []);

    // Stabilized orientation for one bird. Heading (yaw) is taken from the
    // HORIZONTAL velocity, but only refreshed when there's meaningful horizontal
    // speed — during steep climbs/dives sH→0 and that direction is pure noise, so
    // we HOLD the last yaw (this is what stops the 180° tail-first snap on upward
    // surges). Forward is then rebuilt from the held yaw + a clamped pitch, which
    // also avoids the lookAt-near-vertical degeneracy. Gentle turn-rate banking,
    // then snap (warm-up) or slerp (live) toward the target. `immediate` = snap.
    const orient = useCallback((b, immediate) => {
        const sH = Math.hypot(b.velocity.x, b.velocity.z);   // horizontal speed

        // Refresh heading only when actually travelling horizontally.
        let dYaw = 0;
        if (sH > HEADING_MIN_SPEED) {
            const yaw = Math.atan2(b.velocity.x, b.velocity.z);
            dYaw = yaw - b.yaw;
            if (dYaw > Math.PI) dYaw -= PI_2; else if (dYaw < -Math.PI) dYaw += PI_2;
            b.yaw = yaw;
        }

        // Pitch from climb angle, clamped so the body stays fairly level.
        const pitch = THREE.MathUtils.clamp(
            Math.atan2(b.velocity.y, Math.max(sH, 1e-3)), -MAX_PITCH, MAX_PITCH,
        );

        // Forward from held yaw + pitch — always unit length, never degenerate,
        // never reversed by noise. (Matches velocity's heading during normal flight.)
        const cp = Math.cos(pitch);
        v.fwd.set(Math.sin(b.yaw) * cp, Math.sin(pitch), Math.cos(b.yaw) * cp);
        v.tgt.copy(b.position).add(v.fwd);
        v.m4.lookAt(b.position, v.tgt, v.up);
        v.qTarget.setFromRotationMatrix(v.m4).multiply(correction);

        // Bank: lean into the turn, proportional to heading change, clamped+smoothed.
        const bankTarget = THREE.MathUtils.clamp(-dYaw * BANK_GAIN, -MAX_BANK, MAX_BANK);
        b.bank += (bankTarget - b.bank) * (immediate ? 1 : BANK_LERP);
        v.qBank.setFromAxisAngle(v.fwd, b.bank);             // roll about flight dir
        v.qTarget.premultiply(v.qBank);

        if (immediate) b.scene.quaternion.copy(v.qTarget);
        else b.scene.quaternion.slerp(v.qTarget, TURN_LERP);
    }, [correction, v]);

    // One physics step (velocity + position only — no scene/mixer). Shared by
    // the live loop AND the on-mount warm-up, so the flock is already settled
    // before it's ever revealed (no "flying into formation" on first sight).
    const stepPhysics = useCallback((delta, predatorLive, speedScale = 1) => {
        // Roam box = the visible frustum at z=0, so birds fill the frame
        // edge-to-edge (no orbiting the centre). Tracks viewport resizes.
        const halfH = Math.tan((camera.fov * 0.5) * Math.PI / 180) * camera.position.z;
        const halfW = halfH * (size.width / Math.max(1, size.height));
        const BX = halfW * 0.96, BY = halfH * 0.96, BZ = Z_CLAMP;

        // PASS 0 — live flock centroid (target for the weak global attraction).
        v.center.set(0, 0, 0);
        for (let i = 0; i < count; i++) v.center.add(birds[i].position);
        v.center.multiplyScalar(1 / count);

        // Smooth steering: lerp factor toward the target velocity this step.
        const steer = Math.min(1, delta * STEER_LERP);

        // PASS 1 — weighted boids steering (read OLD state → write newVel).
        for (let i = 0; i < count; i++) {
            const b = birds[i];
            let limit = SPEED_LIMIT * speedScale;

            v.sep.set(0, 0, 0); v.ali.set(0, 0, 0); v.coh.set(0, 0, 0);
            let nAli = 0, nCoh = 0;

            for (let j = 0; j < count; j++) {
                if (i === j) continue;
                const o = birds[j];
                v.dir.subVectors(o.position, b.position);
                const distSq = v.dir.lengthSq();
                if (distSq < 1e-4 || distSq > PERCEPTION_SQ) continue;

                // Cohesion + alignment from everyone in perception range.
                v.coh.add(o.position); nCoh++;
                v.ali.add(o.velocity); nAli++;

                // Separation only when actually crowded — stronger the closer.
                if (distSq < SEP_RADIUS * SEP_RADIUS) {
                    const dist = Math.sqrt(distSq);
                    v.sep.addScaledVector(v.dir.divideScalar(dist), -(SEP_RADIUS / dist - 1));
                }
            }

            // Build the desired heading from weighted steering contributions.
            v.target.set(0, 0, 0);
            if (nCoh > 0) {
                v.coh.divideScalar(nCoh).sub(b.position);           // toward local centre
                if (v.coh.lengthSq() > 1e-6) v.target.addScaledVector(v.coh.normalize(), COH_W);
            }
            if (nAli > 0) {
                v.ali.divideScalar(nAli);                            // match neighbours
                if (v.ali.lengthSq() > 1e-6) v.target.addScaledVector(v.ali.normalize(), ALI_W);
            }
            // Separation kept UN-normalized so it grows as birds crowd — this is
            // what overpowers cohesion at short range and stops them stacking.
            v.target.addScaledVector(v.sep, SEP_W);

            // Weak global pull to the centroid — keeps the flock from drifting apart.
            v.dir.subVectors(v.center, b.position);
            if (v.dir.lengthSq() > 1e-6) v.target.addScaledVector(v.dir.normalize(), GLOBAL_W);

            // Cursor/predator scatter — strong flee, overrides toward fleeing.
            if (predatorLive) {
                v.dir.subVectors(b.position, v.predator);
                v.dir.z = 0;
                const dist = v.dir.length();
                if (dist < PREY_RADIUS && dist > 1e-4) {
                    const f = (1 - dist / PREY_RADIUS) * FLEE_W;
                    v.target.addScaledVector(v.dir.divideScalar(dist), f);
                    limit += 5.0;
                }
            }

            // Desired velocity = heading at cruising speed; fall back to current
            // heading when no steering (keeps moving) then LERP for smooth turns.
            if (v.target.lengthSq() > 1e-6) v.target.normalize().multiplyScalar(limit);
            else v.target.copy(b.velocity);

            const vel = b.newVel.copy(b.velocity).lerp(v.target, steer);

            // Turn-rate cap — a bird can't swing its travel direction faster than
            // it can physically bank. Without this, smooth steering can flip the
            // velocity vector while the (smoothed) orientation lags, so the bird
            // briefly glides tail-first. Capping the per-frame heading change keeps
            // travel direction and facing in lock-step.
            const oldSq = b.velocity.lengthSq();
            if (oldSq > 1e-6 && vel.lengthSq() > 1e-6) {
                v.dir.copy(b.velocity).multiplyScalar(1 / Math.sqrt(oldSq));   // old dir
                v.tgt.copy(vel).normalize();                                   // new dir
                const ang = Math.acos(THREE.MathUtils.clamp(v.dir.dot(v.tgt), -1, 1));
                const maxTurn = MAX_TURN_RATE * delta;
                if (ang > maxTurn) {
                    const len = vel.length();
                    v.dir.lerp(v.tgt, maxTurn / ang).normalize();             // step toward new
                    vel.copy(v.dir).multiplyScalar(len);
                }
            }

            // Soft edge containment — gentle wall at the frame bounds.
            if (b.position.x >  BX) vel.x -= (b.position.x - BX) * 0.012;
            if (b.position.x < -BX) vel.x -= (b.position.x + BX) * 0.012;
            if (b.position.y >  BY) vel.y -= (b.position.y - BY) * 0.012;
            if (b.position.y < -BY) vel.y -= (b.position.y + BY) * 0.012;
            if (b.position.z >  BZ) vel.z -= (b.position.z - BZ) * 0.012;
            if (b.position.z < -BZ) vel.z -= (b.position.z + BZ) * 0.012;

            if (vel.length() > limit) vel.setLength(limit);
        }

        // PASS 2 — integrate position.
        for (let i = 0; i < count; i++) {
            const b = birds[i];
            b.velocity.copy(b.newVel);
            b.position.addScaledVector(b.velocity, delta * POS_FACTOR);
        }
    }, [birds, camera, size, count, v]);

    // Warm-up: run the flock forward ~3s of fixed steps once, before it paints,
    // so the reveal shows a settled flock instead of the scattered init state.
    const warmed = useRef(false);
    useEffect(() => {
        if (warmed.current) return;
        warmed.current = true;
        for (let k = 0; k < 320; k++) stepPhysics(0.016, false);
        for (let i = 0; i < count; i++) {
            const b = birds[i];
            b.scene.position.copy(b.position);
            orient(b, true);   // snap to a settled, level pose before first paint
        }
    }, [stepPhysics, birds, count, orient]);

    useFrame((_, rawDelta) => {
        const delta = Math.min(rawDelta, 0.033);

        // Option B: birds always live (no OS-setting freeze). Under reduced-
        // motion we DAMP instead of stop — slower drift + no cursor-scatter
        // darting — so motion-sensitive users get a soothing flock, everyone
        // else gets the full Vanta feel. Wing-flap is velocity-driven, so the
        // slower speed naturally yields a gentler, slower flap too.
        const calm = prefersReducedMotion;

        let predatorLive = false;
        if (!calm && pointerActive.current) {
            v.ndc.set(pointerFrac.current.x * 2 - 1, -(pointerFrac.current.y * 2 - 1), 0.5).unproject(camera);
            v.camDir.copy(v.ndc).sub(camera.position).normalize();
            const t = -camera.position.z / v.camDir.z;
            if (t > 0) { v.predator.copy(camera.position).addScaledVector(v.camDir, t); predatorLive = true; }
        }

        stepPhysics(delta, predatorLive, calm ? 0.45 : 1);

        // Apply to scene: stabilized, level orientation (slerped) + flap.
        for (let i = 0; i < count; i++) {
            const b = birds[i];
            b.scene.position.copy(b.position);
            orient(b, false);   // smooth slerp toward a pitch-clamped, gently-banked pose

            // Wing-flap rate from horizontal speed. The vertical term is kept
            // small now that pitch is clamped — the body stays level, so the flap
            // reads as level flight instead of "flapping sideways".
            if (b.action) {
                const horiz = Math.hypot(b.velocity.x, b.velocity.z);
                b.action.timeScale = THREE.MathUtils.clamp(
                    (1 + horiz * 3 + Math.max(b.velocity.y, 0) * 2) * 0.12, 0.6, 2.0,
                );
            }
            b.mixer.update(delta);
        }
    });

    return <group>{birds.map((b, i) => <primitive key={i} object={b.scene} />)}</group>;
}

/**
 * Single full-parent canvas. Page-level fixed positioning + dark bg + the
 * scroll-driven reveal are handled by the wrapper in Home.jsx.
 */
export default function RealisticBirds() {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            {/* Vanta's exact camera: PerspectiveCamera(75, aspect, 1, 3000) @ z=350 */}
            <Canvas
                dpr={[1, 1.75]}
                gl={{ antialias: true, alpha: true }}
                camera={{ position: [0, 0, 350], fov: 75, near: 1, far: 3000 }}
                style={{ background: 'transparent', pointerEvents: 'none' }}
            >
                <ambientLight intensity={0.42} />
                <directionalLight position={[180, 320, 160]} intensity={2.1} color="#ffe9c2" />
                {/* Warm rim from behind → outlines the wings without the cold cast. */}
                <directionalLight position={[-120, 60, -320]} intensity={1.5} color="#e7c178" />
                <Flock count={64} targetSize={50} />
            </Canvas>
        </div>
    );
}

MODELS.forEach((m) => useGLTF.preload(m));
