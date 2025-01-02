"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { IDemo, IDemoCategory } from "../model/demo";

// Cache management functions
const CACHE_KEYS = {
  CATEGORIES: "demo_categories",
  DEMOS: "demo_demos_",
  LAST_FETCH: "demo_last_fetch_",
  LIKED_DEMOS: "demo_liked_",
  VIEWED_DEMOS: "demo_viewed_",
};

interface WithDates {
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface CacheData<T> {
  data: T;
  timestamp: number;
}

function getFromCache<T extends WithDates | WithDates[]>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item) as CacheData<T>;
    if (!parsed || !parsed.data) return null;

    if (Array.isArray(parsed.data)) {
      return parsed.data.map(item => ({
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      })) as T;
    }

    return {
      ...parsed.data,
      createdAt: parsed.data.createdAt ? new Date(parsed.data.createdAt) : undefined,
      updatedAt: parsed.data.updatedAt ? new Date(parsed.data.updatedAt) : undefined,
    } as T;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );
}

// 检查是否已经点赞或浏览
const hasInteracted = (type: 'like' | 'view', demoId: string): boolean => {
  if (typeof window === "undefined") return false;
  const key = type === 'like' ? CACHE_KEYS.LIKED_DEMOS : CACHE_KEYS.VIEWED_DEMOS;
  const interactions = localStorage.getItem(key);
  if (!interactions) return false;
  return JSON.parse(interactions).includes(demoId);
};

// 记录交互
const recordInteraction = (type: 'like' | 'view', demoId: string): void => {
  if (typeof window === "undefined") return;
  const key = type === 'like' ? CACHE_KEYS.LIKED_DEMOS : CACHE_KEYS.VIEWED_DEMOS;
  const interactions = JSON.parse(localStorage.getItem(key) || '[]');
  if (!interactions.includes(demoId)) {
    interactions.push(demoId);
    localStorage.setItem(key, JSON.stringify(interactions));
  }
};

