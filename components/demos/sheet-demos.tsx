'use client';

import * as React from 'react';
import {
  InfoIcon,
  LayersIcon,
  PanelRightIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export function SheetLiquidHeroDemo() {
  const [name, setName] = React.useState('Liquid Glass Canvas');
  const [refraction, setRefraction] = React.useState([72]);
  const [autoSync, setAutoSync] = React.useState(true);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Sheet>
        <SheetTrigger
          render={
            <Button glass variant="secondary">
              <PanelRightIcon className="size-4" />
              打开液态检查器面板
            </Button>
          }
        />
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>文档属性检查器</SheetTitle>
            <SheetDescription>
              桌面端呈现 macOS 27 悬浮圆角玻璃侧边面板，移动端自动贴边适配。
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                画布名称
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-black/[0.04] p-3.5 dark:bg-white/[0.07]">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>边缘折射强度</span>
                <span className="tabular-nums text-muted-foreground">
                  {refraction[0]}%
                </span>
              </div>
              <Slider
                value={refraction}
                onValueChange={(v) =>
                  setRefraction(Array.isArray(v) ? [...v] : [v])
                }
                min={0}
                max={100}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-black/[0.04] px-3.5 py-3 dark:bg-white/[0.07]">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">自动同步 iCloud</span>
                <span className="text-xs text-muted-foreground">
                  实时保存历史版本快照
                </span>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>
          </div>
          <SheetFooter>
            <SheetClose
              render={<Button variant="secondary">取消</Button>}
            />
            <SheetClose render={<Button variant="default">保存更改</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function SheetSidesDemo() {
  const sides = [
    { side: 'right' as const, label: '右侧（Right）' },
    { side: 'left' as const, label: '左侧（Left）' },
    { side: 'bottom' as const, label: '底部（Bottom）' },
    { side: 'top' as const, label: '顶部（Top）' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {sides.map(({ side, label }) => (
        <Sheet key={side}>
          <SheetTrigger
            render={
              <Button glass variant="secondary" size="sm">
                <LayersIcon className="size-3.5" />
                {label}
              </Button>
            }
          />
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>{label} 抽屉面板</SheetTitle>
              <SheetDescription>
                支持四向弹出，桌面端自动保留 12px 悬浮边距与 26px 液态玻璃圆角。
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-wrap gap-2 px-5">
              <Badge>macOS 27</Badge>
              <Badge variant="secondary">iOS 27</Badge>
              <Badge variant="outline">Liquid Surface</Badge>
            </div>
            <SheetFooter>
              <SheetClose render={<Button variant="default">知道了</Button>} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}

export function SheetInspectorDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Sheet>
        <SheetTrigger
          render={
            <Button glass variant="secondary">
              <InfoIcon className="size-4" />
              查看文件详情
            </Button>
          }
        />
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Apple_UI_Kit_27.sketch</SheetTitle>
            <SheetDescription>设计规范源文件 · 207.8 MB</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-5 text-sm">
            {[
              ['格式', 'Sketch 文档'],
              ['色彩空间', 'Display P3'],
              ['修改时间', '今天 14:32'],
              ['协作权限', '可编辑（团队）'],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-xl bg-black/[0.04] px-3.5 py-2.5 dark:bg-white/[0.07]"
              >
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
          <SheetFooter>
            <SheetClose
              render={
                <Button variant="secondary">
                  <SlidersHorizontalIcon className="size-3.5" />
                  关闭面板
                </Button>
              }
            />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
