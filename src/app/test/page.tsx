'use client';
import { useState } from 'react';
import { MarkdownEditor } from '@/components/customMdRender/components/MarkdownEditor';

const initialContent = `# 欢迎使用带目录的Markdown编辑器

这是一个功能强大的Markdown编辑器，具有自动生成目录的功能。

## 功能特点

### 实时目录生成
编辑器会自动解析文档中的标题，并生成可点击的目录。

### 智能导航
点击目录中的任意标题，编辑器会自动滚动到对应位置。

## 使用方法

### 基本操作
1. 在编辑区域输入Markdown内容
2. 使用 # 符号创建标题
3. 左侧目录会自动更新

### 高级功能
- 支持多级标题（H1-H6）
- 可折叠目录面板
- 图片拖拽上传
- 实时预览

## 示例内容

### 代码块
\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

### 列表
- 项目一
- 项目二
  - 子项目 A
  - 子项目 B

### 表格
| 功能 | 状态 |
|------|------|
| 目录生成 | ✅ |
| 实时预览 | ✅ |
| 图片上传 | ✅ |

## 深层嵌套示例

### 第三级标题
内容内容内容...

#### 第四级标题
更多内容...

##### 第五级标题
更深层的内容...

###### 第六级标题
最深层的内容...

## 结语

希望这个编辑器能够帮助你更好地创作和管理文档内容！`;

export default function TestPage() {
    const [content, setContent] = useState(initialContent);
    const [documentTheme, setDocumentTheme] = useState<'default' | 'github' | 'notion' | 'dark' | 'academic' | 'minimal' | 'material' | 'dracula' | 'solarized-light' | 'vscode' | 'monokai' | 'typora' | 'bear'>('default');

    const getThemeName = (theme: string) => {
        switch (theme) {
            case 'default': return '默认主题';
            case 'github': return 'GitHub风格';
            case 'notion': return 'Notion风格';
            case 'dark': return '暗色主题';
            case 'academic': return '学术论文';
            case 'minimal': return '简洁风格';
            case 'material': return 'Material Design';
            case 'dracula': return 'Dracula主题';
            case 'solarized-light': return 'Solarized Light';
            case 'vscode': return 'VS Code主题';
            case 'monokai': return 'Monokai主题';
            case 'typora': return 'Typora风格';
            case 'bear': return 'Bear风格';
            default: return '默认主题';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                带目录和文档主题的Markdown编辑器测试
                            </h1>
                            <p className="text-gray-600">
                                测试Toast UI Editor的自定义目录功能和文档渲染主题切换。左侧显示文档目录，可点击跳转到对应章节。
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">当前文档主题</div>
                            <div className="font-medium text-gray-900">{getThemeName(documentTheme)}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '800px' }}>
                    <MarkdownEditor
                        initialContent={content}
                        onChange={(newContent) => {
                            setContent(newContent);
                            console.log('内容已更新:', newContent.length, '字符');
                        }}
                        showToc={true}
                        documentTheme={documentTheme}
                        onDocumentThemeChange={setDocumentTheme}
                        height="800px"
                    />
                </div>

                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">使用说明：</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">目录功能：</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• 左侧面板显示文档目录，会根据内容中的标题自动生成</li>
                                <li>• 点击目录中的任意项目，编辑器会滚动到对应位置</li>
                                <li>• 可以点击目录面板顶部的折叠按钮来隐藏/显示目录</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">主题功能（共13种）：</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• 🐙 GitHub风格：仿GitHub README文档样式</li>
                                <li>• 📝 Notion风格：仿Notion文档的排版样式</li>
                                <li>• 🌙 暗色主题：适合夜间阅读的暗色背景</li>
                                <li>• 🎓 学术论文：符合学术规范的排版样式</li>
                                <li>• ✨ 简洁风格：干净简洁的文档样式</li>
                                <li>• 🎨 Material Design：Google Material风格</li>
                                <li>• 🧛 Dracula主题：流行的暗色编程主题</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">更多主题：</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• ☀️ Solarized Light：经典的Solarized亮色主题</li>
                                <li>• 💻 VS Code主题：仿VS Code编辑器样式</li>
                                <li>• 🔥 Monokai主题：经典的编程主题</li>
                                <li>• 🦋 Typora风格：仿Typora编辑器样式</li>
                                <li>• 🐻 Bear风格：仿Bear笔记应用样式</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <h3 className="font-medium text-gray-800 mb-2">其他功能：</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• 支持拖拽图片上传（会自动处理并插入到编辑器中）</li>
                            <li>• 支持实时预览，编辑内容时右侧会同步显示渲染结果</li>
                            <li>• 主题切换会立即应用到预览区域，无需刷新页面</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 