import fs from 'node:fs';
import path from 'node:path';

export interface DemoMeta {
  title: string;
  filePath: string;
  exportName: string;
  installCommand?: string;
  mobileHeight?: number;
  tabletHeight?: number;
}

export const DEMO_META: Record<string, DemoMeta> = {
  'button-liquid-hero': {
    title: '液态玻璃折射按钮',
    filePath: 'components/demos/button-demos.tsx',
    exportName: 'ButtonLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/button',
    mobileHeight: 420,
    tabletHeight: 340,
  },
  'button-all-variants': {
    title: '全部视觉变体',
    filePath: 'components/demos/button-demos.tsx',
    exportName: 'ButtonAllVariantsDemo',
    mobileHeight: 540,
    tabletHeight: 380,
  },
  'button-sizes': {
    title: '尺寸阶梯',
    filePath: 'components/demos/button-demos.tsx',
    exportName: 'ButtonSizesDemo',
    mobileHeight: 480,
    tabletHeight: 380,
  },
  'button-over-glass': {
    title: 'Over-glass 表面适配',
    filePath: 'components/demos/button-demos.tsx',
    exportName: 'ButtonOverGlassDemo',
    mobileHeight: 380,
    tabletHeight: 320,
  },
  'tabs-liquid-hero': {
    title: '悬浮液态玻璃（Glass）',
    filePath: 'components/demos/tabs-demos.tsx',
    exportName: 'TabsLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/tabs',
    mobileHeight: 460,
    tabletHeight: 380,
  },
  'tabs-floating-tab-bar': {
    title: '悬浮导航栏（Tab Bar）',
    filePath: 'components/demos/tabs-demos.tsx',
    exportName: 'TabsFloatingTabBarDemo',
    mobileHeight: 460,
    tabletHeight: 380,
  },
  'tabs-segmented': {
    title: '分段控制器（Segmented Control）',
    filePath: 'components/demos/tabs-demos.tsx',
    exportName: 'TabsSegmentedDemo',
    mobileHeight: 360,
    tabletHeight: 320,
  },
  'tabs-line': {
    title: '极简下划线（Line）',
    filePath: 'components/demos/tabs-demos.tsx',
    exportName: 'TabsLineDemo',
    mobileHeight: 420,
    tabletHeight: 360,
  },
  'tabs-vertical': {
    title: '纵向玻璃选项卡（Vertical）',
    filePath: 'components/demos/tabs-demos.tsx',
    exportName: 'TabsVerticalDemo',
    mobileHeight: 480,
    tabletHeight: 380,
  },
  'select-liquid-hero': {
    title: '响应式选择器（桌面下拉 ↔ 移动抽屉）',
    filePath: 'components/demos/select-demos.tsx',
    exportName: 'SelectLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/select',
    mobileHeight: 560,
    tabletHeight: 420,
  },
  'select-variants': {
    title: '触发器样式与尺寸',
    filePath: 'components/demos/select-demos.tsx',
    exportName: 'SelectVariantsDemo',
    mobileHeight: 560,
    tabletHeight: 420,
  },
  'select-grouped': {
    title: '分组与分隔线',
    filePath: 'components/demos/select-demos.tsx',
    exportName: 'SelectGroupedDemo',
    mobileHeight: 600,
    tabletHeight: 460,
  },
  'select-controlled': {
    title: '受控状态',
    filePath: 'components/demos/select-demos.tsx',
    exportName: 'SelectControlledDemo',
    mobileHeight: 520,
    tabletHeight: 400,
  },
  'liquid-glass-settings': {
    title: 'Apple 系统同款通透度调节（透明 ↔ 色调）',
    filePath: 'components/demos/liquid-glass-demos.tsx',
    exportName: 'LiquidGlassSettingsDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/liquid-glass-provider',
    mobileHeight: 560,
    tabletHeight: 480,
  },
  'liquid-glass-scoped-compare': {
    title: '局部作用域对比（Clear vs Tinted）',
    filePath: 'components/demos/liquid-glass-demos.tsx',
    exportName: 'LiquidGlassScopedCompareDemo',
    mobileHeight: 520,
    tabletHeight: 380,
  },
  'switch-liquid-hero': {
    title: '液态玻璃折射开关',
    filePath: 'components/demos/switch-demos.tsx',
    exportName: 'SwitchLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/switch',
    mobileHeight: 340,
    tabletHeight: 300,
  },
  'switch-variants': {
    title: '色彩变体与无障碍标识',
    filePath: 'components/demos/switch-demos.tsx',
    exportName: 'SwitchVariantsDemo',
    mobileHeight: 420,
    tabletHeight: 380,
  },
  'switch-sizes': {
    title: '尺寸阶梯与禁用态',
    filePath: 'components/demos/switch-demos.tsx',
    exportName: 'SwitchSizesDemo',
    mobileHeight: 300,
    tabletHeight: 260,
  },
  'switch-settings-panel': {
    title: '系统设置联动面板',
    filePath: 'components/demos/switch-demos.tsx',
    exportName: 'SwitchSettingsPanelDemo',
    mobileHeight: 480,
    tabletHeight: 440,
  },
  'slider-liquid-hero': {
    title: '液态玻璃折射滑块',
    filePath: 'components/demos/slider-demos.tsx',
    exportName: 'SliderLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/slider',
    mobileHeight: 300,
    tabletHeight: 260,
  },
  'slider-ticks': {
    title: 'macOS 刻度吸附（Ticks）',
    filePath: 'components/demos/slider-demos.tsx',
    exportName: 'SliderTicksDemo',
    mobileHeight: 280,
    tabletHeight: 240,
  },
  'slider-range': {
    title: '双滑块区间（Range）',
    filePath: 'components/demos/slider-demos.tsx',
    exportName: 'SliderRangeDemo',
    mobileHeight: 260,
    tabletHeight: 220,
  },
  'slider-control-center': {
    title: '控制中心玻璃轨道（Glass）',
    filePath: 'components/demos/slider-demos.tsx',
    exportName: 'SliderControlCenterDemo',
    mobileHeight: 360,
    tabletHeight: 320,
  },
  'dialog-liquid-hero': {
    title: '响应式液态弹窗（桌面 Dialog ↔ 移动 Sheet）',
    filePath: 'components/demos/dialog-demos.tsx',
    exportName: 'DialogLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/dialog',
    mobileHeight: 540,
    tabletHeight: 420,
  },
  'dialog-share-sheet': {
    title: '共享设置弹窗',
    filePath: 'components/demos/dialog-demos.tsx',
    exportName: 'DialogShareSheetDemo',
    mobileHeight: 520,
    tabletHeight: 400,
  },
  'dialog-scrollable': {
    title: '长内容滚动弹窗',
    filePath: 'components/demos/dialog-demos.tsx',
    exportName: 'DialogScrollableDemo',
    mobileHeight: 560,
    tabletHeight: 460,
  },
  'alert-dialog-liquid-hero': {
    title: '响应式液态警示框（macOS 27 ↔ iOS 27）',
    filePath: 'components/demos/alert-dialog-demos.tsx',
    exportName: 'AlertDialogLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/alert-dialog',
    mobileHeight: 460,
    tabletHeight: 380,
  },
  'alert-dialog-destructive': {
    title: '危险操作确认（Destructive）',
    filePath: 'components/demos/alert-dialog-demos.tsx',
    exportName: 'AlertDialogDestructiveDemo',
    mobileHeight: 460,
    tabletHeight: 380,
  },
  'alert-dialog-stacked': {
    title: '多按钮堆叠警示框（Stacked）',
    filePath: 'components/demos/alert-dialog-demos.tsx',
    exportName: 'AlertDialogStackedDemo',
    mobileHeight: 500,
    tabletHeight: 420,
  },
};

