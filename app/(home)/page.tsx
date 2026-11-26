import Link from 'next/link';
import { SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(at_20%_25%,oklch(0.86_0.15_245/0.35)_0px,transparent_52%),radial-gradient(at_80%_20%,oklch(0.84_0.17_320/0.32)_0px,transparent_48%),radial-gradient(at_50%_85%,oklch(0.86_0.14_195/0.3)_0px,transparent_54%)] dark:bg-[radial-gradient(at_20%_25%,oklch(0.42_0.2_255/0.35)_0px,transparent_52%),radial-gradient(at_80%_20%,oklch(0.42_0.22_325/0.32)_0px,transparent_48%),radial-gradient(at_50%_85%,oklch(0.4_0.16_195/0.28)_0px,transparent_54%)]"
      />
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3.5 py-1 text-xs font-medium text-foreground/85 backdrop-blur-md">
          <SparklesIcon className="size-3.5 text-(--apple-blue)" />
          macOS 27 & iOS 27 Responsive · @liqui-design/glass · Motion · shadcn Registry
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Apple Liquid UI
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          基于 shadcn/ui 构建的响应式 Apple Liquid Glass 组件库。桌面端遵循 macOS 27 交互与比例，移动端自动切换 iOS 27 触控形态，所有组件均可通过 shadcn Registry 一键安装。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            glass
            size="lg"
            nativeButton={false}
            render={<Link href="/docs/components/button" />}
          >
            <SparklesIcon />
            体验 Liquid Button
          </Button>
          <Button
            variant="secondary"
            glass
            size="lg"
            nativeButton={false}
            render={<Link href="/docs" />}
          >
            浏览文档
          </Button>
        </div>
      </div>
    </main>
  );
}
