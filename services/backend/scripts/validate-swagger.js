/* eslint-disable no-console, no-restricted-syntax, no-cond-assign, n/no-process-exit,
   security/detect-non-literal-fs-filename */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.resolve(__dirname, '..', 'src', 'modules');

function findFiles(dir, pattern) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function expressToOpenAPI(routePath) {
  return routePath.replace(/:(\w+)/g, '{$1}');
}

function normalizePath(p) {
  return p.replace(/\{[^}]+\}/g, '{*}');
}

function extractRoutes(content) {
  const routes = [];

  const directRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = directRegex.exec(content)) !== null) {
    routes.push({ method: match[1], path: match[2] });
  }

  const routeBlockRegex =
    /router\s*\n?\s*\.route\s*\(\s*['"]([^'"]+)['"]\s*\)([\s\S]*?)(?=\n\s*\n|\nrouter\b|\nmodule\.exports)/g;
  while ((match = routeBlockRegex.exec(content)) !== null) {
    const routePath = match[1];
    const chainBlock = match[2];
    const methodRegex = /\.(get|post|put|patch|delete)\s*\(/g;
    let methodMatch;
    while ((methodMatch = methodRegex.exec(chainBlock)) !== null) {
      routes.push({ method: methodMatch[1], path: routePath });
    }
  }

  return routes;
}

function extractSwaggerDocs(content) {
  const docs = [];
  const swaggerBlockRegex = /\/\*\*\s*\n\s*\*\s*@swagger\s*\n([\s\S]*?)\*\//g;
  let match;
  while ((match = swaggerBlockRegex.exec(content)) !== null) {
    const block = match[1];
    const pathRegex = /^\s*\*\s*(\/[^:\s]+)\s*:\s*$/gm;
    let pathMatch;
    while ((pathMatch = pathRegex.exec(block)) !== null) {
      const swaggerPath = pathMatch[1];
      const afterPath = block.slice(pathMatch.index + pathMatch[0].length);
      const nextPathIdx = afterPath.search(/^\s*\*\s*\/[^:\s]+\s*:\s*$/m);
      const methodBlock = nextPathIdx === -1 ? afterPath : afterPath.slice(0, nextPathIdx);
      const methodRegex = /^\s*\*\s{3,}(get|post|put|patch|delete)\s*:/gm;
      let methodMatch;
      while ((methodMatch = methodRegex.exec(methodBlock)) !== null) {
        docs.push({ method: methodMatch[1], path: swaggerPath });
      }
    }
  }
  return docs;
}

function resolveMountPrefix(routeFilePath) {
  const moduleDir = path.dirname(routeFilePath);
  const versionDir = path.dirname(moduleDir);
  const indexPath = path.join(versionDir, 'index.js');

  if (!fs.existsSync(indexPath)) return '';

  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const moduleName = path.basename(moduleDir);

  const useRegex = /router\.use\(\s*['"]([^'"]+)['"]\s*,\s*(\w+)\s*\)/g;
  let match;
  while ((match = useRegex.exec(indexContent)) !== null) {
    const prefix = match[1];
    const varName = match[2];
    if (varName.toLowerCase().includes(moduleName)) {
      return prefix;
    }
  }
  return '';
}

function validate() {
  const routeFiles = findFiles(MODULES_DIR, /\.routes\.js$/);

  if (routeFiles.length === 0) {
    console.log('No route files found.');
    process.exit(0);
  }

  const undocumented = [];

  for (const filePath of routeFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);

    const prefix = resolveMountPrefix(filePath);
    const routes = extractRoutes(content);
    const swaggerDocs = extractSwaggerDocs(content);

    const documentedSet = new Set(swaggerDocs.map((d) => `${d.method.toLowerCase()} ${normalizePath(d.path)}`));

    for (const route of routes) {
      const fullPath = expressToOpenAPI(`${prefix}${route.path === '/' ? '' : route.path}`);
      const resolvedPath = fullPath || prefix;
      const key = `${route.method.toLowerCase()} ${normalizePath(resolvedPath)}`;

      if (!documentedSet.has(key)) {
        undocumented.push({
          file: relativePath,
          method: route.method.toUpperCase(),
          path: resolvedPath,
        });
      }
    }
  }

  if (undocumented.length > 0) {
    console.error('\nSwagger documentation missing for the following routes:\n');
    for (const { file, method, path: routePath } of undocumented) {
      console.error(`  ${method} ${routePath}  (${file})`);
    }
    console.error(`\n${undocumented.length} route(s) missing swagger documentation.\n`);
    process.exit(1);
  }

  console.log(`All ${routeFiles.length} route file(s) have complete swagger documentation.`);
}

validate();
