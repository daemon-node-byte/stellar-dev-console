import * as THREE from 'three';

function createMesh(geometry: THREE.BufferGeometry, material: THREE.Material) {
	const mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
};

export { createMesh };