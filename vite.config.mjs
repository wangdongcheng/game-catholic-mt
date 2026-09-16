import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL("./", import.meta.url));
const distRoot = resolve(projectRoot, "dist");

const pageInputs = {
  home: resolve(projectRoot, "index.html"),
  stillWeSail: resolve(projectRoot, "still-we-sail/index.html"),
  islandLeap: resolve(projectRoot, "island-leap/index.html"),
};

const socialImages = [
  "og-image.png",
  "still-we-sail/og-image.png",
  "island-leap/og-image.png",
];

function preserveSocialImages() {
  return {
    name: "preserve-social-images",
    async writeBundle() {
      await Promise.all(
        socialImages.map(async (relativePath) => {
          const destination = resolve(distRoot, relativePath);
          await mkdir(dirname(destination), { recursive: true });
          await copyFile(resolve(projectRoot, relativePath), destination);
        }),
      );
    },
  };
}

export default defineConfig({
  root: projectRoot,
  publicDir: false,
  plugins: [preserveSocialImages()],
  build: {
    outDir: distRoot,
    emptyOutDir: true,
    rollupOptions: {
      input: pageInputs,
    },
  },
});
