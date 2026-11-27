import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const UI_DIR = path.resolve(ROOT_DIR, 'components', 'ui');
const OUTPUT_PATH = path.resolve(ROOT_DIR, 'registry.json');

const REGISTRY_NAME = 'apple-liquid-ui';
const REGISTRY_NAMESPACE = '@apple-liquid';
const REGISTRY_HOMEPAGE =
  process.env.REGISTRY_HOMEPAGE || 'https://github.com/createagle/apple-liquid-ui';
const REGISTRY_BASE_URL = process.env.REGISTRY_BASE_URL?.replace(/\/+$/, '') || '';

const BUILTIN_PACKAGES = new Set(['react', 'react-dom', 'next']);
const IMPORT_PATTERN =
  /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

function assertWithinRoot(targetPath) {
  const resolved = path.resolve(targetPath);
  if (resolved !== ROOT_DIR && !resolved.startsWith(ROOT_DIR + path.sep)) {
    throw new Error(`Refusing to access path outside repository root: ${targetPath}`);
  }
  return resolved;
}

function toPosixRelative(absPath) {
  return path.relative(ROOT_DIR, absPath).split(path.sep).join('/');
}

function toTitle(slug) {
  return slug
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join(' ');
}

function toRootPackageName(specifier) {
  if (specifier.startsWith('@')) {
    const parts = specifier.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier;
  }
  return specifier.split('/')[0];
}

