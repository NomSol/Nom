import { RegistryScanner } from '@/lib/registry/scanner';
import * as fs from 'fs';
import * as path from 'path';

async function findRoutes(dir: string, base = ''): Promise<string[]> {
  const routes: string[] = [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(base, entry.name);

    if (entry.isDirectory()) {
      routes.push(...await findRoutes(fullPath, relativePath));
    } else if (entry.name === 'page.tsx') {
      routes.push(relativePath);
    }
  }

  return routes;
}

async function main() {
  try {
    const baseDir = path.join(process.cwd(), 'src', 'app');
    const registryDir = path.join(process.cwd(), 'registry');

    const scanner = new RegistryScanner(baseDir, registryDir);

    console.log('Finding routes...');
    const routes = await findRoutes(baseDir);

    console.log(`Found ${routes.length} routes to scan:\n${routes.join('\n')}\n`);
    console.log('Starting registry scan...\n');

    for (const route of routes) {
      try {
        console.log(`Scanning route: ${route}`);
        const registry = await scanner.scanRoute(route);
        console.log(`✓ Generated registry with ${registry.components.length} components and ${registry.actions.length} actions\n`);
      } catch (error) {
        console.error(`✗ Error scanning route ${route}:`, error, '\n');
      }
    }

    console.log('Registry scan complete!');
  } catch (error) {
    console.error('Fatal error during registry scan:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});