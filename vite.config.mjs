import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL("./", import.meta.url));
const publicRoot = resolve(projectRoot, "public");
const distRoot = resolve(projectRoot, "dist");

const pageInputs = {
  home: resolve(publicRoot, "index.html"),
  stillWeSail: resolve(publicRoot, "still-we-sail/index.html"),
  islandLeap: resolve(publicRoot, "island-leap/index.html"),
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
          await copyFile(resolve(publicRoot, relativePath), destination);
        }),
      );
    },
  };
}

// Keep the existing public directory as the source root for this multi-page site.
export default defineConfig({
  root: publicRoot,
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
