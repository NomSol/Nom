// lib/registry/scanner.ts
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
        // Handle JSXSpreadChild and JSXFragment
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

  private extractComponentInfo(node: t.JSXElement): UIComponent {
    const openingElement = node.openingElement;
    const elementName = t.isJSXIdentifier(openingElement.name) 
      ? openingElement.name.name 
      : 'Unknown';

    // Extract text content
    const text = this.extractTextContent(node.children);
    
    // Extract accessibility attributes
    const accessibility = this.extractAccessibilityInfo(openingElement.attributes);

    // Extract button text if it's a button
    let buttonText = '';
    if (elementName.toLowerCase() === 'button' || 
        (accessibility.role === 'button') || 
        elementName === 'Button') {
      buttonText = text;
    }

    // Handle onClick or similar handlers
    const eventHandlers: string[] = [];
    openingElement.attributes.forEach(attr => {
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        const name = attr.name.name;
        if (name.startsWith('on')) {
          eventHandlers.push(name);
        }
      }
    });

    // Extract important link information
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

  async scanRoute(routePath: string): Promise<RouteRegistry> {
    try {
      const filePath = path.join(this.baseDir, routePath);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      const components: UIComponent[] = [];
      const actions: RouteRegistry['actions'] = [];

      traverse(ast, {
        JSXElement: (path) => {
          // Only process top-level components
          if (path.parent && !t.isJSXElement(path.parent)) {
            const component = this.extractComponentInfo(path.node);
            components.push(component);
          }
        },
        CallExpression: (path) => {
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
    // Normalize path separators and create a flat filename
    const normalizedPath = routePath.replace(/[\\/]+/g, '_');
    const registryPath = path.join(this.registryDir, `${normalizedPath}.registry.json`);
    
    await fs.promises.writeFile(
      registryPath,
      JSON.stringify(registry, null, 2),
      'utf-8'
    );
  }
}