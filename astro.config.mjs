// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://descubre.emma.pe",
  output: "server",
  adapter: node({ mode: "standalone" }),
  server: { host: true, port: 3000 },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { exclude: ["better-sqlite3"] },
    ssr: { external: ["better-sqlite3", "sharp"] },
  },
});
