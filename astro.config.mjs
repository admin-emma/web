// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	output: 'server', // Habilitar SSR
	adapter: node({
		mode: 'standalone'
	}),
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			exclude: ['better-sqlite3']
		}
	}
});
