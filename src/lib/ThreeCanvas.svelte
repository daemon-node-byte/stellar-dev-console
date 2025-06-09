<script lang="ts">
	import * as THREE from 'three';
	import { createEventDispatcher, onMount } from 'svelte';
	import { createGlowMaterial } from '$lib/glowMaterial';
	import { createMesh} from '$lib/createMesh';
	import { createSceneSpace } from '$lib/createSceneSpace';
	import Terminal from '$lib/Terminal.svelte';
	import Starfield from '$lib/Starfield.svelte';
	import { createSun3dObject, createSunGlow, createSolarFlares } from '$lib/createSun3dObject';
	import vertexShader from '$lib/shaders/planet.vert.glsl?raw';
	import fragmentShader from '$lib/shaders/planet.frag.glsl?raw';
	import sunVertexShader from '$lib/shaders/sun.vert.glsl?raw';
	import sunFragmentShader from '$lib/shaders/sun.frag.glsl?raw';
	import sunGlowVertexShader from '$lib/shaders/sunGlow.vert.glsl?raw';
	import sunGlowFragmentShader from '$lib/shaders/sunGlow.frag.glsl?raw';
	import flareVertexShader from '$lib/shaders/solarFlares.vert.glsl?raw';
	import flareFragmentShader from '$lib/shaders/solarFlares.frag.glsl?raw';

	const dispatch = createEventDispatcher();

	let container: HTMLDivElement;
	let labelScreens: { name: string, x: number, y: number, visible: boolean }[] = [];
	let terminalOpen = true;
	let scene: THREE.Scene;

	function toggleTerminal() {
		terminalOpen = !terminalOpen;
	}
	let terminalLines = [
		'Welcome to the Solar Command Interface.',
		'',
		'$ ls',
		'Mercury/ Venus/ Earth/ Mars/ ...',
		'',
		'Click a planet to inspect mission logs.'
	];

	onMount(() => {
		// scene = new THREE.Scene();
		// scene.background = new THREE.Color('#000');
		// let selectedPlanet: THREE.Object3D | null = null;
		const sunSize = 2.2;
		let targetCameraPos = new THREE.Vector3();
		const defaultCameraPos = new THREE.Vector3(0, 12, 30);
		let selectedPlanet: THREE.Mesh | null = null;
		let glowMesh: THREE.Mesh | null = null;
		const { scene: createdScene, renderer, camera } = createSceneSpace(container);
		const uniforms = {
			uTime: { value: 0.0 },
			uLightPos: { value: new THREE.Vector3(0, 0, 0) } // center sun
		};
		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms
		});
		const sunUniforms = {
			uTime: { value: 0 }
		};
		const sunMaterial = new THREE.ShaderMaterial({
			vertexShader: sunVertexShader,
			fragmentShader: sunFragmentShader,
			uniforms: sunUniforms,
			side: THREE.FrontSide,
			transparent: false,
		});
		const sunGlowMaterial = new THREE.ShaderMaterial({
			vertexShader: sunGlowVertexShader,
			fragmentShader: sunGlowFragmentShader,
			blending: THREE.AdditiveBlending,
			transparent: true,
			depthWrite: false,
			side: THREE.BackSide,
		});
		const flareMaterial = new THREE.ShaderMaterial({
			vertexShader: flareVertexShader,
			fragmentShader: flareFragmentShader,
			uniforms: {
				uTime: { value: 0 },
			},
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
		});

		scene = createdScene;
		container.appendChild(renderer.domElement);
		const { mesh: sunMesh } = createSun3dObject(sunSize, sunMaterial, scene);
		createSunGlow(sunSize, sunGlowMaterial, scene, sunMesh);
		createSolarFlares(sunSize, flareMaterial, scene);
		// scene = sunScene


		// Planet config
		const planetData = [
			{ radius: 5, size: 0.7, color: 0x33ccff, speed: 0.01, name: 'About' },
			{ radius: 8, size: 1.0, color: 0xff3366, speed: 0.008, name: 'Blog' },
			{ radius: 11, size: 1.3, color: 0x66ff66, speed: 0.006, name: 'Projects' },
			{ radius: 14, size: 0.9, color: 0xffff66, speed: 0.004, name: 'Contact' }
		];

		const planets: {
			name: string;
			parent: THREE.Object3D;
			mesh: THREE.Mesh;
			angle: number;
			radius: number;
			speed: number;
			texture?: THREE.Mesh;
		}[] = [];

		// Create planets
		planetData.forEach((data) => {
			const parent = new THREE.Object3D();
			parent.position.set(data.radius, 0, 0);
			scene.add(parent);
			const geo = new THREE.SphereGeometry(data.size, 32, 32);
			// const mat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.7, metalness: 0.2, map: material });
			const mesh = createMesh(geo, material);
			// mesh.position.set(data.radius, 0, 0); // Place on the x-axis
			mesh.userData.name = data.name;
			parent.add(mesh);

			planets.push({
				name: data.name,
				parent,
				mesh,
				angle: Math.random() * Math.PI * 2,
				radius: data.radius,
				speed: data.speed
			});
		});

		// Raycaster for click detection
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

