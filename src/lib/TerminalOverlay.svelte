<script lang="ts">
	export let selectedProject: { name: string; description: string } | null = null;
</script>

<style>
    .terminal {
        position: absolute;
        top: 2rem;
        left: 2rem;
        background: rgba(0, 255, 255, 0.05);
        border: 1px solid rgba(0, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        color: cyan;
        font-family: 'Courier New', monospace;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
        z-index: 10;
        min-width: 250px;
    }
    h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.2rem;
        text-shadow: 0 0 3px #0ff;
    }
    .placeholder {
        color: rgba(0, 255, 255, 0.4);
        font-style: italic;
    }
</style>

<div class="terminal">
	{#if selectedProject}
		<h2>{selectedProject.name}</h2>
		<p>{selectedProject.description}</p>
	{:else}
		<p class="placeholder">Click a planet to view project info</p>
	{/if}
</div>
