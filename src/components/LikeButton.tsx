'use client';

import { useState } from 'react';

interface LikeButtonProps {
  articleId: string;
  initialLikes: number;
}

interface Article {
  _id?: string;
  likes: number;
}

export default function LikeButton({ articleId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(() => {
    if (typeof window !== 'undefined') {
      const liked = localStorage.getItem(`liked_${articleId}`);
      return liked === 'true';
    }
    return false;
  });

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();  // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡
    
    if (isLiked) return;

    try {
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const newLikes = likes + 1;
        setLikes(newLikes);
        setIsLiked(true);
        localStorage.setItem(`liked_${articleId}`, 'true');

        // 更新所有缓存中的文章点赞数
        const cacheKeys = Object.keys(localStorage);
        cacheKeys.forEach(key => {
          if (key.startsWith('docs_articles_')) {
            try {
              const cachedData = localStorage.getItem(key);
              if (cachedData) {
                const parsed = JSON.parse(cachedData);
                if (parsed.data && Array.isArray(parsed.data)) {
                  const updatedArticles = parsed.data.map((article: Article) => {
                    if (article._id?.toString() === articleId) {
                      return {
                        ...article,
                        likes: newLikes
                      };
                    }
                    return article;
                  });
                  
                  localStorage.setItem(
                    key,
                    JSON.stringify({
                      data: updatedArticles,
                      timestamp: Date.now(),
                    })
                  );
                }
              }
            } catch (error) {
              console.error('Error updating cache:', error);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  return (
    <span 
      className="flex items-center gap-1 cursor-pointer" 
      onClick={handleLike}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill={isLiked ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
      </svg>
      <span>{likes}</span>
    </span>
  );
}
