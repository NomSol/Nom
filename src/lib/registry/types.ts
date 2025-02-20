// lib/registry/types.ts
export interface UIComponent {
  type: string;                 // 组件类型 (e.g., 'button', 'div', 'Button')
  text: string;                 // 组件内的文本内容
  accessibility: {              // 可访问性属性
    role?: string;
    [key: string]: string | undefined;
  };
  buttonText?: string;         // 如果是按钮,其显示文本
  linkUrl?: string;            // 如果是链接,其目标URL
  events: string[];            // 事件处理器列表 (e.g., ['onClick', 'onFocus'])
  children: UIComponent[];     // 子组件
}

export interface RouteRegistry {
  route: string;
  components: UIComponent[];
  actions: {
    type: string;              // 动作类型 (e.g., 'handleDelete', 'handleSubmit')
    description: string;       // 动作描述
  }[];
  metadata: {
    lastUpdated: string;
    version: string;
  };
}