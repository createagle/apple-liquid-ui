'use client';

import * as React from 'react';
import { LiquiBackdrop } from '@liqui-design/glass';
import {
  CheckIcon,
  Code2Icon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  MonitorIcon,
  RotateCwIcon,
  SmartphoneIcon,
  TabletIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { withBasePath } from '@/lib/shared';
import { DEMO_REGISTRY, type DemoName } from '@/lib/demos';
import {
  BACKDROP_MESSAGE_TYPE,
  PreviewScene,
  usePreviewSettings,
} from '@/components/preview-settings';
import {
  LIQUID_GLASS_MESSAGE_TYPE,
  useLiquidGlass,
} from '@/components/ui/liquid-glass-provider';

type PreviewTab = 'preview' | 'code';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_OPTIONS: ReadonlyArray<{
  value: DeviceMode;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'desktop',
    label: '桌面端 (macOS 27)',
    badge: 'macOS 27 · 桌面',
    icon: MonitorIcon,
  },
  {
    value: 'tablet',
    label: '平板端 (768px)',
    badge: 'iPad · 768px',
    icon: TabletIcon,
  },
  {
    value: 'mobile',
    label: '移动端 (iOS 27 · 390px)',
    badge: 'iOS 27 · 390px',
    icon: SmartphoneIcon,
  },
];

