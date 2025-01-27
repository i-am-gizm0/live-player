import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "./src/main.ts",
      name: "LivePlayer",
      fileName: "live-player",
    },
  },
  plugins: [
    svelte({
      include: ["src/*.svelte"],
      compilerOptions: {
        css: true,
        customElement: true,
      },
    }),
  ],
});
