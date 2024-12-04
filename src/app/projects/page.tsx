"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Github, Star } from "lucide-react";

const styles = `
  @layer utilities {
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  }
`;

interface Screenshot {
  url: string;
  screenshot?: string;
}

interface GithubStats {
  stars: number;
  isStarred: boolean;
}

const gradientColors = [
  ["#FF6B6B", "#4ECDC4"],
  ["#A8E6CF", "#DCEDC1"],
  ["#FFD93D", "#FF6B6B"],
  ["#95E1D3", "#EAFFD0"],
  ["#6C5CE7", "#A8E6CF"],
  ["#FF8C94", "#FFD93D"],
  ["#A8E6CF", "#FF8C94"],
  ["#4ECDC4", "#95E1D3"],
];

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
  github?: string;
  url?: string;
  imageUrl?: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCategory {
  _id: string;
  name: string;
  description: string;
}

const CACHE_KEYS = {
  PROJECTS: 'projects_data',
  CATEGORIES: 'project_categories',
  SCREENSHOTS: 'project_screenshots',
  GITHUB_STATS: 'project_github_stats',
  LAST_FETCH: 'projects_last_fetch',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const GITHUB_STATS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for GitHub stats

function getFromCache<T>(key: string, duration: number = CACHE_DURATION): T | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > duration) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );
}

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [githubStats, setGithubStats] = useState<Record<string, GithubStats>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      // Try to get from cache first
      const cached = getFromCache<Project[]>(CACHE_KEYS.PROJECTS);
      if (cached) {
        setProjects(cached);
        if (!selectedCategory && cached.length > 0) {
          setSelectedCategory(cached[0].categoryId);
        }
        return;
      }

      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        if (data.success) {
          setProjects(data.projects);
          setCache(CACHE_KEYS.PROJECTS, data.projects);
          if (!selectedCategory && data.projects.length > 0) {
            setSelectedCategory(data.projects[0].categoryId);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      // Try to get from cache first
      const cached = getFromCache<ProjectCategory[]>(CACHE_KEYS.CATEGORIES);
      if (cached) {
        setCategories(cached);
        if (!selectedCategory && cached.length > 0) {
          setSelectedCategory(cached[0]._id);
        }
        return;
      }

      try {
        const response = await fetch('/api/project-categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
          setCache(CACHE_KEYS.CATEGORIES, data.categories);
          if (!selectedCategory && data.categories.length > 0) {
            setSelectedCategory(data.categories[0]._id);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [selectedCategory]);

  const projectGradients = useMemo(() => {
    const gradients: Record<string, string> = {};
    projects.forEach((project) => {
      const colors = gradientColors[Math.floor(Math.random() * gradientColors.length)];
      gradients[project.title] = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
    });
    return gradients;
  }, [projects]);

  useEffect(() => {
    const currentProjects = projects.filter((project) => project.categoryId === selectedCategory);

    currentProjects.forEach(async (project) => {
      if (!project.url || screenshots[project.url] || project.imageUrl) return;

      // Try to get screenshot from cache first
      const cachedScreenshot = getFromCache<string>(`${CACHE_KEYS.SCREENSHOTS}_${project.url}`);
      if (cachedScreenshot) {
        setScreenshots((prev) => ({
          ...prev,
          [project.url!]: cachedScreenshot,
        }));
        return;
      }

      try {
        const response = await fetch(
          `/api/screenshot?url=${encodeURIComponent(project.url)}`
        );
        const data = await response.json();

        if (data.screenshot && project.url) {
          setScreenshots((prev) => ({
            ...prev,
            [project.url!]: data.screenshot,
          }));
          setCache(`${CACHE_KEYS.SCREENSHOTS}_${project.url}`, data.screenshot);
        }
      } catch (error) {
        console.error("Failed to fetch screenshot:", error);
      }
    });
  }, [selectedCategory, screenshots, projects]);

  useEffect(() => {
    const currentProjects = projects.filter((project) => project.categoryId === selectedCategory);

    currentProjects.forEach(async (project) => {
      if (!project.github) return;

      // Try to get GitHub stats from cache first
      const cachedStats = getFromCache<GithubStats>(
        `${CACHE_KEYS.GITHUB_STATS}_${project.github}`,
        GITHUB_STATS_CACHE_DURATION
      );
      if (cachedStats) {
        setGithubStats((prev) => ({
          ...prev,
          [project.github!]: cachedStats,
        }));
        return;
      }

      const match = project.github.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return;

      const [, owner, repo] = match;

      try {
        const starsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`
        );
        const repoData = await starsResponse.json();

        let isStarred = false;
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

        if (token) {
          try {
            const starredResponse = await fetch(
              `https://api.github.com/user/starred/${owner}/${repo}`,
              {
                headers: {
                  Accept: "application/vnd.github.v3+json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            isStarred = starredResponse.status === 204;
          } catch (error) {
            console.error("Failed to check star status:", error);
          }
        }

        const stats = {
          stars: repoData.stargazers_count,
          isStarred,
        };

        setGithubStats((prev) => ({
          ...prev,
          [project.github!]: stats,
        }));
        setCache(`${CACHE_KEYS.GITHUB_STATS}_${project.github}`, stats);
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
      }
    });
  }, [selectedCategory, projects]);

  const handleStar = async (githubUrl: string) => {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    if (!token) {
      console.error(
        "GitHub token not found. Please set NEXT_PUBLIC_GITHUB_TOKEN in your .env.local file"
      );
      return;
    }

    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return;

    const [, owner, repo] = match;
    const currentStats = githubStats[githubUrl];

    try {
      const method = currentStats?.isStarred ? "DELETE" : "PUT";
      const response = await fetch(
        `https://api.github.com/user/starred/${owner}/${repo}`,
        {
          method,
          headers: {
            Accept: "application/vnd.github.v3+json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setGithubStats((prev) => ({
          ...prev,
          [githubUrl]: {
            stars:
              (currentStats?.stars || 0) + (currentStats?.isStarred ? -1 : 1),
            isStarred: !currentStats?.isStarred,
          },
        }));
      } else {
        console.error("Failed to toggle star. Status:", response.status);
      }
    } catch (error) {
      console.error("Failed to toggle star:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "planned":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => project.categoryId === selectedCategory);
  }, [selectedCategory, projects]);

  return (
    <main className="flex flex-col sm:flex-row h-screen w-full box-border">
      <div className="sm:w-64 flex-none sm:p-8 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto">
        <div className="p-4 sm:p-0 sm:mb-8">
          <h1 className="text-2xl font-bold mb-2">项目</h1>
          <p className="text-gray-600 text-sm">个人和专业项目的集合</p>
        </div>

        <nav
          className="flex sm:block relative overflow-x-auto sm:overflow-visible whitespace-nowrap sm:whitespace-normal px-4 sm:px-0 pb-4 sm:pb-0 no-scrollbar scroll-smooth"
          ref={scrollRef}
        >
          {/* 分类导航 */}
          {categories.map((category, index) => (
            <button
              key={category._id}
              onClick={() => {
                setSelectedCategory(category._id);
                // Scroll to center the selected tab on mobile
                if (scrollRef.current && window.innerWidth < 640) {
                  const button = scrollRef.current.children[
                    index
                  ] as HTMLElement;
                  const container = scrollRef.current;
                  const scrollLeft =
                    button.offsetLeft -
                    container.offsetWidth / 2 +
                    button.offsetWidth / 2;
                  container.scrollTo({
                    left: scrollLeft,
                    behavior: "smooth",
                  });
                }
              }}
              className={`flex-1 sm:w-full text-left py-2 px-4 rounded-lg sm:mb-2 relative transition-all duration-300 ease-in-out
                flex items-center h-10 justify-center
                sm:block sm:h-auto sm:justify-start ${
                  selectedCategory === category._id
                    ? "bg-black text-white scale-[0.98] sm:scale-100"
                    : "text-black hover:bg-gray-100"
                }`}
              style={{
                minWidth: `${100 / Math.min(categories.length, 3)}%`,
              }}
            >
              <div className="font-medium relative z-10 max-w-[120px] sm:max-w-none truncate">
                {category.name}
              </div>
              <div className="hidden sm:block text-sm opacity-70 relative z-10">
                {category.description}
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              {categories.find(c => c._id === selectedCategory)?.name || '加载中...'}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {filteredProjects.map((project, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                        {project.title}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status.replace("-", " ")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {project.github && (
                        <>
                          <Link
                            href={project.github}
                            className="p-2 hover:bg-gray-100 rounded-full inline-flex items-center justify-center"
                            target="_blank"
                          >
                            <Github size={18} className="sm:w-5 sm:h-5" />
                          </Link>
                          <button
                            onClick={() => handleStar(project.github!)}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                          >
                            <Star
                              size={14}
                              className={`sm:w-4 sm:h-4 ${
                                githubStats[project.github!]?.isStarred
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                            {githubStats[project.github!]?.stars || 0}
                          </button>
                        </>
                      )}
                      {project.url && (
                        <Link
                          href={project.url}
                          className="p-2 hover:bg-gray-100 rounded-full inline-flex items-center justify-center"
                          target="_blank"
                        >
                          <span className="sr-only">Visit project</span>
                          🔗
                        </Link>
                      )}
                    </div>
                  </div>

                  <div
                    className="relative w-full h-36 sm:h-48 mb-4 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{
                      background: projectGradients[project.title],
                    }}
                  >
                    {(project.imageUrl ||
                      (project.url && screenshots[project.url])) && (
                      <Image
                        src={
                          project.imageUrl ||
                          (project.url ? screenshots[project.url] : "")
                        }
                        alt={project.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                  </div>

                  <p className="text-gray-700 mb-4 text-sm sm:text-base">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
