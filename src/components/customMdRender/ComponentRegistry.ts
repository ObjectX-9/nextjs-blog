import { ComponentRegistry } from "./types/components";

class ComponentRegistryService {
  private static instance: ComponentRegistryService;
  private registry: ComponentRegistry = {};

  private constructor() { }

  public static getInstance(): ComponentRegistryService {
    if (!ComponentRegistryService.instance) {
      ComponentRegistryService.instance = new ComponentRegistryService();
    }
    return ComponentRegistryService.instance;
  }

  public register(id: string, config: ComponentRegistry[string]): void {
    this.registry[id] = config;
  }

  public get(id: string): ComponentRegistry[string] | undefined {
    return this.registry[id];
  }

  public getAll(): ComponentRegistry {
    return { ...this.registry };
  }
}

export const componentRegistry = ComponentRegistryService.getInstance();
