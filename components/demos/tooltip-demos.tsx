'use client';

import * as React from 'react';
import {
  BoldIcon,
  CopyIcon,
  ItalicIcon,
  SearchIcon,
  ShareIcon,
  SparklesIcon,
  UnderlineIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function TooltipLiquidHeroDemo() {
  return (
    <TooltipProvider delay={150}>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="secondary" size="icon">
                <BoldIcon className="size-4" />
              </Button>
            }
          />
          <TooltipContent>
            <span>加粗</span>
            <Kbd>⌘B</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="secondary" size="icon">
                <ItalicIcon className="size-4" />
              </Button>
            }
          />
          <TooltipContent>
            <span>斜体</span>
            <Kbd>⌘I</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="secondary" size="icon">
                <UnderlineIcon className="size-4" />
              </Button>
            }
          />
          <TooltipContent>
            <span>下划线</span>
            <Kbd>⌘U</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="secondary" size="icon">
                <ShareIcon className="size-4" />
              </Button>
            }
          />
          <TooltipContent>共享当前文档</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export function TooltipPlacementsDemo() {
  const sides = [
    { side: 'top' as const, label: '上方（Top）' },
    { side: 'bottom' as const, label: '下方（Bottom）' },
    { side: 'left' as const, label: '左侧（Left）' },
    { side: 'right' as const, label: '右侧（Right）' },
  ];

  return (
    <TooltipProvider delay={120}>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {sides.map(({ side, label }) => (
          <Tooltip key={side}>
            <TooltipTrigger
              render={
                <Button variant="secondary" size="sm">
                  {label}
                </Button>
              }
            />
            <TooltipContent side={side}>
              来自{label}的液态玻璃提示
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

export function TooltipShortcutDemo() {
  return (
    <TooltipProvider delay={120}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="secondary">
                <SearchIcon className="size-4" />
                聚焦搜索
              </Button>
            }
          />
          <TooltipContent>
            <span>打开 Spotlight 命令面板</span>
            <Kbd>⌘K</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="secondary">
                <CopyIcon className="size-4" />
                实体对比
              </Button>
            }
          />
          <TooltipContent glass={false} showArrow>
            <span>实体高对比提示（glass=false）</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="secondary">
                <SparklesIcon className="size-4" />
                带箭头玻璃
              </Button>
            }
          />
          <TooltipContent showArrow>带方向箭头的液态玻璃提示</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
