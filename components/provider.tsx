'use client';
import SearchDialog from '@/components/search';
import { PreviewSettingsProvider } from '@/components/preview-settings';
import { LiquidGlassProvider } from '@/components/ui/liquid-glass-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { type ReactNode } from 'react';

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider search={{ SearchDialog }}>
      <LiquidGlassProvider>
        <PreviewSettingsProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </PreviewSettingsProvider>
      </LiquidGlassProvider>
    </RootProvider>
  );
}
