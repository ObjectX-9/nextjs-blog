'use client';
import React, { useState } from 'react';
import { MarkdownRenderer } from '../core/MarkdownRenderer';
import './MarkdownEditor.css';
import { componentRegistry } from '../ComponentRegistry';

interface MarkdownEditorProps {
  initialContent?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent = '',
}) => {
  const [content, setContent] = useState(initialContent);
  const [showComponentList, setShowComponentList] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const registeredComponents = componentRegistry.getAll();
  const componentList = Object.entries(registeredComponents);

  const handleInsertComponent = (componentId: string) => {
    const componentTag = `<div data-component="${componentId}"></div>`;
    const newContent =
      content.slice(0, cursorPosition) +
      componentTag +
      content.slice(cursorPosition);

    setContent(newContent);
    setShowComponentList(false);
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const newContent =
        content.slice(0, cursorPosition) +
        '  ' +
        content.slice(cursorPosition);
      setContent(newContent);
      setCursorPosition(cursorPosition + 2);
    }
  };

  return (
    <div className="markdown-editor">
      <div className="editor-toolbar">
        <button
          className="insert-component-btn"
          onClick={() => setShowComponentList(!showComponentList)}
        >
          插入组件
        </button>
        {showComponentList && (
          <div className="component-list">
            {componentList.map(([id, config]) => (
              <div
                key={id}
                className="component-item"
                onClick={() => handleInsertComponent(id)}
              >
                {config.type}
              </div>
            ))}
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
            components={registeredComponents}
          />
        </div>
      </div>
    </div>
  );
};
