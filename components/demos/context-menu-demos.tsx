'use client';

import * as React from 'react';
import {
  AppWindowIcon,
  CopyIcon,
  EyeIcon,
  FileCode2Icon,
  FolderInputIcon,
  Grid3x3Icon,
  LayersIcon,
  LockIcon,
  PencilIcon,
  RulerIcon,
  StarIcon,
  Trash2Icon,
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ContextMenuLiquidHeroDemo() {
  const [starred, setStarred] = React.useState(false);
  const [lastAction, setLastAction] = React.useState(
    '右键点击（移动端长按）上方卡片呼出菜单'
  );

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <ContextMenu>
        <ContextMenuTrigger
          render={<Card />}
          className="w-full cursor-context-menu gap-0 p-5 text-left transition-transform duration-150 active:scale-[0.99]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--apple-blue)/14 text-(--apple-blue)">
                <LayersIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  Apple Liquid Glass 27.fig
                </p>
                <p className="text-xs text-muted-foreground">
                  42.8 MB · 修改于 10:24
                </p>
              </div>
            </div>
            {starred ? (
              <StarIcon className="size-4 shrink-0 fill-amber-400 text-amber-400" />
            ) : null}
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-foreground/15 bg-black/[0.03] px-3 py-2 text-center text-xs text-muted-foreground dark:bg-white/[0.05]">
            桌面端右键点击 · 移动端长按此处打开菜单
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent title="Apple Liquid Glass 27.fig" className="w-60 md:w-56">
          <ContextMenuGroup>
            <ContextMenuItem onClick={() => setLastAction('正在快速查看文档')}>
              <EyeIcon />
              快速查看
              <ContextMenuShortcut>Space</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setLastAction('已进入重命名模式')}>
              <PencilIcon />
              重命名
              <ContextMenuShortcut>↩</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setLastAction('已拷贝文件')}>
              <CopyIcon />
              拷贝
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <FolderInputIcon />
                打开方式
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem
                  onClick={() => setLastAction('已使用 Figma 打开')}
                >
                  <LayersIcon />
                  Figma（默认）
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => setLastAction('已使用 Sketch 打开')}
                >
                  <AppWindowIcon />
                  Sketch
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => setLastAction('已在浏览器预览中打开')}
                >
                  <FileCode2Icon />
                  浏览器预览
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem
              onClick={() => {
                setStarred((prev) => !prev);
                setLastAction(starred ? '已取消收藏' : '已添加到个人收藏');
              }}
            >
              <StarIcon />
              {starred ? '取消收藏' : '添加到收藏'}
            </ContextMenuItem>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuItem
            variant="destructive"
            onClick={() => setLastAction('已移到废纸篓')}
          >
            <Trash2Icon />
            移到废纸篓
            <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <p className="rounded-full bg-background/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
        {lastAction}
      </p>
    </div>
  );
}

export function ContextMenuViewOptionsDemo() {
  const [showGrid, setShowGrid] = React.useState(true);
  const [showRulers, setShowRulers] = React.useState(false);
  const [locked, setLocked] = React.useState(false);
  const [zoom, setZoom] = React.useState('100');

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <ContextMenu>
        <ContextMenuTrigger
          render={<Card />}
          className="h-44 w-full cursor-context-menu items-center justify-center gap-0 p-5 text-center"
        >
          {showGrid ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-1"
              style={{
                backgroundImage:
                  'radial-gradient(circle, currentColor 0.75px, transparent 0.75px)',
                backgroundSize: '16px 16px',
              }}
            />
          ) : null}
          {showRulers ? (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-0 flex h-4 items-center justify-around border-b border-foreground/10 bg-background/40 text-[9px] text-muted-foreground">
                <span>0</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex w-4 flex-col items-center justify-around border-r border-foreground/10 bg-background/40 text-[9px] text-muted-foreground">
                <span>0</span>
                <span>80</span>
                <span>160</span>
              </div>
            </>
          ) : null}

          <Badge variant="secondary">
            {locked ? (
              <LockIcon data-icon="inline-start" className="text-(--apple-blue)" />
            ) : null}
            画布视图 · {zoom}%
          </Badge>
          <p className="mt-2 rounded-full bg-background/60 px-2.5 py-0.5 text-[11px] text-muted-foreground backdrop-blur-sm">
            右键或长按调整网格、标尺与缩放比例
          </p>
        </ContextMenuTrigger>

        <ContextMenuContent title="画布选项" className="w-60 md:w-52">
          <ContextMenuGroup>
            <ContextMenuLabel>画布辅助</ContextMenuLabel>
            <ContextMenuCheckboxItem
              checked={showGrid}
              onCheckedChange={(checked) => setShowGrid(Boolean(checked))}
            >
              <Grid3x3Icon />
              显示参考网格
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={showRulers}
              onCheckedChange={(checked) => setShowRulers(Boolean(checked))}
            >
              <RulerIcon />
              显示标尺
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={locked}
              onCheckedChange={(checked) => setLocked(Boolean(checked))}
            >
              <LockIcon />
              锁定画布
            </ContextMenuCheckboxItem>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuLabel>缩放比例</ContextMenuLabel>
            <ContextMenuRadioGroup
              value={zoom}
              onValueChange={(value) => setZoom(String(value))}
            >
              <ContextMenuRadioItem value="75">75%</ContextMenuRadioItem>
              <ContextMenuRadioItem value="100">100%（实际大小）</ContextMenuRadioItem>
              <ContextMenuRadioItem value="150">150%</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
