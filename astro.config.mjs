// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	// hybrid モード: 基本は静的生成、特定ページのみ SSR
	output: 'server',
	adapter: vercel({
		webAnalytics: { enabled: true },
	}),
	integrations: [mdx(), sitemap(), react()],

	vite: {
		plugins: [tailwindcss()],
	},
});
