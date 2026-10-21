import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copiar-crm",
      closeBundle() {
        const destino = resolve("dist/crm");
        cpSync(resolve("crm"), destino, {
          recursive: true,
          filter(origem) {
            return !origem.endsWith("config.php");
          }
        });
        const config = resolve("crm/config.php");
        if (existsSync(config)) cpSync(config, resolve(destino, "config.php"));
      }
    }
  ],
  build: {
    outDir: "dist"
  }
});
