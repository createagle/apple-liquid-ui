'use client';

import * as React from 'react';
import {
  ChevronRightIcon,
  ClockIcon,
  CloudIcon,
  FolderIcon,
  HardDriveIcon,
  InboxIcon,
  LayersIcon,
  SettingsIcon,
  SparklesIcon,
  StarIcon,
  Trash2Icon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';

export function SidebarLiquidHeroDemo() {
  const [activeItem, setActiveItem] = React.useState('recents');
  const [query, setQuery] = React.useState('');
  const [tagsOpen, setTagsOpen] = React.useState(true);

  const favoriteItems = [
    { id: 'recents', label: '最近使用', icon: ClockIcon, badge: '12' },
    { id: 'airdrop', label: '隔空投送', icon: SparklesIcon },
    { id: 'icloud', label: 'iCloud 云盘', icon: CloudIcon, badge: '3' },
    { id: 'starred', label: '个人收藏', icon: StarIcon },
  ];

  const folderSubItems = [
    { id: 'design-kit', label: 'Apple UI Kit 27' },
    { id: 'prototypes', label: '原型草稿' },
    { id: 'exports', label: '导出产物' },
  ];

  const filteredFavorites = favoriteItems.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="relative h-[440px] w-full max-w-[760px] overflow-hidden rounded-[22px] border border-black/[0.08] bg-background/30 shadow-lg dark:border-white/[0.14]">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar
          variant="floating"
          collapsible="icon"
          className="absolute"
        >
          <SidebarHeader>
            <div className="flex items-center gap-2 px-1.5 pt-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-(--apple-blue) text-white shadow-xs">
                <FolderIcon className="size-4" />
              </div>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-[13px] font-semibold text-foreground">
                  访达 Finder
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  macOS 27 悬浮边栏
                </p>
              </div>
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <SidebarInput
                placeholder="搜索边栏…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>个人收藏</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredFavorites.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          tooltip={item.label}
                          isActive={activeItem === item.id}
                          onClick={() => setActiveItem(item.id)}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        {item.badge ? (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>工作空间</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="项目目录"
                      onClick={() => setTagsOpen((prev) => !prev)}
                    >
                      <LayersIcon />
                      <span>项目目录</span>
                      <ChevronRightIcon
                        className={`ml-auto size-3.5 transition-transform duration-150 ${
                          tagsOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </SidebarMenuButton>
                    {tagsOpen ? (
                      <SidebarMenuSub>
                        {folderSubItems.map((sub) => (
                          <SidebarMenuSubItem key={sub.id}>
                            <SidebarMenuSubButton
                              href={`#${sub.id}`}
                              isActive={activeItem === sub.id}
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveItem(sub.id);
                              }}
                            >
                              <span>{sub.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="废纸篓"
                      isActive={activeItem === 'trash'}
                      onClick={() => setActiveItem('trash')}
                    >
                      <Trash2Icon />
                      <span>废纸篓</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="系统设置"
                  isActive={activeItem === 'settings'}
                  onClick={() => setActiveItem('settings')}
                >
                  <SettingsIcon />
                  <span>偏好设置</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="m-2.5 ml-0 rounded-[18px] bg-background/70 backdrop-blur-md max-md:ml-2.5">
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-black/[0.06] px-3.5 dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-[13px] font-semibold text-foreground">
                当前视图：{activeItem}
              </span>
            </div>
            <Badge variant="secondary">⌘B 折叠</Badge>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-[14px] font-semibold text-foreground">
              macOS 27 悬浮液态玻璃侧边栏
            </p>
            <p className="max-w-xs text-[12px] leading-relaxed text-muted-foreground">
              点击左上角按钮或按 ⌘B 切换图标折叠态；在移动端视口下会自动切换为玻璃侧滑 Sheet。
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function SidebarInsetDemo() {
  const [mailbox, setMailbox] = React.useState('inbox');

  const boxes = [
    { id: 'inbox', label: '收件箱', icon: InboxIcon, count: '8' },
    { id: 'icloud', label: 'iCloud 归档', icon: CloudIcon, count: '24' },
    { id: 'disk', label: '本地文稿', icon: HardDriveIcon },
  ];

  return (
    <div className="relative h-[400px] w-full max-w-[760px] overflow-hidden rounded-[22px] border border-black/[0.08] bg-background/25 shadow-lg dark:border-white/[0.14]">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar
          variant="inset"
          collapsible="offcanvas"
          className="absolute"
        >
          <SidebarHeader>
            <div className="px-2 py-1 text-[13px] font-semibold text-foreground">
              邮件 Mail
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>邮箱账户</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {boxes.map((box) => {
                    const Icon = box.icon;
                    return (
                      <SidebarMenuItem key={box.id}>
                        <SidebarMenuButton
                          isActive={mailbox === box.id}
                          onClick={() => setMailbox(box.id)}
                        >
                          <Icon />
                          <span>{box.label}</span>
                        </SidebarMenuButton>
                        {box.count ? (
                          <SidebarMenuBadge>{box.count}</SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-black/[0.06] px-3.5 dark:border-white/[0.08]">
            <SidebarTrigger />
            <span className="text-[13px] font-semibold">
              Inset 分栏工作台 · {mailbox}
            </span>
          </header>
          <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {[
              'Liquid Glass 发布评审会议纪要',
              'macOS 27 Sketch Kit 资产同步通知',
              'Registry 自动打包流水线通过',
              '移动端底部 Drawer 触控体验优化',
            ].map((subject) => (
              <div
                key={subject}
                className="flex flex-col justify-between rounded-2xl bg-black/[0.04] p-3.5 dark:bg-white/[0.06]"
              >
                <span className="text-[13px] font-medium text-foreground">
                  {subject}
                </span>
                <span className="mt-2 text-[11px] text-muted-foreground">
                  今天 09:41 · Apple Liquid Team
                </span>
              </div>
            ))}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export function SidebarRightDemo() {
  const [snapGrid, setSnapGrid] = React.useState(true);
  const [livePreview, setLivePreview] = React.useState(true);

  return (
    <div className="relative h-[380px] w-full max-w-[760px] overflow-hidden rounded-[22px] border border-black/[0.08] bg-background/25 shadow-lg dark:border-white/[0.14]">
      <SidebarProvider className="h-full min-h-0">
        <SidebarInset className="m-2.5 mr-0 rounded-[18px] bg-background/70 backdrop-blur-md max-md:mr-2.5">
          <header className="flex h-12 shrink-0 items-center justify-between border-b border-black/[0.06] px-4 dark:border-white/[0.08]">
            <span className="text-[13px] font-semibold">画布编辑区</span>
            <SidebarTrigger />
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <Badge>右侧检查器（side=&quot;right&quot;）</Badge>
            <p className="max-w-xs text-[12px] text-muted-foreground">
              内部挂载独立玻璃背景层，确保内置 Switch 光学折射水滴不受嵌套 Backdrop Root 截断。
            </p>
          </div>
        </SidebarInset>

        <Sidebar
          side="right"
          variant="floating"
          collapsible="offcanvas"
          className="absolute"
        >
          <SidebarHeader>
            <div className="px-2 py-1 text-[13px] font-semibold">
              属性检查器
            </div>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>画布辅助</SidebarGroupLabel>
              <SidebarGroupContent className="flex flex-col gap-2 px-2">
                <div className="flex items-center justify-between rounded-xl bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.07]">
                  <span className="text-[13px] font-medium">对齐像素网格</span>
                  <Switch checked={snapGrid} onCheckedChange={setSnapGrid} />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.07]">
                  <span className="text-[13px] font-medium">实时玻璃预览</span>
                  <Switch
                    checked={livePreview}
                    onCheckedChange={setLivePreview}
                  />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
