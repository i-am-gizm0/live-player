<script lang="ts">
  import { formatBehindTime } from "./seekbar";

  export let duration: number;
  export let behind: number;
  export let startTime: Date | undefined = undefined;

  $: start = startTime ?? new Date();

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
    style="--position: {(duration - behind) / duration}"
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
    --position: 1;
  }

  .seekbar::before {
    content: "";
    position: absolute;
    width: calc(100% * var(--position));
    height: 100%;
    background-color: #f55;
    border-radius: 2px;
  }
</style>
