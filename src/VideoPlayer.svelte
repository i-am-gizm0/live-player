<svelte:options customElement="live-player" />

<script lang="ts">
  import Hls from "hls.js";
  import { onMount } from "svelte";
  import { fade, scale } from "svelte/transition";
  import PlaybackControls from "./PlaybackControls.svelte";
  import MediaQuery from "svelte-media-queries";
  import Seekbar from "./Seekbar.svelte";
  import type { Program } from "./api";
  // import hotkeys from 'hotkeys-js';

  export let src: string;
  export let channelname: string;
  export let program: Program;

  $: poster = program.img.synopsis;

  let video: HTMLVideoElement;
  let player: HTMLElement;

  var hls = new Hls();
  onMount(() => {
    const fontStylesheet = document.createElement("link");
    fontStylesheet.href =
      "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
    fontStylesheet.rel = "stylesheet";
    fontStylesheet.id = "materialiconsoutlined";
    document.head.appendChild(fontStylesheet);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn(event, data);
        if (data.fatal) {
          hls.recoverMediaError();
        }
      });
    }
    video.addEventListener("durationchange", () => {
      duration = video?.duration;
    });
    video.addEventListener("timeupdate", () => {
      currentTime = video?.currentTime;
    });
    console.log(video.textTracks);
    video.addEventListener("loadeddata", ({ target }) => {
      (<HTMLVideoElement>target).textTracks.addEventListener(
        "change",
        updateCaptionButton
      );
      (<HTMLVideoElement>target).textTracks.addEventListener(
        "addtrack",
        updateCaptionButton
      );
      (<HTMLVideoElement>target).textTracks.addEventListener(
        "removetrack",
        updateCaptionButton
      );
    });
    fullscreenEnabled = document.fullscreenEnabled;

    // hotkeys('k', () => {
    //     togglePlayPause();
    //     return false;
    // });

    // hotkeys('f,f11', () => {
    //     toggleFullscreen();
    //     return false;
    // });

    // hotkeys('c', () => {
    //     toggleCC();
    //     return false;
    // });

    // hotkeys('right', () => {
    //     seek(30);
    //     return false;
    // });

    // hotkeys('ctrl+right', () => {
    //     jumpToLive();
    //     return false;
    // });

    // hotkeys('left', () => {
    //     seek(-10);
    //     return false;
    // });

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: channelname,
        artwork: [
          {
            src: poster,
          },
        ],
      });
      navigator.mediaSession.setActionHandler("nexttrack", jumpToLive);
      navigator.mediaSession.setActionHandler(
        "seekbackward",
        ({ seekOffset }) => seek(-(seekOffset ?? 10))
      );
      navigator.mediaSession.setActionHandler("seekforward", ({ seekOffset }) =>
        seek(seekOffset || 30)
      );
    }
  });

  function updateCaptionButton(e: Event) {
    console.log(e);
    if (video?.textTracks?.length) {
      captions = video.textTracks[0].mode == "showing" ? "enabled" : "disabled";
    } else {
      captions = "unavailable";
    }
  }

  const playerLoadDate = new Date();
  let duration = 0;
  let currentTime = 0;
  $: behind = duration - currentTime < 15 ? 0 : duration - currentTime;
  let fullscreenEnabled = false;
  let fullscreen = false;
  let captions = "unavailable";
  let muted = false;
  let paused = true;
  let hideOverlayTimer: number | undefined;

  function toggleCC() {
    if (captions != "unavailable") {
      if (captions == "enabled") {
        ccOff();
      } else {
        ccOn();
      }
    }
  }

  function ccOff() {
    video.textTracks[0].mode = "disabled";
  }

  function ccOn() {
    video.textTracks[0].mode = "showing";
  }

  function togglePlayPause() {
    if (video?.paused) {
      video.play();
      setHideTimer();
    } else {
      video?.pause();
    }
  }

  function seek(time: number) {
    video?.fastSeek(video.currentTime + time);
  }

  function jumpToLive() {
    video?.fastSeek(video.duration - 5);
    video?.play();
  }

  function toggleFullscreen() {
    if (fullscreen) {
      requestExitFullscreen();
    } else {
      requestFullscreen();
    }
  }

  async function requestFullscreen() {
    await player?.requestFullscreen({
      navigationUI: "hide",
    });
  }

  async function requestExitFullscreen() {
    await document.exitFullscreen();
  }

  function handleFullScreenChange() {
    fullscreen =
      document.fullscreenElement === player ||
      document.fullscreenElement?.shadowRoot?.fullscreenElement === player;
  }

  function setHideTimer() {
    if (hideOverlayTimer) {
      clearTimeout(hideOverlayTimer);
    }

    hideOverlayTimer = setTimeout(() => {
      hideOverlayTimer = undefined;
    }, 5000) as unknown as number;
  }

  function mouseOver() {
    mouseOverControls = true;
  }

  function mouseOut() {
    mouseOverControls = false;
  }

  let mouseOverControls = false;
  $: showControls = paused || hideOverlayTimer || mouseOverControls;
</script>

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
/>

