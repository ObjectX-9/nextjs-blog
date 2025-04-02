export function truncateText(text: string, maxLength: number = 50) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}