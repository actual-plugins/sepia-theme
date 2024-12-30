import { defineConfig } from "vite";
import * as path from "path";
import { fileURLToPath } from "url";
import { createWriteStream, rmSync, writeFileSync } from "fs";
import archiver from "archiver";

import manifest from "./src/manifest";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "src/index.tsx"
      ),
      name: "Shared",
      formats: ["es"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  plugins: [
    {
      name: "vite-plugin-clean-dist",
      buildStart() {
        const distPath = path.resolve(__dirname, "dist");
        console.log("🧹 Cleaning dist folder...");
        rmSync(distPath, { recursive: true, force: true });
        console.log("✅ Dist folder cleaned.");
      },
    },
    {
      name: "vite-plugin-generate-manifest",
      closeBundle() {
        const outputPath = path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          "dist",
          "manifest.json"
        );

        writeFileSync(outputPath, JSON.stringify(manifest, null, 2), "utf-8");
        console.log("✅ manifest.json generated in /dist");
      },
    },
    {
      name: "vite-plugin-zip-dist",
      closeBundle() {
        const distPath = path.resolve(__dirname, "dist");
        const zipName = `payload-${manifest.name}-${manifest.version}.zip`;
        const outputPath = path.resolve(__dirname, "dist", zipName);
        const output = createWriteStream(outputPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        console.log(`📦 Creating ${zipName}...`);

        archive.glob("**/*", {
          cwd: distPath,
          ignore: [zipName],
        });

        archive.pipe(output);
        archive.finalize();

        archive.on("close", () => {
          console.log(`✅ ${zipName} created (${archive.pointer()} total bytes)`);
        });

        archive.on("error", (err) => {
          console.error("❌ Error creating ZIP file:", err.message);
        });
      },
    },
  ],
});
