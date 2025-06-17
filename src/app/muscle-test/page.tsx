"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfessionalBodyDiagram } from "@/components/ProfessionalBodyDiagram";

// 肌肉中文映射
const MUSCLE_TRANSLATIONS: { [key: string]: string } = {
  // 背部
  trapezius: "斜方肌",
  "upper-back": "背阔肌",
  "lower-back": "下背部",

  // 胸部
  chest: "胸大肌",

  // 手臂
  biceps: "肱二头肌",
  triceps: "肱三头肌",
  forearm: "前臂",
  "back-deltoids": "后三角肌",
  "front-deltoids": "前三角肌",

  // 腹部
  abs: "腹直肌",
  obliques: "腹斜肌",

  // 腿部
  adductor: "内收肌群",
  hamstring: "腘绳肌",
  quadriceps: "股四头肌",
  abductors: "外展肌群",
  calves: "小腿三头肌",
  gluteal: "臀大肌",

  // 头部
  head: "头部",
  neck: "颈部",
};

// 肌肉颜色映射 - 使用更鲜艳的颜色以便在专业图表上显示
const MUSCLE_COLORS: { [key: string]: string } = {
  chest: "#FF4757",
  "front-deltoids": "#2ED573",
  "back-deltoids": "#2ED573",
  biceps: "#3742FA",
  triceps: "#FF6348",
  forearm: "#FFA502",
  abs: "#FF3838",
  obliques: "#2F3542",
  quadriceps: "#5F27CD",
  hamstring: "#00D2D3",
  calves: "#FF9F43",
  gluteal: "#10AC84",
  trapezius: "#F79F1F",
  "upper-back": "#3D5A80",
  "lower-back": "#EE5A24",
  adductor: "#A55EEA",
  abductors: "#26DE81",
  neck: "#FD79A8",
  head: "#FDCB6E",
};

export default function MuscleTestPage() {
  const [selectedView, setSelectedView] = useState<"front" | "back">("front");
  const [selectedMuscles, setSelectedMuscles] = useState<Set<string>>(new Set());
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // 处理肌肉点击
  const handleMuscleClick = useCallback((muscle: string) => {
    setSelectedMuscles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(muscle)) {
        newSet.delete(muscle);
      } else {
        newSet.add(muscle);
      }
      return newSet;
    });
  }, []);

  // 处理肌肉悬停
  const handleMuscleHover = useCallback((muscle: string | null) => {
    setHoveredMuscle(muscle);
  }, []);

  // 清除所有选择
  const clearAllSelection = () => {
    setSelectedMuscles(new Set());
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            专业人体肌肉群选择器
          </h1>
          <p className="text-lg text-gray-600">
            基于 React Body Highlighter 的专业解剖学图表
          </p>
          <div className="mt-4 px-4 py-2 bg-green-100 border border-green-200 rounded-lg inline-block">
            <p className="text-green-700 text-sm">
              ✨ 使用专业医学级人体解剖图，精确度更高
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 人体图显示区域 */}
          <div className="lg:col-span-3">
            {/* 视图切换 */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-lg shadow-md p-1">
                <Button
                  variant={selectedView === "front" ? "default" : "ghost"}
                  onClick={() => setSelectedView("front")}
                  className="px-6 py-2"
                >
                  正面视图
                </Button>
                <Button
                  variant={selectedView === "back" ? "default" : "ghost"}
                  onClick={() => setSelectedView("back")}
                  className="px-6 py-2"
                >
                  背面视图
                </Button>
              </div>
            </div>

            {/* 人体图 */}
            <Card className="bg-white shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
                <ProfessionalBodyDiagram
                  view={selectedView}
                  selectedMuscles={selectedMuscles}
                  hoveredMuscle={hoveredMuscle}
                  onMuscleClick={handleMuscleClick}
                  onMuscleHover={handleMuscleHover}
                  muscleColors={MUSCLE_COLORS}
                  defaultColor="#F8F9FA"
                />
              </div>
            </Card>

            {/* 使用说明 */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">💡 使用提示</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 直接点击人体图上的肌肉部位进行选择</li>
                <li>• 悬停查看肌肉详细信息</li>
                <li>• 支持多选，可同时选择多个肌肉群</li>
                <li>• 使用右侧面板快速选择或查看选中结果</li>
              </ul>
            </div>
          </div>

          {/* 侧边信息面板 */}
          <div className="space-y-6">
            {/* 操作按钮 */}
            <Card className="bg-white shadow-md p-4">
              <div className="space-y-3">
                <Button
                  onClick={clearAllSelection}
                  variant="outline"
                  className="w-full"
                  disabled={selectedMuscles.size === 0}
                >
                  清除所有选择
                </Button>
                <div className="text-sm text-gray-500 text-center">
                  已选择 {selectedMuscles.size} 个肌肉群
                </div>
              </div>
            </Card>

            {/* 当前悬停的肌肉 */}
            {hoveredMuscle && (
              <Card className="bg-yellow-50 border-yellow-200 shadow-md p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">当前悬停</h3>
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full shadow-sm border-2 border-white"
                    style={{ backgroundColor: MUSCLE_COLORS[hoveredMuscle] || "#999" }}
                  />
                  <span className="font-medium text-yellow-900">
                    {MUSCLE_TRANSLATIONS[hoveredMuscle] || hoveredMuscle}
                  </span>
                </div>
              </Card>
            )}

            {/* 已选择的肌肉列表 */}
            <Card className="bg-white shadow-md p-4">
              <h3 className="font-semibold mb-4 text-gray-800">已选择的肌肉群</h3>
              {selectedMuscles.size > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Array.from(selectedMuscles).map((muscle) => (
                    <div
                      key={muscle}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm border-2 border-white"
                          style={{ backgroundColor: MUSCLE_COLORS[muscle] || "#999" }}
                        />
                        <span className="font-medium text-gray-700">
                          {MUSCLE_TRANSLATIONS[muscle] || muscle}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMuscleClick(muscle)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🫱</div>
                  <p>点击人体图选择肌肉群</p>
                </div>
              )}
            </Card>

            {/* 肌肉群快速选择 */}
            <Card className="bg-white shadow-md p-4">
              <h3 className="font-semibold mb-4 text-gray-800">快速选择</h3>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {Object.entries(MUSCLE_TRANSLATIONS).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => handleMuscleClick(key)}
                    className={`text-left p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${selectedMuscles.has(key)
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-white"
                      style={{
                        backgroundColor: selectedMuscles.has(key)
                          ? "white"
                          : MUSCLE_COLORS[key] || "#999"
                      }}
                    />
                    <span className="text-sm font-medium">{name}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* 技术信息 */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-md p-4">
              <h3 className="font-semibold mb-2 text-purple-800">技术特点</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• 基于 React Body Highlighter</li>
                <li>• 医学级解剖学精度</li>
                <li>• 支持前后视图切换</li>
                <li>• 实时交互反馈</li>
                <li>• 响应式设计</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
} 