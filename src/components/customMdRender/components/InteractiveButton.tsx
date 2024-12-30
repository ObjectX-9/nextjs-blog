import { useState } from 'react';
export interface InteractiveButtonProps {
  text: string;
  color: string;
}


export const InteractiveButton = ({ text, color }: InteractiveButtonProps) => {
  const [count, setCount] = useState(0);

  return (
    <button
      onClick={() => setCount(count + 1)}
      style={{
        backgroundColor: color,
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      {text} (点击次数: {count})
    </button>
  );
};
