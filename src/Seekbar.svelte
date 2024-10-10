<script lang="ts">
  import type { ProgramTiming } from "./api";
  import { formatBehindTime } from "./seekbar";

  export let mediaDuration: number;
  export let behind: number;
  export let programTiming: ProgramTiming | undefined = undefined;
  export let initialStart: Date;

  $: isWithinProgramTime =
    programTiming != undefined &&
    initialStart.getTime() >= programTiming.start.getTime() &&
    initialStart.getTime() <
      programTiming.start.getTime() + programTiming.lengthMs;

  $: start = isWithinProgramTime ? programTiming?.start : initialStart;

  function getSeekbarProportion(
    timing: ProgramTiming,
    timestamp: Date
  ): number {
    const programStartMs = timing.start.getTime();
    const timestampMs = timestamp.getTime();

    return (timestampMs - programStartMs) / timing.lengthMs;
  }

  function getSeekbarOffset(timing: ProgramTiming, timeMs: number): number {
    return timeMs / timing.lengthMs;
  }

  function getSeekbarProportions(
    programTiming: ProgramTiming,
    start: Date,
    duration: number,
    behind: number
  ) {
    return {
      start: getSeekbarProportion(programTiming, start),
      buffered: getSeekbarOffset(programTiming, duration * 1000),
      playback: getSeekbarOffset(programTiming, (duration - behind) * 1000),
    };
  }

  $: seekbarProportions =
    isWithinProgramTime && programTiming
      ? getSeekbarProportions(
          programTiming,
          initialStart,
          mediaDuration,
          behind
        )
      : {
          start: 0,
          buffered: 1,
          playback: (mediaDuration - behind) / mediaDuration,
        };

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  });
</script>

<div class="seek">
  <div class="times">
    <span>{formatter.format(start)}</span>
    <span
      >{#if behind}
        -{formatBehindTime(behind)}
      {:else}
        <span class="live">live</span>
      {/if}</span
    >
  </div>
  <div
    class="seekbar"
    style="--start: {seekbarProportions.start}; --buffered: {seekbarProportions.buffered}; --playback: {seekbarProportions.playback}"
  ></div>
</div>

<style>
  .seek {
    display: grid;
    place-items: center;
    width: 100%;
  }

  .times {
    font-size: 0.75em;
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25em;
  }

  span.live {
    background-color: #f55;
    border-radius: 0.25em;
    padding-inline: 0.3ch;
    font-variant: small-caps;
    line-height: 100%;
  }

  .seekbar {
    position: relative;
    display: block;
    width: 100%;
    height: 4px;
    background-color: #9998;
    border-radius: 2px;
  }

  .seekbar::after {
    content: "";
    position: absolute;
    left: calc(100% * var(--start));
    width: calc(100% * var(--playback));
    height: 100%;
    background-color: #f55;
    border-radius: 2px;
  }

  .seekbar::before {
    content: "";
    position: absolute;
    left: calc(100% * var(--start));
    width: calc(100% * var(--buffered));
    height: 100%;
    background-color: #aaa;
    border-radius: 2px;
  }
</style>
