import { useState } from 'react';
export interface ColorPickerProps {
  initialColor: string;
  label: string;
}


export const ColorPicker = ({ initialColor = '#1890ff', label }: ColorPickerProps) => {
  const [color, setColor] = useState(initialColor);
  const [showPicker, setShowPicker] = useState(false);

  const presetColors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d',
    '#722ed1', '#eb2f96', '#fadb14', '#13c2c2'
  ];

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ marginBottom: '8px' }}>{label}</div>
      <div
        style={{
          width: '100px',
          height: '30px',
          backgroundColor: color,
          border: '2px solid #d9d9d9',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => setShowPicker(!showPicker)}
      />
      {showPicker && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '8px',
          padding: '8px',
          backgroundColor: 'white',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          zIndex: 1
        }}>
          {presetColors.map(presetColor => (
            <div
              key={presetColor}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: presetColor,
                borderRadius: '4px',
                cursor: 'pointer',
                border: color === presetColor ? '2px solid #1890ff' : '2px solid transparent'
              }}
              onClick={() => {
                setColor(presetColor);
                setShowPicker(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
