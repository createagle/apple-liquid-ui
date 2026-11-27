'use client';

import * as React from 'react';
import { LiquiBackdrop } from '@liqui-design/glass';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Code2Icon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  LockIcon,
  MonitorIcon,
  RotateCwIcon,
  SmartphoneIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { withBasePath } from '@/lib/shared';
import { DEMO_REGISTRY, type DemoName } from '@/lib/demos';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  BACKDROP_MESSAGE_TYPE,
  PreviewScene,
  usePreviewSettings,
} from '@/components/preview-settings';
import {
  LIQUID_GLASS_ACCENT_MESSAGE_TYPE,
  LIQUID_GLASS_MESSAGE_TYPE,
  useLiquidGlass,
} from '@/components/ui/liquid-glass-provider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PreviewTab = 'preview' | 'code';
type DeviceMode = 'desktop' | 'mobile';

// MacBook 16:10 horizontal aspect ratio: 1024 x 640 (40px Safari top bar + 600px viewport)
const MACBOOK_FRAME_WIDTH = 1024;
const MACBOOK_TOOLBAR_HEIGHT = 40;
const MACBOOK_VIEWPORT_HEIGHT = 600;
const MACBOOK_TOTAL_HEIGHT = MACBOOK_TOOLBAR_HEIGHT + MACBOOK_VIEWPORT_HEIGHT;

// True iPhone 9:19.5 vertical aspect ratio: 390 x 844 logical screen + 8px bezel on each side
const IPHONE_VIEWPORT_WIDTH = 390;
const IPHONE_SCREEN_HEIGHT = 844;
const IPHONE_STATUS_HEIGHT = 48;
const IPHONE_SAFARI_BAR_HEIGHT = 68;
const IPHONE_IFRAME_HEIGHT =
  IPHONE_SCREEN_HEIGHT - IPHONE_STATUS_HEIGHT - IPHONE_SAFARI_BAR_HEIGHT; // 728px
const IPHONE_BEZEL = 8;
const IPHONE_FRAME_WIDTH = IPHONE_VIEWPORT_WIDTH + IPHONE_BEZEL * 2; // 406px
const IPHONE_TOTAL_HEIGHT = IPHONE_SCREEN_HEIGHT + IPHONE_BEZEL * 2; // 860px
// Keep the full vertical iPhone frame comfortably visible in a single desktop screen while preserving exact 9:19.5 ratio
const IPHONE_MAX_STAGE_HEIGHT = 640;

const DEVICE_OPTIONS: ReadonlyArray<{
  value: DeviceMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'desktop',
    label: 'PC 端 (MacBook · macOS 27)',
    icon: MonitorIcon,
  },
  {
    value: 'mobile',
    label: '移动端 (iPhone · iOS 27)',
    icon: SmartphoneIcon,
  },
];

export interface ComponentPreviewClientProps {
  name?: DemoName;
  title?: string;
  code?: string | null;
  highlightedLines?: React.ReactNode[] | null;
  /** @deprecated iPhone frame now uses exact 390x844 (9:19.5) device proportions. */
  mobileHeight?: number;
  /** @deprecated Tablet mode has been removed in favor of PC & Mobile only. */
  tabletHeight?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ComponentPreviewClient({
  name,
  title,
  code,
  highlightedLines,
  className,
  children,
}: ComponentPreviewClientProps) {
  const isMobileViewport = useIsMobile();
  const { backdrop } = usePreviewSettings();
  const { tint, accent } = useLiquidGlass();
  const [tab, setTab] = React.useState<PreviewTab>('preview');
  const [device, setDevice] = React.useState<DeviceMode>('desktop');
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [stageWidth, setStageWidth] = React.useState<number>(0);

  const hasUserSelectedDeviceRef = React.useRef(false);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);

  const hasCode = Boolean(code);
  const previewUrl = name ? withBasePath(`/preview/${name}`) : null;
  const DemoComponent = name ? DEMO_REGISTRY[name].component : null;
  const displayAddress = name
    ? `apple-liquid-ui/preview/${name}`
    : 'apple-liquid-ui';

  // Keep default device aligned with host viewport until the user explicitly switches.
  React.useEffect(() => {
    if (!hasUserSelectedDeviceRef.current) {
      setDevice(isMobileViewport ? 'mobile' : 'desktop');
    }
  }, [isMobileViewport]);

  // Inline inside the matching browser shell when host viewport matches; iframe when emulating the opposite device.
  const isIframeMode = Boolean(
    previewUrl &&
      ((isMobileViewport && device === 'desktop') ||
        (!isMobileViewport && device === 'mobile'))
  );

