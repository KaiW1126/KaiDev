/**
 * API Route: /api/likes/[articleId]
 *
 * GET    - 記事のいいね数を取得
 * POST   - 記事にいいねを追加
 * DELETE - 記事のいいねを取り消し
 */
import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { supabase } from '../../../lib/supabase';

// SSR モードを有効化（この API は動的に処理する必要がある）
export const prerender = false;

const MAX_ARTICLE_ID_LENGTH = 100;
const ARTICLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function errorResponse(message: string, status: number): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

async function validateArticleId(
	articleId: string | undefined
): Promise<{ articleId: string } | Response> {
	if (
		!articleId ||
		articleId.length > MAX_ARTICLE_ID_LENGTH ||
		!ARTICLE_ID_PATTERN.test(articleId)
	) {
		return errorResponse('Invalid article ID', 400);
	}

	if (!(await getEntry('blog', articleId))) {
		return errorResponse('Article not found', 404);
	}

	return { articleId };
}

// GET: いいね数を取得
export const GET: APIRoute = async ({ params }) => {
	try {
		const validation = await validateArticleId(params.articleId);
		if (validation instanceof Response) return validation;
		const { articleId } = validation;

		const { count, error } = await supabase
			.from('likes')
			.select('*', { count: 'exact', head: true })
			.eq('article_id', articleId);

		if (error) {
			throw error;
		}

		return new Response(JSON.stringify({ articleId, likeCount: count ?? 0 }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch {
		console.error('Error fetching likes');
		return new Response(JSON.stringify({ error: 'Failed to fetch likes' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// POST: いいねを追加
export const POST: APIRoute = async ({ params }) => {
	try {
		const validation = await validateArticleId(params.articleId);
		if (validation instanceof Response) return validation;
		const { articleId } = validation;

		// いいねを追加
		const { error: insertError } = await supabase.from('likes').insert({ article_id: articleId });

		if (insertError) {
			throw insertError;
		}

		// 最新のいいね数を取得
		const { count, error: countError } = await supabase
			.from('likes')
			.select('*', { count: 'exact', head: true })
			.eq('article_id', articleId);

		if (countError) {
			throw countError;
		}

		return new Response(JSON.stringify({ success: true, likeCount: count ?? 0 }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch {
		console.error('Error adding like');
		return new Response(JSON.stringify({ error: 'Failed to add like' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// DELETE: いいねを取り消し
export const DELETE: APIRoute = async ({ params }) => {
	try {
		const validation = await validateArticleId(params.articleId);
		if (validation instanceof Response) return validation;
		const { articleId } = validation;

		// アトミックに1件削除（RPC関数を使用してレースコンディション対策）
		const { error: deleteError } = await supabase.rpc('delete_one_like', {
			target_article_id: articleId,
		});

		if (deleteError) {
			throw deleteError;
		}

		// 最新のいいね数を取得
		const { count, error: countError } = await supabase
			.from('likes')
			.select('*', { count: 'exact', head: true })
			.eq('article_id', articleId);

		if (countError) {
			throw countError;
		}

		return new Response(JSON.stringify({ success: true, likeCount: count ?? 0 }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch {
		console.error('Error removing like');
		return new Response(JSON.stringify({ error: 'Failed to remove like' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
