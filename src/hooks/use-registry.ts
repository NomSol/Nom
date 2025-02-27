import { RouteRegistry, UIComponent } from '@/lib/registry/types';
import { RegistryVectorStore, createVectorizer } from '@/lib/registry/vectorizer';
import { useCallback, useEffect, useState } from 'react';

interface UseRegistryOptions {
  route?: string;
  preloadRoutes?: string[];
}

interface UseRegistryReturn {
  registry: RouteRegistry | null;
  loading: boolean;
  error: Error | null;
  vectorStore: RegistryVectorStore;
  searchComponents: (query: string, topK?: number) => Promise<Array<{
    route: string;
    component: UIComponent;
    similarity: number;
  }>>;
  findSimilarRoutes: (query: string, topK?: number) => Promise<Array<{
    route: string;
    similarity: number;
  }>>;
}

/**
 * Hook for loading and interacting with component registries
 */
export function useRegistry({ route, preloadRoutes = [] }: UseRegistryOptions = {}): UseRegistryReturn {
  const [registry, setRegistry] = useState<RouteRegistry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [vectorStore] = useState<RegistryVectorStore>(() => new RegistryVectorStore(createVectorizer()));

  /**
   * Load a registry by route
   */
  const loadRegistry = useCallback(async (routePath: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert route path to registry file path
      const normalizedPath = routePath.replace(/[\\/]+/g, '_');
      const registryPath = `/registry/${normalizedPath}.registry.json`;
      
      const response = await fetch(registryPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load registry for route ${routePath}`);
      }
      
      const data = await response.json();
      setRegistry(data);
      
      // Add to vector store
      vectorStore.addRegistry(data);
      
      return data;
    } catch (err) {
      console.error(`Error loading registry for route ${routePath}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  }, [vectorStore]);

  /**
   * Search for components matching a query
   */
  const searchComponents = useCallback(async (
    query: string,
    topK: number = 5
  ): Promise<Array<{
    route: string;
    component: UIComponent;
    similarity: number;
  }>> => {
    return vectorStore.findSimilarComponents(query, topK);
  }, [vectorStore]);

  /**
   * Find routes matching a query
   */
  const findSimilarRoutes = useCallback(async (
    query: string,
    topK: number = 3
  ): Promise<Array<{
    route: string;
    similarity: number;
  }>> => {
    return vectorStore.findSimilarRoutes(query, topK);
  }, [vectorStore]);

  // Load the specified route registry
  useEffect(() => {
    if (route) {
      loadRegistry(route);
    }
  }, [route, loadRegistry]);

  // Preload additional routes if specified
  useEffect(() => {
    if (preloadRoutes && preloadRoutes.length > 0) {
      Promise.all(preloadRoutes.map(r => loadRegistry(r)))
        .catch(err => console.error('Error preloading registries:', err));
    }
  }, [preloadRoutes, loadRegistry]);

  return {
    registry,
    loading,
    error,
    vectorStore,
    searchComponents,
    findSimilarRoutes
  };
}