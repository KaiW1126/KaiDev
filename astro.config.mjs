// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'https://kai-dev-ziq8-neon.vercel.app',
	// 基本は静的生成（デフォルト）。動的が必要なページのみ prerender = false を指定する
	output: 'static',
	adapter: vercel({
		webAnalytics: { enabled: true },
	}),
	integrations: [mdx(), sitemap(), react()],

	vite: {
		plugins: [tailwindcss()],
	},
});
