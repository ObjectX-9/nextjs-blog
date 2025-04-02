import React, { ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ISite } from '@/app/model/site';

interface InspirationHeaderProps {
  title?: string;
  createdAt: string | Date;
  site: ISite | null;
  isMobile?: boolean;
  children: ReactNode;
}

/**
 * 灵感笔记头部组件，包含作者信息和标题
 */
export const InspirationHeader: React.FC<InspirationHeaderProps> = ({
  title,
  createdAt,
  site,
  isMobile = false,
  children
}) => {
  return (
    <>
      <div className="flex items-baseline space-x-2 mb-1">
        <span className={`font-medium text-gray-900 ${isMobile ? 'text-sm truncate' : 'text-sm'}`}>
          {site?.author?.name}
        </span>
        <span className="text-xs text-gray-500 flex-shrink-0">
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
          })}
        </span>
      </div>
      <div className={`bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-100 ${isMobile ? 'p-3 w-full' : 'p-4'} inline-block ${isMobile ? 'max-w-full' : ''}`}>
        {title && (
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 ${isMobile ? 'mb-1' : 'mb-2'}`}>
            {title}
          </h3>
        )}
        {children}
      </div>
    </>
  );
};

export default InspirationHeader;
