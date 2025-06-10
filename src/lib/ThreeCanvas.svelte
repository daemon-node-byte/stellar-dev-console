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
	import { drawPlanet } from '$lib/drawPlanet';
	import { planets as newPlanetData } from '$lib/planets';
	import Terminal from '$lib/Terminal.svelte';

	import {
		createSun3dObject,
		createSunGlow,
		createSolarFlares,
		updatePlasmaArcs
	} from '$lib/createSun3dObject';
	import {
		sunMaterial,
		sunGlowMaterial,
		flareMaterial
	} from '$lib/materials';

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

	// Move planets declaration here so it's accessible in markup
	let planets: {
		name: string;
		angle: number;
		parent: THREE.Object3D;
		mesh: THREE.Mesh;
		speed: number;
		radius: number;
		withRing?: boolean;
		material: THREE.Material;
		size: number;
		ringMaterial?: THREE.Material;
	}[] = [];

	onMount(() => {
		const sunSize = 2.2;
		let targetCameraPos = new THREE.Vector3();
		const defaultCameraPos = new THREE.Vector3(0, 12, 30);
		let selectedPlanet: THREE.Mesh | null = null;
		let glowMesh: THREE.Mesh | null = null;
		let selectedPlanetData: typeof planets[0] | null = null;

		const { scene: createdScene, renderer, camera } = createSceneSpace(container);
		scene = createdScene;

		 // Optimize renderer
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// Setup post-processing
		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));
		composer.addPass(new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			0.7, 0.15, 0.25 // Lower bloom strength and radius
		));

		// Setup materials
		const uniforms = {
			uTime: { value: 0.0 },
			uLightPos: { value: new THREE.Vector3(0, 0, 0) }
		};
		const sunUniformsObj = { uTime: { value: 0 } };
		const sunShaderMaterial = sunMaterial(sunUniformsObj);
		const sunGlowShaderMaterial = sunGlowMaterial();
		const flareShaderMaterial = flareMaterial();

		container.appendChild(renderer.domElement);
		drawStarfield(scene);

		// Create sun
		const { mesh: sunMesh, plasmaGroup } = createSun3dObject(sunSize, sunShaderMaterial, scene, 16, 16);
		createSunGlow(sunSize, sunGlowShaderMaterial, scene, sunMesh, 16, 16);
		createSolarFlares(sunSize, flareShaderMaterial, scene, 32);
		sunMesh.add(plasmaGroup);

		// Assign to outer planets variable
		planets = newPlanetData.map((data) => {
			const planet = drawPlanet(scene, data.withRing, data.material(uniforms), {size: data.size, radius: data.radius}, data.withRing && data.ringMaterial ? data.ringMaterial() : undefined);
			return {
				...data,
				angle: Math.random() * Math.PI * 2,
				parent: planet.parent,
				mesh: planet.mesh,
			}
		});

		// Setup raycaster for interaction
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();

		// Handle planet selection by mesh or label
		function selectPlanetByMesh(mesh: THREE.Mesh | null) {
			if (glowMesh) scene.remove(glowMesh);

			if (mesh) {
				selectedPlanet = mesh;
				selectedPlanetData = planets.find(p => p.mesh === mesh) || null;
				dispatch('select', selectedPlanet.userData);
				// Always compute the latest position for the camera to follow the planet
				const planetPos = selectedPlanetData?.parent.position.clone() || mesh.position.clone();
				targetCameraPos = planetPos.clone().add(new THREE.Vector3(0, 2, 5));

				// Add glow effect
				const geometry = (mesh.geometry as THREE.SphereGeometry).clone();
				glowMesh = createMesh(geometry, createGlowMaterial());
				glowMesh.scale.set(1.2, 1.2, 1.2);
				glowMesh.position.copy(planetPos);
				scene.add(glowMesh);
			} else {
				selectedPlanet = null;
				selectedPlanetData = null;
				targetCameraPos = defaultCameraPos.clone();
			}
		}

		const onClick = (event: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

			raycaster.setFromCamera(mouse, camera);

			const planetMeshes = planets.map(p => p.mesh);
			const intersects = raycaster.intersectObjects(planetMeshes);

			if (intersects.length > 0) {
				selectPlanetByMesh(intersects[0].object as THREE.Mesh);
			} else {
				selectPlanetByMesh(null);
			}
		};

		container.addEventListener('click', onClick);

		let prevTime = performance.now();

		let prevLabelScreens: typeof labelScreens = [];

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

			// Update camera to follow the selected planet as it moves
			if (selectedPlanet && selectedPlanetData) {
				const planetPos = selectedPlanetData.parent.position.clone();
				const desiredCameraPos = planetPos.clone().add(new THREE.Vector3(0, 2, 5));
				camera.position.lerp(desiredCameraPos, 0.05);
				camera.lookAt(planetPos);

				if (glowMesh) {
					glowMesh.position.copy(planetPos);
					const viewVector = new THREE.Vector3().subVectors(camera.position, planetPos);
					(glowMesh.material as THREE.ShaderMaterial).uniforms.viewVector.value = viewVector;
				}
			} else {
				camera.position.lerp(defaultCameraPos, 0.1);
				camera.lookAt(new THREE.Vector3(0, 0, 0));
			}

			// Update planet labels only if camera or planet positions changed
			const newLabels = planets.map(({ name, parent }) => {
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
			if (JSON.stringify(newLabels) !== JSON.stringify(prevLabelScreens)) {
				labelScreens = newLabels;
				prevLabelScreens = newLabels;
			}

			composer.render(scene, camera);
			requestAnimationFrame(animate);
		};

		animate();

		// Debounced resize handler
		let resizeTimeout: ReturnType<typeof setTimeout>;
		const handleResize = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				camera.aspect = container.clientWidth / container.clientHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(container.clientWidth, container.clientHeight);
			}, 100);
		};

		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				selectPlanetByMesh(null);
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
		<button
			type="button"
			class="label-btn"
			aria-label="Select planet {label.name}"
			style="
				position: absolute;
				left: {label.x}px;
				top: {label.y}px;
				transform: translate(-50%, -50%);
			"
			on:click={() => {
				const planet = planets.find(p => p.name === label.name);
				if (planet) selectPlanetByMesh(planet.mesh);
			}}
		>
			{label.name}
		</button>
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
    .label-btn {
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        white-space: nowrap;
        user-select: none;
        color: white;
        font-weight: bold;
        text-shadow: 0 0 5px #00ffff;
        z-index: 99999;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        outline: none;
    }
    .label-btn:focus {
        outline: 2px solid cyan;
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
