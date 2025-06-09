<script lang="ts">
	import * as THREE from 'three';
	import { onMount } from 'svelte';
	export let scene: THREE.Scene;

	const starCount = 1000;
	const radiusMin = 150;
	const radiusMax = 500;

	function generateStarfield() {
		const geometry = new THREE.BufferGeometry();
		const positions = [];

		for (let i = 0; i < starCount; i++) {
			const radius = THREE.MathUtils.randFloat(radiusMin, radiusMax);
			const theta = Math.random() * 2 * Math.PI;
			const phi = Math.acos(THREE.MathUtils.randFloat(-1, 1));

			const x = radius * Math.sin(phi) * Math.cos(theta);
			const y = radius * Math.sin(phi) * Math.sin(theta);
			const z = radius * Math.cos(phi);

			// Only allow stars OUTSIDE the planetary system zone
			if (radius > 40) {
				positions.push(x, y, z);
			}
		}

		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

		const material = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.5,
			transparent: true,
			opacity: 0.8,
		});

		const stars = new THREE.Points(geometry, material);
		stars.name = 'Starfield';

		return stars;
	}

	onMount(() => {
		const starfield = generateStarfield();
		scene.add(starfield);
	});
</script>
