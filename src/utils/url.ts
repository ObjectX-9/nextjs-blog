
// 获取有效的主机名
export const getHostname = (url: string): string => {
    try {
        // 检查 URL 是否包含协议
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        return new URL(url).hostname;
    } catch (error) {
        // 如果 URL 无效，返回原始 URL 或其一部分
        return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    }
};