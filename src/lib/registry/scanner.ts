import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as fs from 'fs';
import * as path from 'path';
import { RouteRegistry, UIComponent } from './types';

export class RegistryScanner {
  private baseDir: string;
  private registryDir: string;
  private currentPath: string[] = [];
  private processedFiles: Set<string> = new Set(); // Track processed files to avoid recursion

  constructor(baseDir: string, registryDir: string) {
    this.baseDir = baseDir;
    this.registryDir = registryDir;
    this.ensureRegistryDir();
  }

  private ensureRegistryDir() {
    if (!fs.existsSync(this.registryDir)) {
      fs.mkdirSync(this.registryDir, { recursive: true });
    }
  }

  private extractTextContent(children: Array<t.JSXText | t.JSXElement | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXFragment>): string {
    return children
      .map(child => {
        if (t.isJSXText(child)) {
          return child.value.trim();
        }
        if (t.isJSXElement(child)) {
          return this.extractTextContent(child.children);
        }
        if (t.isJSXExpressionContainer(child)) {
          if (t.isStringLiteral(child.expression)) {
            return child.expression.value;
          }
          if (t.isTemplateLiteral(child.expression)) {
            return child.expression.quasis[0].value.raw;
          }
        }
        return '';
      })
      .filter(text => text.length > 0)
      .join(' ');
  }

