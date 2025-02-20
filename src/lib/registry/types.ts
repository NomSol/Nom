
export interface UIComponent {
  type: string;  
  text: string;
  accessibility: {
    role?: string;
    [key: string]: string | undefined;
  };
  buttonText?: string;
  linkUrl?: string;
  events: string[];
  children: UIComponent[]; 
}

export interface RouteRegistry {
  route: string;
  components: UIComponent[];
  actions: {
    type: string;
    description: string;
  }[];
  metadata: {
    lastUpdated: string;
    version: string;
  };
}