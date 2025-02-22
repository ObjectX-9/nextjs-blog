export const api = {
  async fetchSite() {
    const response = await fetch("/api/site");
    if (!response.ok) throw new Error("获取网站信息失败");
    return response.json();
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("上传失败");
    return response.json();
  },

  async saveSite(siteData: any) {
    const response = await fetch("/api/site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      body: JSON.stringify(siteData),
    });
    if (!response.ok) throw new Error("保存失败");
    return response.json();
  },

  async generateCaptcha() {
    const response = await fetch("/api/captcha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "ALPHANUMERIC",
      }),
    });
    if (!response.ok) throw new Error("生成验证码失败");
    return response.json();
  },

  async getCaptchaDetail(id: string) {
    if (!id) return null;
    const response = await fetch(`/api/captcha/${encodeURIComponent(id)}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "获取验证码详情失败");
    }
    return response.json();
  },

  async getAllCaptchas() {
    const response = await fetch("/api/captcha");
    if (!response.ok) throw new Error("获取验证码列表失败");
    return response.json();
  },
};
