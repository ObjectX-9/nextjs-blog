import fs from "node:fs";
import path from "node:path";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from 'unified';

export function getDocsList() {
  const docsPath = path.join(process.cwd(), "src/docs");
  const files = fs.readdirSync(docsPath);
  return files.map((file) => {
    const filePath = path.join(docsPath, file);
    const stats = fs.statSync(filePath);
    const lastModified = stats.mtime;
    return {
      name: file.replace(/\.mdx|md$/, ""),
      lastModified,
    };
  });
}

export async function getMdxResource(blogName: string) {
  const docsPath = path.join(process.cwd(), "src/docs");
  const filePath = path.join(docsPath, `${blogName}.mdx`);
  const mdxSource = fs.readFileSync(filePath, "utf8");

  const file = await unified()
    .use(remarkParse) // Convert into markdown AST
    .use(remarkRehype) // Transform to HTML AST
    .use(remarkGfm)
    .use(rehypeSanitize) // Sanitize HTML input
    .use(rehypePrettyCode)
    .use(rehypeStringify) // Convert AST into serialized HTML
    .process(mdxSource);
  return file.value;
}

const Markdown: React.FC<{ blogName: string }> = async ({ blogName }) => {
  const source = await getMdxResource(blogName);
  return (
    <article
      className="prose prose-sm prose-a:text-blue-600 2xl:max-w-3xl min-w-none max-w-none overflow-x-clip w-full my-0 mx-auto"
      dangerouslySetInnerHTML={{ __html: source }}
    ></article>
  );
};

export default Markdown;
