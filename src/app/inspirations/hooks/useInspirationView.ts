import { useRef, useEffect, useCallback } from 'react';

interface UseInspirationViewProps {
    inspirationId: string;
    onView: (id: string) => void;
}

export const useInspirationView = ({ inspirationId, onView }: UseInspirationViewProps) => {
    const viewTimeoutRef = useRef<NodeJS.Timeout>();
    const hasViewedRef = useRef(false);

    const handleMouseEnter = useCallback(() => {
        if (hasViewedRef.current) return;

        viewTimeoutRef.current = setTimeout(() => {
            onView(inspirationId);
            hasViewedRef.current = true;
        }, 1000); // 1秒后触发浏览量增加
    }, [inspirationId, onView]);

    const handleMouseLeave = useCallback(() => {
        if (viewTimeoutRef.current) {
            clearTimeout(viewTimeoutRef.current);
        }
    }, []);

    // 组件卸载时清理定时器
    useEffect(() => {
        return () => {
            if (viewTimeoutRef.current) {
                clearTimeout(viewTimeoutRef.current);
            }
        };
    }, []);

    return {
        handleMouseEnter,
        handleMouseLeave,
    };
}; 