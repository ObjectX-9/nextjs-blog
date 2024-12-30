
// 组件配置
export interface ComponentConfig<Type extends string = string, Props = any> {
  type: Type;
  props: Props;
  component: Function;
}

// 组件注册表
export interface ComponentRegistry {
  [key: string]: ComponentConfig;
}

// Markdown 组件属性
export interface MarkdownComponentProps {
  content: string;
  components: ComponentRegistry;
}