function resolveLocalModule(importPath) {
  const rel = importPath.replace(/^@\//, '');
  const candidates = [
    path.resolve(ROOT_DIR, `${rel}.tsx`),
    path.resolve(ROOT_DIR, `${rel}.ts`),
    path.resolve(ROOT_DIR, rel, 'index.tsx'),
    path.resolve(ROOT_DIR, rel, 'index.ts'),
  ];

  for (const candidate of candidates) {
    assertWithinRoot(candidate);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

function extractImports(sourceCode) {
  const specifiers = [];
  for (const match of sourceCode.matchAll(IMPORT_PATTERN)) {
    const specifier = match[1] || match[2];
    if (specifier) {
      specifiers.push(specifier);
    }
  }
  return specifiers;
}

function formatRegistryDep(name) {
  if (REGISTRY_BASE_URL) {
    return `${REGISTRY_BASE_URL}/${name}.json`;
  }
  return `${REGISTRY_NAMESPACE}/${name}`;
}

/**
 * `LiquidGlassProvider` applies accent presets by setting `data-apple-accent`
 * on the root, so consumers need the matching CSS rules. They are generated
 * from `LIQUID_GLASS_ACCENTS` (single source of truth) and shipped unlayered with
 * `:root` / `:root.dark` specificity so they override the default `cssVars`.
 */
function buildAccentPresetCss() {
  const providerPath = assertWithinRoot(
    path.join(UI_DIR, 'liquid-glass-provider.tsx')
  );
  const source = fs.readFileSync(providerPath, 'utf8');
  const block = source.match(
    /export const LIQUID_GLASS_ACCENTS = \{([\s\S]*?)\n\} as const/
  );
  if (!block) {
    throw new Error('LIQUID_GLASS_ACCENTS not found in liquid-glass-provider.tsx');
  }

  const HEX = '"(#[0-9a-fA-F]{3,8})"';
  const entry = new RegExp(
    `(\\w+): \\{[^}]*?light: ${HEX},[^}]*?dark: ${HEX},[^}]*?pressedLight: ${HEX},[^}]*?pressedDark: ${HEX}`,
    'g'
  );

  const css = {};
  for (const [, name, light, dark, pressedLight, pressedDark] of block[1].matchAll(entry)) {
    const attr = `[data-apple-accent="${name}"]`;
    css[`:root${attr}, ${attr}`] = {
      '--apple-accent': light,
      '--apple-accent-pressed': pressedLight,
    };
    css[`:root.dark${attr}, .dark${attr}, .dark ${attr}`] = {
      '--apple-accent': dark,
      '--apple-accent-pressed': pressedDark,
    };
  }

  if (Object.keys(css).length === 0) {
    throw new Error('No accent presets parsed from LIQUID_GLASS_ACCENTS');
  }
  return css;
}

function buildLiquidFoundationItem() {
  const files = [];
  for (const [relPath, type] of [['lib/liquid-motion.ts', 'registry:lib']]) {
    const abs = assertWithinRoot(path.resolve(ROOT_DIR, relPath));
    if (fs.existsSync(abs)) {
      files.push({ path: relPath, type });
    }
  }

  return {
    name: 'liquid-glass',
    type: 'registry:style',
    title: 'Apple Liquid Glass Foundation',
    description:
      'Apple macOS 27 & iOS 27 system color tokens, @liqui-design/glass refraction tokens, and Motion spring physics.',
    dependencies: ['@liqui-design/glass', 'motion'],
    files,
    css: buildAccentPresetCss(),
    cssVars: {
      light: {
        'apple-accent': '#0088ff',
        'apple-accent-pressed': '#0078f0',
        'apple-blue': 'var(--apple-accent)',
        'apple-blue-pressed': 'var(--apple-accent-pressed)',
        'apple-green': '#34c759',
        'apple-red': '#ff383c',
        'apple-red-pressed': '#e5292d',
        'apple-fill-bordered-mac': 'rgba(0, 0, 0, 0.08)',
        'apple-fill-bordered-mac-hover': 'rgba(0, 0, 0, 0.12)',
        'apple-fill-bordered-mac-pressed': 'rgba(0, 0, 0, 0.16)',
        'apple-fill-bordered-ios': 'rgba(118, 118, 128, 0.12)',
        'apple-fill-bordered-ios-pressed': 'rgba(118, 118, 128, 0.22)',
        'apple-fill-over-glass': 'rgba(0, 0, 0, 0.12)',
        'apple-fill-over-glass-pressed': 'rgba(0, 0, 0, 0.2)',
        'apple-fill-destructive-ios': 'rgba(255, 56, 60, 0.14)',
        'apple-fill-destructive-ios-pressed': 'rgba(255, 56, 60, 0.22)',
        'apple-fill-destructive-mac': 'rgba(245, 47, 50, 0.23)',
        'apple-fill-destructive-mac-pressed': 'rgba(245, 47, 50, 0.31)',
        'apple-label-destructive-mac': '#f52f32',
        'liquid-glass-tint': '0.5',
        'liquid-surface-alpha': 'calc(0.16 + var(--liquid-glass-tint, 0.5) * 0.7)',
        'liquid-surface-menu-alpha': 'calc(0.22 + var(--liquid-glass-tint, 0.5) * 0.68)',
        'liquid-surface-sheet-alpha': 'calc(0.2 + var(--liquid-glass-tint, 0.5) * 0.7)',
        'liquid-surface': 'rgb(240 242 246 / var(--liquid-surface-alpha))',
        'liquid-surface-hover': 'rgb(246 247 250 / min(0.98, calc(var(--liquid-surface-alpha) + 0.1)))',
        'liquid-surface-menu': 'rgb(255 255 255 / var(--liquid-surface-menu-alpha))',
        'liquid-surface-sheet': 'rgb(255 255 255 / var(--liquid-surface-sheet-alpha))',
        'liquid-blur': 'calc(4px + var(--liquid-glass-tint, 0.5) * 26px)',
        'liquid-saturate': 'calc(1.55 + var(--liquid-glass-tint, 0.5) * 0.45)',
        'lq-text': 'rgba(0, 0, 0, 0.85)',
        'lq-text-dim': 'rgba(0, 0, 0, 0.5)',
        'lq-tint': 'rgb(255 255 255 / calc(0.12 + var(--liquid-glass-tint, 0.5) * 0.88))',
        'lq-tint-deep': 'rgb(248 249 252 / calc(0.05 + var(--liquid-glass-tint, 0.5) * 0.87))',
        'lq-rim-hi': 'rgba(255, 255, 255, 0.85)',
        'lq-rim-lo': 'rgba(255, 255, 255, 0.28)',
        'lq-shadow':
          '0 24px 60px rgba(10, 15, 40, 0.35), 0 4px 14px rgba(10, 15, 40, 0.18)',
        'lq-highlight': 'rgba(255, 255, 255, 0.5)',
        'lq-control': 'rgba(255, 255, 255, 0.72)',
        'lq-control-rim': 'rgba(28, 28, 40, 0.16)',
        'lq-accent': 'var(--apple-accent)',
        'lq-danger': '#ff383c',
        'lq-danger-text': '#e0262b',
        'lq-scrim': 'rgba(12, 14, 28, 0.32)',
      },
      dark: {
        'apple-accent': '#0091ff',
        'apple-accent-pressed': '#0a99ff',
        'apple-blue': 'var(--apple-accent)',
        'apple-blue-pressed': 'var(--apple-accent-pressed)',
        'apple-green': '#30d158',
        'apple-red': '#ff4245',
        'apple-red-pressed': '#ff5a5d',
        'apple-fill-bordered-mac': 'rgba(255, 255, 255, 0.08)',
        'apple-fill-bordered-mac-hover': 'rgba(255, 255, 255, 0.13)',
        'apple-fill-bordered-mac-pressed': 'rgba(255, 255, 255, 0.18)',
        'apple-fill-bordered-ios': 'rgba(120, 120, 128, 0.28)',
        'apple-fill-bordered-ios-pressed': 'rgba(120, 120, 128, 0.38)',
        'apple-fill-over-glass': 'rgba(255, 255, 255, 0.15)',
        'apple-fill-over-glass-pressed': 'rgba(255, 255, 255, 0.24)',
        'apple-fill-destructive-ios': 'rgba(255, 66, 69, 0.14)',
        'apple-fill-destructive-ios-pressed': 'rgba(255, 66, 69, 0.22)',
        'apple-fill-destructive-mac': 'rgba(255, 71, 71, 0.25)',
        'apple-fill-destructive-mac-pressed': 'rgba(255, 71, 71, 0.33)',
        'apple-label-destructive-mac': '#ff4747',
        'liquid-surface-alpha': 'calc(0.16 + var(--liquid-glass-tint, 0.5) * 0.68)',
        'liquid-surface-menu-alpha': 'calc(0.22 + var(--liquid-glass-tint, 0.5) * 0.66)',
        'liquid-surface-sheet-alpha': 'calc(0.2 + var(--liquid-glass-tint, 0.5) * 0.68)',
        'liquid-surface': 'rgb(26 26 30 / var(--liquid-surface-alpha))',
        'liquid-surface-hover': 'rgb(38 38 44 / min(0.96, calc(var(--liquid-surface-alpha) + 0.1)))',
        'liquid-surface-menu': 'rgb(26 26 30 / var(--liquid-surface-menu-alpha))',
        'liquid-surface-sheet': 'rgb(22 22 26 / var(--liquid-surface-sheet-alpha))',
        'liquid-blur': 'calc(4px + var(--liquid-glass-tint, 0.5) * 26px)',
        'liquid-saturate': 'calc(1.55 + var(--liquid-glass-tint, 0.5) * 0.45)',
        'lq-text': 'rgba(255, 255, 255, 0.85)',
        'lq-text-dim': 'rgba(255, 255, 255, 0.55)',
        'lq-tint': 'color-mix(in srgb, rgb(255 255 255 / 0.08), rgb(64 64 70 / 0.96) calc(var(--liquid-glass-tint, 0.5) * 100%))',
        'lq-tint-deep': 'color-mix(in srgb, rgb(160 160 175 / 0.05), rgb(44 44 50 / 0.96) calc(var(--liquid-glass-tint, 0.5) * 100%))',
        'lq-rim-hi': 'rgba(255, 255, 255, 0.5)',
        'lq-rim-lo': 'rgba(255, 255, 255, 0.12)',
        'lq-shadow':
          '0 24px 60px rgba(0, 0, 5, 0.55), 0 4px 14px rgba(0, 0, 5, 0.35)',
        'lq-highlight': 'rgba(255, 255, 255, 0.18)',
        'lq-control': 'rgba(126, 128, 146, 0.3)',
        'lq-control-rim': 'rgba(255, 255, 255, 0.22)',
        'lq-accent': 'var(--apple-accent)',
        'lq-danger': '#ff4245',
        'lq-danger-text': '#ff6467',
        'lq-scrim': 'rgba(0, 0, 6, 0.48)',
      },
    },
  };
}

function buildRegistryItem(uiFileName) {
  const safeName = path.basename(uiFileName);
  const componentName = safeName.replace(/\.tsx$/, '');
  const entryAbsPath = assertWithinRoot(path.join(UI_DIR, safeName));

  const dependencies = new Set();
  const registryDependencies = new Set();
  const files = new Map();
  const visited = new Set();
  let usesLiquidFoundation = false;

  function walkFile(absPath, fileType) {
    const normalized = assertWithinRoot(absPath);
    if (visited.has(normalized)) return;
    visited.add(normalized);

    const relPath = toPosixRelative(normalized);
    files.set(relPath, { path: relPath, type: fileType });

    const code = fs.readFileSync(normalized, 'utf8');
    if (
      code.includes('@liqui-design/glass') ||
      code.includes('@/lib/liquid-motion') ||
      code.includes('--apple-') ||
      code.includes('--liquid-')
    ) {
      usesLiquidFoundation = true;
    }

    for (const specifier of extractImports(code)) {
      if (specifier.startsWith('@/components/ui/')) {
        const depName = path.basename(specifier.replace(/^@\/components\/ui\//, ''));
        if (depName && depName !== componentName) {
          registryDependencies.add(formatRegistryDep(depName));
        }
        continue;
      }

      if (specifier.startsWith('@/hooks/')) {
        const hookAbs = resolveLocalModule(specifier);
        if (hookAbs) {
          walkFile(hookAbs, 'registry:hook');
        }
        continue;
      }

      if (specifier.startsWith('@/lib/')) {
        if (specifier === '@/lib/utils' || specifier === '@/lib/cn') {
          continue;
        }
        if (specifier === '@/lib/liquid-motion') {
          usesLiquidFoundation = true;
          continue;
        }
        const libAbs = resolveLocalModule(specifier);
        if (libAbs) {
          walkFile(libAbs, 'registry:lib');
        }
        continue;
      }

      if (
        specifier.startsWith('.') ||
        specifier.startsWith('@/') ||
        specifier.startsWith('node:')
      ) {
        continue;
      }

      const pkgName = toRootPackageName(specifier);
      if (!BUILTIN_PACKAGES.has(pkgName)) {
        dependencies.add(pkgName);
      }
    }
  }

  walkFile(entryAbsPath, 'registry:ui');

  if (usesLiquidFoundation) {
    registryDependencies.add(formatRegistryDep('liquid-glass'));
  }

  const item = {
    name: componentName,
    type: 'registry:ui',
    title: toTitle(componentName),
    description: `${toTitle(componentName)} component from ${REGISTRY_NAME}.`,
    files: Array.from(files.values()),
  };

  if (dependencies.size > 0) {
    item.dependencies = Array.from(dependencies).sort();
  }
  if (registryDependencies.size > 0) {
    item.registryDependencies = Array.from(registryDependencies).sort();
  }

  return item;
}

function main() {
  assertWithinRoot(UI_DIR);
  const uiFiles = fs
    .readdirSync(UI_DIR)
    .filter((file) => file.endsWith('.tsx'))
    .sort((a, b) => a.localeCompare(b));

  const items = [buildLiquidFoundationItem(), ...uiFiles.map((file) => buildRegistryItem(file))];

  const registry = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: REGISTRY_NAME,
    homepage: REGISTRY_HOMEPAGE,
    items,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  console.log(`Synced ${items.length} registry items into ${toPosixRelative(OUTPUT_PATH)}`);
}

main();
