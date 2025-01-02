'use client';
import React, { useState } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { MarkdownRenderer } from '../core/MarkdownRenderer';
import { componentRegistry } from '../ComponentRegistry';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent = '',
  onChange,
}) => {
  const [content, setContent] = useState(initialContent);
  const [showComponentList, setShowComponentList] = useState(false);
  const [uploading, setUploading] = useState(false);

  const registeredComponents = componentRegistry.getAll();
  const componentList = Object.entries(registeredComponents);

  const handleInsertComponent = (componentId: string) => {
    const componentTag = `<div data-component="${componentId}"></div>`;
    const newContent = content.slice(0, content.length) + componentTag;
    setContent(newContent);
    onChange?.(newContent);
    setShowComponentList(false);
  };

  const handleEditorChange = (value?: string) => {
    const newContent = value || '';
    setContent(newContent);
    onChange?.(newContent);
  };

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'docs'); // 上传到 images/docs 目录

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
      console.error('上传错误:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 处理粘贴事件
  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        event.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          try {
            const imageUrl = await handleImageUpload(file);
            const imageMarkdown = `![](${imageUrl})`;
            const newContent = content.slice(0, content.length) + imageMarkdown;
            setContent(newContent);
            onChange?.(newContent);
          } catch (error) {
            alert('图片上传失败');
          }
        }
        break;
      }
    }
  };

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    try {
      const imageUrl = await handleImageUpload(file);
      const imageMarkdown = `![](${imageUrl})`;
      const newContent = content.slice(0, content.length) + imageMarkdown;
      setContent(newContent);
      onChange?.(newContent);
    } catch (error) {
      alert('图片上传失败');
    }
  };

  // 自定义命令列表
  const customCommands = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.hr,
    commands.title,
    commands.link,
    commands.quote,
    commands.code,
    commands.codeBlock,
    {
      name: 'uploadImage',
      keyCommand: 'uploadImage',
      buttonProps: { 'aria-label': 'Upload Image' },
      icon: (
        <span>📷</span>
      ),
      execute: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          if (target && target.files) {
            handleFileSelect({ target } as React.ChangeEvent<HTMLInputElement>);
          }
        };
        input.click();
      },
    },
    {
      name: 'insertComponent',
      keyCommand: 'insertComponent',
      buttonProps: { 'aria-label': 'Insert Component' },
      icon: (
        <span>🧩</span>
      ),
      execute: () => {
        setShowComponentList(true);
      },
    },
  ];

  return (
    <div className="markdown-editor h-full" data-color-mode="light">
      <div className="editor-toolbar border-b p-2 bg-white">
        {showComponentList && (
          <div className="component-list absolute z-10 mt-1 bg-white border rounded-lg shadow-lg">
            {componentList.length === 0 ? (
              <div className="p-3 text-gray-500">暂无可用组件</div>
            ) : (
              componentList.map(([id, config]) => (
                <div
                  key={id}
                  className="p-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleInsertComponent(id)}
                >
                  {config.type}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="editor-container h-[calc(100%-48px)] flex">
        <div className="w-1/2 h-full border-r" onPaste={handlePaste}>
          <MDEditor
            value={content}
            onChange={handleEditorChange}
            height="100%"
            preview="edit"
            hideToolbar={false}
            visibleDragbar={false}
            commands={customCommands}
            className="custom-md-editor"
          />
        </div>
        <div className="w-1/2 h-full overflow-auto p-4 bg-white">
          <div className="prose max-w-none [&_h1]:!text-lg [&_h2]:!text-base [&_h3]:!text-sm [&_h4]:!text-xs [&_p]:!text-xs [&_ul]:!text-xs [&_ol]:!text-xs [&_li]:!text-xs [&_pre]:!text-xs [&_code]:!text-xs [&_blockquote]:!text-xs [&_table]:!text-xs [&_img]:!w-full [&_img]:!max-w-full [&_pre]:!overflow-x-auto [&_pre]:!whitespace-pre-wrap [&_pre]:!break-words !text-[12px] !leading-[1.5]">
            <MarkdownRenderer content={content} isMobile={true} />
          </div>
        </div>
      </div>
    </div>
  );
};
