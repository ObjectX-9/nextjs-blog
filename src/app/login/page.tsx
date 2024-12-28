"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const router = useRouter();

  // 检查是否已经登录
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth");
        const data = await response.json();
        if (data.isAuthenticated) {
          router.push("/admin/bookmarks");
          router.refresh();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 基本验证
    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码");
      return;
    }

    // 检查登录尝试次数
    if (loginAttempts >= 5) {
      setError("登录尝试次数过多，请稍后再试");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/bookmarks");
        router.refresh();
      } else {
        setLoginAttempts(prev => prev + 1);
        setError(data.error || "用户名或密码错误");
        // 清空密码输入
        setPassword("");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("登录失败，请检查网络连接");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            管理员登录
          </h2>
          {loginAttempts > 0 && (
            <p className="mt-2 text-center text-sm text-gray-600">
              剩余尝试次数: {5 - loginAttempts}
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || loginAttempts >= 5}
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || loginAttempts >= 5}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center" role="alert">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading || loginAttempts >= 5
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
              disabled={isLoading || loginAttempts >= 5}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  登录中...
                </span>
              ) : loginAttempts >= 5 ? (
                "请稍后再试"
              ) : (
                "登录"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
