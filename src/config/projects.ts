export interface Project {
  title: string;
  description: string;
  url?: string;
  github?: string;
  imageUrl?: string;
  tags: string[];
  status: "completed" | "in-progress" | "planned";
}

export interface ProjectCategory {
  name: string;
  description: string;
  projects: Project[];
}

export const projectData: ProjectCategory[] = [
  {
    "name": "网页应用 & 一些demo",
    "description": "🍀 网页应用 & 一些demo",
    "projects": [
      {
        "title": "个人博客213",
        "description": "一个使用 Next.js 13 构建的现代博客,具有服务器组件、MDX 支持和清爽的设计",
        "github": "https://github.com/ObjectX-9/react_demo",
        "url": "https://yourblog.com",
        "tags": [
          "Next.js",
          "React",
          "TypeScript",
          "Tailwind CSS"
        ],
        "status": "completed"
      },
      {
        "title": "Task Management System",
        "description": "A collaborative task management platform with real-time updates and team features",
        "github": "https://github.com/yourusername/task-manager",
        "tags": [
          "React",
          "Node.js",
          "MongoDB",
          "Socket.io"
        ],
        "url": "https://object-x.com.cn/",
        "status": "in-progress"
      }
    ]
  },
  {
    "name": "参与的开源项目",
    "description": "💐 贡献过 & 个人的开源项目",
    "projects": [
      {
        "title": "React Component Library",
        "description": "A collection of reusable React components with TypeScript support",
        "github": "https://github.com/yourusername/react-components",
        "tags": [
          "React",
          "TypeScript",
          "Storybook"
        ],
        "status": "in-progress"
      },
      {
        "title": "React Component Library",
        "description": "A collection of reusable React components with TypeScript support",
        "github": "https://github.com/yourusername/react-components",
        "tags": [
          "React",
          "TypeScript",
          "Storybook"
        ],
        "status": "in-progress"
      }
    ]
  },
  {
    "name": "移动端项目",
    "description": "🌼 移动端项目 & 或者一些跨端项目",
    "projects": [
      {
        "title": "Fitness Tracker",
        "description": "A React Native app for tracking workouts and nutrition",
        "github": "https://github.com/yourusername/fitness-app",
        "tags": [
          "React Native",
          "Redux",
          "Firebase"
        ],
        "status": "planned"
      },
      {
        "title": "React Component Library",
        "description": "A collection of reusable React components with TypeScript support",
        "github": "https://github.com/yourusername/react-components",
        "tags": [
          "React",
          "TypeScript",
          "Storybook"
        ],
        "status": "in-progress"
      }
    ]
  }
];
