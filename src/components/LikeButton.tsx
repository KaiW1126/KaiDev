/**
 * LikeButton - いいねボタンコンポーネント（React Island）
 *
 * 機能：
 * - いいね数を表示
 * - クリックでいいねを追加
 * - localStorage でいいね済み状態を管理（UX向上）
 * - ハートアニメーション
 */
import { useState, useEffect } from 'react';

interface LikeButtonProps {
	articleId: string;
}

export default function LikeButton({ articleId }: LikeButtonProps) {
	const [likeCount, setLikeCount] = useState<number>(0);
	const [hasLiked, setHasLiked] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);

	// localStorage のキー
	const storageKey = `liked_${articleId}`;

	// 初期化：いいね数取得 + localStorage チェック
	useEffect(() => {
		// localStorage からいいね済み状態を取得
		const liked = localStorage.getItem(storageKey);
		if (liked === 'true') {
			setHasLiked(true);
		}

		// いいね数を取得
		fetchLikeCount();
	}, [articleId]);

	const fetchLikeCount = async () => {
		try {
			const response = await fetch(`/api/likes/${articleId}`);
			if (response.ok) {
				const data = await response.json();
				setLikeCount(data.likeCount);
			}
		} catch (error) {
			console.error('Failed to fetch like count:', error);
		}
	};

	const handleLike = async () => {
		if (isLoading) return;

		setIsLoading(true);
		setIsAnimating(true);

		try {
			// いいね済みなら取り消し、未いいねなら追加
			const method = hasLiked ? 'DELETE' : 'POST';
			const response = await fetch(`/api/likes/${articleId}`, { method });

			if (response.ok) {
				const data = await response.json();
				setLikeCount(data.likeCount);

				if (hasLiked) {
					// 取り消し
					setHasLiked(false);
					localStorage.removeItem(storageKey);
				} else {
					// 追加
					setHasLiked(true);
					localStorage.setItem(storageKey, 'true');
				}
			}
		} catch (error) {
			console.error('Failed to toggle like:', error);
		} finally {
			setIsLoading(false);
			// アニメーション終了
			setTimeout(() => setIsAnimating(false), 300);
		}
	};

	return (
		<button
			onClick={handleLike}
			disabled={isLoading}
			className={`like-button ${hasLiked ? 'liked' : ''} ${isAnimating ? 'animating' : ''}`}
			aria-label={hasLiked ? 'いいね済み' : 'いいねする'}
		>
			<span className="heart-icon">{hasLiked ? '❤️' : '🤍'}</span>
			<span className="like-count">{likeCount}</span>

			<style>{`
        .like-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 9999px;
          background: var(--color-bg, #ffffff);
          color: var(--color-text, #171717);
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .like-button:hover {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .like-button.liked {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .like-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .heart-icon {
          font-size: 1.25rem;
          transition: transform 0.2s ease;
        }

        .like-button.animating .heart-icon {
          animation: heartBeat 0.3s ease;
        }

        .like-count {
          font-weight: 600;
        }

        @keyframes heartBeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        /* ダークモード対応 */
        :global(.dark) .like-button {
          border-color: var(--color-border, #27272a);
          background: var(--color-bg, #0a0a0a);
          color: var(--color-text, #ededed);
        }

        :global(.dark) .like-button:hover,
        :global(.dark) .like-button.liked {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
        }
      `}</style>
		</button>
	);
}
