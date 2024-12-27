// 从B站视频链接中提取BV号
export function extractBilibiliInfo(url: string) {
  try {
    // 移除链接中的空格
    url = url.trim();
    
    // 尝试提取BV号
    let bvid: string | null = null;
    
    // 匹配BV号的正则表达式
    const bvRegex = /BV[a-zA-Z0-9]+/;
    const match = url.match(bvRegex);
    
    if (match) {
      bvid = match[0];
    } else {
      // 尝试从URL中提取
      const urlObj = new URL(url);
      // 检查路径中是否包含BV号
      const pathMatch = urlObj.pathname.match(bvRegex);
      if (pathMatch) {
        bvid = pathMatch[0];
      }
      // 检查查询参数中是否包含BV号
      if (!bvid && urlObj.searchParams.has('bvid')) {
        bvid = urlObj.searchParams.get('bvid');
      }
    }
    
    if (!bvid) {
      throw new Error('无法从链接中提取BV号');
    }
    
    // 获取视频信息
    return {
      bvid,
      // 可以通过B站API获取更多信息，比如标题、封面等
      // 目前先返回基本信息
      page: 1
    };
  } catch (error) {
    throw new Error('无效的B站视频链接');
  }
}

// 验证BV号格式是否正确
export function isValidBvid(bvid: string) {
  return /^BV[a-zA-Z0-9]+$/.test(bvid);
}
