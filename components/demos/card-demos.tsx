'use client';

import * as React from 'react';
import { BellIcon, CloudIcon, SparklesIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export function CardLiquidHeroDemo() {
  const [icloudSync, setIcloudSync] = React.useState(true);
  const [handoff, setHandoff] = React.useState(true);

  return (
    <Card refract className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>iCloud+ 同步概览</CardTitle>
        <CardDescription>
          独立背景层不会截断内部 Switch 的液态折射水滴效果。
        </CardDescription>
        <CardAction>
          <Badge variant="default">2 TB</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <Card size="sm" className="gap-0 py-0">
          <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <CloudIcon className="size-4 text-(--apple-blue)" />
                <span className="text-[13.5px] font-medium text-foreground">
                  照片与文稿自动同步
                </span>
              </div>
              <Switch checked={icloudSync} onCheckedChange={setIcloudSync} />
            </div>
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <SparklesIcon className="size-4 text-(--apple-blue)" />
                <span className="text-[13.5px] font-medium text-foreground">
                  跨设备接力与剪贴板
                </span>
              </div>
              <Switch checked={handoff} onCheckedChange={setHandoff} />
            </div>
          </div>
        </Card>
      </CardContent>

      <CardFooter className="justify-end">
        <Button size="sm" variant="secondary">
          管理空间
        </Button>
        <Button size="sm" variant="default">
          立即同步
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CardSurfacesDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>默认液态玻璃（Glass）</CardTitle>
          <CardDescription>
            实时响应全局通透度滑块与壁纸色彩。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs leading-relaxed text-muted-foreground">
          默认开启 `glass`，适合作为悬浮内容面板、控制中心卡片与信息摘要。
        </CardContent>
      </Card>

      <Card glass={false}>
        <CardHeader>
          <CardTitle>实体卡片（glass=&#123;false&#125;）</CardTitle>
          <CardDescription>
            对齐 iOS 27 Grouped Table View 实体色值。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs leading-relaxed text-muted-foreground">
          传入 `glass=&#123;false&#125;` 即可关闭模糊并切回高对比度浅白 / `#1C1C1E` 深色卡片。
        </CardContent>
      </Card>
    </div>
  );
}

export function CardCompactDemo() {
  return (
    <Card size="sm" className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellIcon className="size-4 text-(--apple-blue)" />
          <span>通知摘要 · 14:30</span>
        </CardTitle>
        <CardDescription>
          设计团队在“Apple Liquid UI”中新增了 3 条评论。
        </CardDescription>
        <CardAction>
          <Badge size="sm" variant="secondary">
            刚刚
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
