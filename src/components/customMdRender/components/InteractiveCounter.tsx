import { useState } from 'react';

export interface InteractiveCounterProps {
  initialValue: number;
  step: number;
  label: string;
}

export const InteractiveCounter = ({ initialValue = 0, step = 1, label }: InteractiveCounterProps) => {
  const [count, setCount] = useState(initialValue);

  return (
    <div className="counter">
      <div className="counter-label">{label}</div>
      <div className="counter-controls">
        <button
          onClick={() => setCount(count - step)}
          style={{
            backgroundColor: '#ff4d4f',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          -
        </button>
        <span style={{ margin: '0 10px' }}>{count}</span>
        <button
          onClick={() => setCount(count + step)}
          style={{
            backgroundColor: '#52c41a',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};
