import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import comlink from "vite-plugin-comlink";

export default defineConfig({
  plugins: [
    checker({ typescript: true }),
    comlink(),
    react(),
    crx({
      manifest: defineManifest({
        manifest_version: 3,
        name: "Maat",
        description:
          "Maat automatically opens Google Meet pages of the meeting that is about to start using iCal URL of Google Calendar.",
        version: process.env.npm_package_version!,
        icons: ["16", "32", "48", "128"].reduce(
          (result, size) => ({ ...result, [size]: `icon/${size}.png` }),
          {}
        ),
        background: {
          service_worker: "src/sw.ts",
        },
        options_page: "settings.html",
        permissions: ["alarms", "storage"],
        host_permissions: ["https://calendar.google.com/*"],
      }),
    }),
  ],

  worker: {
    plugins: [comlink()],
  },
});
