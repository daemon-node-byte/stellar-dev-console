import * as THREE from 'three';
import { createMesh } from '$lib/createMesh';

function createSun3dObject(size: number, material: THREE.ShaderMaterial, scene: THREE.Scene){
	const geometry = new THREE.SphereGeometry(size, 32, 32);
	const mesh = createMesh(geometry, material);
	mesh.position.set(0, 0, 0);
	scene.add(mesh)
	return { mesh, scene }
}

function createSunGlow (size: number, material: THREE.ShaderMaterial, scene: THREE.Scene, rootPlanet: THREE.Mesh) {
	const geometry = new THREE.SphereGeometry(size + 0.6, 32, 32);
	const mesh = createMesh(geometry, material)
	mesh.position.copy(rootPlanet.position)
	scene.add(mesh)
	return { mesh, scene }
}

function createSolarFlares(size: number, material: THREE.ShaderMaterial, scene: THREE.Scene){

	const geo = new THREE.RingGeometry(size + 0.4, size + 0.6, 64);
	geo.rotateX(Math.PI / 2); // face the camera
	const mesh = new THREE.Mesh(geo, material);
	scene.add(mesh);
	return { mesh, scene }
}

export { createSun3dObject, createSunGlow, createSolarFlares };