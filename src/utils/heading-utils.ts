/**
 * 生成与 Toast UI Editor 一致的标题 ID
 * @param text 标题文本
 * @returns 生成的 ID
 */
export function generateHeadingId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")  // 将非字母数字和中文字符替换为连字符
        .replace(/^-+|-+$/g, "");  // 移除开头和结尾的连字符
}

/**
 * 尝试多种方式查找标题元素
 * @param text 标题文本
 * @returns 找到的元素或 null
 */
export function findHeadingElement(text: string): HTMLElement | null {
    const headingId = generateHeadingId(text);

    // 首先尝试使用标准的 Toast UI Editor ID
    let element = document.getElementById(headingId);

    // 如果找不到，尝试其他可能的 ID 格式
    if (!element) {
        const altId = text.toLowerCase().replace(/\s+/g, "-");
        element = document.getElementById(altId);
    }

    // 如果还是找不到，尝试通过文本内容查找
    if (!element) {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        element = Array.from(headings).find(h =>
            h.textContent?.trim() === text
        ) as HTMLElement;
    }

    return element;
}

/**
 * 平滑滚动到指定标题
 * @param text 标题文本
 * @returns 是否成功找到并滚动到元素
 */
export function scrollToHeading(text: string): boolean {
    const element = findHeadingElement(text);

    if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return true;
    } else {
        console.warn('找不到标题元素:', text);
        return false;
    }
} 