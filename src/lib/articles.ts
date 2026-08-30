import { getCollection } from 'astro:content';
import { SOCIAL_LINKS } from '../consts';

export interface ArticleSummary {
	title: string;
	description: string;
	pubDate: Date;
	href: string;
	tags: string[];
	source: 'blog' | 'zenn';
}

const DEFAULT_ZENN_DESCRIPTION = 'Zennで公開している技術記事です。';

function createExcerpt(body?: string): string {
	if (!body) return DEFAULT_ZENN_DESCRIPTION;

	const paragraph = body
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.find(
			(block) =>
				block.length > 0 &&
				!block.startsWith('#') &&
				!block.startsWith('```') &&
				!block.startsWith('- ') &&
				!block.startsWith('* ') &&
				!/^\d+\.\s/.test(block)
		);

	if (!paragraph) return DEFAULT_ZENN_DESCRIPTION;

	return paragraph
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[`*_~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export async function getArticleSummaries(): Promise<ArticleSummary[]> {
	const [blogPosts, zennPosts] = await Promise.all([
		getCollection('blog'),
		getCollection('zenn', ({ data }) => data.published),
	]);

	const articles: ArticleSummary[] = [
		...blogPosts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			href: `/blog/${post.id}/`,
			tags: post.data.tags,
			source: 'blog' as const,
		})),
		...zennPosts.map((post) => ({
			title: post.data.title,
			description: createExcerpt(post.body),
			// 公開記事のpublished_atはContent Collectionのスキーマで必須化している
			pubDate: post.data.published_at!,
			href: `${SOCIAL_LINKS.zenn}/articles/${post.id}`,
			tags: post.data.topics,
			source: 'zenn' as const,
		})),
	];

	return articles.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}
