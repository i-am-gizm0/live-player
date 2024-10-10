<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { scale } from "svelte/transition";

  const dispatch = createEventDispatcher<{ mouseOver: void; mouseOut: void }>();

  function mouseOver() {
    dispatch("mouseOver");
  }

  function mouseOut() {
    dispatch("mouseOut");
  }

  export let seek: (delta: number) => void;
  export let togglePlayPause: () => void;
  export let paused: boolean;
  export let behind: number;

  export let touch = false;
</script>

<div
  class="playback-controls"
  class:onscreen-controls={touch}
  on:pointerover={mouseOver}
  on:pointerout={mouseOut}
>
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a href="#" class="seek back" on:click|preventDefault={() => seek(-10)}>
    <i class="material-icons-outlined">replay_10</i>
  </a>
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a href="#" class="playpause" on:click|preventDefault={togglePlayPause}>
    {#if paused}
      <i class="material-icons-outlined" transition:scale={{ duration: 100 }}>
        play_arrow
      </i>
    {:else}
      <i class="material-icons-outlined" transition:scale={{ duration: 100 }}>
        pause
      </i>
    {/if}
  </a>
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a
    href="#"
    class="seek ahead"
    on:click|preventDefault={() => seek(30)}
    class:disabled={!behind}
  >
    <i class="material-icons-outlined">forward_30</i>
  </a>
</div>

<style>
  .playback-controls {
    display: inline-grid;
    vertical-align: bottom;
    place-items: center;
    grid-template-columns: auto auto auto;
  }

  .playback-controls:not(.onscreen-controls) {
    grid-template-columns: repeat(3, 1fr);
  }

  div.onscreen-controls {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    font-size: 2rem;
    column-gap: 0.5em;
    z-index: 2;
  }

  .playback-controls > a {
    display: grid;
    place-items: center;
    text-decoration: none !important;
    position: relative;
  }

  .onscreen-controls > a {
    width: 1.75em;
    height: 1.75em;
    background-color: #000b;
    border-radius: 50%;
  }

  .playback-controls > a.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .onscreen-controls > a.playpause {
    font-size: 1.5em;
  }

  .playback-controls > a.playpause > i {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .onscreen-controls > a > i {
    font-size: inherit !important;
  }
</style>
