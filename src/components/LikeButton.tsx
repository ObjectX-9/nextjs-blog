'use client';

import { useState } from 'react';

interface LikeButtonProps {
  articleId: string;
  initialLikes: number;
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
        setLikes(prev => prev + 1);
        setIsLiked(true);
        localStorage.setItem(`liked_${articleId}`, 'true');
      }
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  return (
    <span 
      className="flex items-center gap-1 cursor-pointer" 
      onClick={handleLike}
      onMouseDown={(e) => e.stopPropagation()} // 防止鼠标事件冒泡
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
