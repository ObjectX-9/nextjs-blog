import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  content: string;
  className?: string;
}

interface TocItem {
  level: number;
  text: string;
  id: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content, className }) => {
  const headings = content.split('\n')
    .filter(line => line.startsWith('#'))
    .map(line => {
      const level = line.match(/^#+/)?.[0].length || 0;
      const text = line.replace(/^#+\s+/, '');
      const id = text.toLowerCase().replace(/\s+/g, '-');
      return { level, text, id };
    });

  const renderTocItems = (items: TocItem[]) => {
    return items.map((item, index) => (
      <NavigationMenu.Item key={index} className="list-none">
        <NavigationMenu.Link
          className={cn(
            'block select-none rounded-[4px] px-3 py-1.5 text-sm',
            'text-gray-600 dark:text-gray-400',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            'hover:text-gray-900 dark:hover:text-gray-200',
            'transition-colors duration-200'
          )}
          href={`#${item.id}`}
        >
          <span style={{ marginLeft: `${(item.level - 1) * 16}px` }}>
            {item.text}
          </span>
        </NavigationMenu.Link>
      </NavigationMenu.Item>
    ));
  };

  return (
    <NavigationMenu.Root title='目录'>
      <NavigationMenu.List
      >
        {renderTocItems(headings)}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};

export default TableOfContents;
