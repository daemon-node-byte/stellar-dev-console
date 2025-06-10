import * as THREE from 'three';
import { createMesh } from '$lib/createMesh';

function generatePlanetObject(data: { size: number, radius: number }, material: THREE.Material){
	const { size, radius } = data;
	const parent = new THREE.Object3D();
	parent.position.set(radius, 0, 0)
	const geo = new THREE.SphereGeometry(size, 32, 32);
	const mesh = createMesh(geo, material);
	mesh.userData = { ...data }

	return { parent, mesh };
}

function generatePlanetRing(size: number, material: THREE.Material) {
	const geo = new THREE.RingGeometry(size + 1, size * 1.3, 64);
	geo.rotateX(-Math.PI / 2);
	return createMesh(geo, material);
}

function drawPlanet(
	scene: THREE.Scene,
	withRing: boolean,
	planetMat: THREE.Material,
	data : { size: number; radius: number },
	ringMaterial?: THREE.Material,
) {
	const { parent, mesh } = generatePlanetObject(data, planetMat);
	parent.add(mesh)
	if (withRing && ringMaterial) {
		const ring = generatePlanetRing(data.size, ringMaterial);
		parent.add(ring);
	}
	scene.add(parent);
	return { parent, mesh };
}

export { drawPlanet, generatePlanetObject, generatePlanetRing };