<script lang="ts">
	import * as THREE from 'three';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
	import { createEventDispatcher, onMount } from 'svelte';
	import { createGlowMaterial } from '$lib/glowMaterial';
	import { createMesh } from '$lib/createMesh';
	import { createSceneSpace } from '$lib/createSceneSpace';
	import { drawStarfield } from '$lib/drawStarfield';
	import Terminal from '$lib/Terminal.svelte';
	import { settings } from '$lib/config';
	import {
		createSun3dObject,
		createSunGlow,
		createSolarFlares,
		updatePlasmaArcs
	} from '$lib/createSun3dObject';
	import {
		material,
		sunMaterial,
		sunGlowMaterial,
		flareMaterial
	} from '$lib/materials';

	const { planets: orbitData } = settings.solarSystem;
	const dispatch = createEventDispatcher();

	let container: HTMLDivElement;
	let labelScreens: { name: string; x: number; y: number; visible: boolean }[] = [];
	let terminalOpen = true;
	let scene: THREE.Scene;
	const terminalLines = [
		'Welcome to the Solar Command Interface.',
		'',
		'$ ls',
		'Mercury/ Venus/ Earth/ Mars/ ...',
		'',
		'Click a planet to inspect mission logs.'
	];

	function toggleTerminal() {
		terminalOpen = !terminalOpen;
	}

	onMount(() => {
		const sunSize = 2.2;
		let targetCameraPos = new THREE.Vector3();
		const defaultCameraPos = new THREE.Vector3(0, 12, 30);
		let selectedPlanet: THREE.Mesh | null = null;
		let glowMesh: THREE.Mesh | null = null;

		const { scene: createdScene, renderer, camera } = createSceneSpace(container);
		scene = createdScene;

		// Setup post-processing
		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));
		composer.addPass(new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			1.2, 0.2, 0.35
		));

		// Setup materials
		const uniforms = {
			uTime: { value: 0.0 },
			uLightPos: { value: new THREE.Vector3(0, 0, 0) }
		};
		const planetMaterial = material(uniforms);
		const sunUniformsObj = { uTime: { value: 0 } };
		const sunShaderMaterial = sunMaterial(sunUniformsObj);
		const sunGlowShaderMaterial = sunGlowMaterial();
		const flareShaderMaterial = flareMaterial();

		container.appendChild(renderer.domElement);
		drawStarfield(scene);

		// Create sun
		const { mesh: sunMesh, plasmaGroup } = createSun3dObject(sunSize, sunShaderMaterial, scene);
		createSunGlow(sunSize, sunGlowShaderMaterial, scene, sunMesh);
		createSolarFlares(sunSize, flareShaderMaterial, scene);
		sunMesh.add(plasmaGroup);

		// Planet data
		const planetData = [
			{ radius: 6, size: 0.7, color: 0x33ccff, speed: 0.003, name: 'About' },
			{ radius: 10, size: 1.0, color: 0xff3366, speed: 0.008, name: 'Blog' },
			{ radius: 14, size: 1.3, color: 0x66ff66, speed: 0.006, name: 'Projects' },
			{ radius: 18, size: 0.9, color: 0xffff66, speed: 0.004, name: 'Contact' }
		];

		// Project details
		const projects = [
			{ name: 'Project Mercury', description: 'A blazing fast API server.', color: 0x33ccff },
			{ name: 'Project Venus', description: 'Beautiful UI component library.', color: 0xff3366 },
			{ name: 'Project Earth', description: 'Full-stack web platform.', color: 0x66ff66 },
			{ name: 'Project Mars', description: 'AI-powered data analysis tool.', color: 0xffff66 }
		];

		// Create planets
		const planets = planetData.map((data, i) => {
			const parent = new THREE.Object3D();
			parent.position.set(data.radius, 0, 0);
			scene.add(parent);

			const geo = new THREE.SphereGeometry(data.size, 32, 32);
			const mesh = createMesh(geo, planetMaterial);
			mesh.userData = {
				name: data.name,
				...projects[i],
				id: i
			};
			parent.add(mesh);

			return {
				name: data.name,
				parent,
				mesh,
				angle: Math.random() * Math.PI * 2,
				radius: data.radius,
				speed: data.speed
			};
		});

		// Setup raycaster for interaction
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		// Handle planet selection
		const onClick = (event: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

			raycaster.setFromCamera(mouse, camera);
			const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

			if (glowMesh) scene.remove(glowMesh);

			if (intersects.length > 0) {
				selectedPlanet = intersects[0].object as THREE.Mesh;
				dispatch('select', selectedPlanet.userData);
				targetCameraPos = selectedPlanet.position.clone().add(new THREE.Vector3(0, 2, 5));

				// Add glow effect
				const geometry = (selectedPlanet.geometry as THREE.SphereGeometry).clone();
				glowMesh = createMesh(geometry, createGlowMaterial());
				glowMesh.scale.set(1.2, 1.2, 1.2);
				glowMesh.position.copy(selectedPlanet.position);
				scene.add(glowMesh);
			} else {
				selectedPlanet = null;
				targetCameraPos = defaultCameraPos.clone();
			}
		};

		container.addEventListener('click', onClick);

		let prevTime = performance.now();

		// Animation loop
		const animate = () => {
			const currentTime = performance.now();
			const delta = (currentTime - prevTime) / 1000;
			prevTime = currentTime;

			// Update uniforms and sun effects
			uniforms.uTime.value += delta;
			sunUniformsObj.uTime.value += delta;
			updatePlasmaArcs(delta, plasmaGroup);

			// Animate planets
			planets.forEach((planet) => {
				planet.angle += planet.speed;
				const x = planet.radius * Math.cos(planet.angle);
				const z = planet.radius * Math.sin(planet.angle);
				planet.parent.position.set(x, 0, z);
				planet.mesh.rotation.y += delta * 0.1;
			});

			// Update camera
			if (selectedPlanet) {
				camera.position.lerp(targetCameraPos, 0.05);
				camera.lookAt(selectedPlanet.position);

				if (glowMesh) {
					glowMesh.position.copy(selectedPlanet.position);
					const viewVector = new THREE.Vector3().subVectors(camera.position, selectedPlanet.position);
					(glowMesh.material as THREE.ShaderMaterial).uniforms.viewVector.value = viewVector;
				}
			} else {
				camera.position.lerp(defaultCameraPos, 0.1);
				camera.lookAt(new THREE.Vector3(0, 0, 0));
			}

			// Update planet labels
			labelScreens = planets.map(({ name, parent }) => {
				const screenPos = parent.position.clone();
				screenPos.y = 1;
				screenPos.project(camera);
				return {
					name,
					x: (screenPos.x * 0.5 + 0.5) * window.innerWidth,
					y: (1 - (screenPos.y * 0.5 + 0.5)) * window.innerHeight,
					visible: screenPos.z < 1
				};
			});

			composer.render(scene, camera);
			requestAnimationFrame(animate);
		};

		animate();

		// Handle window events
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
		};
	});
</script>

<div bind:this={container} class="canvas-container"></div>
<button class="terminal-toggle" on:click={toggleTerminal}>Toggle Terminal</button>
<Terminal lines={terminalLines} isOpen={terminalOpen} />
{#each labelScreens as label (label.name)}
	{#if label.visible}
		<div
			class="label"
			style="
        position: absolute;
        left: {label.x}px;
        top: {label.y}px;
        transform: translate(-50%, -50%);
      "
		>
			{label.name}
		</div>
	{/if}
{/each}

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