  private extractAccessibilityInfo(attributes: Array<t.JSXAttribute | t.JSXSpreadAttribute>) {
    const accessibility: Record<string, string> = {};
    
    attributes.forEach(attr => {
      if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name)) return;
      
      const name = attr.name.name;
      if (name === 'role' || name.startsWith('aria-')) {
        const value = this.extractAttributeValue(attr.value);
        if (value) {
          accessibility[name] = value;
        }
      }
    });

    return accessibility;
  }

  private extractAttributeValue(value: t.JSXAttribute['value']): string | null {
    if (!value) return null;
    
    if (t.isStringLiteral(value)) {
      return value.value;
    }
    
    if (t.isJSXExpressionContainer(value)) {
      const expr = value.expression;
      if (t.isStringLiteral(expr)) {
        return expr.value;
      }
      if (t.isTemplateLiteral(expr)) {
        return expr.quasis[0].value.raw;
      }
    }
    
    return null;
  }

  // Get the imported component path
  private resolveImportPath(importPath: string, currentFilePath: string): string | null {
    if (importPath.startsWith('@/')) {
      // Handle aliased imports (using @ prefix)
      const srcPath = importPath.replace('@/', '');
      return path.join(this.baseDir, '..', srcPath);
    } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
      // Handle relative imports
      return path.resolve(path.dirname(currentFilePath), importPath);
    }
    // Skip external imports
    return null;
  }

  private extractComponentInfo(node: t.JSXElement): UIComponent {
    const openingElement = node.openingElement;
    const elementName = t.isJSXIdentifier(openingElement.name) 
      ? openingElement.name.name 
      : 'Unknown';

    const text = this.extractTextContent(node.children);
    
    const accessibility = this.extractAccessibilityInfo(openingElement.attributes);

    let buttonText = '';
    if (elementName.toLowerCase() === 'button' || 
        (accessibility.role === 'button') || 
        elementName === 'Button') {
      buttonText = text;
    }

    const eventHandlers: string[] = [];
    openingElement.attributes.forEach(attr => {
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        const name = attr.name.name;
        if (name.startsWith('on')) {
          eventHandlers.push(name);
        }
      }
    });

    let linkInfo = '';
    if (elementName.toLowerCase() === 'a' || elementName === 'Link') {
      openingElement.attributes.forEach(attr => {
        if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
          if (attr.name.name === 'href') {
            linkInfo = this.extractAttributeValue(attr.value) || '';
          }
        }
      });
    }

    const component: UIComponent = {
      type: elementName,
      text: text || buttonText || '', // Prioritize any text content
      accessibility,
      buttonText: buttonText || undefined,
      linkUrl: linkInfo || undefined,
      events: eventHandlers,
      children: node.children
        .filter((child): child is t.JSXElement => t.isJSXElement(child))
        .map(child => this.extractComponentInfo(child))
    };

    return component;
  }

  private async processImports(filePath: string, components: UIComponent[]): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      // Keep track of import mappings (component name -> file path)
      const importedComponents: Map<string, string> = new Map();

      // First pass: collect all import statements
      const self = this; // Store reference to this for use in traverse
      traverse(ast, {
        ImportDeclaration(path) {
          const source = path.node.source.value;
          
          // Only process imports from the src directory
          if (typeof source === 'string' && (source.startsWith('@/') || source.startsWith('./') || source.startsWith('../'))) {
            const importPath = source;
            const resolvedPath = self.resolveImportPath(importPath, filePath);
            
            if (resolvedPath) {
              // Extract imported component names
              path.node.specifiers.forEach(specifier => {
                if (t.isImportSpecifier(specifier) || t.isImportDefaultSpecifier(specifier)) {
                  const componentName = specifier.local.name;
                  importedComponents.set(componentName, resolvedPath);
                }
              });
            }
          }
        }
      });

      // Second pass: For each custom component found, recursively scan its file
      for (const [componentName, importPath] of importedComponents.entries()) {
        // Skip if we've already processed this file to avoid infinite recursion
        if (this.processedFiles.has(importPath)) continue;
        
        // Add extension to the file path if not present (.tsx or .ts)
        const resolvedPath = !importPath.endsWith('.tsx') && !importPath.endsWith('.ts') 
          ? `${importPath}.tsx` 
          : importPath;
        
        // Check if the file exists
        if (fs.existsSync(resolvedPath)) {
          this.processedFiles.add(resolvedPath);
          
          // Read and parse the component file
          const componentContent = await fs.promises.readFile(resolvedPath, 'utf-8');
          const componentAst = parse(componentContent, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
          });
          
          // Extract component definition
          const extractedComponents: UIComponent[] = [];
          
          const self = this; // Store reference to this for use in traverse
          traverse(componentAst, {
            JSXElement(path) {
              // Only capture top-level JSX elements
              if (path.parent && !t.isJSXElement(path.parent)) {
                const component = self.extractComponentInfo(path.node);
                extractedComponents.push(component);
              }
            }
          });
          
          // Find where this component is used in the main file
          const usageIndex = components.findIndex(comp => 
            comp.type === componentName || 
            comp.children.some(child => child.type === componentName));
          
          if (usageIndex >= 0) {
            // Enhance the component details in the registry
            if (extractedComponents.length > 0) {
              components[usageIndex].children = extractedComponents;
            }
          } else {
            // Add as a new component if it wasn't found in the main file
            extractedComponents.forEach(comp => {
              components.push({
                ...comp,
                type: componentName, // Use the imported name
              });
            });
          }
          
          // Recursively process imports from this component
          await this.processImports(resolvedPath, components);
        }
      }
    } catch (error) {
      console.error(`Error processing imports in ${filePath}:`, error);
    }
  }

  async scanRoute(routePath: string): Promise<RouteRegistry> {
    try {
      const filePath = path.join(this.baseDir, routePath);
      this.processedFiles.clear(); // Reset processed files for this route
      this.processedFiles.add(filePath); // Add the main file to avoid re-processing
      
      const content = await fs.promises.readFile(filePath, 'utf-8');
      
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      const components: UIComponent[] = [];
      const actions: RouteRegistry['actions'] = [];

      const self = this; // Store reference to this for use in traverse
      traverse(ast, {
        JSXElement(path) {
          if (path.parent && !t.isJSXElement(path.parent)) {
            const component = self.extractComponentInfo(path.node);
            components.push(component);
          }
        },
        CallExpression(path) {
          const node = path.node;
          if (t.isIdentifier(node.callee) && 
              node.callee.name.startsWith('handle')) {
            actions.push({
              type: node.callee.name,
              description: `Event handler: ${node.callee.name}`
            });
          }
        }
      });

      // Process imported components
      await this.processImports(filePath, components);

      const registry: RouteRegistry = {
        route: routePath,
        components,
        actions,
        metadata: {
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      await this.saveRegistry(routePath, registry);
      return registry;
    } catch (error) {
      console.error(`Error scanning route ${routePath}:`, error);
      throw error;
    }
  }

  private async saveRegistry(routePath: string, registry: RouteRegistry) {
    const normalizedPath = routePath.replace(/[\\/]+/g, '_');
    const registryPath = path.join(this.registryDir, `${normalizedPath}.registry.json`);
    
    await fs.promises.writeFile(
      registryPath,
      JSON.stringify(registry, null, 2),
      'utf-8'
    );
  }
}