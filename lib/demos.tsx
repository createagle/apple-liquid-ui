'use client';

import type * as React from 'react';
import {
  ButtonAllVariantsDemo,
  ButtonLiquidHeroDemo,
  ButtonOverGlassDemo,
  ButtonSizesDemo,
} from '@/components/demos/button-demos';
import {
  TabsFloatingTabBarDemo,
  TabsLineDemo,
  TabsLiquidHeroDemo,
  TabsSegmentedDemo,
  TabsVerticalDemo,
} from '@/components/demos/tabs-demos';
import {
  SelectControlledDemo,
  SelectGroupedDemo,
  SelectLiquidHeroDemo,
  SelectVariantsDemo,
} from '@/components/demos/select-demos';
import {
  LiquidGlassScopedCompareDemo,
  LiquidGlassSettingsDemo,
} from '@/components/demos/liquid-glass-demos';
import {
  SwitchLiquidHeroDemo,
  SwitchSettingsPanelDemo,
  SwitchSizesDemo,
  SwitchVariantsDemo,
} from '@/components/demos/switch-demos';
import {
  SliderControlCenterDemo,
  SliderLiquidHeroDemo,
  SliderRangeDemo,
  SliderTicksDemo,
} from '@/components/demos/slider-demos';

export interface DemoRegistryEntry {
  title: string;
  component: React.ComponentType;
  filePath: string;
  exportName: string;
  installCommand?: string;
  mobileHeight?: number;
  tabletHeight?: number;
}

