import React from 'react';

interface TagsListProps {
  tags: string[];
  isMobile?: boolean;
}

/**
 * 标签列表组件，支持桌面端和移动端
 */
export const TagsList: React.FC<TagsListProps> = ({
  tags,
  isMobile = false
}) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap ${isMobile ? 'gap-1.5 mb-2' : 'gap-2 mb-3'}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className={`${isMobile ? 'px-2 py-0.5' : 'px-2 py-1'} bg-blue-50 text-blue-600 rounded-full text-xs`}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
};

export default TagsList;
