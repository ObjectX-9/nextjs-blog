import React from 'react';
import Image from 'next/image';
import { Link as LinkIcon } from 'lucide-react';

interface Link {
  url: string;
  title: string;
  icon?: string;
}

interface LinksListProps {
  links: Link[];
  isMobile?: boolean;
}

/**
 * 链接列表组件，支持桌面端和移动端
 */
export const LinksList: React.FC<LinksListProps> = ({
  links,
  isMobile = false
}) => {
  if (!links || links.length === 0) return null;

  return (
    <div className={`${isMobile ? 'mb-2 gap-1.5' : 'mb-3 gap-2'} flex flex-wrap`}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center ${isMobile ? 'space-x-1 text-xs px-2 py-0.5' : 'space-x-1.5 text-sm px-2 py-1'} text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 rounded-full`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {link.icon ? (
            <Image
              src={link.icon}
              alt="Link icon"
              width={isMobile ? 12 : 14}
              height={isMobile ? 12 : 14}
              className="rounded"
            />
          ) : (
            <LinkIcon size={isMobile ? 12 : 14} />
          )}
          <span className={`truncate ${isMobile ? 'max-w-[160px]' : 'max-w-[200px]'}`}>
            {link.title}
          </span>
        </a>
      ))}
    </div>
  );
};

export default LinksList;
