'use client';

import * as React from 'react';
import {
  AirplayIcon,
  BluetoothIcon,
  PanelBottomOpenIcon,
  Share2Icon,
  SlidersHorizontalIcon,
  Volume2Icon,
  WifiIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export function DrawerLiquidHeroDemo() {
  const [volume, setVolume] = React.useState([68]);
  const [spatialAudio, setSpatialAudio] = React.useState(true);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Drawer>
        <DrawerTrigger
          render={
            <Button variant="secondary">
              <AirplayIcon className="size-4" />
              打开音频输出抽屉
            </Button>
          }
        />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>隔空播放与音频</DrawerTitle>
            <DrawerDescription>
              支持手势拖拽关闭的 iOS 27 贴边液态玻璃抽屉，内置独立折射层不截断子控件光学效果。
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 px-5 py-3">
            <div className="flex flex-col gap-2 rounded-2xl bg-black/[0.04] p-3.5 dark:bg-white/[0.07]">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <Volume2Icon className="size-3.5 text-muted-foreground" />
                  输出音量
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {volume[0]}%
                </span>
              </div>
              <Slider
                value={volume}
                onValueChange={(v) => setVolume(Array.isArray(v) ? [...v] : [v])}
                min={0}
                max={100}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-black/[0.04] px-3.5 py-3 dark:bg-white/[0.07]">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  个性化空间音频
                </span>
                <span className="text-xs text-muted-foreground">
                  头部追踪与自适应均衡器
                </span>
              </div>
              <Switch
                checked={spatialAudio}
                onCheckedChange={setSpatialAudio}
              />
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="default">完成</Button>} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function DrawerDirectionsDemo() {
  const directions = [
    { dir: 'down' as const, label: '底部滑出' },
    { dir: 'right' as const, label: '右侧滑出' },
    { dir: 'left' as const, label: '左侧滑出' },
    { dir: 'up' as const, label: '顶部滑出' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {directions.map(({ dir, label }) => (
        <Drawer key={dir} swipeDirection={dir}>
          <DrawerTrigger
            render={
              <Button variant="secondary" size="sm">
                <PanelBottomOpenIcon className="size-3.5" />
                {label}
              </Button>
            }
          />
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{label}（swipeDirection=&quot;{dir}&quot;）</DrawerTitle>
              <DrawerDescription>
                沿滑出反方向拖拽手柄即可自然跟手关闭，并自动适配对应方向的圆角与阴影。
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-2 px-5 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2.5 rounded-xl bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.07]">
                <WifiIcon className="size-4 text-(--apple-blue)" />
                <span>无线局域网 · Studio 5G</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.07]">
                <BluetoothIcon className="size-4 text-(--apple-blue)" />
                <span>蓝牙 · AirPods Pro</span>
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose
                render={<Button variant="secondary" surface="over-glass">关闭</Button>}
              />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}

export function DrawerSnapPointsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Drawer snapPoints={[0.45, 0.85]}>
        <DrawerTrigger
          render={
            <Button variant="secondary">
              <SlidersHorizontalIcon className="size-4" />
              打开多段吸附抽屉
            </Button>
          }
        />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>共享与快捷操作</DrawerTitle>
            <DrawerDescription>
              向上拖动可展开至 85% 高度，向下拖动可回到半屏或直接关闭。
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-3">
            {[
              { title: '隔空投送至 MacBook Pro', desc: '附近设备已就绪' },
              { title: '拷贝共享链接', desc: '任何拥有链接的人均可查看' },
              { title: '导出为高分辨率 PDF', desc: '包含液态玻璃矢量分层' },
              { title: '添加到快速备忘录', desc: '自动同步至 iCloud' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-2xl bg-black/[0.04] px-3.5 py-3 dark:bg-white/[0.07]"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.desc}
                  </span>
                </div>
                <Share2Icon className="size-4 text-muted-foreground" />
              </div>
            ))}
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="default">完成</Button>} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
