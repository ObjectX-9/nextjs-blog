'use client';

import { useEffect, useState } from 'react';

interface ViewCounterProps {
  articleId: string;
  initialViews: number;
}

export default function ViewCounter({ articleId, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const [hasIncremented, setHasIncremented] = useState(false);

  useEffect(() => {
    const incrementView = async () => {
      if (hasIncremented) return;

      try {
        const response = await fetch(`/api/articles/${articleId}/view`, {
          method: 'POST',
        });

        if (response.ok) {
          setViews(prev => prev + 1);
          setHasIncremented(true);
          // 使用会话存储，这样刷新页面后会重新计数
          sessionStorage.setItem(`viewed_${articleId}`, 'true');
        }
      } catch (error) {
        console.error('Error incrementing view:', error);
      }
    };

    // 检查是否在此会话中已经增加过浏览量
    const hasViewed = sessionStorage.getItem(`viewed_${articleId}`);
    if (!hasViewed) {
      incrementView();
    }
  }, [articleId, hasIncremented]);

  return (
    <span className="flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <span>{views}</span>
    </span>
  );
}
