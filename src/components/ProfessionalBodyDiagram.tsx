"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import '../app/muscle-test/styles.css';
import { IExerciseData } from 'react-body-highlighter';

// 动态导入 react-body-highlighter 以避免 SSR 问题
const Model = dynamic(() => import('react-body-highlighter'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">加载专业人体图中...</p>
      </div>
    </div>
  )
});

interface ProfessionalBodyDiagramProps {
  view: "front" | "back";
  selectedMuscles: Set<string>;
  hoveredMuscle: string | null;
  onMuscleClick: (muscle: string) => void;
  onMuscleHover: (muscle: string | null) => void;
  muscleColors: { [key: string]: string };
  defaultColor?: string;
}

// 将我们的肌肉键映射到 react-body-highlighter 的肌肉名称
const MUSCLE_MAPPING: { [key: string]: string } = {
  "chest": "chest",
  "front-deltoids": "front-deltoids",
  "back-deltoids": "back-deltoids",
  "biceps": "biceps",
  "triceps": "triceps",
  "forearm": "forearm",
  "abs": "abs",
  "obliques": "obliques",
  "quadriceps": "quadriceps",
  "hamstring": "hamstring",
  "calves": "calves",
  "gluteal": "gluteal",
  "trapezius": "trapezius",
  "upper-back": "upper-back",
  "lower-back": "lower-back",
  "adductor": "adductor",
  "abductors": "abductors",
  "neck": "neck"
};

export const ProfessionalBodyDiagram: React.FC<ProfessionalBodyDiagramProps> = ({
  view,
  selectedMuscles,
  hoveredMuscle,
  onMuscleClick,
  onMuscleHover,
  muscleColors,
  defaultColor = "#F7FAFC"
}) => {
  // 创建运动数据，用于高亮选中的肌肉
  const exerciseData = Array.from(selectedMuscles).map(muscle => ({
    name: `Selected-${muscle}`,
    muscles: [MUSCLE_MAPPING[muscle] || muscle]
  }));

  // 处理点击事件
  const handleClick = React.useCallback(({ muscle }: { muscle: string }) => {
    // 找到对应的肌肉键
    const muscleKey = Object.keys(MUSCLE_MAPPING).find(
      key => MUSCLE_MAPPING[key] === muscle
    ) || muscle;

    onMuscleClick(muscleKey);
  }, [onMuscleClick]);

  // 处理悬停事件
  const handleMouseEnter = React.useCallback((muscle: string) => {
    const muscleKey = Object.keys(MUSCLE_MAPPING).find(
      key => MUSCLE_MAPPING[key] === muscle
    ) || muscle;

    onMuscleHover(muscleKey);
  }, [onMuscleHover]);

  const handleMouseLeave = React.useCallback(() => {
    onMuscleHover(null);
  }, [onMuscleHover]);

  // 获取高亮颜色数组
  const getHighlightColors = () => {
    const colors: string[] = [];
    selectedMuscles.forEach(muscle => {
      const color = muscleColors[muscle];
      if (color) {
        colors.push(color);
      }
    });
    return colors.length > 0 ? colors : ["#4A90E2"];
  };

  return (
    <div className="body-highlighter-container">
      <div className="body-highlighter">
        <Model
          type={view === "front" ? "anterior" : "posterior"}
          data={exerciseData as IExerciseData[]}
          highlightedColors={getHighlightColors()}
          onClick={handleClick}
          style={{
            width: '350px',
            height: 'auto',
            maxWidth: '100%'
          }}
        />
      </div>
    </div>
  );
}; 