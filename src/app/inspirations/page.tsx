"use client";

import { WebInspirationsView } from "./WebInspirationsView";
import { MobileInspirationsView } from "./MobileInspirationsView";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

/**
 * 灵感笔记主页面 - 根据设备类型展示不同的视图
 */
export default function InspirationPage() {
  const isMobile = useDeviceDetection();

  return isMobile ? <MobileInspirationsView /> : <WebInspirationsView />;
}
