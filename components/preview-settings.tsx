'use client';

import * as React from 'react';
import { PaletteIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiquidGlassTintSlider } from '@/components/ui/liquid-glass-provider';

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

  return (
    <div
      data-slot="global-backdrop-picker"
      className="mt-2 rounded-lg border bg-fd-secondary/50 p-2 text-xs"
    >
      <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-medium text-fd-muted-foreground">
        <PaletteIcon className="size-3.5 shrink-0" />
        <span>全局预览背景</span>
      </div>
      <div
        role="radiogroup"
        aria-label="全局预览背景"
        className="grid grid-cols-2 gap-1"
      >
        {BACKDROP_OPTIONS.map((option) => {
          const active = backdrop === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setBackdrop(option.value)}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[11px] font-medium transition-colors',
                active
                  ? 'bg-fd-background text-fd-foreground shadow-xs ring-1 ring-fd-border'
                  : 'text-fd-muted-foreground hover:bg-fd-background/60 hover:text-fd-foreground'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'size-2.5 shrink-0 rounded-full',
                  option.swatchClass
                )}
              />
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 border-t border-fd-border/70 pt-2">
        <LiquidGlassTintSlider compact label="玻璃通透度" />
      </div>
    </div>
  );
}
