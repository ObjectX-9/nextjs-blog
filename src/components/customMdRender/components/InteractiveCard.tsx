import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardTheme {
  background: string;
  text: string;
  border: string;
}

const themes: Record<string, CardTheme> = {
  light: {
    background: '#ffffff',
    text: '#333333',
    border: '#e0e0e0'
  },
  dark: {
    background: '#2d2d2d',
    text: '#ffffff',
    border: '#404040'
  },
  blue: {
    background: '#e3f2fd',
    text: '#1565c0',
    border: '#90caf9'
  }
};

interface InteractiveCardProps {
  title: string;
  initialContent?: string;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ title, initialContent = '点击编辑内容' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);

  // 从 localStorage 加载保存的状态
  useEffect(() => {
    const savedContent = localStorage.getItem(`card-${title}-content`);
    const savedTheme = localStorage.getItem(`card-${title}-theme`);
    
    if (savedContent) setContent(savedContent);
    if (savedTheme) setCurrentTheme(savedTheme);
  }, [title]);

  // 保存状态到 localStorage
  useEffect(() => {
    localStorage.setItem(`card-${title}-content`, content);
    localStorage.setItem(`card-${title}-theme`, currentTheme);
  }, [content, currentTheme, title]);

  const handleThemeChange = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setCurrentTheme(themeKeys[nextIndex]);
  };

  const handleContentClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleContentBlur = () => {
    setIsEditing(false);
  };

  return (
    <motion.div
      style={{
        background: themes[currentTheme].background,
        color: themes[currentTheme].text,
        border: `1px solid ${themes[currentTheme].border}`,
        borderRadius: '8px',
        padding: '16px',
        margin: '16px',
        maxWidth: '400px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div>
          <button
            onClick={handleThemeChange}
            style={{
              background: 'transparent',
              border: `1px solid ${themes[currentTheme].border}`,
              color: themes[currentTheme].text,
              padding: '4px 8px',
              borderRadius: '4px',
              marginRight: '8px',
              cursor: 'pointer'
            }}
          >
            切换主题
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: `1px solid ${themes[currentTheme].border}`,
              color: themes[currentTheme].text,
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isEditing ? (
              <textarea
                value={content}
                onChange={handleContentChange}
                onBlur={handleContentBlur}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '8px',
                  background: themes[currentTheme].background,
                  color: themes[currentTheme].text,
                  border: `1px solid ${themes[currentTheme].border}`,
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
                autoFocus
              />
            ) : (
              <div
                onClick={handleContentClick}
                style={{
                  minHeight: '100px',
                  whiteSpace: 'pre-wrap',
                  cursor: 'text'
                }}
              >
                {content}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InteractiveCard;