// Add planet name + project data
		const projects = [
			{ name: 'Project Mercury', description: 'A blazing fast API server.', color: 0x33ccff },
			{ name: 'Project Venus', description: 'Beautiful UI component library.', color: 0xff3366 },
			{ name: 'Project Earth', description: 'Full-stack web platform.', color: 0x66ff66 },
			{ name: 'Project Mars', description: 'AI-powered data analysis tool.', color: 0xffff66 }
		];

// Apply names to meshes
		planets.forEach((planet, i) => {

			planet.mesh.userData = {
				...planet.mesh.userData,
				...projects[i],
				id: i
			};
		});

		// Click handler
		const onClick = (event: MouseEvent) => {


			const rect = container.getBoundingClientRect();
			mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

			raycaster.setFromCamera(mouse, camera);
			const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

			if (intersects.length > 0) {
				const selected = intersects[0].object as THREE.Mesh;
				console.info('Selected planet:', selected);
				dispatch('select', selected.userData);

				selectedPlanet = selected;
				targetCameraPos = selected.position.clone().add(new THREE.Vector3(0, 2, 5));
				if (glowMesh) scene.remove(glowMesh);

				const geometry = (selectedPlanet.geometry as THREE.SphereGeometry).clone();
				const glowMaterial = createGlowMaterial();
				glowMesh = createMesh(geometry, glowMaterial);
				glowMesh.scale.set(1.2, 1.2, 1.2); // slightly larger
				glowMesh.position.copy(selectedPlanet.position);
				scene.add(glowMesh);
				// Optional: brighten material
				// (selectedPlanet.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x333333);
			} else {
				if (selectedPlanet) {
					// Reset previous highlight
					(selectedPlanet.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
				}
				selectedPlanet = null;
				targetCameraPos = defaultCameraPos.clone();
				if (glowMesh) {
					scene.remove(glowMesh);
					glowMesh = null;
				}
			}


		};

		container.addEventListener('click', onClick);


		// Starfield
		const starGeometry = new THREE.BufferGeometry();
		const starCount = 2500;
		const starVertices = [];
		const minDistance = 40; // minimum radius away from center
		const maxDistance = 150;

		function randomPositionOutsideInnerSystem() {
			const radius = THREE.MathUtils.randFloat(minDistance, maxDistance);
			const theta = Math.random() * 2 * Math.PI;
			const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));

			const x = radius * Math.sin(phi) * Math.cos(theta);
			const y = radius * Math.sin(phi) * Math.sin(theta);
			const z = radius * Math.cos(phi);

			return new THREE.Vector3(x, y, z);
		}


		for (let i = 0; i < starCount; i++) {
			starVertices.push(...randomPositionOutsideInnerSystem());
		}

		starGeometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(starVertices, 3)
		);

		const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
		const stars = new THREE.Points(starGeometry, starMaterial);
		scene.add(stars);

		let prevTime = performance.now();

		// Animate
		const animate = () => {
			const currentTime = performance.now();
			const delta = (currentTime - prevTime) / 1000; // seconds
			prevTime = currentTime;

			uniforms.uTime.value += delta;
			sunUniforms.uTime.value += delta;


			// In animate:
			planets.forEach((planet) => {
				planet.angle += planet.speed;
				const x = planet.radius * Math.cos(planet.angle);
				const z = planet.radius * Math.sin(planet.angle);
				planet.parent.position.set(x, 0, z); // orbit
				planet.mesh.rotation.y += delta * 0.1; // spin surface only
			});
		/*
			planets.forEach((planet) => {
				// Update planet rotation
				planet.mesh.rotation.y += delta * 0.1; // Adjust speed as needed
			});
			*/
			// mesh.rotation.y += delta * 0.1;
			if (selectedPlanet) {
				// Smoothly move camera to selected planet
				camera.position.lerp(targetCameraPos, 0.05);
				camera.lookAt(selectedPlanet.position);
				if (glowMesh && selectedPlanet) {
					glowMesh.position.copy(selectedPlanet.position);
					const viewVector = new THREE.Vector3().subVectors(camera.position, selectedPlanet.position);
					(glowMesh.material as THREE.ShaderMaterial).uniforms.viewVector.value = viewVector;
				}
			} else {
				// Reset camera position
				camera.position.lerp(defaultCameraPos, 0.1);
				camera.lookAt(new THREE.Vector3(0, 0, 0));
			}

			// Orbit logic
			planets.forEach((planet) => {
				planet.angle += planet.speed;
				const x = planet.radius * Math.cos(planet.angle);
				const z = planet.radius * Math.sin(planet.angle);
				planet.mesh.position.set(x, 0, z);
			});

			renderer.render(scene, camera);
			requestAnimationFrame(animate);
			// Update labelScreens calculation in the animate function
			labelScreens = planets.map(({ name, mesh }) => {
			  const screenPos = mesh.position.clone();
			  screenPos.y = 1.2; // Fix the height for label projection
			  screenPos.project(camera);

			  const isVisible = screenPos.z < 1; // Check if in view frustum
			  return {
			    name,
			    x: (screenPos.x * 0.5 + 0.5) * window.innerWidth,
			    y: (1 - (screenPos.y * 0.5 + 0.5)) * window.innerHeight,
			    visible: isVisible,
			  };
			});

		};

		animate();

		const handleResize = () => {
			camera.aspect = container.clientWidth / container.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(container.clientWidth, container.clientHeight);
		};

		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				selectedPlanet = null;
				targetCameraPos = defaultCameraPos.clone();
			}
		});

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			container.removeEventListener('click', onClick);
			container.removeChild(renderer.domElement);
			if (selectedPlanet) {
				(selectedPlanet.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
			}

		};
	});
