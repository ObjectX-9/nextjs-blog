# 图片预览组件

## 组件说明

### ImagePreview

一个独立的图片预览弹窗组件，支持全屏查看图片。

#### 特性

- 🔍 **全屏预览**: 支持全屏查看图片
- ⌨️ **键盘操作**: ESC 键关闭预览
- 🎨 **美观界面**: 带有关闭按钮和图片信息展示
- 📱 **响应式**: 自适应不同屏幕尺寸
- 🚫 **防止滚动**: 预览时禁止页面滚动
- 🖼️ **错误处理**: 图片加载失败时的占位符处理

#### Props

```typescript
interface ImagePreviewProps {
  src: string;     // 图片链接
  alt: string;     // 图片描述
  onClose: () => void; // 关闭回调函数
}
```

#### 使用示例

```tsx
import { ImagePreview } from '@/components/customMdRender/components/ImagePreview';

function MyComponent() {
  const [previewImage, setPreviewImage] = useState<{src: string, alt: string} | null>(null);

  return (
    <>
      <img 
        src="/example.jpg" 
        alt="示例图片"
        onClick={() => setPreviewImage({src: "/example.jpg", alt: "示例图片"})}
      />
      
      {previewImage && (
        <ImagePreview
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
}
```

### useImagePreview Hook

为容器内的图片自动添加点击预览功能的钩子函数。

#### 特性

- 🎯 **自动检测**: 自动为容器内的图片添加点击预览
- 🔄 **悬停效果**: 鼠标悬停时的缩放和透明度变化
- 📏 **尺寸过滤**: 过滤掉小于 50x50 的小图标
- ⚡ **性能优化**: 自动清理事件监听器

#### 参数

```typescript
interface ImagePreviewHookProps {
  enableImagePreview?: boolean;           // 是否启用图片预览，默认 true
  containerRef: React.RefObject<HTMLElement>; // 容器引用
  content?: string;                       // 内容变化的依赖项
}
```

#### 返回值

```typescript
{
  previewImage: {src: string, alt: string} | null; // 当前预览的图片
  closePreview: () => void;                        // 关闭预览函数
}
```

#### 使用示例

```tsx
import { useImagePreview, ImagePreview } from '@/components/customMdRender/components/ImagePreview';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { previewImage, closePreview } = useImagePreview({
    enableImagePreview: true,
    containerRef,
    content: 'some-content-dependency'
  });

  return (
    <>
      <div ref={containerRef}>
        <img src="/image1.jpg" alt="图片1" />
        <img src="/image2.jpg" alt="图片2" />
      </div>
      
      {previewImage && (
        <ImagePreview
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={closePreview}
        />
      )}
    </>
  );
}
```

## 在 MarkdownRenderer 中的使用

`MarkdownRenderer` 组件已经集成了图片预览功能：

```tsx
import { MarkdownRenderer } from '@/components/customMdRender/core/MarkdownRenderer';

function ArticlePage() {
  const markdownContent = `
# 示例文章

这是一张图片：

![示例图片](https://example.com/image.jpg)
  `;

  return (
    <MarkdownRenderer
      content={markdownContent}
      theme="github"
      enableImagePreview={true} // 启用图片预览
    />
  );
}
```

## 样式定制

可以通过修改 CSS 变量来定制图片预览的样式：

```css
/* 在你的 CSS 文件中 */
.markdown-content .toastui-editor-contents img {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.markdown-content .toastui-editor-contents img:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 16+

## 注意事项

1. 确保图片具有合适的 `alt` 属性用于无障碍访问
2. 对于大尺寸图片，建议使用图片压缩服务
3. 组件会自动处理图片加载失败的情况
4. 预览时会阻止页面滚动，关闭后自动恢复 