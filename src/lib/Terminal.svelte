<script lang="ts">
  export let lines: string[] = [];
  export let isOpen: boolean = true;

  import { fly, fade, scale } from 'svelte/transition';

  let displayLines: string[] = [];
  let currentLine = '';
  let typingIndex = 0;

  $: if (lines && isOpen) {
    startTyping(lines);
  }

  async function startTyping(newLines: string[]) {
    displayLines = [];
    for (const line of newLines) {
      currentLine = '';
      typingIndex = 0;

      while (typingIndex <= line.length) {
        currentLine = line.slice(0, typingIndex);
        typingIndex++;
        await delay(20);
      }

      displayLines.push(currentLine);
      await delay(100);
    }
  }

  function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

</script>

{#if isOpen}
<div class="terminal-two">
  <pre>
    {#each displayLines as line}
      <div class="terminal-line">{line}</div>
    {/each}

    <!-- currently typing line -->
    {#if currentLine}
      <div class="terminal-line">{currentLine}<span class="cursor">█</span></div>
    {/if}
  </pre>
</div>
  {/if}


<style>
  .terminal-two {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 40vh;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(3px);
    color: #00ffcc;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    overflow-y: auto;
    border-top: 1px solid #00ffcc44;
    box-shadow: 0 -4px 20px #00ffcc33;
    transform-origin: bottom left;
  }

  .terminal-line {
    line-height: 1.4;
    white-space: pre-wrap;
    text-shadow: 0 0 2px #00ffcc;
  }

  .cursor {
    animation: blink 1s steps(1) infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
</style>

