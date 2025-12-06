import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"], // Add all your entry points here
  format: ["esm"], // Output ES Modules
  target: "es2020",
  outDir: "dist",
  clean: true, // Clean dist before build
  splitting: false,
  sourcemap: true,
  dts: true, // Generate .d.ts files (replaces tsc for types)
  noExternal: [], // Keep dependencies external (usually good for node apps)
  banner: { js: "#!/usr/bin/env node" },
  esbuildOptions(options, context) {
    options.banner = {
      js: `#!/usr/bin/env node`,
    };
  },
});
