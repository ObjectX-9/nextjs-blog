import { ExifDateTime } from "exiftool-vendored";

export const calculateDuration = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffInMonths =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;
    return { years, months };
};

export const formatPhotoDateTime = (dateTime: ExifDateTime) => {
    if (!dateTime) return undefined;

    // 检查是否是 ExifDateTime 对象格式
    if (typeof dateTime === 'object' && dateTime.year) {
        const { year, month, day, hour, minute, second, zoneName } = dateTime;
        // 创建日期对象 (注意 month 需要减1，因为 JavaScript Date 月份从0开始)
        const date = new Date(year, month - 1, day, hour, minute, second);

        // 格式化显示，包含时区信息
        const formatted = date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // 如果有时区信息且不是 UTC，则添加时区显示
        return zoneName && zoneName !== 'UTC' ? `${formatted} (${zoneName})` : formatted;
    }

    // 如果是字符串格式，按原来的方式处理
    if (typeof dateTime === 'string') {
        return new Date(dateTime).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    return undefined;
};