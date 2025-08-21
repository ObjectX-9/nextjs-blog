'use client';
import { useEffect, useRef } from 'react';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import 'prismjs/themes/prism.css';
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
// 导入常用语言支持
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import Prism from 'prismjs';
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
import { ImagePreview, useImagePreview } from '../components/ImagePreview';

interface MarkdownRendererProps {
  content: string;
  isMobile?: boolean;
  theme?: 'default' | 'github' | 'notion' | 'dark' | 'academic' | 'minimal' | 'material' | 'dracula' | 'solarized-light' | 'vscode' | 'monokai' | 'typora' | 'bear';
  className?: string;
  enableImagePreview?: boolean; // 是否启用图片预览功能
}

export const MarkdownRenderer = ({
  content,
  isMobile = false,
  theme = 'github',
  className = '',
  enableImagePreview = true
}: MarkdownRendererProps) => {
  const viewerRef = useRef<Viewer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用图片预览钩子
  const { previewImage, closePreview } = useImagePreview({
    enableImagePreview,
    containerRef,
    content
  });

  // 获取主题CSS类名
  const getThemeClass = () => {
    if (theme === 'default') return '';
    return `markdown-theme-${theme}`;
  };

  // 当内容变化时更新viewer
  useEffect(() => {
    if (viewerRef.current) {
      const viewer = viewerRef.current.getInstance();
      viewer.setMarkdown(content);
    }
  }, [content]);

  return (
    <>
      <div
        ref={containerRef}
        className={`
          markdown-content 
          ${getThemeClass()} 
          ${isMobile ? 'text-sm' : ''} 
          ${className}
        `}
      >
        <Viewer
          ref={viewerRef}
          initialValue={content}
          plugins={[
            [codeSyntaxHighlight, { highlighter: Prism }]
          ]}
        />
      </div>

      {/* 图片预览弹窗 */}
      {previewImage && (
        <ImagePreview
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={closePreview}
        />
      )}
    </>
  );
};
