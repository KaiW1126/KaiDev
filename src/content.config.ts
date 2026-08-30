import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			// New fields
			tags: z.array(z.string()).optional().default([]),
			zennUrl: z.string().url().optional(),
		}),
});

const zenn = defineCollection({
	// Zenn CLIと共有しているルートのarticlesディレクトリを読み込む
	loader: glob({ base: './articles', pattern: '**/*.md' }),
	schema: z
		.object({
			title: z.string(),
			emoji: z.string(),
			type: z.enum(['tech', 'idea']),
			topics: z.array(z.string()),
			published: z.boolean(),
			published_at: z.coerce.date().optional(),
		})
		.superRefine((article, context) => {
			if (article.published && !article.published_at) {
				context.addIssue({
					code: 'custom',
					path: ['published_at'],
					message: '公開するZenn記事にはpublished_atを設定してください',
				});
			}
		}),
});

export const collections = { blog, zenn };
