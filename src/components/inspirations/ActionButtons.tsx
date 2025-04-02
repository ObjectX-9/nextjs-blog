import React from 'react';
import { Heart, Eye } from 'lucide-react';

interface ActionButtonsProps {
  inspirationId: string;
  likes: number;
  views: number;
  hasLiked: boolean;
  onLike: (id: string) => void;
  isMobile?: boolean;
}

/**
 * 灵感笔记操作按钮组件，包含点赞和查看数
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  inspirationId,
  likes,
  views,
  hasLiked,
  onLike,
  isMobile = false
}) => {
  return (
    <div className="flex space-x-4 text-gray-500 text-xs">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLike(inspirationId);
        }}
        className={`flex items-center space-x-1 transition-colors ${
          hasLiked ? "text-red-500" : "hover:text-red-500"
        }`}
      >
        <Heart size={isMobile ? 12 : 14} fill={hasLiked ? "currentColor" : "none"} />
        <span>{likes || 0}</span>
      </button>
      <button
        className="flex items-center space-x-1 hover:text-green-500 transition-colors"
        disabled
      >
        <Eye size={isMobile ? 12 : 14} />
        <span>{views || 0}</span>
      </button>
    </div>
  );
};

export default ActionButtons;