  // Use scaled stage whenever rendering an iframe (cross-device emulation) OR rendering the fixed-ratio iPhone shell.
  const usesScaledFrame = isIframeMode || device === 'mobile';

  const targetFrameWidth =
    device === 'desktop' ? MACBOOK_FRAME_WIDTH : IPHONE_FRAME_WIDTH;
  const targetFrameHeight =
    device === 'desktop' ? MACBOOK_TOTAL_HEIGHT : IPHONE_TOTAL_HEIGHT;

  const widthScale =
    stageWidth > 0 ? Math.min(1, stageWidth / targetFrameWidth) : 1;
  const heightScale =
    device === 'mobile'
      ? Math.min(1, IPHONE_MAX_STAGE_HEIGHT / targetFrameHeight)
      : 1;
  const scale = usesScaledFrame
    ? Math.max(0.2, Math.min(widthScale, heightScale))
    : 1;

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
      win.postMessage(
        { type: LIQUID_GLASS_ACCENT_MESSAGE_TYPE, accent },
        window.location.origin
      );
    } catch {
      // Ignore cross-frame messaging errors during unmount
    }
  }, [accent, backdrop, tint]);

  React.useEffect(() => {
    if (isIframeMode) {
      syncSettingsToIframe();
    }
  }, [isIframeMode, syncSettingsToIframe]);

  // Measure available stage width for zero-overflow auto-scaling.
  React.useEffect(() => {
    if (!usesScaledFrame || tab !== 'preview') return;
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const updateWidth = () => {
      setStageWidth(stageEl.clientWidth);
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateWidth);
    observer.observe(stageEl);
    return () => observer.disconnect();
  }, [usesScaledFrame, tab, device]);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleSelectDevice = (next: DeviceMode) => {
    hasUserSelectedDeviceRef.current = true;
    setDevice(next);
  };

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard
      .writeText(code)
      .then(() => setCopied(true))
      .catch(() => {});
  };

  const scaledWidth = Math.round(targetFrameWidth * scale);
  const scaledHeight = Math.round(targetFrameHeight * scale);
  const scaleBadge = scale < 0.995 ? `${Math.round(scale * 100)}%` : null;

  const inlineStage = (
    <LiquiBackdrop
      backdrop={<PreviewScene preset={backdrop} />}
      className={cn(
        'relative size-full overflow-hidden',
        backdrop === 'aurora' && 'dark text-white',
        className
      )}
    >
      <div className="relative z-10 size-full overflow-y-auto overscroll-contain">
        <div
          key={refreshKey}
          className="flex min-h-full w-full items-center justify-center p-6 sm:p-8"
        >
          {DemoComponent ? <DemoComponent /> : children}
        </div>
      </div>
    </LiquiBackdrop>
  );

  return (
    <div
      data-slot="component-preview"
      className="not-prose isolate my-6 overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
    >
      {/* Top toolbar: Preview | Code + Title on left, PC / Mobile Switcher & Actions on right */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/35 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Tabs
            value={tab}
            onValueChange={(next) => setTab(next as PreviewTab)}
            className="gap-0"
          >
            <TabsList
              aria-label="预览与代码切换"
              className="h-8 md:h-8"
            >
              <TabsTrigger value="preview" className="px-2.5 text-xs md:px-2.5 md:text-xs">
                <EyeIcon className="size-3.5" />
                <span>Preview</span>
              </TabsTrigger>
              {hasCode ? (
                <TabsTrigger value="code" className="px-2.5 text-xs md:px-2.5 md:text-xs">
                  <Code2Icon className="size-3.5" />
                  <span>Code</span>
                </TabsTrigger>
              ) : null}
            </TabsList>
          </Tabs>

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
                <Tabs
                  value={device}
                  onValueChange={(next) => handleSelectDevice(next as DeviceMode)}
                  className="gap-0"
                >
                  <TabsList
                    aria-label="设备视口切换"
                    className="h-8 md:h-8"
                  >
                    {DEVICE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <TabsTrigger
                          key={opt.value}
                          value={opt.value}
                          aria-label={opt.label}
                          title={opt.label}
                          className="px-2 md:px-2"
                        >
                          <Icon className="size-3.5" />
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              ) : null}

              <div className="inline-flex h-8 items-center gap-0.5 rounded-lg border border-border bg-background p-0.5">
                {previewUrl ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    nativeButton={false}
                    aria-label="在新标签页打开预览"
                    title="在新标签页打开预览"
                    className="size-7 rounded-md text-muted-foreground hover:text-foreground md:size-7"
                    render={
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <ExternalLinkIcon className="size-3.5" />
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="刷新预览"
                  title="刷新预览"
                  onClick={() => setRefreshKey((k) => k + 1)}
                  className="size-7 rounded-md text-muted-foreground hover:text-foreground md:size-7"
                >
                  <RotateCwIcon className="size-3.5" />
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="secondary"
              size="xs"
              onClick={handleCopyCode}
              aria-label={copied ? '已复制代码' : '复制代码'}
              className="h-8 md:h-8"
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
            </Button>
          )}
        </div>
      </div>

      {/* Main Content: Always wrapped in MacBook (16:10 horizontal) or iPhone (9:19.5 vertical) Safari browser shell */}
      {tab === 'preview' ? (
        <div className="bg-muted/30 bg-[radial-gradient(color-mix(in_oklab,var(--border)_85%,transparent)_1px,transparent_1px)] [background-size:16px_16px] p-4 sm:p-6">
          {device === 'desktop' && !isIframeMode ? (
            /* PC Host + PC Mode: Responsive 16:10 MacBook Safari Browser Shell with crisp 1:1 inline preview */
            <div className="mx-auto flex aspect-[16/10] w-full max-w-[920px] flex-col overflow-hidden rounded-[16px] border border-black/15 bg-background shadow-[0_24px_60px_-16px_rgba(0,0,0,0.22),0_4px_14px_-4px_rgba(0,0,0,0.08)] dark:border-white/15 dark:shadow-[0_28px_72px_-14px_rgba(0,0,0,0.72)]">
              {/* macOS Safari Browser Toolbar */}
              <div className="flex h-10 shrink-0 items-center justify-between gap-4 rounded-t-[15px] border-b border-border/70 bg-muted/65 px-4">
                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex items-center gap-2" aria-hidden="true">
                    <span className="size-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)]" />
                    <span className="size-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)]" />
                    <span className="size-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)]" />
                  </div>
                  <div
                    className="flex items-center gap-0.5 text-muted-foreground/70"
                    aria-hidden="true"
                  >
                    <ChevronLeftIcon className="size-4" />
                    <ChevronRightIcon className="size-4 opacity-45" />
                  </div>
                </div>

                <div className="flex h-7 w-full max-w-md items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-3 text-[11px] font-medium text-muted-foreground shadow-2xs">
                  <LockIcon className="size-3 shrink-0 opacity-65" />
                  <span className="truncate">{displayAddress}</span>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                  <span>MacBook · 16:10</span>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-[15px]">
                {inlineStage}
              </div>
            </div>
          ) : (
            /* Scaled Stage: Mobile Host + PC Mode (16:10 MacBook iframe) OR Any Host + Mobile Mode (9:19.5 iPhone shell) */
            <div
              ref={stageRef}
              className="flex w-full justify-center"
            >
              <div
                style={{
                  width: scaledWidth,
                  height: scaledHeight,
                }}
                className="relative shrink-0"
              >
                {device === 'desktop' ? (
                  /* MacBook macOS 27 Safari Browser Shell (16:10 Horizontal Ratio: 1024 x 640) */
                  <div
                    style={{
                      width: MACBOOK_FRAME_WIDTH,
                      height: MACBOOK_TOTAL_HEIGHT,
                      transform: scale < 1 ? `scale(${scale})` : undefined,
                      transformOrigin: 'top left',
                    }}
                    className="flex flex-col overflow-hidden rounded-[18px] border border-black/15 bg-background shadow-[0_28px_70px_-16px_rgba(0,0,0,0.28),0_4px_16px_-4px_rgba(0,0,0,0.1)] dark:border-white/15 dark:shadow-[0_32px_80px_-14px_rgba(0,0,0,0.75)]"
                  >
                    <div className="flex h-10 shrink-0 items-center justify-between gap-4 rounded-t-[17px] border-b border-border/70 bg-muted/65 px-4">
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="flex items-center gap-2" aria-hidden="true">
                          <span className="size-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)]" />
                          <span className="size-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)]" />
                          <span className="size-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.12)]" />
                        </div>
                        <div
                          className="flex items-center gap-0.5 text-muted-foreground/70"
                          aria-hidden="true"
                        >
                          <ChevronLeftIcon className="size-4" />
                          <ChevronRightIcon className="size-4 opacity-45" />
                        </div>
                      </div>

                      <div className="flex h-7 w-full max-w-md items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-3 text-[11px] font-medium text-muted-foreground shadow-2xs">
                        <LockIcon className="size-3 shrink-0 opacity-65" />
                        <span className="truncate">{displayAddress}</span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                        <span>MacBook · 16:10</span>
                        {scaleBadge ? (
                          <span className="rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-foreground/80">
                            {scaleBadge}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <iframe
                      ref={iframeRef}
                      key={`desktop-${refreshKey}`}
                      src={previewUrl ?? undefined}
                      title={`${title ?? name} (MacBook)`}
                      onLoad={syncSettingsToIframe}
                      style={{
                        width: MACBOOK_FRAME_WIDTH,
                        height: MACBOOK_VIEWPORT_HEIGHT,
                      }}
                      className="block rounded-b-[17px] border-0 bg-background"
                    />
                  </div>
                ) : (
                  /* iPhone iOS 27 Safari Browser Shell (Exact 390 x 844 / 9:19.5 Vertical Aspect Ratio) */
                  <div
                    style={{
                      width: IPHONE_FRAME_WIDTH,
                      height: IPHONE_TOTAL_HEIGHT,
                      padding: IPHONE_BEZEL,
                      transform: scale < 1 ? `scale(${scale})` : undefined,
                      transformOrigin: 'top left',
                    }}
                    className="rounded-[52px] bg-neutral-900 shadow-[0_32px_80px_-18px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.14)_inset] dark:bg-neutral-800 dark:shadow-[0_36px_90px_-14px_rgba(0,0,0,0.82),0_0_0_1px_rgba(255,255,255,0.16)_inset]"
                  >
                    <div className="flex size-full flex-col overflow-hidden rounded-[44px] bg-background">
                      {/* iPhone Status Bar + Dynamic Island (48px) */}
                      <div className="relative flex h-12 shrink-0 items-center justify-between rounded-t-[44px] bg-background px-6 text-foreground select-none">
                        <span className="text-[13px] font-semibold tracking-tight">
                          9:41
                        </span>

                        {/* Dynamic Island */}
                        <div
                          aria-hidden="true"
                          className="absolute top-2.5 left-1/2 flex h-[26px] w-[104px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2.5 shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.1)]"
                        >
                          <span className="size-2.5 rounded-full bg-neutral-800 ring-1 ring-neutral-700/80" />
                        </div>

                        {/* Signal / Battery */}
                        <div className="flex items-center gap-1.5" aria-hidden="true">
                          <svg
                            viewBox="0 0 18 12"
                            className="h-2.5 w-3.5 fill-current"
                          >
                            <rect x="0" y="7" width="3" height="5" rx="0.8" />
                            <rect x="4.5" y="5" width="3" height="7" rx="0.8" />
                            <rect x="9" y="2.5" width="3" height="9.5" rx="0.8" />
                            <rect x="13.5" y="0" width="3" height="12" rx="0.8" />
                          </svg>
                          <div className="flex items-center gap-0.5">
                            <div className="flex h-[11px] w-[22px] items-center rounded-[3.5px] border border-current/45 p-[1.5px]">
                              <div className="h-full w-full rounded-[1.5px] bg-current" />
                            </div>
                            <span className="h-1 w-[1.5px] rounded-r-full bg-current/45" />
                          </div>
                        </div>
                      </div>

                      {/* Real 390 x 728 iOS Viewport */}
                      <div
                        style={{
                          width: IPHONE_VIEWPORT_WIDTH,
                          height: IPHONE_IFRAME_HEIGHT,
                        }}
                        className="relative shrink-0 overflow-hidden bg-background"
                      >
                        {isIframeMode ? (
                          <iframe
                            ref={iframeRef}
                            key={`mobile-${refreshKey}`}
                            src={previewUrl ?? undefined}
                            title={`${title ?? name} (iPhone)`}
                            onLoad={syncSettingsToIframe}
                            style={{
                              width: IPHONE_VIEWPORT_WIDTH,
                              height: IPHONE_IFRAME_HEIGHT,
                            }}
                            className="block border-0 bg-background"
                          />
                        ) : (
                          inlineStage
                        )}
                      </div>

                      {/* iOS 27 Safari Bottom Floating URL Bar + Home Indicator (68px) */}
                      <div className="flex h-[68px] shrink-0 flex-col items-center justify-between rounded-b-[44px] border-t border-border/60 bg-muted/45 px-5 pt-2.5 pb-2">
                        <div className="flex h-8 w-full items-center justify-between rounded-full border border-border/60 bg-background/85 px-3 text-[11px] font-medium text-muted-foreground shadow-2xs">
                          <ChevronLeftIcon className="size-3.5 opacity-55" />
                          <span className="flex items-center gap-1 truncate">
                            <LockIcon className="size-2.5 shrink-0 opacity-65" />
                            <span className="truncate">apple-liquid-ui</span>
                          </span>
                          <span className="font-mono text-[10px] opacity-65">
                            {scaleBadge ?? '9:19.5'}
                          </span>
                        </div>
                        <div
                          aria-hidden="true"
                          className="h-[5px] w-32 rounded-full bg-foreground/25"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
