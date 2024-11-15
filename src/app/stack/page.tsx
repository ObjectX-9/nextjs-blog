import { Card } from "@/components/ui/card";
import { Link } from "lucide-react";
import Image from "next/image";

const stackList = [
  {
    title: "React",
    description:
      "A JavaScript library for building user interfaces. It's maintained by Facebook and a community of individual developers and companies.",
    link: "https://reactjs.org/",
    iconSrc: "https://api.iconify.design/devicon:react.svg",
  },
  {
    title: "Next.js",
    description:
      "A React framework that enables functionality such as server-side rendering and generating static websites for React-based web applications.",
    link: "https://nextjs.org/",
    iconSrc: "https://api.iconify.design/devicon:nextjs.svg",
  },
  {
    title: "Tailwind CSS",
    description:
      "A utility-first CSS framework that helps you quickly build modern designs without ever leaving your HTML.",
    link: "https://tailwindcss.com/",
    iconSrc: "https://api.iconify.design/logos:tailwindcss-icon.svg",
  },
  {
    title: "TypeScript",
    description:
      "A typed superset of JavaScript that compiles to plain JavaScript.",
    link: "https://www.typescriptlang.org/",
    iconSrc: "https://api.iconify.design/skill-icons:typescript.svg",
  },
  {
    title: "Vercel",
    description:
      "A cloud platform for static sites and Serverless Functions that fits perfectly with your workflow.",
    link: "https://vercel.com/",
    iconSrc: "https://api.iconify.design/devicon:vercel.svg",
  },
  {
    title: "GitHub",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://github.com/",
    iconSrc: "https://api.iconify.design/devicon:github.svg",
  },
  {
    title: "Vue",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://github.com/vuejs",
    iconSrc: "https://api.iconify.design/devicon:vuejs.svg",
  },
  {
    title: "Vite",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://github.com/vitejs/vite",
    iconSrc: "https://api.iconify.design/devicon:vite.svg",
  },
  {
    title: "Webpack",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://github.com/webpack/webpack",
    iconSrc: "https://api.iconify.design/devicon:webpack.svg",
  },
  {
    title: "Docker",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://www.docker.com/",
    iconSrc: "https://api.iconify.design/skill-icons:docker.svg",
  },
  {
    title: "Sass",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://www.sass.hk/",
    iconSrc: "https://api.iconify.design/logos:node-sass.svg",
  },
  {
    title: "Pnpm",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://pnpm.io/",
    iconSrc: "https://api.iconify.design/logos:pnpm.svg",
  },
  {
    title: "Vim",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://www.vim.org/",
    iconSrc: "https://api.iconify.design/logos:vim.svg",
  },
  {
    title: "Git",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://git-scm.com/",
    iconSrc: "https://api.iconify.design/logos:git-icon.svg",
  },
  {
    title: "Ubuntu",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://ubuntu.com/",
    iconSrc: "https://api.iconify.design/logos:ubuntu.svg",
  },
  {
    title: "Rollup",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://rollupjs.org/guide/en/",
    iconSrc: "https://api.iconify.design/devicon:rollup.svg",
  },
  {
    title: "VS Code",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://code.visualstudio.com/",
    iconSrc: "https://api.iconify.design/logos:visual-studio-code.svg",
  },
  {
    title: "Neovim",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://neovim.io/",
    iconSrc: "https://api.iconify.design/devicon:neovim.svg",
  },
  {
    title: "MySQL",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://www.mysql.com/",
    iconSrc: "https://api.iconify.design/devicon:mysql.svg",
  },
  {
    title: "Styled Components",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://styled-components.com/",
    iconSrc: "https://api.iconify.design/skill-icons:styledcomponents.svg",
  },
  {
    title: "Nestjs",
    description:
      "A code hosting platform for version control and collaboration.",
    link: "https://nestjs.com/",
    iconSrc: "https://api.iconify.design/devicon:nestjs.svg",
  },
];
export default function Stack() {
  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-24 px-8">
      <h1 className="text-3xl font-bold mb-6">Stack</h1>
      <div className="mb-4 last:mb-0">
        Here is my go-to stack. I use these tools to build and maintain my
        projects.
      </div>
      <ul className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
        {stackList.map((stackItem) => (
          <li key={stackItem.title} className="mb-1 flex last:mb-0">
            <Card className="flex-1 max-w-96">
              <div className="flex items-center h-full space-x-4 rounded-md p-4">
                <Image
                  src={stackItem.iconSrc}
                  width={24}
                  height={24}
                  alt={stackItem.title}
                ></Image>
                <div className="flex-1 space-y-1">
                  <a
                    className="text-sm font-medium leading-none flex hover:underline items-center"
                    href={stackItem.link}
                    target="_blank"
                  >
                    {stackItem.title}
                    <Link className="ml-1" size={14} />
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {stackItem.description}
                  </p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