export interface ComponentPreviewClientProps {
  name?: DemoName;
  title?: string;
  code?: string | null;
  highlightedLines?: React.ReactNode[] | null;
  mobileHeight?: number;
  tabletHeight?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ComponentPreviewClient({
  name,
  title,
  code,
  highlightedLines,
  mobileHeight = 520,
  tabletHeight = 380,
  className,
  children,
}: ComponentPreviewClientProps) {
  const { backdrop } = usePreviewSettings();
  const { tint } = useLiquidGlass();
  const [tab, setTab] = React.useState<PreviewTab>('preview');
  const [device, setDevice] = React.useState<DeviceMode>('desktop');
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  const hasCode = Boolean(code);
  const previewUrl = name ? withBasePath(`/preview/${name}`) : null;
  const DemoComponent = name ? DEMO_REGISTRY[name].component : null;

  const syncSettingsToIframe = React.useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage(
        { type: BACKDROP_MESSAGE_TYPE, preset: backdrop },
        window.location.origin
      );
      win.postMessage(
        { type: LIQUID_GLASS_MESSAGE_TYPE, tint },
        window.location.origin
      );
    } catch {
      // Ignore cross-frame messaging errors during unmount
    }
  }, [backdrop, tint]);

  React.useEffect(() => {
    if (device !== 'desktop') {
      syncSettingsToIframe();
    }
  }, [device, syncSettingsToIframe]);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard
      .writeText(code)
      .then(() => setCopied(true))
      .catch(() => {});
  };

  return (
    <div
      data-slot="component-preview"
      className="not-prose my-6 overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
    >
      {/* Shadcn-style top toolbar: Preview | Code + Title on left, Device Switcher & Actions on right */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/35 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            role="tablist"
            aria-label="预览与代码切换"
            className="inline-flex h-8 shrink-0 items-center rounded-lg bg-muted p-0.5 text-xs font-medium"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'preview'}
              onClick={() => setTab('preview')}
              className={cn(
                'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 transition-all',
                tab === 'preview'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <EyeIcon className="size-3.5" />
              <span>Preview</span>
            </button>
            {hasCode ? (
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'code'}
                onClick={() => setTab('code')}
                className={cn(
                  'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 transition-all',
                  tab === 'code'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Code2Icon className="size-3.5" />
                <span>Code</span>
              </button>
            ) : null}
          </div>

          {title ? (
            <>
              <span
                aria-hidden="true"
                className="hidden h-4 w-px shrink-0 bg-border sm:block"
              />
              <span className="hidden truncate text-xs text-muted-foreground sm:block">
                {title}
              </span>
            </>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {tab === 'preview' ? (
            <>
              {previewUrl ? (
                <div
                  role="group"
                  aria-label="设备视口切换"
                  className="inline-flex h-8 items-center gap-0.5 rounded-lg border border-border bg-background p-0.5"
                >
                  {DEVICE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = device === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-label={opt.label}
                        aria-pressed={active}
                        title={opt.label}
                        onClick={() => setDevice(opt.value)}
                        className={cn(
                          'inline-flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors',
                          active
                            ? 'bg-muted text-foreground shadow-2xs'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        )}
                      >
                        <Icon className="size-3.5" />
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="inline-flex h-8 items-center gap-0.5 rounded-lg border border-border bg-background p-0.5">
                {previewUrl ? (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="在新标签页打开预览"
                    title="在新标签页打开预览"
                    className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                ) : null}
                <button
                  type="button"
                  aria-label="刷新预览"
                  title="刷新预览"
                  onClick={() => setRefreshKey((k) => k + 1)}
                  className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <RotateCwIcon className="size-3.5" />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label={copied ? '已复制代码' : '复制代码'}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              {copied ? (
                <>
                  <CheckIcon className="size-3.5 text-emerald-500" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <CopyIcon className="size-3.5 text-muted-foreground" />
                  <span>复制代码</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Live Preview (Desktop inline / Tablet & Mobile real viewport iframe) OR Highlighted Code */}
      {tab === 'preview' ? (
        device === 'desktop' || !previewUrl ? (
          <LiquiBackdrop
            backdrop={<PreviewScene preset={backdrop} />}
            className={cn(
              'relative flex min-h-64 items-center justify-center p-8',
              backdrop === 'aurora' && 'dark text-white',
              className
            )}
          >
            <div
              key={refreshKey}
              className="relative z-10 flex w-full items-center justify-center"
            >
              {DemoComponent ? <DemoComponent /> : children}
            </div>
          </LiquiBackdrop>
        ) : (
          <div className="overflow-x-auto bg-muted/30 bg-[radial-gradient(color-mix(in_oklab,var(--border)_85%,transparent)_1px,transparent_1px)] [background-size:16px_16px] p-5 sm:p-6">
            <div className="mx-auto flex w-fit flex-col items-center">
              <div
                className={cn(
                  'overflow-hidden border border-border/85 bg-background shadow-[0_24px_56px_-18px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_60px_-14px_rgba(0,0,0,0.65)]',
                  device === 'mobile' ? 'w-[390px] rounded-[28px]' : 'w-[768px] rounded-2xl'
                )}
              >
                <div className="flex items-center justify-between border-b border-border/70 bg-muted/50 px-4 py-1.5 text-[11px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500/85" />
                    {device === 'mobile' ? 'iPhone · iOS 27' : 'iPad · 768px'}
                  </span>
                  <span className="font-mono text-[10px] opacity-80">
                    {device === 'mobile'
                      ? `390 × ${mobileHeight}`
                      : `768 × ${tabletHeight}`}
                  </span>
                </div>
                <iframe
                  ref={iframeRef}
                  key={`${device}-${refreshKey}`}
                  src={previewUrl}
                  title={`${title ?? name} (${device})`}
                  onLoad={syncSettingsToIframe}
                  style={{
                    height: device === 'mobile' ? mobileHeight : tabletHeight,
                  }}
                  className={cn(
                    'block border-0 bg-background',
                    device === 'mobile' ? 'w-[390px]' : 'w-[768px]'
                  )}
                />
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="relative bg-background">
          <pre
            dir="ltr"
            tabIndex={0}
            className="max-h-[460px] overflow-auto px-4 py-4 font-mono text-[13px] leading-relaxed outline-none"
          >
            <code className="grid min-w-max grid-cols-[auto_1fr] gap-x-4">
              {(highlightedLines ?? code?.split('\n') ?? []).map(
                (line, index) => (
                  <React.Fragment key={index}>
                    <span
                      aria-hidden="true"
                      className="min-w-6 text-right text-xs text-muted-foreground/55 select-none"
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 whitespace-pre">
                      {line === '' ||
                      (Array.isArray(line) && line.length === 0)
                        ? '\n'
                        : line}
                    </span>
                  </React.Fragment>
                )
              )}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
