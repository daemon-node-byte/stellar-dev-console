import * as THREE from 'three';
import { createMesh } from '$lib/createMesh';

function createPlasmaArc(radius = 1.05, height = 0.3, angle = 0) {
	const arcSegments = 20;
	const arcAngleSpan = Math.PI / 4;
	const arcPoints = Array.from({ length: arcSegments + 1 }, (_, i) => {
		const t = i / arcSegments;
		const arcAngle = angle + t * arcAngleSpan;
		return new THREE.Vector3(
			Math.cos(arcAngle) * radius,
			Math.sin(t * Math.PI) * height,
			Math.sin(arcAngle) * radius
		);
	});

	const curve = new THREE.CatmullRomCurve3(arcPoints);
	const geometry = new THREE.TubeGeometry(curve, 64, 0.01, 8, false);
	const material = new THREE.MeshBasicMaterial({
		color: new THREE.Color(1.0, 0.4, 0.1),
		transparent: true,
		opacity: 1.0,
	});

	return new THREE.Mesh(geometry, material);
}

function createSun3dObject(size: number, material: THREE.ShaderMaterial, scene: THREE.Scene) {
	const mesh = createMesh(new THREE.SphereGeometry(size, 32, 32), material);
	mesh.position.set(0, 0, 0);

	const plasmaGroup = new THREE.Group();
	for (let i = 0; i < 6; i++) {
		const angle = (i / 6) * Math.PI * 2;
		const arcMesh = createPlasmaArc(2.55, 2, angle);
		arcMesh.rotation.set(
			Math.random() * Math.PI * 2,
			Math.random() * Math.PI * 2,
			Math.random() * Math.PI * 2
		);
		plasmaGroup.add(arcMesh);
	}

	scene.add(mesh);
	return { mesh, scene, plasmaGroup };
}

function createSunGlow(size: number, material: THREE.ShaderMaterial, scene: THREE.Scene, rootPlanet: THREE.Mesh) {
	const mesh = createMesh(new THREE.SphereGeometry(size + 0.6, 32, 32), material);
	mesh.position.copy(rootPlanet.position);
	scene.add(mesh);
	return { mesh, scene };
}

function createSolarFlares(size: number, material: THREE.ShaderMaterial, scene: THREE.Scene) {
	const geo = new THREE.RingGeometry(size + 0.4, size + 0.6, 64);
	geo.rotateX(Math.PI / 2);
	const mesh = new THREE.Mesh(geo, material);
	scene.add(mesh);
	return { mesh, scene };
}

function updatePlasmaArcs(elapsedTime: number, plasmaGroup: THREE.Group) {
	plasmaGroup.children.forEach((arc, i) => {
		const mat = (arc as THREE.Mesh).material as THREE.MeshBasicMaterial;
		mat.opacity = 0.6 + 0.4 * Math.sin(elapsedTime * 2 + i);
	});
}

export { createSun3dObject, createSunGlow, createSolarFlares, createPlasmaArc, updatePlasmaArcs };