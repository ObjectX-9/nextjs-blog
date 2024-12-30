'use client';
import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from '../core/MarkdownRenderer';
import './MarkdownEditor.css';
import { componentRegistry } from '../ComponentRegistry';

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
  const [cursorPosition, setCursorPosition] = useState(0);

  const registeredComponents = componentRegistry.getAll();
  const componentList = Object.entries(registeredComponents);

  useEffect(() => {
    console.log('Registered components:', registeredComponents);
    console.log('Component list:', componentList);
  }, [registeredComponents, componentList]);

  const handleInsertComponent = (componentId: string) => {
    console.log('Inserting component:', componentId);
    const componentTag = `<div data-component="${componentId}"></div>`;
    const newContent =
      content.slice(0, cursorPosition) +
      componentTag +
      content.slice(cursorPosition);

    setContent(newContent);
    onChange?.(newContent);
    setShowComponentList(false);
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCursorPosition(e.target.selectionStart);
    onChange?.(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const newContent =
        content.slice(0, cursorPosition) +
        '  ' +
        content.slice(cursorPosition);
      setContent(newContent);
      onChange?.(newContent);
      setCursorPosition(cursorPosition + 2);
    }
  };

  return (
    <div className="markdown-editor">
      <div className="editor-toolbar">
        <button
          className="insert-component-btn"
          onClick={() => {
            console.log('Toggle component list, current:', !showComponentList);
            setShowComponentList(!showComponentList);
          }}
        >
          插入组件
        </button>
        {showComponentList && (
          <div className="component-list">
            {componentList.length === 0 ? (
              <div className="component-item">暂无可用组件</div>
            ) : (
              componentList.map(([id, config]) => (
                <div
                  key={id}
                  className="component-item"
                  onClick={() => handleInsertComponent(id)}
                >
                  {config.type}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="editor-container">
        <div className="editor-pane">
          <textarea
            value={content}
            onChange={handleEditorChange}
            onKeyDown={handleKeyDown}
            onClick={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
            placeholder="在这里输入 Markdown 内容..."
          />
        </div>
        <div className="preview-pane">
          <MarkdownRenderer
            content={content}
          />
        </div>
      </div>
    </div>
  );
};
