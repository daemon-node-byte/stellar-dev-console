import * as THREE from 'three';
import { settings } from '$lib/config';



function randomPositionOutsideInnerSystem(minDistance: number, maxDistance: number): THREE.Vector3 {
	const radius = THREE.MathUtils.randFloat(minDistance, maxDistance);
	const theta = Math.random() * 2 * Math.PI;
	const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));

	const x = radius * Math.sin(phi) * Math.cos(theta);
	const y = radius * Math.sin(phi) * Math.sin(theta);
	const z = radius * Math.cos(phi);

	return new THREE.Vector3(x, y, z);
}

function drawStarfield(scene: THREE.Scene) {
	const { amount, distance } = settings.starfield
	const starGeometry = new THREE.BufferGeometry();
	const starVertices = [];
	for (let i = 0; i < amount; i++) {
		const position = randomPositionOutsideInnerSystem(distance.min, distance.max);
		starVertices.push(...position)
	}
	starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
	const starMaterial = new THREE.PointsMaterial({
		color: 0xffffff,
		size: 0.05,
		transparent: true,
		opacity: 0.8
	});
	const stars = new THREE.Points(starGeometry, starMaterial);
	scene.add(stars);
	return { scene };
}

export { drawStarfield };
