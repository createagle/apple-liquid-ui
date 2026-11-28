'use client';

import * as React from 'react';
import {
  CompassIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  SunIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export function PopoverLiquidHeroDemo() {
  const [brightness, setBrightness] = React.useState(76);
  const [trueTone, setTrueTone] = React.useState(true);
  const [nightShift, setNightShift] = React.useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <Popover>
        <PopoverTrigger
          render={
            <Button glass variant="secondary">
              <SunIcon />
              显示与亮度
            </Button>
          }
        />
        <PopoverContent className="w-80">
          <PopoverHeader>
            <PopoverTitle>显示与亮度</PopoverTitle>
            <PopoverDescription>
              实时调节屏幕亮度与色彩自适应选项。
            </PopoverDescription>
          </PopoverHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 rounded-2xl bg-black/[0.045] px-3.5 py-3 dark:bg-white/[0.07]">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-foreground">屏幕亮度</span>
                <span className="tabular-nums text-muted-foreground">
                  {brightness}%
                </span>
              </div>
              <Slider
                value={brightness}
                onValueChange={(val) =>
                  setBrightness(Array.isArray(val) ? (val[0] ?? 76) : val)
                }
                min={10}
                max={100}
                step={1}
              />
            </div>

            <div className="divide-y divide-black/[0.06] overflow-hidden rounded-2xl bg-black/[0.045] dark:divide-white/[0.08] dark:bg-white/[0.07]">
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-foreground md:text-[13px]">
                    原彩显示
                  </span>
                  <span className="text-xs text-muted-foreground">
                    自动适应环境光线色温
                  </span>
                </div>
                <Switch checked={trueTone} onCheckedChange={setTrueTone} />
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-foreground md:text-[13px]">
                    夜览模式
                  </span>
                  <span className="text-xs text-muted-foreground">
                    日落后自动调暖屏幕色调
                  </span>
                </div>
                <Switch checked={nightShift} onCheckedChange={setNightShift} />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <p className="text-xs text-muted-foreground">
        当前亮度 {brightness}% · 原彩显示{trueTone ? '开启' : '关闭'} · 夜览{nightShift ? '开启' : '关闭'}
      </p>
    </div>
  );
}

export function PopoverAlignmentDemo() {
  const placements = [
    { side: 'top' as const, label: '上方弹出', desc: '固定在触发器正上方，适合底部工具栏快捷面板。' },
    { side: 'bottom' as const, label: '下方弹出', desc: '默认方向，适合导航栏或头部操作区展开。' },
    { side: 'left' as const, label: '左侧弹出', desc: '向左侧展开，避免遮挡右侧检查器内容。' },
    { side: 'right' as const, label: '右侧弹出', desc: '适合左侧边栏的快捷属性悬浮卡片。' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {placements.map((item) => (
        <Popover key={item.side}>
          <PopoverTrigger
            render={
              <Button glass variant="secondary" size="sm">
                <CompassIcon />
                {item.label}
              </Button>
            }
          />
          <PopoverContent side={item.side} className="w-64">
            <PopoverHeader>
              <PopoverTitle>{item.label}</PopoverTitle>
              <PopoverDescription>{item.desc}</PopoverDescription>
            </PopoverHeader>
            <div className="flex items-center gap-2 rounded-xl bg-black/[0.045] px-3 py-2 text-xs text-muted-foreground dark:bg-white/[0.07]">
              <SparklesIcon className="size-3.5 shrink-0 text-(--apple-blue)" />
              <span>桌面端按方向锚定，移动端自动切换底部抽屉。</span>
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}

export function PopoverQuickFormDemo() {
  const [width, setWidth] = React.useState('320');
  const [radius, setRadius] = React.useState('20');
  const [padding, setPadding] = React.useState('16');

  return (
    <div className="flex flex-col items-center gap-3">
      <Popover>
        <PopoverTrigger
          render={
            <Button glass variant="outline">
              <SlidersHorizontalIcon />
              调整图层尺寸
            </Button>
          }
        />
        <PopoverContent align="start" className="w-76">
          <PopoverHeader>
            <PopoverTitle>图层参数</PopoverTitle>
            <PopoverDescription>
              快速设定卡片容器的宽度、圆角与内边距（单位 px）。
            </PopoverDescription>
          </PopoverHeader>

          <div className="grid gap-2.5">
            <label className="grid grid-cols-[4.5rem_1fr] items-center gap-2.5">
              <span className="text-xs font-medium text-foreground/80">宽度</span>
              <Input
                size="sm"
                inputMode="numeric"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="tabular-nums"
              />
            </label>
            <label className="grid grid-cols-[4.5rem_1fr] items-center gap-2.5">
              <span className="text-xs font-medium text-foreground/80">圆角半径</span>
              <Input
                size="sm"
                inputMode="numeric"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="tabular-nums"
              />
            </label>
            <label className="grid grid-cols-[4.5rem_1fr] items-center gap-2.5">
              <span className="text-xs font-medium text-foreground/80">内边距</span>
              <Input
                size="sm"
                inputMode="numeric"
                value={padding}
                onChange={(e) => setPadding(e.target.value)}
                className="tabular-nums"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <PopoverClose
              render={<Button size="sm" variant="secondary" />}
            >
              取消
            </PopoverClose>
            <PopoverClose render={<Button size="sm" variant="default" />}>
              完成
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>

      <p className="text-xs tabular-nums text-muted-foreground">
        当前配置：{width}px 宽 · 圆角 {radius}px · 内边距 {padding}px
      </p>
    </div>
  );
}
