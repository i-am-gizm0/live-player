export function formatBehindTime(time: number) {
  if (time < 60) {
    const timeDiv5 = Math.floor(time / 5);
    return `${timeDiv5 * 5}s`;
  } else {
    const minutes = Math.floor(time / 60);
    const seconds = Math.round((Math.floor(time / 5) * 5) % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}
