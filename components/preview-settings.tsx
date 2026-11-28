'use client';

import * as React from 'react';
import { RotateCcwIcon, SlidersHorizontalIcon } from 'lucide-react';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { cn } from '@/lib/utils';
import { gitConfig } from '@/lib/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  isLiquidGlassAccentPreset,
  LIQUID_GLASS_ACCENTS,
  LiquidGlassAccentPicker,
  LiquidGlassTintSlider,
  useLiquidGlass,
} from '@/components/ui/liquid-glass-provider';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';

export type BackdropPreset = 'wallpaper' | 'editorial' | 'aurora' | 'clean';

export const BACKDROP_STORAGE_KEY = 'apple-liquid-ui:preview-backdrop';
export const BACKDROP_MESSAGE_TYPE = 'apple-liquid:set-backdrop';

export const BACKDROP_OPTIONS: ReadonlyArray<{
  value: BackdropPreset;
  label: string;
  swatchClass: string;
}> = [
  {
    value: 'wallpaper',
    label: '彩色波浪',
    swatchClass:
      'bg-[linear-gradient(135deg,#0088ff_0%,#f472b6_55%,#fb923c_100%)]',
  },
  {
    value: 'editorial',
    label: '文字折射线',
    swatchClass:
      'bg-[linear-gradient(135deg,#e0f2fe_0%,#ffffff_50%,#ffe4e6_100%)] ring-1 ring-inset ring-sky-500/35',
  },
  {
    value: 'aurora',
    label: '深色极光',
    swatchClass:
      'bg-[linear-gradient(135deg,#09090b_0%,#4f46e5_55%,#10b981_100%)]',
  },
  {
    value: 'clean',
    label: '纯色',
    swatchClass: 'bg-background ring-1 ring-inset ring-border',
  },
];

const VALID_PRESETS = new Set<BackdropPreset>([
  'wallpaper',
  'editorial',
  'aurora',
  'clean',
]);

export function isValidBackdropPreset(value: unknown): value is BackdropPreset {
  return typeof value === 'string' && VALID_PRESETS.has(value as BackdropPreset);
}

interface PreviewSettingsContextValue {
  backdrop: BackdropPreset;
  setBackdrop: (preset: BackdropPreset) => void;
}

const PreviewSettingsContext =
  React.createContext<PreviewSettingsContextValue | null>(null);

export function PreviewSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [backdrop, setBackdropState] =
    React.useState<BackdropPreset>('wallpaper');

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(BACKDROP_STORAGE_KEY);
      if (isValidBackdropPreset(saved)) {
        setBackdropState(saved);
      }
    } catch {
      // Ignore storage access restrictions
    }

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === BACKDROP_STORAGE_KEY &&
        isValidBackdropPreset(event.newValue)
      ) {
        setBackdropState(event.newValue);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as
        | { type?: unknown; preset?: unknown }
        | null
        | undefined;
      if (
        data &&
        data.type === BACKDROP_MESSAGE_TYPE &&
        isValidBackdropPreset(data.preset)
      ) {
        setBackdropState(data.preset);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const setBackdrop = React.useCallback((preset: BackdropPreset) => {
    setBackdropState(preset);
    try {
      window.localStorage.setItem(BACKDROP_STORAGE_KEY, preset);
    } catch {
      // Ignore storage access restrictions
    }
  }, []);

  const value = React.useMemo(
    () => ({ backdrop, setBackdrop }),
    [backdrop, setBackdrop]
  );

  return (
    <PreviewSettingsContext.Provider value={value}>
      {children}
    </PreviewSettingsContext.Provider>
  );
}

export function usePreviewSettings() {
  const ctx = React.useContext(PreviewSettingsContext);
  if (!ctx) {
    return {
      backdrop: 'wallpaper' as BackdropPreset,
      setBackdrop: () => {},
    };
  }
  return ctx;
}

export function PreviewScene({ preset }: { preset: BackdropPreset }) {
  if (preset === 'clean') {
    return <div className="pointer-events-none absolute inset-0 bg-background" />;
  }

  if (preset === 'editorial') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-br from-sky-50 via-white to-rose-50 dark:from-slate-950 dark:via-neutral-950 dark:to-indigo-950">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,136,255,0.14)_0px,rgba(0,136,255,0.14)_2px,transparent_2px,transparent_28px),repeating-linear-gradient(0deg,rgba(255,56,60,0.1)_0px,rgba(255,56,60,0.1)_2px,transparent_2px,transparent_28px)]" />
        <div className="absolute inset-0 flex flex-col justify-between p-5 font-semibold tracking-tight text-neutral-900/18 select-none dark:text-white/18">
          <p className="text-4xl leading-none sm:text-5xl">
            LIQUID GLASS · REFRACTION · 27
          </p>
          <p className="text-right text-3xl leading-none sm:text-4xl">
            OPTICAL LENS · MACOS &amp; IOS
          </p>
          <p className="text-4xl leading-none sm:text-5xl">
            SQUIRCLE SDF · REAL DISPLACEMENT
          </p>
        </div>
        <div className="absolute top-6 left-10 size-28 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-300 opacity-80" />
        <div className="absolute right-12 bottom-6 size-32 rounded-full bg-gradient-to-tr from-rose-500 to-amber-300 opacity-75" />
      </div>
    );
  }

  if (preset === 'aurora') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-neutral-950">
        <div className="absolute -top-12 left-[8%] h-56 w-72 rotate-[-12deg] rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 opacity-80 blur-2xl" />
        <div className="absolute right-[6%] -bottom-10 h-56 w-80 rotate-[10deg] rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 opacity-70 blur-2xl" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(125deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_1.5px,transparent_1.5px,transparent_24px)]" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,#dbeafe_0%,#fce7f3_48%,#e0f2fe_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_50%,#082f49_100%)]">
      <div className="absolute -top-10 left-[6%] h-44 w-72 rotate-[-14deg] rounded-full bg-gradient-to-r from-[#0088ff] via-[#38bdf8] to-[#2dd4bf] opacity-85 blur-md" />
      <div className="absolute top-[22%] right-[5%] h-40 w-72 rotate-[18deg] rounded-full bg-gradient-to-r from-[#ff383c] via-[#f472b6] to-[#fb923c] opacity-80 blur-md" />
      <div className="absolute -bottom-12 left-[28%] h-40 w-80 rotate-[-6deg] rounded-full bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] opacity-75 blur-md" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.28)_0px,rgba(255,255,255,0.28)_2px,transparent_2px,transparent_36px)] dark:bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.1)_0px,rgba(255,255,255,0.1)_2px,transparent_2px,transparent_36px)]" />
    </div>
  );
}

