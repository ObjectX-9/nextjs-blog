// 标题项目接口
export interface HeadingItem {
    level: number;
    text: string;
    id: string;
    element?: Element;
}
export const TableOfContents: React.FC<{
    headings: HeadingItem[];
    onHeadingClick: (id: string) => void;
    className?: string;
}> = ({ headings, onHeadingClick, className = '' }) => {
    if (headings.length === 0) {
        return (
            <div className={`p-4 text-gray-500 text-sm ${className}`}>
                暂无目录
            </div>
        );
    }

    return (
        <div className={`p-4 ${className}`}>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">目录</h3>
            <nav>
                <ul className="space-y-1">
                    {headings.map((heading, index) => (
                        <li key={index}>
                            <button
                                onClick={() => {
                                    console.log('点击目录项:', heading.text, heading.id);
                                    onHeadingClick(heading.id);
                                }}
                                className={`
                    w-full text-left p-2 text-sm hover:bg-gray-100 rounded transition-colors
                    ${heading.level === 1 ? 'font-semibold text-gray-900' : ''}
                    ${heading.level === 2 ? 'font-medium text-gray-800 pl-4' : ''}
                    ${heading.level === 3 ? 'text-gray-700 pl-8' : ''}
                    ${heading.level >= 4 ? 'text-gray-600 pl-12' : ''}
                  `}
                                title={heading.text}
                            >
                                <span className="block truncate">{heading.text}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};