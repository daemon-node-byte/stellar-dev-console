import * as THREE from 'three';
function createSceneSpace(container: HTMLDivElement) {
	const scene = new THREE.Scene();
	const renderer = new THREE.WebGLRenderer({ antialias: true });

	// Create a perspective camera with a 75 degree field of view, aspect ratio based on container size, and near/far planes
	const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
	renderer.setSize(container.clientWidth, container.clientHeight); // Set the size of the renderer to match the container
	renderer.setPixelRatio(window.devicePixelRatio);  // Set pixel ratio for high DPI displays
	camera.lookAt(0, 0, 0); // Set camera to look at the origin
	scene.background = new THREE.Color(0x000000); // Set background color to black

	// renderer.shadowMap.enabled = true;
	// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	return { scene, camera, renderer };
}

export { createSceneSpace };