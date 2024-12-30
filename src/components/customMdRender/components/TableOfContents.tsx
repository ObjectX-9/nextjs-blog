import React, { useState, useEffect } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const headings = content.split('\n')
      .filter(line => line.startsWith('#'))
      .map(line => {
        const level = line.match(/^#+/)?.[0].length || 0;
        const text = line.replace(/^#+\s+/, '');
        const id = text.toLowerCase().replace(/\s+/g, '-');
        return { id, text, level };
      });
    
    setToc(headings);
  }, [content]);

  return (
    <div className="fixed top-20 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">目录</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <span className={`block w-4 h-4 transform transition-transform ${
              isCollapsed ? 'rotate-180' : ''
            }`}>
              {/* 使用 Unicode 字符创建箭头 */}
              <span className="block text-lg leading-none">▲</span>
            </span>
          </button>
        </div>
        
        {!isCollapsed && (
          <nav className="mt-2 space-y-1 max-h-[60vh] overflow-y-auto">
            {toc.map((item, index) => (
              <a
                key={index}
                href={`#${item.id}`}
                className={`
                  block text-sm hover:text-blue-500 transition-colors duration-200
                  ${item.level === 1 ? 'font-semibold' : 'font-normal'}
                `}
                style={{ marginLeft: `${(item.level - 1) * 0.75}rem` }}
              >
                {item.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};