<MediaQuery query="(pointer: coarse)" let:matches={isTouch}>
  <main
    bind:this={player}
    on:fullscreenchange={handleFullScreenChange}
    on:pointermove={setHideTimer}
    on:pointerdown={setHideTimer}
    class:hide-controls={!showControls}
  >
    {#if showControls}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="overlay"
        transition:fade={{ duration: 200 }}
        on:dblclick={toggleFullscreen}
      >
        {#if isTouch}
          <PlaybackControls
            touch
            on:mouseOver={mouseOver}
            on:mouseOut={mouseOut}
            {seek}
            {togglePlayPause}
            {paused}
            {behind}
          />
        {/if}
        <div class="bottom">
          <span class="channel">{channelname}</span>
          <Seekbar
            mediaDuration={duration}
            {behind}
            programTiming={program}
            initialStart={playerLoadDate}
          />
          <div
            class="bottom-controls"
            on:pointerover={mouseOver}
            on:pointerout={mouseOut}
          >
            <div class="playback">
              {#if !isTouch}
                <PlaybackControls {seek} {togglePlayPause} {paused} {behind} />
              {/if}
              {#if behind}
                <span class="status" transition:fade={{ duration: 100 }}>
                  <!-- svelte-ignore a11y-invalid-attribute -->
                  <a href="#" on:click|preventDefault={jumpToLive}>
                    Go Live <i class="material-icons-outlined">skip_next</i>
                  </a>
                </span>
              {/if}
            </div>
            <div class="controls">
              <div>
                <!-- svelte-ignore a11y-invalid-attribute -->
                {#if muted}
                  <a
                    href="#"
                    on:click|preventDefault={() => {
                      muted = !muted;
                    }}
                    transition:scale={{ duration: 100 }}
                    ><i class="material-icons-outlined">volume_off</i></a
                  >
                {:else}
                  <a
                    href="#"
                    on:click|preventDefault={() => {
                      muted = !muted;
                    }}
                    transition:scale={{ duration: 100 }}
                    ><i class="material-icons-outlined">volume_up</i></a
                  >
                {/if}
              </div>

              {#if captions != "unavailable"}
                <div>
                  <!-- svelte-ignore a11y-invalid-attribute -->
                  {#if captions == "enabled"}
                    <a
                      href="#"
                      on:click|preventDefault={ccOff}
                      transition:scale={{ duration: 100 }}
                    >
                      <i class="material-icons-outlined">closed_caption</i>
                    </a>
                  {:else}
                    <a
                      href="#"
                      on:click|preventDefault={ccOn}
                      transition:scale={{ duration: 100 }}
                    >
                      <i class="material-icons-outlined"
                        >closed_caption_disabled</i
                      >
                    </a>
                  {/if}
                </div>
              {/if}

              <!-- PiP -->

              {#if fullscreenEnabled}
                {#if fullscreen}
                  <!-- svelte-ignore a11y-invalid-attribute -->
                  <a href="#" on:click|preventDefault={requestExitFullscreen}>
                    <i class="material-icons-outlined">fullscreen_exit</i>
                  </a>
                {:else}
                  <!-- svelte-ignore a11y-invalid-attribute -->
                  <a href="#" on:click|preventDefault={requestFullscreen}>
                    <i class="material-icons-outlined">fullscreen</i>
                  </a>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video
      bind:this={video}
      {poster}
      preload="metadata"
      bind:muted
      bind:paused
    />
  </main>
</MediaQuery>

<style>
  :global(*) {
    user-select: none;
  }

  main {
    display: grid;
    place-items: center;
    position: relative;
    color: #fff;
    font-family: sans-serif;
  }

  main.hide-controls {
    cursor: none;
  }

  div.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    transition: 2s opacity;
  }
  div.overlay > div.bottom {
    box-sizing: border-box;
    display: block;
    opacity: 1;
    position: absolute;
    --v-offset: 0;
    left: 0;
    width: 100%;
    min-height: 40%;
    background: rgb(0, 0, 0);
    background: rgb(0, 0, 0, 0.75);
    background: linear-gradient(
      var(--angle),
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.75) 100%
    );
    padding: 0.75em;
  }

  div.overlay > div.bottom {
    bottom: var(--v-offset);
    --angle: 180deg;
    display: grid;
    grid-template-rows: 1fr auto auto;
    grid-template-columns: 1fr;
    row-gap: 1em;
    place-items: end start;
  }

  span.channel {
    display: block;
    width: 100%;
    font-size: 2em;
    /* text-shadow: #000 0 0 0.25em; */
    /* border-bottom: 1px solid #0004; */
  }

  div.bottom-controls {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .controls {
    display: flex;
  }

  .controls > * {
    display: inline-block;
    margin-inline-start: 1ch;
  }

  .controls > div {
    position: relative;
    width: 24px;
  }

  .controls > div > * {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .status {
    display: inline-block;
  }

  .status > a {
    /* vertical-align: bottom; */
    line-height: 24px;
    text-decoration: none !important;
    background-color: #000b;
    box-sizing: border-box;
    padding: 0.1em;
    border-radius: 4px;
  }

  .material-icons-outlined {
    vertical-align: bottom;
  }

  :global(a) {
    color: inherit !important;
  }

  video {
    width: 100%;
    height: 100%;
    z-index: 0;
  }
</style>
