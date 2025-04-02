"use client";

import { useSiteStore } from "@/store/site";
import { useEffect, useState, useRef, useMemo } from "react";
import { Timer, BadgeCheck } from "lucide-react";
import React from "react";
import StatIndicator from "./StatIndicator";
import Divider from "./Divider";

export const WebControlInfo = () => {
  const { site } = useSiteStore();

  const [state, setState] = useState({
    runningTime: "",
    isMobile: false
  });

  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setState(prev => ({ ...prev, isMobile: window.innerWidth < 768 }));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    // 保存当前的 timeout ref 到 effect 作用域内的变量
    const timeoutRef = closeTimeoutRef;
    return () => {
      window.removeEventListener("resize", checkMobile);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 计算运行时间
  useEffect(() => {
    const calculateRunningTime = () => {
      if (!site?.createdAt) return;

      const now = new Date();
      const createdAt = new Date(site.createdAt);
      const diff = now.getTime() - createdAt.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setState(prev => ({ ...prev, runningTime: `${days}天${hours}时${minutes}分` }));
    };

    calculateRunningTime();
    const timer = setInterval(calculateRunningTime, 60000);
    return () => clearInterval(timer);
  }, [site?.createdAt]);

  // 计算运行时间（仅在site.createdAt变化时重新计算）
  const runningTimeDisplay = useMemo(() => {
    return state.runningTime || "0天0时0分";
  }, [state.runningTime]);

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:overflow-visible py-1">
      <StatIndicator
        icon={<Timer />}
        label="已运行"
        value={runningTimeDisplay}
        bgColor="bg-green-500/20"
        iconColor="text-green-500"
      />

      <Divider />

      <StatIndicator
        icon={<BadgeCheck />}
        label="备案"
        value={site?.icp || ""}
        bgColor="bg-blue-500/20"
        iconColor="text-blue-500"
      />
    </div>
  );
};
