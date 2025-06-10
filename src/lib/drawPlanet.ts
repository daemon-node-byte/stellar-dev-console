import * as THREE from 'three';
import { createMesh } from '$lib/createMesh';

// Reusable geometries
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32); // Scaled later by size
const ringGeometry = new THREE.RingGeometry(1.1, 1.3, 64); // Scaled later by size
ringGeometry.rotateX(-Math.PI / 2);

function drawPlanet(
	scene: THREE.Scene,
	withRing: boolean,
	planetMat: THREE.Material,
	data: { size: number; radius: number },
	ringMaterial?: THREE.Material,
) {
	// Create parent object
	const parent = new THREE.Object3D();
	parent.position.set(data.radius, 0, 0);

	// Create planet mesh
	const mesh = createMesh(sphereGeometry, planetMat);
	mesh.scale.set(data.size, data.size, data.size);
	mesh.userData = { ...data };
	parent.add(mesh);

	// Add ring if applicable
	if (withRing && ringMaterial) {
		const ring = createMesh(ringGeometry, ringMaterial);
		ring.scale.set(data.size, data.size, data.size);
		parent.add(ring);
	}

	// Add to scene
	scene.add(parent);

	return { parent, mesh };
}

export { drawPlanet };