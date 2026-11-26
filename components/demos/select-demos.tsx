'use client';

import * as React from 'react';
import {
  CpuIcon,
  GlobeIcon,
  LaptopIcon,
  MoonIcon,
  SmartphoneIcon,
  SparklesIcon,
  SunIcon,
  TabletIcon,
  WatchIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function SelectLiquidHeroDemo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Select defaultValue="macbook">
        <SelectTrigger variant="glass" className="w-72 md:w-60">
          <SelectValue placeholder="选择设备..." />
        </SelectTrigger>
        <SelectContent title="选择 Apple 设备">
          <SelectGroup>
            <SelectLabel>桌面与移动设备</SelectLabel>
            <SelectItem value="macbook">
              <LaptopIcon />
              MacBook Pro (macOS 27)
            </SelectItem>
            <SelectItem value="iphone">
              <SmartphoneIcon />
              iPhone 18 Pro (iOS 27)
            </SelectItem>
            <SelectItem value="ipad">
              <TabletIcon />
              iPad Pro (iPadOS 27)
            </SelectItem>
            <SelectItem value="watch">
              <WatchIcon />
              Apple Watch Ultra
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="rounded-full bg-background/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
        桌面端（&ge; 768px）展开 macOS 27 悬浮液态下拉菜单；窄屏移动端（&lt; 768px）自动弹出 iOS 27 底部滑动 Drawer
      </p>
    </div>
  );
}

export function SelectVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Select defaultValue="auto">
        <SelectTrigger variant="glass" className="w-44">
          <SelectValue placeholder="外观主题" />
        </SelectTrigger>
        <SelectContent title="外观主题">
          <SelectGroup>
            <SelectItem value="auto">
              <SparklesIcon />
              跟随系统
            </SelectItem>
            <SelectItem value="light">
              <SunIcon />
              浅色模式
            </SelectItem>
            <SelectItem value="dark">
              <MoonIcon />
              深色模式
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select defaultValue="auto">
        <SelectTrigger variant="default" className="w-44">
          <SelectValue placeholder="外观主题" />
        </SelectTrigger>
        <SelectContent title="外观主题">
          <SelectGroup>
            <SelectItem value="auto">跟随系统</SelectItem>
            <SelectItem value="light">浅色模式</SelectItem>
            <SelectItem value="dark">深色模式</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select defaultValue="sm">
        <SelectTrigger variant="default" size="sm" className="w-36">
          <SelectValue placeholder="紧凑尺寸" />
        </SelectTrigger>
        <SelectContent title="紧凑尺寸">
          <SelectGroup>
            <SelectItem value="sm">紧凑 Small</SelectItem>
            <SelectItem value="md">标准 Regular</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select disabled defaultValue="locked">
        <SelectTrigger variant="glass" className="w-36">
          <SelectValue placeholder="禁用状态" />
        </SelectTrigger>
        <SelectContent title="禁用状态">
          <SelectGroup>
            <SelectItem value="locked">已禁用</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function SelectGroupedDemo() {
  return (
    <Select defaultValue="tokyo">
      <SelectTrigger variant="glass" className="w-72 md:w-60">
        <SelectValue placeholder="选择边缘节点..." />
      </SelectTrigger>
      <SelectContent title="选择部署区域">
        <SelectGroup>
          <SelectLabel>亚太地区</SelectLabel>
          <SelectItem value="tokyo">
            <GlobeIcon />
            东京 · ap-northeast-1
          </SelectItem>
          <SelectItem value="singapore">
            <GlobeIcon />
            新加坡 · ap-southeast-1
          </SelectItem>
          <SelectItem value="hongkong">
            <GlobeIcon />
            香港 · ap-east-1
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>北美地区</SelectLabel>
          <SelectItem value="cupertino">
            <CpuIcon />
            库比蒂诺 · us-west-1
          </SelectItem>
          <SelectItem value="virginia">
            <CpuIcon />
            弗吉尼亚 · us-east-1
          </SelectItem>
          <SelectItem value="disabled-node" disabled>
            维护中节点（不可选）
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function SelectControlledDemo() {
  const [value, setValue] = React.useState<string | null>('swift');

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger variant="glass" className="w-48">
          <SelectValue placeholder="选择语言..." />
        </SelectTrigger>
        <SelectContent title="选择开发语言">
          <SelectGroup>
            <SelectItem value="swift">Swift / SwiftUI</SelectItem>
            <SelectItem value="typescript">TypeScript / React</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
            <SelectItem value="go">Go</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button variant="secondary" size="sm" onClick={() => setValue(null)}>
        清空（当前：{value ?? '未选'}）
      </Button>
    </div>
  );
}
