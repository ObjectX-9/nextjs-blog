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
    name: "Web Applications",
    description: "Full-stack web applications and websites",
    projects: [
      {
        title: "Personal Blog",
        description:
          "A modern blog built with Next.js 13, featuring server components, MDX support, and a clean design",
        github: "https://github.com/ObjectX-9/react_demo",
        url: "https://yourblog.com",
        tags: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        status: "completed",
      },
      {
        title: "Task Management System",
        description:
          "A collaborative task management platform with real-time updates and team features",
        github: "https://github.com/yourusername/task-manager",
        tags: ["React", "Node.js", "MongoDB", "Socket.io"],
        url: "https://object-x.com.cn/",
        status: "in-progress",
      },
    ],
  },
  {
    name: "Open Source",
    description: "Contributions and personal open source projects",
    projects: [
      {
        title: "React Component Library",
        description:
          "A collection of reusable React components with TypeScript support",
        github: "https://github.com/yourusername/react-components",
        tags: ["React", "TypeScript", "Storybook"],
        status: "in-progress",
      },
      {
        title: "React Component Library",
        description:
          "A collection of reusable React components with TypeScript support",
        github: "https://github.com/yourusername/react-components",
        tags: ["React", "TypeScript", "Storybook"],
        status: "in-progress",
      },
    ],
  },
  {
    name: "Mobile Applications",
    description: "Cross-platform and native mobile apps",
    projects: [
      {
        title: "Fitness Tracker",
        description: "A React Native app for tracking workouts and nutrition",
        github: "https://github.com/yourusername/fitness-app",
        tags: ["React Native", "Redux", "Firebase"],
        status: "planned",
      },
      {
        title: "React Component Library",
        description:
          "A collection of reusable React components with TypeScript support",
        github: "https://github.com/yourusername/react-components",
        tags: ["React", "TypeScript", "Storybook"],
        status: "in-progress",
      },
    ],
  },
];