export default function Demos() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<IDemoCategory[]>([]);
  const [demos, setDemos] = useState<IDemo[]>([]);
  const [showMobileList, setShowMobileList] = useState(false);
  const [categoryDemoCounts, setCategoryDemoCounts] = useState<Record<string, number>>({});
  const [likedDemos, setLikedDemos] = useState<string[]>([]);
  const [viewedDemos, setViewedDemos] = useState<string[]>([]);

  // 提取获取分类的函数
  const fetchCategories = useCallback(async () => {
    try {
      console.log('Fetching categories...');
      const cachedCategories = getFromCache<IDemoCategory[]>(CACHE_KEYS.CATEGORIES);
      if (cachedCategories && Array.isArray(cachedCategories)) {
        console.log('Using cached categories:', cachedCategories);
        setCategories(cachedCategories);
        if (!selectedCategory && cachedCategories.length > 0 && cachedCategories[0]._id) {
          setSelectedCategory(cachedCategories[0]._id.toString());
        }
      }

      // 获取所有demos
      const demosResponse = await fetch("/api/demos");
      const demosData = await demosResponse.json();
      const demoCounts: Record<string, number> = {};

      if (demosData.success && Array.isArray(demosData.demos)) {
        console.log('Demos data:', demosData.demos);
        demosData.demos.forEach((demo: IDemo) => {
          const categoryId = typeof demo.categoryId === 'string'
            ? demo.categoryId
            : demo.categoryId.toString();
          demoCounts[categoryId] = (demoCounts[categoryId] || 0) + 1;
        });
        console.log('Demo counts:', demoCounts);
      }

      const response = await fetch("/api/demos/categories");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.categories)) {
          console.log('Categories data:', data.categories);
          const processedCategories = data.categories.map((category: IDemoCategory) => {
            const categoryId = typeof category._id === 'string'
              ? category._id
              : category._id!.toString();
            return {
              ...category,
              _id: categoryId
            };
          });

          console.log('Processed categories:', processedCategories);
          setCategories(processedCategories);
          setCache(CACHE_KEYS.CATEGORIES, processedCategories);
          setCategoryDemoCounts(demoCounts);

          if (!selectedCategory && processedCategories.length > 0 && processedCategories[0]._id) {
            setSelectedCategory(processedCategories[0]._id);
          }
        } else {
          console.error("Invalid categories data format:", data);
          setCategories([]);
        }
      } else {
        console.error("Failed to fetch categories:", response.statusText);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  }, [selectedCategory]);

  // 初始加载和定时刷新分类
  useEffect(() => {
    console.log('Initial categories fetch');
    fetchCategories();

    const categoryInterval = setInterval(() => {
      console.log('Refreshing categories');
      fetchCategories();
    }, 30000);

    return () => clearInterval(categoryInterval);
  }, [fetchCategories]);

  // 提取获取demos的函数
  const fetchDemos = async (categoryId: string) => {
    if (!categoryId) return;

    try {
      const cacheKey = `${CACHE_KEYS.DEMOS}${categoryId}`;
      const cachedDemos = getFromCache<IDemo[]>(cacheKey);
      if (cachedDemos && Array.isArray(cachedDemos)) {
        setDemos(cachedDemos);
      }

      const response = await fetch(`/api/demos?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.demos)) {
          setDemos(data.demos);
          setCache(cacheKey, data.demos);
        } else {
          console.error("Invalid demos data format:", data);
          setDemos([]);
        }
      } else {
        console.error("Failed to fetch demos:", response.statusText);
        setDemos([]);
      }
    } catch (error) {
      console.error("Error fetching demos:", error);
      setDemos([]);
    }
  };

  // 处理点赞
  const handleLike = async (demoId: string) => {
    if (hasInteracted('like', demoId)) return;
    
    try {
      const response = await fetch(`/api/demos/${demoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'like' }),
      });
      
      if (response.ok) {
        recordInteraction('like', demoId);
        setLikedDemos(prev => [...prev, demoId]);
        // 更新本地数据
        setDemos(prevDemos => 
          prevDemos.map(demo => 
            demo._id === demoId 
              ? { ...demo, likes: (demo.likes || 0) + 1 }
              : demo
          )
        );
      }
    } catch (error) {
      console.error('Error liking demo:', error);
    }
  };

  // 处理浏览
  const handleView = async (demoId: string) => {
    if (hasInteracted('view', demoId)) return;
    
    try {
      const response = await fetch(`/api/demos/${demoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'view' }),
      });
      
      if (response.ok) {
        recordInteraction('view', demoId);
        setViewedDemos(prev => [...prev, demoId]);
        // 更新本地数据
        setDemos(prevDemos => 
          prevDemos.map(demo => 
            demo._id === demoId 
              ? { ...demo, views: (demo.views || 0) + 1 }
              : demo
          )
        );
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  // 当选中的分类改变或定时刷新时获取demos
  useEffect(() => {
    if (selectedCategory) {
      fetchDemos(selectedCategory);

      const demoInterval = setInterval(() => {
        fetchDemos(selectedCategory);
      }, 30000);

      return () => clearInterval(demoInterval);
    }
  }, [selectedCategory]);

  // Web layout
  const WebLayout = () => (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white">
        <nav className="p-4">
          {categories.map((category) => (
            <button
              key={category._id?.toString()}
              onClick={() =>
                setSelectedCategory(category._id?.toString() || null)
              }
              className={`w-full text-left p-2 rounded-lg mb-2 ${selectedCategory === category._id?.toString()
                ? "bg-black text-white"
                : "hover:bg-gray-100"
                }`}
            >
              <div className="flex justify-between items-center">
                <span>{category.name}</span>
                <span className="text-sm opacity-60">
                  {categoryDemoCounts[category._id?.toString() || ""] || 0} 个Demo
                </span>
              </div>
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 h-[100vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {categories.find((cat) => cat._id?.toString() === selectedCategory)?.name}
        </h2>
        <div className="grid grid-cols-2 gap-6 w-full overflow-auto-y">
          {demos.map((demo) => (
            <div
              key={demo._id?.toString()}
              className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow w-full cursor-pointer"
              onClick={(e) => {
                if (demo._id) handleView(demo._id.toString());
                if (demo.url) {
                  window.open(demo.url, '_blank');
                }
              }}
            >
              <div className="aspect-video bg-gray-100 p-4">
                {demo.gifUrl && (
                  <Image
                    src={demo.gifUrl}
                    alt={demo.name}
                    width={400}
                    height={225}
                    className="w-full h-full object-contain rounded-lg"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">{demo.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {demo.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {demo.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {demo.views || 0}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (demo._id) handleLike(demo._id.toString());
                    }}
                    className={`flex items-center gap-1 ${
                      demo._id && hasInteracted('like', demo._id.toString())
                        ? 'text-red-500' 
                        : 'hover:text-red-500'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={demo._id && hasInteracted('like', demo._id.toString()) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {demo.likes || 0}
                  </button>
                  <span className={`flex items-center gap-1 ${demo.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {demo.completed ? "已完成" : "进行中"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  // Mobile layout
  const MobileLayout = () => (
    <>
      {showMobileList ? (
        <div className="flex flex-col min-h-screen bg-white h-[100vh]">
          <div className="sticky top-0 bg-white border-b">
            <div className="px-4 py-3">
              <button
                onClick={() => setShowMobileList(false)}
                className="text-sm text-gray-500"
              >
                返回分类
              </button>
            </div>
            <div className="px-4 pb-3">
              <h2 className="text-xl font-bold">
                {categories.find((cat) => cat._id?.toString() === selectedCategory)?.name}
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto">
            {demos.map((demo) => (
              <div
                key={demo._id?.toString()}
                className="block border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
                onClick={(e) => {
                  if (demo._id) handleView(demo._id.toString());
                  if (demo.url) {
                    window.open(demo.url, '_blank');
                  }
                }}
              >
                <div className="aspect-video bg-gray-100 p-4">
                  {demo.gifUrl && (
                    <Image
                      src={demo.gifUrl}
                      alt={demo.name}
                      width={400}
                      height={225}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2">{demo.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {demo.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {demo.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {demo.views || 0}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (demo._id) handleLike(demo._id.toString());
                      }}
                      className={`flex items-center gap-1 ${
                        demo._id && hasInteracted('like', demo._id.toString())
                          ? 'text-red-500' 
                          : 'hover:text-red-500'
                      }`}
                    >
                      <svg className="w-4 h-4" fill={demo._id && hasInteracted('like', demo._id.toString()) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {demo.likes || 0}
                    </button>
                    <span className={`flex items-center gap-1 ${demo.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {demo.completed ? "已完成" : "进行中"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Demos</h1>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category._id?.toString()}
                onClick={() => {
                  setSelectedCategory(category._id?.toString() || null);
                  setShowMobileList(true);
                }}
                className="w-full p-3 rounded-lg border border-gray-200 text-left"
              >
                <div className="flex justify-between items-center">
                  <span>{category.name}</span>
                  <span className="text-sm text-gray-500">
                    {categoryDemoCounts[category._id?.toString() || ""] || 0} 个Demo
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-white flex-1">
      <div className="lg:hidden">
        <MobileLayout />
      </div>
      <div className="hidden lg:block">
        <WebLayout />
      </div>
    </div>
  );
}
