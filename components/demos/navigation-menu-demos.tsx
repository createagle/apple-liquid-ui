'use client';

import * as React from 'react';
import {
  CompassIcon,
  LayersIcon,
  PaletteIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
} from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

export function NavigationMenuLiquidHeroDemo() {
  const [selectedDoc, setSelectedDoc] = React.useState(
    '悬停或点击导航项体验动态视口玻璃浮层'
  );

  const componentLinks = [
    {
      title: 'Liquid Glass 基础包',
      description: '动态通透度 Provider、Apple 8 色强调色与弹簧预设。',
      icon: SparklesIcon,
    },
    {
      title: '浮层与菜单',
      description: 'Dialog、Popover、DropdownMenu 与移动端底部 Drawer。',
      icon: LayersIcon,
    },
    {
      title: '表单与滑块',
      description: 'Switch、Slider 光学折射水滴与高对比输入框。',
      icon: SlidersHorizontalIcon,
    },
    {
      title: '色彩与材质规范',
      description: 'Clear 透明与 Tinted 色调双态连续调节体系。',
      icon: PaletteIcon,
    },
  ];

  return (
    <div className="flex min-h-[340px] flex-col items-center justify-between gap-4 pt-2">
      <NavigationMenu align="center">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>设计规范</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-full gap-2 md:w-[460px] md:grid-cols-[0.85fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink
                    href="#overview"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDoc('已进入：Apple Liquid Glass 设计总览');
                    }}
                    className="flex h-full w-full flex-col justify-end rounded-[16px]! bg-linear-to-br from-(--apple-blue)/18 via-(--apple-blue)/8 to-transparent p-4! shadow-[inset_0_0_0_0.5px_rgba(0,136,255,0.2)]"
                  >
                    <CompassIcon className="size-5 text-(--apple-blue)" />
                    <div className="mt-2 text-[14px] font-semibold text-foreground">
                      Apple 27 规范
                    </div>
                    <p className="text-[12px] leading-relaxed text-muted-foreground">
                      macOS 27 桌面精密布局与 iOS 27 触控人体工学的原生融合。
                    </p>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    href="#refraction"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDoc('已选择：光学边缘折射');
                    }}
                  >
                    <div className="text-[13px] font-semibold">光学边缘折射</div>
                    <p className="text-[12px] leading-snug text-muted-foreground">
                      基于 SDF 位移图的真实边框折射与色散。
                    </p>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    href="#responsive"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDoc('已选择：纯视口响应式');
                    }}
                  >
                    <div className="text-[13px] font-semibold">纯视口响应式</div>
                    <p className="text-[12px] leading-snug text-muted-foreground">
                      无需手动判断平台，768px 自动切换交互形态。
                    </p>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    href="#a11y"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDoc('已选择：无障碍与减弱动态');
                    }}
                  >
                    <div className="text-[13px] font-semibold">无障碍支持</div>
                    <p className="text-[12px] leading-snug text-muted-foreground">
                      完整键盘导航与 reduced-motion 降级保护。
                    </p>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>组件库</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-full gap-1.5 md:w-[480px] md:grid-cols-2">
                {componentLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title}>
                      <NavigationMenuLink
                        href={`#${item.title}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedDoc(`已浏览组件分组：${item.title}`);
                        }}
                      >
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                          <Icon className="size-3.5 text-(--apple-blue)" />
                          <span>{item.title}</span>
                        </div>
                        <p className="text-[12px] leading-snug text-muted-foreground">
                          {item.description}
                        </p>
                      </NavigationMenuLink>
                    </li>
                  );
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              href="#security"
              className={navigationMenuTriggerStyle()}
              onClick={(e) => {
                e.preventDefault();
                setSelectedDoc('已点击直达链接：Registry 分发说明');
              }}
            >
              <ShieldCheckIcon className="mr-1 size-3.5 text-(--apple-blue)" />
              Registry
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <p className="rounded-full bg-background/75 px-3.5 py-1.5 text-center text-[11.5px] text-muted-foreground shadow-xs backdrop-blur-md">
        {selectedDoc}
      </p>
    </div>
  );
}

export function NavigationMenuCompactDemo() {
  const [activeKey, setActiveKey] = React.useState('overview');

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          液态玻璃导航（含当前激活态）
        </span>
        <NavigationMenu>
          <NavigationMenuList>
            {[
              { key: 'overview', label: '概览' },
              { key: 'tokens', label: '设计 Token' },
              { key: 'changelog', label: '更新日志' },
            ].map((item) => (
              <NavigationMenuItem key={item.key}>
                <NavigationMenuLink
                  href={`#${item.key}`}
                  active={activeKey === item.key}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveKey(item.key);
                  }}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          实体导航栏（glass=false）
        </span>
        <NavigationMenu glass={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#home" active onClick={(e) => e.preventDefault()}>
                首页
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>资源</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-full gap-1.5 md:w-60 md:gap-1">
                  <NavigationMenuLink href="#kit" onClick={(e) => e.preventDefault()}>
                    <div className="text-[13px] font-semibold">Sketch UI Kit</div>
                    <p className="text-[12px] text-muted-foreground">
                      官方 macOS 27 与 iOS 27 设计源文件。
                    </p>
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#cli" onClick={(e) => e.preventDefault()}>
                    <div className="text-[13px] font-semibold">shadcn CLI</div>
                    <p className="text-[12px] text-muted-foreground">
                      一行命令同步安装全部依赖组件。
                    </p>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
