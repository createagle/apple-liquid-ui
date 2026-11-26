'use client';

import * as React from 'react';
import {
  SunIcon,
  SunMediumIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export function SliderLiquidHeroDemo() {
  const [volume, setVolume] = React.useState(62);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="relative w-full rounded-3xl">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-(--liquid-surface) shadow-[0_10px_28px_-8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(255,255,255,0.14)]"
        />
        <div className="relative z-10 p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">输出音量</span>
            <span className="tabular-nums text-xs font-medium text-muted-foreground">
              {volume}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            {volume === 0 ? (
              <VolumeXIcon className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <Volume1Icon className="size-4 shrink-0 text-muted-foreground" />
            )}

            <Slider
              value={volume}
              onValueChange={(val) =>
                setVolume(Array.isArray(val) ? (val[0] ?? 0) : val)
              }
              min={0}
              max={100}
              aria-label="输出音量"
            />

            <Volume2Icon className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </div>
      </div>

      <p className="rounded-full bg-background/70 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
        按住滑块左右拖动：白色胶囊滑块会膨胀为透明水滴透镜，透视并放大下方的蓝色进度轨道
      </p>
    </div>
  );
}

export function SliderTicksDemo() {
  const [speed, setSpeed] = React.useState(6);

  return (
    <div className="relative w-full max-w-md rounded-3xl">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-(--liquid-surface) shadow-[0_10px_28px_-8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(255,255,255,0.14)]"
      />
      <div className="relative z-10 p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">触控板跟踪速度</span>
          <span className="tabular-nums text-xs text-muted-foreground">
            档位 {speed} / 10
          </span>
        </div>

        <Slider
          value={speed}
          onValueChange={(val) =>
            setSpeed(Array.isArray(val) ? (val[0] ?? 1) : val)
          }
          min={1}
          max={10}
          step={1}
          ticks
          aria-label="触控板跟踪速度"
        />

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>慢</span>
          <span>默认</span>
          <span>快</span>
        </div>
      </div>
    </div>
  );
}

export function SliderRangeDemo() {
  const [range, setRange] = React.useState<number[]>([25, 78]);

  return (
    <div className="relative w-full max-w-md rounded-3xl">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-(--liquid-surface) shadow-[0_10px_28px_-8px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45),0_0_0_0.5px_rgba(255,255,255,0.14)]"
      />
      <div className="relative z-10 p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">色温自适应区间</span>
          <span className="tabular-nums text-xs font-medium text-(--apple-blue)">
            {range[0]}% – {range[1]}%
          </span>
        </div>

        <Slider
          value={range}
          onValueChange={(val) => {
            if (Array.isArray(val) && val.length >= 2) {
              setRange([val[0], val[1]]);
            }
          }}
          min={0}
          max={100}
          aria-label="色温自适应区间"
        />
      </div>
    </div>
  );
}

export function SliderControlCenterDemo() {
  const [brightness, setBrightness] = React.useState(76);
  const [sound, setSound] = React.useState(48);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="relative rounded-3xl">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-(--liquid-surface) shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.92)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[0_14px_34px_-8px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(255,255,255,0.14)]"
        />
        <div className="relative z-10 p-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">显示器亮度</span>
            <span className="tabular-nums text-xs text-muted-foreground">
              {brightness}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SunMediumIcon className="size-4 shrink-0 text-muted-foreground" />
            <Slider
              variant="glass"
              size="lg"
              value={brightness}
              onValueChange={(val) =>
                setBrightness(Array.isArray(val) ? (val[0] ?? 0) : val)
              }
              aria-label="显示器亮度"
            />
            <SunIcon className="size-4 shrink-0 text-foreground" />
          </div>
        </div>
      </div>

      <div className="relative rounded-3xl">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-(--liquid-surface) shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.92)] [backdrop-filter:blur(var(--liquid-blur))_saturate(var(--liquid-saturate))] dark:shadow-[0_14px_34px_-8px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(255,255,255,0.14)]"
        />
        <div className="relative z-10 p-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">声音</span>
            <span className="tabular-nums text-xs text-muted-foreground">
              {sound}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Volume1Icon className="size-4 shrink-0 text-muted-foreground" />
            <Slider
              variant="glass"
              size="lg"
              value={sound}
              onValueChange={(val) =>
                setSound(Array.isArray(val) ? (val[0] ?? 0) : val)
              }
              aria-label="声音"
            />
            <Volume2Icon className="size-4 shrink-0 text-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
