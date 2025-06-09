<script lang="ts">
	import ThreeCanvas from '$lib/ThreeCanvas.svelte';
	import TerminalOverlay from '$lib/TerminalOverlay.svelte';



	let selectedProject: {
		name: string;
		description: string;
	} | null = null;
</script>

<ThreeCanvas on:select={(e) => selectedProject = e.detail} />
<TerminalOverlay {selectedProject} />