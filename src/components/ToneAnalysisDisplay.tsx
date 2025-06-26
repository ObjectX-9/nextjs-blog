import React, { useState } from 'react';
import { Button } from 'antd';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { IToneAnalysis } from '@/app/model/photo';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface ToneAnalysisDisplayProps {
  data: IToneAnalysis;
  className?: string;
}

const ToneAnalysisDisplay: React.FC<ToneAnalysisDisplayProps> = ({
  data,
  className = ''
}) => {
  const [currentChannel, setCurrentChannel] = useState<'red' | 'green' | 'blue' | 'luminance'>('luminance');

  // 生成直方图数据
  const generateChartData = () => {
    const labels = Array.from({ length: 256 }, (_, i) => i);

    if (currentChannel === 'luminance') {
      // 亮度模式 - 显示RGB三色叠加
      return {
        labels,
        datasets: [
          {
            label: '',
            data: data.histogram.red,
            borderColor: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.3)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1,
          },
          {
            label: '',
            data: data.histogram.green,
            borderColor: '#51cf66',
            backgroundColor: 'rgba(81, 207, 102, 0.3)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1,
          },
          {
            label: '',
            data: data.histogram.blue,
            borderColor: '#339af0',
            backgroundColor: 'rgba(51, 154, 240, 0.3)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1,
          }
        ],
      };
    } else {
      // 单通道模式
      const channelData = data.histogram[currentChannel];
      const colors = {
        red: { border: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.6)' },
        green: { border: '#51cf66', bg: 'rgba(81, 207, 102, 0.6)' },
        blue: { border: '#339af0', bg: 'rgba(51, 154, 240, 0.6)' },
      };

      return {
        labels,
        datasets: [
          {
            label: '',
            data: channelData,
            borderColor: colors[currentChannel].border,
            backgroundColor: colors[currentChannel].bg,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1,
          }
        ],
      };
    }
  };

  // Chart.js 配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 text-white ${className}`}>
      {/* 标题 */}
      <h3 className="text-lg font-medium mb-4 text-gray-200">影调分析</h3>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">影调类型</span>
            <span className="text-white font-medium">{data.toneType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">亮度</span>
            <span className="text-white font-medium">{data.brightness}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">阴影占比</span>
            <span className="text-white font-medium">{data.shadowRatio}%</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">对比度</span>
            <span className="text-white font-medium">{data.contrast}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">高光占比</span>
            <span className="text-white font-medium">{data.highlightRatio}%</span>
          </div>
        </div>
      </div>

      {/* 直方图标题 */}
      <div className="text-sm text-gray-400 mb-2">直方图</div>

      {/* 直方图区域 */}
      <div className="bg-gray-900 rounded p-3 mb-4" style={{ height: '180px' }}>
        <Line data={generateChartData()} options={chartOptions} />
      </div>

      {/* 通道切换按钮 */}
      <div className="flex gap-2">
        <Button
          size="small"
          type={currentChannel === 'red' ? 'primary' : 'default'}
          className={currentChannel === 'red' ? 'bg-red-500 border-red-500' : 'bg-gray-700 border-gray-600 text-red-400'}
          onClick={() => setCurrentChannel('red')}
        >
          ● R
        </Button>

        <Button
          size="small"
          type={currentChannel === 'green' ? 'primary' : 'default'}
          className={currentChannel === 'green' ? 'bg-green-500 border-green-500' : 'bg-gray-700 border-gray-600 text-green-400'}
          onClick={() => setCurrentChannel('green')}
        >
          ● G
        </Button>

        <Button
          size="small"
          type={currentChannel === 'blue' ? 'primary' : 'default'}
          className={currentChannel === 'blue' ? 'bg-blue-500 border-blue-500' : 'bg-gray-700 border-gray-600 text-blue-400'}
          onClick={() => setCurrentChannel('blue')}
        >
          ● B
        </Button>

        <Button
          size="small"
          type={currentChannel === 'luminance' ? 'primary' : 'default'}
          className={currentChannel === 'luminance' ? 'bg-gray-500 border-gray-500' : 'bg-gray-700 border-gray-600 text-gray-300'}
          onClick={() => setCurrentChannel('luminance')}
        >
          ● 亮度
        </Button>

        <div className="flex-1"></div>

        <Button
          size="small"
          className="bg-gray-700 border-gray-600 text-gray-300"
        >
          统计
        </Button>
      </div>
    </div>
  );
};

export default ToneAnalysisDisplay; 