import { useState, useEffect } from 'react';

export const useDeviceDetection = (breakpoint: number = 640) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // 初始检查
        checkMobile();

        // 添加resize监听器
        window.addEventListener("resize", checkMobile);

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, [breakpoint]);

    return isMobile;
}; 