export const DEMO_REGISTRY = {
  'button-liquid-hero': {
    title: '液态玻璃折射按钮',
    component: ButtonLiquidHeroDemo,
    filePath: 'components/demos/button-demos.tsx',
    exportName: 'ButtonLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/button',
    mobileHeight: 420,
    tabletHeight: 340,
  },
  'button-all-variants': {
    title: '全部视觉变体',
    component: ButtonAllVariantsDemo,
    filePath: 'components/demos/button-demos.tsx',
    exportName: 'ButtonAllVariantsDemo',
    mobileHeight: 540,
    tabletHeight: 380,
  },
  'button-sizes': {
    title: '尺寸阶梯',
    component: ButtonSizesDemo,
    filePath: 'components/demos/button-demos.tsx',
    exportName: 'ButtonSizesDemo',
    mobileHeight: 480,
    tabletHeight: 380,
  },
  'button-over-glass': {
    title: 'Over-glass 表面适配',
    component: ButtonOverGlassDemo,
    filePath: 'components/demos/button-demos.tsx',
    exportName: 'ButtonOverGlassDemo',
    mobileHeight: 380,
    tabletHeight: 320,
  },
  'tabs-liquid-hero': {
    title: '悬浮液态玻璃（Glass）',
    component: TabsLiquidHeroDemo,
    filePath: 'components/demos/tabs-demos.tsx',
    exportName: 'TabsLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/tabs',
    mobileHeight: 460,
    tabletHeight: 380,
  },
  'tabs-floating-tab-bar': {
    title: '悬浮导航栏（Tab Bar）',
    component: TabsFloatingTabBarDemo,
    filePath: 'components/demos/tabs-demos.tsx',
    exportName: 'TabsFloatingTabBarDemo',
    mobileHeight: 460,
    tabletHeight: 380,
  },
  'tabs-segmented': {
    title: '分段控制器（Segmented Control）',
    component: TabsSegmentedDemo,
    filePath: 'components/demos/tabs-demos.tsx',
    exportName: 'TabsSegmentedDemo',
    mobileHeight: 360,
    tabletHeight: 320,
  },
  'tabs-line': {
    title: '极简下划线（Line）',
    component: TabsLineDemo,
    filePath: 'components/demos/tabs-demos.tsx',
    exportName: 'TabsLineDemo',
    mobileHeight: 420,
    tabletHeight: 360,
  },
  'tabs-vertical': {
    title: '纵向玻璃选项卡（Vertical）',
    component: TabsVerticalDemo,
    filePath: 'components/demos/tabs-demos.tsx',
    exportName: 'TabsVerticalDemo',
    mobileHeight: 480,
    tabletHeight: 380,
  },
  'select-liquid-hero': {
    title: '响应式选择器（桌面下拉 ↔ 移动抽屉）',
    component: SelectLiquidHeroDemo,
    filePath: 'components/demos/select-demos.tsx',
    exportName: 'SelectLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/select',
    mobileHeight: 560,
    tabletHeight: 420,
  },
  'select-variants': {
    title: '触发器样式与尺寸',
    component: SelectVariantsDemo,
    filePath: 'components/demos/select-demos.tsx',
    exportName: 'SelectVariantsDemo',
    mobileHeight: 560,
    tabletHeight: 420,
  },
  'select-grouped': {
    title: '分组与分隔线',
    component: SelectGroupedDemo,
    filePath: 'components/demos/select-demos.tsx',
    exportName: 'SelectGroupedDemo',
    mobileHeight: 600,
    tabletHeight: 460,
  },
  'select-controlled': {
    title: '受控状态',
    component: SelectControlledDemo,
    filePath: 'components/demos/select-demos.tsx',
    exportName: 'SelectControlledDemo',
    mobileHeight: 520,
    tabletHeight: 400,
  },
  'liquid-glass-settings': {
    title: 'Apple 系统同款通透度调节（透明 ↔ 色调）',
    component: LiquidGlassSettingsDemo,
    filePath: 'components/demos/liquid-glass-demos.tsx',
    exportName: 'LiquidGlassSettingsDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/liquid-glass-provider',
    mobileHeight: 560,
    tabletHeight: 480,
  },
  'liquid-glass-scoped-compare': {
    title: '局部作用域对比（Clear vs Tinted）',
    component: LiquidGlassScopedCompareDemo,
    filePath: 'components/demos/liquid-glass-demos.tsx',
    exportName: 'LiquidGlassScopedCompareDemo',
    mobileHeight: 520,
    tabletHeight: 380,
  },
  'switch-liquid-hero': {
    title: '液态玻璃折射开关',
    component: SwitchLiquidHeroDemo,
    filePath: 'components/demos/switch-demos.tsx',
    exportName: 'SwitchLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/switch',
    mobileHeight: 340,
    tabletHeight: 300,
  },
  'switch-variants': {
    title: '色彩变体与无障碍标识',
    component: SwitchVariantsDemo,
    filePath: 'components/demos/switch-demos.tsx',
    exportName: 'SwitchVariantsDemo',
    mobileHeight: 420,
    tabletHeight: 380,
  },
  'switch-sizes': {
    title: '尺寸阶梯与禁用态',
    component: SwitchSizesDemo,
    filePath: 'components/demos/switch-demos.tsx',
    exportName: 'SwitchSizesDemo',
    mobileHeight: 300,
    tabletHeight: 260,
  },
  'switch-settings-panel': {
    title: '系统设置联动面板',
    component: SwitchSettingsPanelDemo,
    filePath: 'components/demos/switch-demos.tsx',
    exportName: 'SwitchSettingsPanelDemo',
    mobileHeight: 480,
    tabletHeight: 440,
  },
  'slider-liquid-hero': {
    title: '液态玻璃折射滑块',
    component: SliderLiquidHeroDemo,
    filePath: 'components/demos/slider-demos.tsx',
    exportName: 'SliderLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/slider',
    mobileHeight: 300,
    tabletHeight: 260,
  },
  'slider-ticks': {
    title: 'macOS 刻度吸附（Ticks）',
    component: SliderTicksDemo,
    filePath: 'components/demos/slider-demos.tsx',
    exportName: 'SliderTicksDemo',
    mobileHeight: 280,
    tabletHeight: 240,
  },
  'slider-range': {
    title: '双滑块区间（Range）',
    component: SliderRangeDemo,
    filePath: 'components/demos/slider-demos.tsx',
    exportName: 'SliderRangeDemo',
    mobileHeight: 260,
    tabletHeight: 220,
  },
  'slider-control-center': {
    title: '控制中心玻璃轨道（Glass）',
    component: SliderControlCenterDemo,
    filePath: 'components/demos/slider-demos.tsx',
    exportName: 'SliderControlCenterDemo',
    mobileHeight: 360,
    tabletHeight: 320,
  },
} as const satisfies Record<string, DemoRegistryEntry>;

export type DemoName = keyof typeof DEMO_REGISTRY;

export const DEMO_NAMES = Object.keys(DEMO_REGISTRY) as DemoName[];

export function isDemoName(value: string): value is DemoName {
  return Object.prototype.hasOwnProperty.call(DEMO_REGISTRY, value);
}
