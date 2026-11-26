'use client';

import * as React from 'react';
import {
  BluetoothIcon,
  MoonIcon,
  PlaneIcon,
  RadioIcon,
  SparklesIcon,
  WifiIcon,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SwitchLiquidHeroDemo() {
  const [enabled, setEnabled] = React.useState(true);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between gap-4 rounded-3xl bg-(--liquid-surface) px-5 py-4 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(255,255,255,0.14)]">
        <div className="flex items-center gap-3 text-left">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-(--apple-green)/15 text-(--apple-green)">
            <SparklesIcon className="size-5" />
          </span>
          <div>
            <Label
              htmlFor="switch-liquid-hero"
              className="cursor-pointer text-sm font-semibold text-foreground"
            >
              液态玻璃光学折射
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {enabled ? '已开启 · 按住滑块左右拖动体验棱镜折射' : '已关闭 · 点击或拖动滑块重新启用'}
            </p>
          </div>
        </div>

        <Switch
          id="switch-liquid-hero"
          size="lg"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>

      <p className="rounded-full bg-background/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
        按住滑块不放或左右拖动：白色胶囊滑块会膨胀为透明水滴透镜，透视并实时渐变底层轨道颜色
      </p>
    </div>
  );
}

export function SwitchVariantsDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-3xl bg-(--liquid-surface) p-5 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(255,255,255,0.14)]">
      <div className="flex items-center justify-between gap-4">
        <div className="text-left">
          <Label htmlFor="switch-variant-default" className="text-sm font-medium">
            Default（响应式：macOS 蓝 / iOS 绿）
          </Label>
          <p className="text-xs text-muted-foreground">桌面端自动采用 Apple Blue，移动端自动切换 Apple Green</p>
        </div>
        <Switch id="switch-variant-default" variant="default" defaultChecked />
      </div>

      <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

      <div className="flex items-center justify-between gap-4">
        <div className="text-left">
          <Label htmlFor="switch-variant-green" className="text-sm font-medium">
            Green（Apple Green）
          </Label>
          <p className="text-xs text-muted-foreground">固定使用 iOS 经典系统绿</p>
        </div>
        <Switch id="switch-variant-green" variant="green" defaultChecked />
      </div>

      <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

      <div className="flex items-center justify-between gap-4">
        <div className="text-left">
          <Label htmlFor="switch-variant-blue" className="text-sm font-medium">
            Blue（Apple Blue）
          </Label>
          <p className="text-xs text-muted-foreground">macOS 强调色风格开关</p>
        </div>
        <Switch id="switch-variant-blue" variant="blue" defaultChecked />
      </div>

      <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

      <div className="flex items-center justify-between gap-4">
        <div className="text-left">
          <Label htmlFor="switch-variant-glass" className="text-sm font-medium">
            Glass（液态玻璃轨道）
          </Label>
          <p className="text-xs text-muted-foreground">半透明磨砂轨道，适配多彩壁纸与控制中心</p>
        </div>
        <Switch id="switch-variant-glass" variant="glass" />
      </div>

      <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

      <div className="flex items-center justify-between gap-4">
        <div className="text-left">
          <Label htmlFor="switch-variant-labels" className="text-sm font-medium">
            无障碍开/关标识（I / O）
          </Label>
          <p className="text-xs text-muted-foreground">开启 showLabels 在轨道内显示 I / O 指示符</p>
        </div>
        <Switch id="switch-variant-labels" showLabels defaultChecked />
      </div>
    </div>
  );
}

export function SwitchSizesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 rounded-3xl bg-(--liquid-surface) px-6 py-5 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(255,255,255,0.14)]">
      <div className="flex flex-col items-center gap-2">
        <Switch size="sm" defaultChecked aria-label="小号开关" />
        <span className="text-xs text-muted-foreground">sm</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Switch size="default" defaultChecked aria-label="默认尺寸开关" />
        <span className="text-xs text-muted-foreground">default</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Switch size="lg" defaultChecked aria-label="大号开关" />
        <span className="text-xs text-muted-foreground">lg</span>
      </div>

      <div className="h-8 w-px bg-black/[0.08] dark:bg-white/10" />

      <div className="flex flex-col items-center gap-2">
        <Switch disabled aria-label="禁用关闭状态" />
        <span className="text-xs text-muted-foreground">disabled</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Switch disabled defaultChecked aria-label="禁用开启状态" />
        <span className="text-xs text-muted-foreground">disabled on</span>
      </div>
    </div>
  );
}

export function SwitchSettingsPanelDemo() {
  const [settings, setSettings] = React.useState({
    airplane: false,
    wifi: true,
    bluetooth: true,
    airdrop: true,
    focus: false,
  });

  const activeCount = Object.values(settings).filter(Boolean).length;

  const toggle = (key: keyof typeof settings) => (checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: checked,
      ...(key === 'airplane' && checked
        ? { wifi: false, bluetooth: false, airdrop: false }
        : {}),
    }));
  };

  const rows: {
    key: keyof typeof settings;
    label: string;
    desc: string;
    icon: React.ReactNode;
    iconBg: string;
  }[] = [
    {
      key: 'airplane',
      label: '飞行模式',
      desc: '开启后将自动关闭无线连接',
      icon: <PlaneIcon className="size-4 text-white" />,
      iconBg: 'bg-orange-500',
    },
    {
      key: 'wifi',
      label: '无线局域网',
      desc: settings.wifi ? 'Apple Studio 6E' : '未连接',
      icon: <WifiIcon className="size-4 text-white" />,
      iconBg: 'bg-(--apple-blue)',
    },
    {
      key: 'bluetooth',
      label: '蓝牙',
      desc: settings.bluetooth ? 'AirPods Pro 已连接' : '已关闭',
      icon: <BluetoothIcon className="size-4 text-white" />,
      iconBg: 'bg-blue-600',
    },
    {
      key: 'airdrop',
      label: '隔空投送',
      desc: settings.airdrop ? '仅限联系人' : '接收关闭',
      icon: <RadioIcon className="size-4 text-white" />,
      iconBg: 'bg-sky-500',
    },
    {
      key: 'focus',
      label: '专注模式',
      desc: settings.focus ? '勿扰中' : '关闭',
      icon: <MoonIcon className="size-4 text-white" />,
      iconBg: 'bg-indigo-500',
    },
  ];

  return (
    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-(--liquid-surface) shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.92)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[0_14px_34px_-8px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(255,255,255,0.14)]">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3.5 dark:border-white/[0.08]">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          系统连接设置
        </span>
        <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-foreground dark:bg-white/10">
          已启用 {activeCount} / {rows.length}
        </span>
      </div>

      <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-3 px-5 py-3"
          >
            <div className="flex items-center gap-3 text-left">
              <span
                className={`inline-flex size-8 shrink-0 items-center justify-center rounded-xl shadow-xs ${row.iconBg}`}
              >
                {row.icon}
              </span>
              <div>
                <Label
                  htmlFor={`setting-${row.key}`}
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  {row.label}
                </Label>
                <p className="text-xs text-muted-foreground">{row.desc}</p>
              </div>
            </div>

            <Switch
              id={`setting-${row.key}`}
              checked={settings[row.key]}
              onCheckedChange={toggle(row.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
