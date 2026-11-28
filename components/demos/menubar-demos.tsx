'use client';

import * as React from 'react';
import {
  CopyIcon,
  FilePlus2Icon,
  FolderOpenIcon,
  Maximize2Icon,
  PrinterIcon,
  Redo2Icon,
  SaveIcon,
  ScissorsIcon,
  Share2Icon,
  SparklesIcon,
  Undo2Icon,
} from 'lucide-react';

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';

export function MenubarLiquidHeroDemo() {
  const [showStatusBar, setShowStatusBar] = React.useState(true);
  const [showPathBar, setShowPathBar] = React.useState(false);
  const [layoutMode, setLayoutMode] = React.useState('columns');
  const [lastAction, setLastAction] = React.useState(
    '点击菜单项体验 macOS 27 悬浮菜单栏与 iOS 27 底部抽屉'
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>文件</MenubarTrigger>
          <MenubarContent title="文件" className="w-60 md:w-56">
            <MenubarGroup>
              <MenubarLabel>文稿</MenubarLabel>
              <MenubarItem onClick={() => setLastAction('已新建空白文稿')}>
                <FilePlus2Icon />
                新建文稿
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => setLastAction('已打开最近项目')}>
                <FolderOpenIcon />
                打开…
                <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => setLastAction('已保存当前修改')}>
                <SaveIcon />
                存储
                <MenubarShortcut>⌘S</MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>

            <MenubarSeparator />

            <MenubarGroup>
              <MenubarSub>
                <MenubarSubTrigger>
                  <Share2Icon />
                  共享与导出
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => setLastAction('已通过 隔空投送 共享')}>
                    隔空投送
                  </MenubarItem>
                  <MenubarItem onClick={() => setLastAction('已导出为 PDF 文稿')}>
                    导出为 PDF…
                  </MenubarItem>
                  <MenubarItem onClick={() => setLastAction('已拷贝协作链接')}>
                    拷贝协作链接
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarItem onClick={() => setLastAction('已准备打印预览')}>
                <PrinterIcon />
                打印…
                <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>编辑</MenubarTrigger>
          <MenubarContent title="编辑" className="w-60 md:w-52">
            <MenubarGroup>
              <MenubarItem onClick={() => setLastAction('已撤销上一步操作')}>
                <Undo2Icon />
                撤销
                <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => setLastAction('已重做操作')}>
                <Redo2Icon />
                重做
                <MenubarShortcut>⇧⌘Z</MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarItem onClick={() => setLastAction('已剪切选中内容')}>
                <ScissorsIcon />
                剪切
                <MenubarShortcut>⌘X</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => setLastAction('已拷贝选中内容')}>
                <CopyIcon />
                拷贝
                <MenubarShortcut>⌘C</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>
                <SparklesIcon />
                智能润色（未选中文本）
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>视图</MenubarTrigger>
          <MenubarContent title="显示选项" className="w-60 md:w-56">
            <MenubarGroup>
              <MenubarLabel>窗口布局</MenubarLabel>
              <MenubarRadioGroup
                value={layoutMode}
                onValueChange={(value) => {
                  const next = String(value);
                  setLayoutMode(next);
                  setLastAction(`已切换视图模式：${next}`);
                }}
              >
                <MenubarRadioItem value="icons">图标</MenubarRadioItem>
                <MenubarRadioItem value="list">列表</MenubarRadioItem>
                <MenubarRadioItem value="columns">分栏</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarGroup>

            <MenubarSeparator />

            <MenubarGroup>
              <MenubarLabel>界面元素</MenubarLabel>
              <MenubarCheckboxItem
                checked={showStatusBar}
                onCheckedChange={(checked) => {
                  const next = Boolean(checked);
                  setShowStatusBar(next);
                  setLastAction(next ? '已显示状态栏' : '已隐藏状态栏');
                }}
              >
                显示状态栏
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={showPathBar}
                onCheckedChange={(checked) => {
                  const next = Boolean(checked);
                  setShowPathBar(next);
                  setLastAction(next ? '已显示路径栏' : '已隐藏路径栏');
                }}
              >
                显示路径栏
              </MenubarCheckboxItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>窗口</MenubarTrigger>
          <MenubarContent title="窗口" className="w-56 md:w-48">
            <MenubarItem onClick={() => setLastAction('已最小化当前窗口')}>
              最小化
              <MenubarShortcut>⌘M</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => setLastAction('已进入全屏模式')}>
              <Maximize2Icon />
              进入全屏
              <MenubarShortcut>⌃⌘F</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <p className="rounded-full bg-background/75 px-3.5 py-1.5 text-center text-[11.5px] text-muted-foreground shadow-xs backdrop-blur-md">
        {lastAction}
      </p>
    </div>
  );
}

export function MenubarCompactDemo() {
  const [fontFamily, setFontFamily] = React.useState('sf-pro');
  const [bold, setBold] = React.useState(true);
  const [italic, setItalic] = React.useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          液态玻璃菜单栏（默认）
        </span>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>格式</MenubarTrigger>
            <MenubarContent title="文字格式" className="w-56 md:w-52">
              <MenubarGroup>
                <MenubarLabel>字体风格</MenubarLabel>
                <MenubarCheckboxItem
                  checked={bold}
                  onCheckedChange={(v) => setBold(Boolean(v))}
                >
                  粗体
                </MenubarCheckboxItem>
                <MenubarCheckboxItem
                  checked={italic}
                  onCheckedChange={(v) => setItalic(Boolean(v))}
                >
                  斜体
                </MenubarCheckboxItem>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarGroup>
                <MenubarLabel>字族</MenubarLabel>
                <MenubarRadioGroup
                  value={fontFamily}
                  onValueChange={(v) => setFontFamily(String(v))}
                >
                  <MenubarRadioItem value="sf-pro">SF Pro</MenubarRadioItem>
                  <MenubarRadioItem value="sf-mono">SF Mono</MenubarRadioItem>
                  <MenubarRadioItem value="new-york">New York</MenubarRadioItem>
                </MenubarRadioGroup>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>对齐</MenubarTrigger>
            <MenubarContent title="文本对齐" className="w-52 md:w-44">
              <MenubarItem>左对齐</MenubarItem>
              <MenubarItem>居中</MenubarItem>
              <MenubarItem>右对齐</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          实体工具栏（glass=false）
        </span>
        <Menubar glass={false}>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent title="文件" className="w-52 md:w-44">
              <MenubarItem>新建</MenubarItem>
              <MenubarItem>导出</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>帮助</MenubarTrigger>
            <MenubarContent title="帮助" className="w-52 md:w-44">
              <MenubarItem>快捷键总览</MenubarItem>
              <MenubarItem>检查更新</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
}
