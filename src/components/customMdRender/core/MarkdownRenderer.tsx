'use client';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { MarkdownComponentProps } from '../types/components';
import type { Components } from 'react-markdown';
import type { HTMLAttributes, DetailedHTMLProps } from 'react';
import { componentRegistry } from '../ComponentRegistry';
import TableOfContents from '../components/TableOfContents';
import { cn } from '@/lib/utils';

// 桌面端渲染组件
const DesktopMarkdownRenderer = ({ content = '' }: MarkdownComponentProps) => {
  const renderComponent = (id: string) => {
    const componentConfig = componentRegistry.get(id);
    if (!componentConfig) {
      console.warn(`Component with id ${id} not found in registry`);
      return null;
    }

    const componentFunction = componentConfig.component;
    if (!componentFunction) {
      console.warn(`Component type ${componentConfig.type} not found in componentMap`);
      return null;
    }

    return componentFunction(componentConfig.props);
  };

  const customComponents: Components = {
    div: (props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 'data-component'?: string }) => {
      const { 'data-component': dataComponent, ...rest } = props;

      if (dataComponent) {
        const component = renderComponent(dataComponent);
        if (component) {
          return <div {...rest}>{component}</div>;
        }
      }

      return <div {...rest}>{props.children}</div>;
    },
    h1: ({ node, ...props }) => <h1 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />,
    h2: ({ node, ...props }) => <h2 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />,
    h3: ({ node, ...props }) => <h3 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />,
    h4: ({ node, ...props }) => <h4 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />,
    h5: ({ node, ...props }) => <h5 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />,
    h6: ({ node, ...props }) => <h6 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />
  };

  return (
    <div className="markdown-content w-full mx-auto relative">
      <div className="lg:flex">
        <div className="w-full lg:flex-1 overflow-y-auto h-[calc(100vh-4rem)] px-4 max-w-3xl mx-auto lg:mx-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            components={customComponents}
          >
            {content || ''}
          </ReactMarkdown>
        </div>
        <TableOfContents content={content} className="hidden lg:block w-64 shrink-0" />
      </div>
    </div>
  );
};

// 移动端渲染组件
const MobileMarkdownRenderer = ({ content = '', isMobile }: MarkdownComponentProps & { isMobile?: boolean }) => {
  const renderComponent = (id: string) => {
    const componentConfig = componentRegistry.get(id);
    if (!componentConfig) {
      console.warn(`Component with id ${id} not found in registry`);
      return null;
    }

    const componentFunction = componentConfig.component;
    if (!componentFunction) {
      console.warn(`Component type ${componentConfig.type} not found in componentMap`);
      return null;
    }

    return componentFunction(componentConfig.props);
  };

  const customComponents: Components = {
    div: (props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 'data-component'?: string }) => {
      const { 'data-component': dataComponent, ...rest } = props;

      if (dataComponent) {
        const component = renderComponent(dataComponent);
        if (component) {
          return <div {...rest}>{component}</div>;
        }
      }

      return <div {...rest}>{props.children}</div>;
    },
    h1: ({ node, ...props }) => <h1 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />,
    h2: ({ node, ...props }) => <h2 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />,
    h3: ({ node, ...props }) => <h3 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />,
    h4: ({ node, ...props }) => <h4 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />,
    h5: ({ node, ...props }) => <h5 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />,
    h6: ({ node, ...props }) => <h6 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} />
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={customComponents}
        className={cn(
          "prose max-w-none",
          isMobile && "prose-sm [&_h1]:!text-lg [&_h2]:!text-base [&_h3]:!text-sm [&_h4]:!text-xs [&_p]:!text-xs [&_ul]:!text-xs [&_ol]:!text-xs [&_li]:!text-xs [&_pre]:!text-xs [&_code]:!text-xs [&_blockquote]:!text-xs [&_table]:!text-xs [&_img]:!w-full [&_img]:!max-w-full [&_pre]:!overflow-x-auto [&_pre]:!whitespace-pre-wrap [&_pre]:!break-words [&]:!text-[12px] [&]:!leading-[1.5]"
        )}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};

// 主导出组件
export const MarkdownRenderer = ({ content = '', isMobile = false }: MarkdownComponentProps & { isMobile?: boolean }) => {
  return isMobile ? (
    <MobileMarkdownRenderer content={content} isMobile={isMobile} />
  ) : (
    <DesktopMarkdownRenderer content={content} />
  );
};
