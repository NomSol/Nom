import { RouteRegistry, UIComponent } from './types';

/**
 * Configuration options for the Vectorizer
 */
export interface VectorizerOptions {
  // Dimension of the output vectors
  dimensions?: number;
  // Weight factors for different component attributes
  weights?: {
    type?: number;
    text?: number;
    buttonText?: number;
    linkUrl?: number;
    accessibility?: number;
    events?: number;
    children?: number;
  };
  // Whether to normalize output vectors
  normalize?: boolean;
}

/**
 * Default options for vectorization
 */
const DEFAULT_OPTIONS: VectorizerOptions = {
  dimensions: 128,
  weights: {
    type: 1.0,
    text: 1.2,
    buttonText: 1.5,
    linkUrl: 1.3,
    accessibility: 1.1,
    events: 0.8,
    children: 0.5
  },
  normalize: true
};

/**
 * Vectorizer class for converting UI components to vector representations
 */
export class Vectorizer {
  private options: VectorizerOptions;
  private hashMap: Map<string, number[]>;
  private wordToVectorMap: Map<string, number[]>;

  /**
   * Initialize a new Vectorizer instance
   * @param options Configuration options
   */
  constructor(options: VectorizerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.hashMap = new Map<string, number[]>();
    this.wordToVectorMap = new Map<string, number[]>();
    this.initializeWordVectors();
  }

  /**
   * Initialize word vectors for common UI component terms
   * This is a simplified version - in production this would use pre-trained embeddings
   */
  private initializeWordVectors(): void {
    // Common UI component types
    const commonTypes = [
      'div', 'span', 'button', 'input', 'form', 'img', 'a', 'ul', 'li',
      'h1', 'h2', 'h3', 'p', 'select', 'option', 'textarea', 'table', 'tr', 'td',
      'Card', 'Button', 'Input', 'Form', 'Dropdown', 'Modal', 'Tabs', 'Avatar'
    ];

    // Common event handlers
    const commonEvents = [
      'onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur', 'onKeyPress',
      'onMouseOver', 'onMouseOut', 'onDrag', 'onDrop'
    ];

    // Common accessibility roles
    const accessibilityRoles = [
      'button', 'link', 'checkbox', 'radio', 'tab', 'tabpanel', 'dialog',
      'alert', 'banner', 'navigation', 'menu', 'menuitem'
    ];

    // Generate simple vector representation for each word
    [...commonTypes, ...commonEvents, ...accessibilityRoles].forEach(word => {
      this.wordToVectorMap.set(word, this.generateSimpleWordVector(word));
    });
  }

  /**
   * Generate a simple word vector using character hash values
   * This is a very simple approach - in production, use proper word embeddings
   */
  private generateSimpleWordVector(word: string): number[] {
    const dimensions = this.options.dimensions || 128;
    const vector = new Array(dimensions).fill(0);
    
    // Simple hash function to distribute across vector dimensions
    for (let i = 0; i < word.length; i++) {
      const char = word.charCodeAt(i);
      const position = (char * (i + 1)) % dimensions;
      vector[position] += char / 255; // Normalize to 0-1 range
    }
    
    return this.normalizeVector(vector);
  }

