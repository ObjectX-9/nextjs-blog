'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import 'prismjs/themes/prism.css';
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import './MarkdownThemes.css';

import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import Prism from 'prismjs';

// 导入常用语言支持
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import { HeadingItem, TableOfContents } from './TableOfContents';

// 文档主题类型定义
type DocumentTheme = 'default' | 'github' | 'notion' | 'dark' | 'academic' | 'minimal' | 'material' | 'dracula' | 'solarized-light' | 'vscode' | 'monokai' | 'typora' | 'bear';

interface MarkdownEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  height?: string;
  className?: string;
  showToc?: boolean; // 是否显示目录
  documentTheme?: DocumentTheme; // 文档渲染主题
  onDocumentThemeChange?: (theme: DocumentTheme) => void; // 主题变化回调
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent = '',
  onChange,
  className = '',
  showToc = true,
  documentTheme = 'github',
  onDocumentThemeChange,
}) => {
  const editorRef = useRef<Editor>(null);
  const [uploading, setUploading] = useState(false);
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [currentDocumentTheme, setCurrentDocumentTheme] = useState<DocumentTheme>(documentTheme);

  // 文档主题切换处理
  const handleDocumentThemeToggle = useCallback(() => {
    const themes: DocumentTheme[] = [
      'default', 'github', 'notion', 'dark', 'academic', 'minimal',
      'material', 'dracula', 'solarized-light', 'vscode', 'monokai', 'typora', 'bear'
    ];
    const currentIndex = themes.indexOf(currentDocumentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setCurrentDocumentTheme(nextTheme);
    onDocumentThemeChange?.(nextTheme);
  }, [currentDocumentTheme, onDocumentThemeChange]);

  // 同步外部主题状态
  useEffect(() => {
    setCurrentDocumentTheme(documentTheme);
  }, [documentTheme]);

  // 获取主题CSS类名
  const getThemeClass = useCallback(() => {
    if (currentDocumentTheme === 'default') return '';
    return `markdown-theme-${currentDocumentTheme}`;
  }, [currentDocumentTheme]);

  // 获取主题图标
  const getThemeIcon = useCallback(() => {
    switch (currentDocumentTheme) {
      case 'default': return '📄';
      case 'github': return '🐙';
      case 'notion': return '📝';
      case 'dark': return '🌙';
      case 'academic': return '🎓';
      case 'minimal': return '✨';
      case 'material': return '🎨';
      case 'dracula': return '🧛';
      case 'solarized-light': return '☀️';
      case 'vscode': return '💻';
      case 'monokai': return '🔥';
      case 'typora': return '🦋';
      case 'bear': return '🐻';
      default: return '📄';
    }
  }, [currentDocumentTheme]);

  // 获取主题名称
  const getThemeName = useCallback(() => {
    switch (currentDocumentTheme) {
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
  }, [currentDocumentTheme]);

  // 解析Markdown内容中的标题
  const parseHeadings = useCallback((markdown: string): HeadingItem[] => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: HeadingItem[] = [];
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = `heading-${text.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '')}-${headings.length}`;

      headings.push({
        level,
        text,
        id,
      });
    }

    return headings;
  }, []);

  // 处理内容变化
  const handleChange = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.getInstance().getMarkdown();

      // 解析标题
      const parsedHeadings = parseHeadings(content);
      setHeadings(parsedHeadings);

      onChange?.(content);
    }
  }, [onChange, parseHeadings]);

  // 初始化时解析标题
  useEffect(() => {
    if (initialContent) {
      const parsedHeadings = parseHeadings(initialContent);
      setHeadings(parsedHeadings);
    }
  }, [initialContent, parseHeadings]);

  // 处理目录点击，滚动到对应位置
  const handleHeadingClick = useCallback((id: string) => {
    if (!editorRef.current) {
      console.log('编辑器引用不存在');
      return;
    }

    try {
      const editor = editorRef.current.getInstance();
      console.log('编辑器实例:', editor);

      // 找到对应的标题文本
      const heading = headings.find(h => h.id === id);
      if (!heading) {
        console.log('找不到对应标题:', id);
        return;
      }

      console.log('准备滚动到标题:', heading.text);

      // 简化的滚动方法
      const findAndScrollToHeading = () => {
        console.log('开始查找标题元素...');

        // 直接在整个文档中查找包含目标标题的元素
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        console.log('文档中的所有标题数量:', allHeadings.length);

        const targetElement = Array.from(allHeadings as NodeListOf<HTMLElement>).find(el => {
          const text = el.textContent?.trim() || '';
          console.log('检查标题:', text, '目标:', heading.text);
          return text === heading.text;
        });

        if (targetElement) {
          console.log('找到目标元素:', targetElement);

          // 直接滚动到元素
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });

          // 高亮目标元素（可选）
          targetElement.style.backgroundColor = '#fff3cd';
          setTimeout(() => {
            targetElement.style.backgroundColor = '';
          }, 2000);

          return true;
        } else {
          console.log('在文档中未找到目标标题');

          // 作为后备方案，尝试滚动到编辑器中对应的行
          try {
            const markdown = editor.getMarkdown();
            const lines = markdown.split('\n');
            let targetLine = -1;

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line.startsWith('#') && line.includes(heading.text)) {
                targetLine = i + 1; // 行号从1开始
                break;
              }
            }

            console.log('在Markdown中找到目标行:', targetLine);

            if (targetLine > 0) {
              // 尝试移动光标到目标行
              try {
                const currentMode = editor.getCurrentModeType();
                console.log('当前编辑器模式:', currentMode);

                if (currentMode === 'wysiwyg') {
                  editor.changeMode('markdown');
                  setTimeout(() => {
                    editor.moveCursorToStart();
                    // 移动到目标行
                    for (let i = 1; i < targetLine; i++) {
                      editor.exec('goLineDown');
                    }

                    // 切换回原模式
                    setTimeout(() => {
                      editor.changeMode('wysiwyg');
                    }, 200);
                  }, 100);
                } else {
                  editor.moveCursorToStart();
                  for (let i = 1; i < targetLine; i++) {
                    editor.exec('goLineDown');
                  }
                }
                return true;
              } catch (e) {
                console.log('编辑器操作失败:', e);
              }
            }
          } catch (e) {
            console.log('Markdown解析失败:', e);
          }

          return false;
        }
      };

      // 立即尝试滚动
      if (!findAndScrollToHeading()) {
        // 如果失败，稍后重试
        console.log('滚动失败，250ms后重试');
        setTimeout(() => {
          if (!findAndScrollToHeading()) {
            console.log('重试仍然失败，500ms后再次重试');
            setTimeout(findAndScrollToHeading, 500);
          }
        }, 250);
      }

    } catch (error) {
      console.error('滚动到标题时出错:', error);
    }
  }, [headings]);

  // 简化的图片上传
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setUploading(true);

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        throw new Error('请选择图片文件');
      }

      // 检查文件大小 (2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('图片文件不能超过2MB');
      }

      // 创建表单数据
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'docs');

      // 发送上传请求
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('图片上传错误:', error);
      alert(error instanceof Error ? error.message : '图片上传失败');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`markdown-editor w-full h-full flex ${className}`}>
      {/* 目录侧边栏 */}
      {showToc && (
        <div className={`
          bg-gray-50 border-r border-gray-200 flex-shrink-0 transition-all duration-300
          ${tocCollapsed ? 'w-0 overflow-hidden' : 'w-64'}
        `}>
          <div className="h-full overflow-y-auto">
            <div className="p-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">文档导航</span>
              <div className="flex items-center gap-1">
                {/* 文档主题切换按钮 */}
                <button
                  onClick={handleDocumentThemeToggle}
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
                  title={`当前文档主题: ${getThemeName()}, 点击切换`}
                >
                  <span className="text-sm">{getThemeIcon()}</span>
                </button>
                <button
                  onClick={() => setTocCollapsed(!tocCollapsed)}
                  className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                  title={tocCollapsed ? "展开目录" : "收起目录"}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <TableOfContents
              headings={headings}
              onHeadingClick={handleHeadingClick}
            />
          </div>
        </div>
      )}

      {/* 目录折叠按钮 */}
      {showToc && tocCollapsed && (
        <button
          onClick={() => setTocCollapsed(false)}
          className="absolute left-0 top-4 z-10 p-2 bg-white border border-gray-200 rounded-r-md shadow-sm hover:bg-gray-50"
          title="展开目录"
        >
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* 编辑器主体 */}
      <div className="flex-1 flex flex-col min-w-0">
        {uploading && (
          <div className="p-2 bg-blue-50 text-blue-600 text-sm rounded m-2 flex-shrink-0">
            正在上传图片...
          </div>
        )}

        <div className={`flex-1 min-h-0 ${getThemeClass()}`}>
          <Editor
            ref={editorRef}
            initialValue={initialContent}
            previewStyle="vertical"
            height="100%"
            initialEditType="markdown"
            useCommandShortcut={true}
            onChange={handleChange}
            plugins={[
              [codeSyntaxHighlight, { highlighter: Prism }]
            ]}
            hooks={{
              addImageBlobHook: async (blob: Blob | File, callback: (url: string, alt?: string) => void) => {
                try {
                  const imageUrl = await handleImageUpload(blob as File);
                  callback(imageUrl, 'image');
                } catch (error) {
                  console.error('图片上传失败:', error);
                }
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
