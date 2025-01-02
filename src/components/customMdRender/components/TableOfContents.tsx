import React, { useState, useEffect, useCallback } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content, className = '' }) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = content.split('\n')
      .filter(line => line.startsWith('#'))
      .map(line => {
        const level = line.match(/^#+/)?.[0].length || 0;
        const text = line.replace(/^#+\s+/, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return { id, text, level };
      });
    
    setToc(headings);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px'
      }
    );

    toc.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [toc]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  if (toc.length === 0) return null;

  return (
    <nav className={`fixed top-20 right-8 w-64 notion-scrollbar overflow-y-auto max-h-[calc(100vh-6rem)] z-10 ${className}`}>
      <div className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
        目录
      </div>
      <div className="space-y-1">
        {toc.map((item, index) => (
          <a
            key={index}
            href={`#${item.id}`}
            onClick={(e) => handleClick(e, item.id)}
            className={`
              block text-sm transition-colors duration-200 rounded-sm
              ${item.id === activeId 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}
            `}
            style={{ 
              paddingLeft: `${(item.level - 1) * 1}rem`,
              lineHeight: '1.75rem',
              fontSize: item.level === 1 ? '0.9rem' : '0.875rem',
              fontWeight: item.level === 1 ? 500 : 400
            }}
          >
            {item.text}
          </a>
        ))}
      </div>
    </nav>
  );
};
