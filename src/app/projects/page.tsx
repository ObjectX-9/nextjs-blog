"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { projectData } from "../../config/projects";
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

export default function Projects() {
  const [selectedCategory, setSelectedCategory] =
    useState("网页应用 & 一些demo");
  const [screenshots, setScreenshots] = useState<Record<string, string>>({});
  const [githubStats, setGithubStats] = useState<Record<string, GithubStats>>(
    {}
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  // 为每个项目生成一个固定的渐变色
  const projectGradients = useMemo(() => {
    const gradients: Record<string, string> = {};
    projectData.forEach((category) => {
      category.projects.forEach((project) => {
        const colors =
          gradientColors[Math.floor(Math.random() * gradientColors.length)];
        gradients[
          project.title
        ] = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
      });
    });
    return gradients;
  }, []);

  useEffect(() => {
    const currentProjects =
      projectData.find((cat) => cat.name === selectedCategory)?.projects || [];

    currentProjects.forEach(async (project) => {
      // 确保 project.url 存在且不是空字符串
      if (!project.url || screenshots[project.url] || project.imageUrl) return;

      try {
        const response = await fetch(
          `/api/screenshot?url=${encodeURIComponent(project.url)}`
        );
        const data = await response.json();

        if (data.screenshot && project.url) {
          // 再次检查 project.url 存在
          setScreenshots((prev) => ({
            ...prev,
            [project.url!]: data.screenshot, // 使用非空断言
          }));
        }
      } catch (error) {
        console.error("Failed to fetch screenshot:", error);
      }
    });
  }, [selectedCategory, screenshots]);

  useEffect(() => {
    const currentProjects =
      projectData.find((cat) => cat.name === selectedCategory)?.projects || [];

    currentProjects.forEach(async (project) => {
      if (!project.github) return;

      // Extract owner and repo from GitHub URL
      const match = project.github.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return;

      const [, owner, repo] = match;

      try {
        // Get star count (public data, no token needed)
        const starsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`
        );
        const repoData = await starsResponse.json();

        // Only check starred status if token exists
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

        setGithubStats((prev) => ({
          ...prev,
          [project.github!]: {
            stars: repoData.stargazers_count,
            isStarred,
          },
        }));
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
      }
    });
  }, [selectedCategory]);

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

  return (
    <main className="flex flex-col sm:flex-row h-screen w-full box-border">
      {/* Sidebar - 在移动端变为顶部导航 */}
      <div className="sm:w-64 flex-none sm:p-8 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto">
        <div className="p-4 sm:p-0 sm:mb-8">
          <h1 className="text-2xl font-bold mb-2">项目</h1>
          <p className="text-gray-600 text-sm">个人和专业项目的集合</p>
        </div>

        {/* Categories */}
        <nav
          className="flex sm:block relative overflow-x-auto sm:overflow-visible whitespace-nowrap sm:whitespace-normal px-4 sm:px-0 pb-4 sm:pb-0 no-scrollbar scroll-smooth"
          ref={scrollRef}
        >
          {projectData.map((category, index) => (
            <button
              key={category.name}
              onClick={() => {
                setSelectedCategory(category.name);
                // Scroll to center the selected tab on mobile
                if (scrollRef.current && window.innerWidth < 640) {
                  const button = scrollRef.current.children[
                    index
                  ] as HTMLElement;
                  const nav = scrollRef.current;
                  const buttonLeft = button.offsetLeft;
                  const buttonWidth = button.offsetWidth;
                  const navWidth = nav.offsetWidth;
                  const scrollLeft = buttonLeft - (navWidth - buttonWidth) / 2;
                  nav.scrollTo({
                    left: scrollLeft,
                    behavior: "smooth",
                  });
                }
              }}
              className={`flex-1 sm:w-full text-left py-2 px-4 rounded-lg sm:mb-2 relative transition-all duration-300 ease-in-out
                flex items-center h-10 justify-center
                sm:block sm:h-auto sm:justify-start ${
                  selectedCategory === category.name
                    ? "bg-black text-white scale-[0.98] sm:scale-100"
                    : "text-black hover:bg-gray-100"
                }`}
              style={{
                minWidth: `${100 / Math.min(projectData.length, 3)}%`,
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-8">
            <h2 className="hidden sm:block text-4xl font-bold mb-8">
              {selectedCategory}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {projectData
                .find((cat) => cat.name === selectedCategory)
                ?.projects.map((project, index) => (
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
