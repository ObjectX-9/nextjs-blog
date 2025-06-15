'use client';
import { useState } from 'react';
import { MarkdownEditor } from '@/components/customMdRender/components/MarkdownEditor';

const testContent = `# 代码高亮测试

## JavaScript 示例
\`\`\`javascript
function hello() {
  console.log('Hello World!');
  const name = 'Test';
  return \`Hello \${name}\`;
}
\`\`\`

## TypeScript 示例
\`\`\`typescript
interface User {
  id: number;
  name: string;
}

const user: User = {
  id: 1,
  name: 'John'
};
\`\`\`

## Python 示例
\`\`\`python
def hello_world():
    print("Hello, World!")
    return "success"
\`\`\`
`;

export default function TestHighlightPage() {
    const [content, setContent] = useState(testContent);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">代码高亮功能测试</h1>
                <div className="bg-white rounded-lg shadow" style={{ height: '600px' }}>
                    <MarkdownEditor
                        initialContent={content}
                        onChange={setContent}
                        showToc={false}
                    />
                </div>
            </div>
        </div>
    );
} 