/**
 * API Route: /api/likes/[articleId]
 *
 * GET    - 記事のいいね数を取得
 * POST   - 記事にいいねを追加
 * DELETE - 記事のいいねを取り消し
 */
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

// SSR モードを有効化（この API は動的に処理する必要がある）
export const prerender = false;

// GET: いいね数を取得
export const GET: APIRoute = async ({ params }) => {
	const { articleId } = params;

	if (!articleId) {
		return new Response(JSON.stringify({ error: 'Article ID is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
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
	} catch (error) {
		console.error('Error fetching likes:', error);
		return new Response(JSON.stringify({ error: 'Failed to fetch likes' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// POST: いいねを追加
export const POST: APIRoute = async ({ params }) => {
	const { articleId } = params;

	if (!articleId) {
		return new Response(JSON.stringify({ error: 'Article ID is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
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
	} catch (error) {
		console.error('Error adding like:', error);
		return new Response(JSON.stringify({ error: 'Failed to add like' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// DELETE: いいねを取り消し
export const DELETE: APIRoute = async ({ params }) => {
	const { articleId } = params;

	if (!articleId) {
		return new Response(JSON.stringify({ error: 'Article ID is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		// いいねを1つ削除（複数ある場合は1つだけ削除）
		const { data: likeToDelete } = await supabase
			.from('likes')
			.select('id')
			.eq('article_id', articleId)
			.limit(1)
			.single();

		if (likeToDelete) {
			const { error: deleteError } = await supabase
				.from('likes')
				.delete()
				.eq('id', likeToDelete.id);

			if (deleteError) {
				throw deleteError;
			}
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
	} catch (error) {
		console.error('Error removing like:', error);
		return new Response(JSON.stringify({ error: 'Failed to remove like' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

