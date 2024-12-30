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

  // 自定义命令列表
  const customCommands = [
    ...commands.getCommands(),
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
        <button
          className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => setShowComponentList(!showComponentList)}
        >
          插入组件
        </button>
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
        <div className="w-1/2 h-full border-r">
          <MDEditor
            value={content}
            onChange={handleEditorChange}
            height="100%"
            preview="edit"
            hideToolbar={false}
            visibleDragbar={false}
            className="custom-md-editor"
            commands={customCommands}
          />
        </div>
        <div className="w-1/2 h-full overflow-auto p-4 bg-white">
          <div className="prose max-w-none">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </div>
    </div>
  );
};
