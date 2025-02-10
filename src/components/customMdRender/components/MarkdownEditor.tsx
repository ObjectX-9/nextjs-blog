'use client';
import React, { useState } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { MarkdownRenderer } from '../core/MarkdownRenderer';
import { componentRegistry } from '../ComponentRegistry';
import './MarkdownEditor.css';
import imageCompression from 'browser-image-compression';

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

  // 压缩图片
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1.9, // 设置为1.9MB以确保在2MB以下
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type as string,
      initialQuality: 0.8,
      onProgress: (progress: number) => {
        console.log('压缩进度：', progress);
      }
    };

    try {
      let compressedFile = await imageCompression(file, options);

      // 如果第一次压缩后仍然大于1.9MB，继续压缩
      let quality = 0.8;
      while (compressedFile.size > 1.9 * 1024 * 1024 && quality > 0.1) {
        quality -= 0.1;
        options.initialQuality = quality;
        console.log(`尝试使用质量 ${quality.toFixed(2)} 重新压缩`);
        compressedFile = await imageCompression(file, options);
      }

      // 创建新的File对象，保持原始文件名和类型
      const resultFile = new File(
        [compressedFile],
        file.name,
        { type: file.type }
      );

      console.log("原始文件大小:", (file.size / 1024 / 1024).toFixed(2), "MB");
      console.log("压缩后文件大小:", (resultFile.size / 1024 / 1024).toFixed(2), "MB");
      console.log("最终压缩质量:", quality.toFixed(2));

      if (resultFile.size > 2 * 1024 * 1024) {
        throw new Error("无法将图片压缩到2MB以下，请选择较小的图片");
      }

      return resultFile;
    } catch (error: any) {
      console.error("压缩图片时出错:", error);
      throw new Error(error.message || "图片压缩失败");
    }
  };

  // 处理图片上传
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('不支持的图片格式');
      }

      // 压缩图片
      const compressedFile = await compressImage(file);

      // 创建表单数据
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('type', 'docs'); // 上传到 images/docs 目录

      // 发送上传请求
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '上传失败');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('图片上传错误:', error);
      
      // 根据错误类型提供更具体的用户反馈
      if (error instanceof Error) {
        switch (error.message) {
          case '不支持的图片格式':
            alert('仅支持 JPEG、PNG、WebP 和 GIF 格式的图片');
            break;
          case '无法将图片压缩到2MB以下，请选择较小的图片':
            alert('图片文件过大，请选择小于 2MB 的图片');
            break;
          default:
            alert('图片上传失败，请重试');
        }
      }
      
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
            const imageMarkdown = `\n![](${imageUrl})\n`;
            const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
              setContent(newContent);
              onChange?.(newContent);
              // 设置光标位置
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
                textarea.focus();
              }, 0);
            }
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
      const imageMarkdown = `\n![](${imageUrl})\n`;
      const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
        setContent(newContent);
        onChange?.(newContent);
        // 设置光标位置
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
          textarea.focus();
        }, 0);
      }
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