  /**
   * Vectorize a component and all its children
   * @param component UI component to vectorize
   * @returns Vector representation
   */
  public vectorizeComponent(component: UIComponent): number[] {
    // Check cache first
    const cacheKey = this.getCacheKey(component);
    if (this.hashMap.has(cacheKey)) {
      return this.hashMap.get(cacheKey)!;
    }

    const dimensions = this.options.dimensions || 128;
    const vector = new Array(dimensions).fill(0);
    const weights = this.options.weights || {};

    // Process component type
    this.addWordVector(vector, component.type, weights.type || 1.0);
    
    // Process text content
    if (component.text) {
      this.addTextVector(vector, component.text, weights.text || 1.0);
    }
    
    // Process button text (stronger signal for interactions)
    if (component.buttonText) {
      this.addTextVector(vector, component.buttonText, weights.buttonText || 1.5);
    }
    
    // Process link URL
    if (component.linkUrl) {
      this.addTextVector(vector, component.linkUrl, weights.linkUrl || 1.3);
    }
    
    // Process accessibility attributes
    if (Object.keys(component.accessibility).length > 0) {
      const accessWeight = weights.accessibility || 1.1;
      Object.entries(component.accessibility).forEach(([key, value]) => {
        if (value) {
          this.addWordVector(vector, key, accessWeight * 0.5);
          this.addTextVector(vector, value, accessWeight * 0.5);
        }
      });
    }
    
    // Process events
    if (component.events.length > 0) {
      const eventWeight = weights.events || 0.8;
      component.events.forEach(event => {
        this.addWordVector(vector, event, eventWeight);
      });
    }
    
    // Process children components (with reduced weight)
    if (component.children.length > 0) {
      const childWeight = weights.children || 0.5;
      component.children.forEach(child => {
        const childVector = this.vectorizeComponent(child);
        this.addVectorWithWeight(vector, childVector, childWeight);
      });
    }
    
    // Normalize the vector if specified
    const result = this.options.normalize ? this.normalizeVector(vector) : vector;
    
    // Cache the result
    this.hashMap.set(cacheKey, result);
    
    return result;
  }

  /**
   * Vectorize an entire route registry
   * @param registry Route registry to vectorize
   * @returns Object with vectorized components
   */
  public vectorizeRegistry(registry: RouteRegistry): { 
    route: string; 
    vectors: { component: UIComponent; vector: number[] }[];
    routeVector: number[];
  } {
    // Vectorize each component in the registry
    const vectors = registry.components.map(component => ({
      component,
      vector: this.vectorizeComponent(component)
    }));
    
    // Create an aggregate vector for the entire route by averaging component vectors
    const routeVector = this.combineVectors(vectors.map(v => v.vector));
    
    return {
      route: registry.route,
      vectors,
      routeVector
    };
  }

  /**
   * Calculate similarity between two vectors (cosine similarity)
   * @param vec1 First vector
   * @param vec2 Second vector
   * @returns Similarity score between 0 and 1
   */
  public similarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }
    
    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    return dotProduct / (mag1 * mag2);
  }

  /**
   * Find the most similar components from a registry to a query vector
   * @param registry Vectorized registry
   * @param queryVector Query vector to match against
   * @param topK Number of results to return
   * @returns Array of components and their similarity scores
   */
  public findSimilarComponents(
    registry: { route: string; vectors: { component: UIComponent; vector: number[] }[] },
    queryVector: number[],
    topK: number = 5
  ): { component: UIComponent; similarity: number }[] {
    const results = registry.vectors.map(({ component, vector }) => ({
      component,
      similarity: this.similarity(vector, queryVector)
    }));
    
    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);
    
    // Return top K results
    return results.slice(0, topK);
  }

  /**
   * Vectorize a text query to match against components
   * @param query Text query
   * @returns Vector representation of the query
   */
  public vectorizeQuery(query: string): number[] {
    const dimensions = this.options.dimensions || 128;
    const vector = new Array(dimensions).fill(0);
    
    this.addTextVector(vector, query, 1.0);
    
    return this.options.normalize ? this.normalizeVector(vector) : vector;
  }

  /**
   * Add a word vector to the target vector with a specified weight
   */
  private addWordVector(targetVector: number[], word: string, weight: number): void {
    let wordVector: number[];
    
    if (this.wordToVectorMap.has(word)) {
      wordVector = this.wordToVectorMap.get(word)!;
    } else {
      wordVector = this.generateSimpleWordVector(word);
      this.wordToVectorMap.set(word, wordVector);
    }
    
    this.addVectorWithWeight(targetVector, wordVector, weight);
  }

  /**
   * Add a text vector (multiple words) to the target vector
   */
  private addTextVector(targetVector: number[], text: string, weight: number): void {
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (word.length > 0) {
        this.addWordVector(targetVector, word, weight / words.length);
      }
    });
  }

  /**
   * Add a vector to the target vector with a specified weight
   */
  private addVectorWithWeight(targetVector: number[], sourceVector: number[], weight: number): void {
    for (let i = 0; i < targetVector.length; i++) {
      targetVector[i] += sourceVector[i] * weight;
    }
  }

  /**
   * Normalize a vector to unit length
   */
  private normalizeVector(vector: number[]): number[] {
    let magnitude = 0;
    
    for (let i = 0; i < vector.length; i++) {
      magnitude += vector[i] * vector[i];
    }
    
    magnitude = Math.sqrt(magnitude);
    
    if (magnitude === 0) return vector;
    
    return vector.map(value => value / magnitude);
  }

  /**
   * Combine multiple vectors into one by averaging
   */
  private combineVectors(vectors: number[][]): number[] {
    if (vectors.length === 0) {
      return new Array(this.options.dimensions || 128).fill(0);
    }
    
    const result = new Array(vectors[0].length).fill(0);
    
    vectors.forEach(vector => {
      for (let i = 0; i < vector.length; i++) {
        result[i] += vector[i];
      }
    });
    
    // Average the values
    for (let i = 0; i < result.length; i++) {
      result[i] /= vectors.length;
    }
    
    return this.options.normalize ? this.normalizeVector(result) : result;
  }

  /**
   * Generate a cache key for a component
   */
  private getCacheKey(component: UIComponent): string {
    return JSON.stringify({
      type: component.type,
      text: component.text,
      buttonText: component.buttonText,
      linkUrl: component.linkUrl,
      accessibility: component.accessibility,
      events: component.events,
      childrenCount: component.children.length
    });
  }
}