export function GlobalBackdropPicker() {
  const { backdrop, setBackdrop } = usePreviewSettings();
  const { tint, accent, resetTint, resetAccent } = useLiquidGlass();

  const activeBackdrop =
    BACKDROP_OPTIONS.find((item) => item.value === backdrop) ??
    BACKDROP_OPTIONS[0];
  const accentSwatchColor = isLiquidGlassAccentPreset(accent)
    ? LIQUID_GLASS_ACCENTS[accent].light
    : accent;
  const tintPercent = Math.round(tint * 100);
  const tintBadge =
    tintPercent <= 10 ? '透明' : tintPercent >= 90 ? '色调' : `${tintPercent}%`;

  const isDefault =
    backdrop === 'wallpaper' && Math.abs(tint - 0.5) <= 0.01 && accent === 'blue';

  const handleReset = () => {
    setBackdrop('wallpaper');
    resetTint();
    resetAccent();
  };

  return (
    <div data-slot="global-backdrop-picker">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label="自定义主题与预览外观"
              className="h-9 w-full justify-between rounded-full border border-black/[0.06] bg-black/[0.035] px-3 text-xs font-medium text-foreground shadow-none transition-colors hover:bg-black/[0.065] dark:border-white/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] md:h-9 md:px-3 md:text-xs"
            />
          }
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex shrink-0 items-center -space-x-1" aria-hidden="true">
              <span
                className={cn(
                  'size-3.5 rounded-full ring-2 ring-fd-card',
                  activeBackdrop.swatchClass
                )}
              />
              <span
                className="size-3.5 rounded-full ring-2 ring-fd-card"
                style={{ backgroundColor: accentSwatchColor }}
              />
            </span>
            <span className="truncate">主题与外观</span>
          </span>

          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-mono tabular-nums">{tintBadge}</span>
            <SlidersHorizontalIcon className="size-3.5 opacity-80" />
          </span>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="start"
          sideOffset={10}
          className="w-[310px] gap-4"
        >
          <PopoverHeader
            trailing={
              !isDefault ? (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={handleReset}
                  aria-label="重置默认外观"
                  title="重置默认"
                  className="shrink-0"
                >
                  <RotateCcwIcon className="size-3" />
                  <span>重置</span>
                </Button>
              ) : null
            }
          >
            <PopoverTitle>主题与外观</PopoverTitle>
            <PopoverDescription>
              实时调整全站强调色、玻璃通透度与预览壁纸。
            </PopoverDescription>
          </PopoverHeader>

          <LiquidGlassAccentPicker label="主题强调色" />

          <LiquidGlassTintSlider label="玻璃通透度" showDescription />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                预览背景
              </span>
              <Badge
                variant="secondary"
                glass={false}
                size="sm"
                className="text-muted-foreground"
              >
                {activeBackdrop.label}
              </Badge>
            </div>
            <div
              role="radiogroup"
              aria-label="全局预览背景"
              className="grid grid-cols-2 gap-1.5"
            >
              {BACKDROP_OPTIONS.map((option) => {
                const active = backdrop === option.value;
                return (
                  <Button
                    key={option.value}
                    variant="secondary"
                    size="sm"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setBackdrop(option.value)}
                    className={cn(
                      'h-9 w-full justify-start gap-2 rounded-xl px-2.5 text-left text-xs font-medium md:h-9 md:px-2.5 md:text-xs',
                      active
                        ? 'text-foreground ring-1 ring-(--apple-blue)/55'
                        : 'bg-black/[0.035] text-muted-foreground hover:bg-black/[0.06] hover:text-foreground dark:bg-white/[0.05] dark:hover:bg-white/[0.09]'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'size-4 shrink-0 rounded-full shadow-xs',
                        option.swatchClass
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function SidebarFooterControls() {
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

  return (
    <div
      data-slot="sidebar-footer-controls"
      className="flex flex-col gap-2.5 md:border-t md:border-black/[0.06] md:pt-3 md:dark:border-white/[0.08]"
    >
      <GlobalBackdropPicker />

      <div className="flex items-center justify-between gap-2 px-0.5">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 仓库"
          className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.08]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="size-4 shrink-0"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <span>GitHub</span>
        </a>

        <ThemeSwitch className="border-black/[0.07] bg-black/[0.04] p-0.5 dark:border-white/[0.09] dark:bg-white/[0.06] [&_svg]:size-6.5 [&_svg]:p-1.5" />
      </div>
    </div>
  );
}
