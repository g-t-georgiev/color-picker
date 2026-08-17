import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ColorPickerComponents",
      fileName: (format) => `color-picker.${format}.js`,
      formats: ["es", "umd", "cjs"]
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled into your library if you have any
      external: [],
      output: {
        globals: {}
      }
    }
  },
  server: {
    open: "/demo/index.html" // Automatically open the demo on `npm run dev`
  }
});