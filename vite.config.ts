import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import UnoCSS from 'unocss/vite';
import path from 'path';

function generateManifest() {
  const manifest = readJsonFile("extension/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  plugins: [
    vue(),
    UnoCSS(),
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ["package.json", "extension/manifest.json"],
      disableAutoLaunch: true,
    }),
  ],
});