const WORKSPACE_ROOT = process.cwd();
const fileCache = new Map<string, string>();

function readWorkspaceFile(relPath: string): string {
  const cached = fileCache.get(relPath);
  if (cached !== undefined && process.env.NODE_ENV === 'production') {
    return cached;
  }
  const absPath = path.resolve(WORKSPACE_ROOT, relPath);
  if (!absPath.startsWith(WORKSPACE_ROOT + path.sep)) {
    throw new Error(`Invalid demo file path: ${relPath}`);
  }
  const content = fs.readFileSync(absPath, 'utf8');
  fileCache.set(relPath, content);
  return content;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isIdentifierUsed(code: string, identifier: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegExp(identifier)}\\b`);
  return pattern.test(code);
}

function extractFunctionBlock(source: string, exportName: string): string | null {
  const fnRegex = new RegExp(`export function ${escapeRegExp(exportName)}\\b`);
  const match = fnRegex.exec(source);
  if (!match) return null;

  const startIndex = match.index;
  const braceStart = source.indexOf('{', startIndex);
  if (braceStart === -1) return null;

  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inSingle) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === '"') inDouble = false;
      continue;
    }
    if (inTemplate) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === '`') inTemplate = false;
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '`') {
      inTemplate = true;
      continue;
    }

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return source.slice(startIndex, i + 1);
      }
    }
  }

  return null;
}

function filterImportsForBody(source: string, body: string): string[] {
  const importRegex = /^import[\s\S]*?from\s+['"][^'"]+['"];?/gm;
  const keptImports: string[] = [];

  for (const match of source.matchAll(importRegex)) {
    const statement = match[0].trim();

    // Namespace import: import * as React from 'react';
    const nsMatch = /^import\s+\*\s+as\s+(\w+)\s+from\s+(['"][^'"]+['"]);?$/.exec(
      statement
    );
    if (nsMatch) {
      if (isIdentifierUsed(body, nsMatch[1])) {
        keptImports.push(statement);
      }
      continue;
    }

    // Named import: import { A, B } from '...';
    const namedMatch = /^import\s+\{([\s\S]*?)\}\s+from\s+(['"][^'"]+['"]);?$/.exec(
      statement
    );
    if (namedMatch) {
      const specifiers = namedMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const used = specifiers.filter((spec) => {
        const aliasParts = spec.split(/\s+as\s+/);
        const localName = (aliasParts[1] ?? aliasParts[0]).replace(/^type\s+/, '').trim();
        return localName.length > 0 && isIdentifierUsed(body, localName);
      });
      if (used.length > 0) {
        if (used.length <= 3 && used.join(', ').length <= 48) {
          keptImports.push(`import { ${used.join(', ')} } from ${namedMatch[2]};`);
        } else {
          keptImports.push(
            `import {\n${used.map((s) => `  ${s},`).join('\n')}\n} from ${namedMatch[2]};`
          );
        }
      }
      continue;
    }

    // Fallback: keep default or mixed imports as-is if any identifier matches
    keptImports.push(statement);
  }

  return keptImports;
}

export function getDemoSourceCode(name: string): string | null {
  const meta = DEMO_META[name];
  if (!meta) return null;

  const source = readWorkspaceFile(meta.filePath);
  const fnBlock = extractFunctionBlock(source, meta.exportName);
  if (!fnBlock) return null;

  const imports = filterImportsForBody(source, fnBlock);
  const hasUseClient = source.trimStart().startsWith("'use client'") || source.trimStart().startsWith('"use client"');

  return [
    hasUseClient ? "'use client';" : null,
    imports.length > 0 ? imports.join('\n') : null,
    fnBlock,
  ]
    .filter(Boolean)
    .join('\n\n');
}
