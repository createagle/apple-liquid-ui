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
  'dropdown-menu-liquid-hero': {
    title: '液态玻璃下拉菜单（macOS 27 ↔ iOS 27）',
    filePath: 'components/demos/dropdown-menu-demos.tsx',
    exportName: 'DropdownMenuLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/dropdown-menu',
    mobileHeight: 560,
    tabletHeight: 440,
  },
  'dropdown-menu-checkboxes': {
    title: '多选切换项（Checkbox Items）',
    filePath: 'components/demos/dropdown-menu-demos.tsx',
    exportName: 'DropdownMenuCheckboxesDemo',
    mobileHeight: 520,
    tabletHeight: 400,
  },
  'dropdown-menu-radio-group': {
    title: '单选分组（Radio Group）',
    filePath: 'components/demos/dropdown-menu-demos.tsx',
    exportName: 'DropdownMenuRadioGroupDemo',
    mobileHeight: 520,
    tabletHeight: 400,
  },
  'context-menu-liquid-hero': {
    title: '液态玻璃上下文菜单（右键 / 长按）',
    filePath: 'components/demos/context-menu-demos.tsx',
    exportName: 'ContextMenuLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/context-menu',
    mobileHeight: 560,
    tabletHeight: 440,
  },
  'context-menu-view-options': {
    title: '画布选项联动（复选与单选）',
    filePath: 'components/demos/context-menu-demos.tsx',
    exportName: 'ContextMenuViewOptionsDemo',
    mobileHeight: 560,
    tabletHeight: 440,
  },
  'popover-liquid-hero': {
    title: '液态玻璃气泡卡片（macOS 27 ↔ iOS 27）',
    filePath: 'components/demos/popover-demos.tsx',
    exportName: 'PopoverLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/popover',
    mobileHeight: 540,
    tabletHeight: 420,
  },
  'popover-alignment': {
    title: '多方向锚定（Placement）',
    filePath: 'components/demos/popover-demos.tsx',
    exportName: 'PopoverAlignmentDemo',
    mobileHeight: 440,
    tabletHeight: 360,
  },
  'popover-quick-form': {
    title: '紧凑参数表单',
    filePath: 'components/demos/popover-demos.tsx',
    exportName: 'PopoverQuickFormDemo',
    mobileHeight: 520,
    tabletHeight: 420,
  },
  'checkbox-liquid-hero': {
    title: '响应式复选框（含全选与半选联动）',
    filePath: 'components/demos/checkbox-demos.tsx',
    exportName: 'CheckboxLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/checkbox',
    mobileHeight: 360,
    tabletHeight: 320,
  },
  'checkbox-sizes': {
    title: '尺寸阶梯与禁用态',
    filePath: 'components/demos/checkbox-demos.tsx',
    exportName: 'CheckboxSizesDemo',
    mobileHeight: 240,
    tabletHeight: 200,
  },
  'checkbox-glass': {
    title: '液态玻璃材质（Glass）',
    filePath: 'components/demos/checkbox-demos.tsx',
    exportName: 'CheckboxGlassDemo',
    mobileHeight: 260,
    tabletHeight: 220,
  },
  'radio-group-liquid-hero': {
    title: '响应式单选框组（macOS 27 ↔ iOS 27）',
    filePath: 'components/demos/radio-group-demos.tsx',
    exportName: 'RadioGroupLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/radio-group',
    mobileHeight: 380,
    tabletHeight: 340,
  },
  'radio-group-sizes': {
    title: '尺寸阶梯与禁用态',
    filePath: 'components/demos/radio-group-demos.tsx',
    exportName: 'RadioGroupSizesDemo',
    mobileHeight: 300,
    tabletHeight: 240,
  },
  'radio-group-glass': {
    title: '液态玻璃材质（Glass）',
    filePath: 'components/demos/radio-group-demos.tsx',
    exportName: 'RadioGroupGlassDemo',
    mobileHeight: 260,
    tabletHeight: 220,
  },
  'input-liquid-hero': {
    title: '液态玻璃与 Over-glass 输入框',
    filePath: 'components/demos/input-demos.tsx',
    exportName: 'InputLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/input',
    mobileHeight: 360,
    tabletHeight: 320,
  },
  'input-sizes': {
    title: '尺寸阶梯',
    filePath: 'components/demos/input-demos.tsx',
    exportName: 'InputSizesDemo',
    mobileHeight: 260,
    tabletHeight: 220,
  },
  'input-states': {
    title: '校验、禁用与密码态',
    filePath: 'components/demos/input-demos.tsx',
    exportName: 'InputStatesDemo',
    mobileHeight: 300,
    tabletHeight: 260,
  },
  'textarea-liquid-hero': {
    title: '液态玻璃备忘录多行输入',
    filePath: 'components/demos/textarea-demos.tsx',
    exportName: 'TextareaLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/textarea',
    mobileHeight: 340,
    tabletHeight: 300,
  },
  'textarea-glass': {
    title: '液态玻璃材质（Glass）',
    filePath: 'components/demos/textarea-demos.tsx',
    exportName: 'TextareaGlassDemo',
    mobileHeight: 240,
    tabletHeight: 200,
  },
  'textarea-states': {
    title: '尺寸、校验与禁用态',
    filePath: 'components/demos/textarea-demos.tsx',
    exportName: 'TextareaStatesDemo',
    mobileHeight: 380,
    tabletHeight: 340,
  },
  'card-liquid-hero': {
    title: '液态玻璃卡片（含光学折射与内嵌 Switch）',
    filePath: 'components/demos/card-demos.tsx',
    exportName: 'CardLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/card',
    mobileHeight: 420,
    tabletHeight: 380,
  },
  'card-surfaces': {
    title: '液态玻璃 vs 实体卡片',
    filePath: 'components/demos/card-demos.tsx',
    exportName: 'CardSurfacesDemo',
    mobileHeight: 400,
    tabletHeight: 300,
  },
  'card-compact': {
    title: '紧凑通知卡片（Small）',
    filePath: 'components/demos/card-demos.tsx',
    exportName: 'CardCompactDemo',
    mobileHeight: 240,
    tabletHeight: 220,
  },
  'badge-liquid-hero': {
    title: '全部语义变体',
    filePath: 'components/demos/badge-demos.tsx',
    exportName: 'BadgeLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/badge',
    mobileHeight: 220,
    tabletHeight: 180,
  },
  'badge-sizes': {
    title: '尺寸阶梯',
    filePath: 'components/demos/badge-demos.tsx',
    exportName: 'BadgeSizesDemo',
    mobileHeight: 180,
    tabletHeight: 160,
  },
  'badge-glass-compare': {
    title: '液态玻璃 vs 实体对比',
    filePath: 'components/demos/badge-demos.tsx',
    exportName: 'BadgeGlassCompareDemo',
    mobileHeight: 240,
    tabletHeight: 200,
  },
  'drawer-liquid-hero': {
    title: '液态玻璃手势抽屉',
    filePath: 'components/demos/drawer-demos.tsx',
    exportName: 'DrawerLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/drawer',
    mobileHeight: 540,
    tabletHeight: 460,
  },
  'drawer-directions': {
    title: '四向滑出抽屉',
    filePath: 'components/demos/drawer-demos.tsx',
    exportName: 'DrawerDirectionsDemo',
    mobileHeight: 520,
    tabletHeight: 420,
  },
  'drawer-snap-points': {
    title: '多段吸附点（Snap Points）',
    filePath: 'components/demos/drawer-demos.tsx',
    exportName: 'DrawerSnapPointsDemo',
    mobileHeight: 560,
    tabletHeight: 480,
  },
  'sheet-liquid-hero': {
    title: '响应式液态检查器面板',
    filePath: 'components/demos/sheet-demos.tsx',
    exportName: 'SheetLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/sheet',
    mobileHeight: 560,
    tabletHeight: 480,
  },
  'sheet-sides': {
    title: '四向弹出抽屉面板',
    filePath: 'components/demos/sheet-demos.tsx',
    exportName: 'SheetSidesDemo',
    mobileHeight: 520,
    tabletHeight: 420,
  },
  'sheet-inspector': {
    title: '文件详情检查器',
    filePath: 'components/demos/sheet-demos.tsx',
    exportName: 'SheetInspectorDemo',
    mobileHeight: 520,
    tabletHeight: 440,
  },
  'toast-liquid-hero': {
    title: '液态玻璃通知横幅',
    filePath: 'components/demos/toast-demos.tsx',
    exportName: 'ToastLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/toast',
    mobileHeight: 340,
    tabletHeight: 300,
  },
  'toast-types': {
    title: '语义状态类型',
    filePath: 'components/demos/toast-demos.tsx',
    exportName: 'ToastTypesDemo',
    mobileHeight: 360,
    tabletHeight: 300,
  },
  'toast-action': {
    title: '带操作按钮的通知',
    filePath: 'components/demos/toast-demos.tsx',
    exportName: 'ToastActionDemo',
    mobileHeight: 340,
    tabletHeight: 300,
  },
  'tooltip-liquid-hero': {
    title: '工具栏快捷键提示',
    filePath: 'components/demos/tooltip-demos.tsx',
    exportName: 'TooltipLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/tooltip',
    mobileHeight: 220,
    tabletHeight: 200,
  },
  'tooltip-placements': {
    title: '多方向锚定',
    filePath: 'components/demos/tooltip-demos.tsx',
    exportName: 'TooltipPlacementsDemo',
    mobileHeight: 240,
    tabletHeight: 220,
  },
  'tooltip-shortcut': {
    title: '液态玻璃、箭头与实体对比',
    filePath: 'components/demos/tooltip-demos.tsx',
    exportName: 'TooltipShortcutDemo',
    mobileHeight: 240,
    tabletHeight: 220,
  },
  'hover-card-liquid-hero': {
    title: '液态玻璃悬浮预览卡片',
    filePath: 'components/demos/hover-card-demos.tsx',
    exportName: 'HoverCardLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/hover-card',
    mobileHeight: 340,
    tabletHeight: 300,
  },
  'hover-card-profile': {
    title: '行内协作者资料卡',
    filePath: 'components/demos/hover-card-demos.tsx',
    exportName: 'HoverCardProfileDemo',
    mobileHeight: 320,
    tabletHeight: 280,
  },
  'hover-card-link-preview': {
    title: '侧向预览（Placement）',
    filePath: 'components/demos/hover-card-demos.tsx',
    exportName: 'HoverCardLinkPreviewDemo',
    mobileHeight: 320,
    tabletHeight: 280,
  },
  'command-liquid-hero': {
    title: 'Spotlight 命令面板（⌘J）',
    filePath: 'components/demos/command-demos.tsx',
    exportName: 'CommandLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/command',
    mobileHeight: 520,
    tabletHeight: 440,
  },
  'command-dialog': {
    title: '组合键快捷跳转（⇧⌘K）',
    filePath: 'components/demos/command-demos.tsx',
    exportName: 'CommandDialogDemo',
    mobileHeight: 520,
    tabletHeight: 440,
  },
  'combobox-liquid-hero': {
    title: '单选可搜索下拉框',
    filePath: 'components/demos/combobox-demos.tsx',
    exportName: 'ComboboxLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/combobox',
    mobileHeight: 420,
    tabletHeight: 380,
  },
  'combobox-multiple': {
    title: '多选胶囊标签（Multiple Chips）',
    filePath: 'components/demos/combobox-demos.tsx',
    exportName: 'ComboboxMultipleDemo',
    mobileHeight: 440,
    tabletHeight: 380,
  },
  'combobox-grouped': {
    title: '分组搜索（Grouped）',
    filePath: 'components/demos/combobox-demos.tsx',
    exportName: 'ComboboxGroupedDemo',
    mobileHeight: 440,
    tabletHeight: 380,
  },
  'menubar-liquid-hero': {
    title: '液态玻璃菜单栏（macOS 27 ↔ iOS 27）',
    filePath: 'components/demos/menubar-demos.tsx',
    exportName: 'MenubarLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/menubar',
    mobileHeight: 540,
    tabletHeight: 420,
  },
  'menubar-compact': {
    title: '液态玻璃 vs 实体对比',
    filePath: 'components/demos/menubar-demos.tsx',
    exportName: 'MenubarCompactDemo',
    mobileHeight: 480,
    tabletHeight: 380,
  },
  'navigation-menu-liquid-hero': {
    title: '悬浮液态玻璃导航栏',
    filePath: 'components/demos/navigation-menu-demos.tsx',
    exportName: 'NavigationMenuLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/navigation-menu',
    mobileHeight: 540,
    tabletHeight: 440,
  },
  'navigation-menu-compact': {
    title: '激活态高亮与实体样式对比',
    filePath: 'components/demos/navigation-menu-demos.tsx',
    exportName: 'NavigationMenuCompactDemo',
    mobileHeight: 460,
    tabletHeight: 380,
  },
  'calendar-liquid-hero': {
    title: '液态玻璃单选日历',
    filePath: 'components/demos/calendar-demos.tsx',
    exportName: 'CalendarLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/calendar',
    mobileHeight: 460,
    tabletHeight: 400,
  },
  'calendar-range': {
    title: '双月行程区间选择（Range）',
    filePath: 'components/demos/calendar-demos.tsx',
    exportName: 'CalendarRangeDemo',
    mobileHeight: 480,
    tabletHeight: 420,
  },
  'calendar-dropdown': {
    title: '年月下拉快速跳转（Dropdown）',
    filePath: 'components/demos/calendar-demos.tsx',
    exportName: 'CalendarDropdownDemo',
    mobileHeight: 440,
    tabletHeight: 380,
  },
  'calendar-date-picker': {
    title: '响应式 Date Picker（Popover ↔ Drawer）',
    filePath: 'components/demos/calendar-demos.tsx',
    exportName: 'CalendarDatePickerDemo',
    mobileHeight: 540,
    tabletHeight: 440,
  },
  'sidebar-liquid-hero': {
    title: 'macOS 27 悬浮液态玻璃侧边栏（Floating）',
    filePath: 'components/demos/sidebar-demos.tsx',
    exportName: 'SidebarLiquidHeroDemo',
    installCommand: 'npx shadcn@latest add @apple-liquid/sidebar',
    mobileHeight: 520,
    tabletHeight: 480,
  },
  'sidebar-inset': {
    title: '内嵌分栏工作台（Inset）',
    filePath: 'components/demos/sidebar-demos.tsx',
    exportName: 'SidebarInsetDemo',
    mobileHeight: 480,
    tabletHeight: 440,
  },
  'sidebar-right': {
    title: '右侧属性检查器边栏（Side Right）',
    filePath: 'components/demos/sidebar-demos.tsx',
    exportName: 'SidebarRightDemo',
    mobileHeight: 480,
    tabletHeight: 440,
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
