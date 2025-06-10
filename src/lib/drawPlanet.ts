import * as THREE from 'three';
import { createMesh } from '$lib/createMesh';

function generatePlanetObject(data: { size: number, radius: number }, material: THREE.Material){
	const { size, radius } = data;
	const parent = new THREE.Object3D();
	parent.position.set(radius, 0, 0)
	const geo = new THREE.SphereGeometry(size, 32, 32);
	const mesh = createMesh(geo, material);
	mesh.userData = { ...data }
	parent.add(mesh)
	return parent;
}

function generatePlanetRing(size: number, material: THREE.Material) {
	const geo = new THREE.RingGeometry(size + 0.1, size * 1.2, 128);
	geo.rotateX(-Math.PI / 2);
	return createMesh(geo, material);
}

function drawPlanet(
	scene: THREE.Scene,
	withRing: boolean,
	planetMat: THREE.Material,
	data : { size: number; radius: number },
	ringMat?: THREE.Material,
) {
	const planet = generatePlanetObject(data, planetMat);
	if (withRing && ringMat) {
		const ring = generatePlanetRing(data.size, ringMat);
		planet.add(ring);
	}
	scene.add(planet);
}

export { drawPlanet, generatePlanetObject, generatePlanetRing };