</script>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
    .canvas-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        z-index: 0;
    }
    .label {
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        white-space: nowrap;
        user-select: none;
        color: white;
        font-weight: bold;
        text-shadow: 0 0 5px #00ffff;
        pointer-events: none;
				z-index: 99999;
    }
		.terminal-toggle {
			position: fixed;
			bottom: 20px;
			right: 20px;
			background: rgba(0, 255, 255, 0.1);
			border: none;
			color: cyan;
			font-family: 'Courier New', monospace;
			padding: 10px 20px;
			border-radius: 5px;
			cursor: pointer;
			box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
			z-index: 1000;
		}
</style>

<div bind:this={container} class="canvas-container"></div>
<Starfield {scene} />
<button class="terminal-toggle" on:click={toggleTerminal}>Toggle Terminal</button>
<Terminal lines={terminalLines} isOpen={terminalOpen}/>
{#each labelScreens as label (label.name)}
	{#if label.visible}
		<div
			class="label"
			style="
        position: absolute;
        left: {label.x}px;
        top: {label.y}px;
        transform: translate(-50%, -50%);
        color: white;
        font-weight: bold;
        text-shadow: 0 0 5px #00ffff;
        pointer-events: none;
      "
		>
			{label.name}
		</div>
	{/if}
{/each}

