'use client';
import SearchDialog from '@/components/search';
import { PreviewSettingsProvider } from '@/components/preview-settings';
import { LiquidGlassProvider } from '@/components/ui/liquid-glass-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

export function Provider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Standalone demo viewport embedded by the docs device-frame iframes: docs search (⌘K / Ctrl+K)
  // belongs to the host page only, so the iframe must not mount its own search dialog / hotkey.
  const isPreviewRoute = pathname?.startsWith('/preview/') ?? false;

  return (
    <LiquidGlassProvider>
      <RootProvider
        search={isPreviewRoute ? { enabled: false } : { SearchDialog }}
      >
        <PreviewSettingsProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </PreviewSettingsProvider>
      </RootProvider>
    </LiquidGlassProvider>
  );
}