/**
 * Create a vectorizer with default options
 * @returns Configured Vectorizer instance
 */
export function createVectorizer(options?: VectorizerOptions): Vectorizer {
  return new Vectorizer(options);
}

/**
 * Helper class to store and search registry vectors
 */
export class RegistryVectorStore {
  private vectorizer: Vectorizer;
  private vectorizedRegistries: Array<{
    route: string;
    vectors: { component: UIComponent; vector: number[] }[];
    routeVector: number[];
  }> = [];

  constructor(vectorizer?: Vectorizer) {
    this.vectorizer = vectorizer || createVectorizer();
  }

  /**
   * Add a registry to the vector store
   * @param registry Registry to add
   */
  public addRegistry(registry: RouteRegistry): void {
    const vectorized = this.vectorizer.vectorizeRegistry(registry);
    this.vectorizedRegistries.push(vectorized);
  }

  /**
   * Find the most similar components across all registries
   * @param query Text query or vector
   * @param topK Number of results to return
   */
  public findSimilarComponents(
    query: string | number[],
    topK: number = 5
  ): Array<{
    route: string;
    component: UIComponent;
    similarity: number;
  }> {
    const queryVector = typeof query === 'string' 
      ? this.vectorizer.vectorizeQuery(query)
      : query;
    
    const allResults: Array<{
      route: string;
      component: UIComponent;
      similarity: number;
    }> = [];
    
    this.vectorizedRegistries.forEach(registry => {
      const results = this.vectorizer.findSimilarComponents(registry, queryVector, topK);
      
      results.forEach(result => {
        allResults.push({
          route: registry.route,
          component: result.component,
          similarity: result.similarity
        });
      });
    });
    
    // Sort by similarity (descending)
    allResults.sort((a, b) => b.similarity - a.similarity);
    
    // Return top K results
    return allResults.slice(0, topK);
  }

  /**
   * Find the most similar routes to a query
   * @param query Text query or vector
   * @param topK Number of results to return
   */
  public findSimilarRoutes(
    query: string | number[],
    topK: number = 3
  ): Array<{
    route: string;
    similarity: number;
  }> {
    const queryVector = typeof query === 'string'
      ? this.vectorizer.vectorizeQuery(query)
      : query;
    
    const results = this.vectorizedRegistries.map(registry => ({
      route: registry.route,
      similarity: this.vectorizer.similarity(queryVector, registry.routeVector)
    }));
    
    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);
    
    // Return top K results
    return results.slice(0, topK);
  }

  /**
   * Get the vectorizer instance
   */
  public getVectorizer(): Vectorizer {
    return this.vectorizer;
  }

  /**
   * Get all vectorized registries
   */
  public getVectorizedRegistries(): Array<{
    route: string;
    vectors: { component: UIComponent; vector: number[] }[];
    routeVector: number[];
  }> {
    return this.vectorizedRegistries;
  }
}