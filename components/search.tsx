'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  FileTextIcon,
  HashIcon,
  LayoutGridIcon,
  Loader2Icon,
  RocketIcon,
  SearchIcon,
  SparklesIcon,
  TextIcon,
} from 'lucide-react';
import type { SharedProps } from 'fumadocs-ui/components/dialog/search';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useStaticSearch } from 'fumadocs-core/search/client';
import { useI18n } from 'fumadocs-ui/contexts/i18n';

import { withBasePath } from '@/lib/shared';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

const QUICK_LINKS = [
  {
    title: '快速开始',
    url: '/docs',
    icon: RocketIcon,
  },
  {
    title: 'Liquid Glass 通透度',
    url: '/docs/liquid-glass',
    icon: SparklesIcon,
  },
  {
    title: '组件总览',
    url: '/docs/components',
    icon: LayoutGridIcon,
  },
] as const;

export default function DefaultSearchDialog({
  open,
  onOpenChange,
}: SharedProps) {
  const router = useRouter();
  const { locale } = useI18n();
  const search = useStaticSearch({
    from: withBasePath('/api/search'),
    locale,
    delayMs: 50,
  });

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) {
        search.onSearchChange('');
      }
      onOpenChange(next);
    },
    [onOpenChange, search.onSearchChange]
  );

  const handleSelectUrl = React.useCallback(
    (url: string) => {
      router.push(url);
      handleOpenChange(false);
    },
    [handleOpenChange, router]
  );

  const hasQuery = search.search.trim().length > 0;
  const results = React.useMemo(
    () =>
      (search.data?.items ?? []).flatMap((item) =>
        item.type === 'table' ? item.rows : [item]
      ),
    [search.data]
  );
  const pageResults = results.filter((item) => item.type === 'page');
  const sectionResults = results.filter((item) => item.type !== 'page');

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="搜索文档"
      description="搜索组件名称、中文关键词或文档内容"
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={search.search}
          onValueChange={search.onSearchChange}
          placeholder="搜索组件、属性或文档内容…"
        />
        <CommandList className="h-[48dvh] md:h-80">
          {!hasQuery ? (
            <CommandGroup heading="快速跳转">
              {QUICK_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.url}
                    value={item.url}
                    onSelect={() => handleSelectUrl(item.url)}
                  >
                    <Icon />
                    <span>{item.title}</span>
                    <CommandShortcut>↵</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : results.length > 0 ? (
            <>
              {pageResults.length > 0 && (
                <CommandGroup heading="页面">
                  {pageResults.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.id}-${item.content}`}
                      onSelect={() => handleSelectUrl(item.url)}
                    >
                      <FileTextIcon />
                      <span className="truncate">{item.content}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {pageResults.length > 0 && sectionResults.length > 0 && (
                <CommandSeparator />
              )}
              {sectionResults.length > 0 && (
                <CommandGroup heading="章节与内容">
                  {sectionResults.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.id}-${item.content}`}
                      onSelect={() => handleSelectUrl(item.url)}
                    >
                      {item.type === 'heading' ? <HashIcon /> : <TextIcon />}
                      <span className="truncate">{item.content}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          ) : search.isLoading && !search.data ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              <span>正在检索文档…</span>
            </div>
          ) : search.error ? (
            <CommandEmpty>检索失败，请稍后重试</CommandEmpty>
          ) : (
            <CommandEmpty>未找到与“{search.search}”相关的文档</CommandEmpty>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function SidebarSearchTrigger() {
  const { setOpenSearch, enabled } = useSearchContext();
  if (!enabled) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => setOpenSearch(true)}
      className="h-9 w-full justify-between px-3 text-muted-foreground md:h-9"
    >
      <span className="inline-flex items-center gap-2 truncate">
        <SearchIcon className="size-3.5 shrink-0" />
        <span className="truncate text-[13px] font-normal">搜索文档…</span>
      </span>
      <Kbd className="ml-auto shrink-0">⌘K</Kbd>
    </Button>
  );
}

export function MobileSearchTrigger() {
  const { setOpenSearch, enabled } = useSearchContext();
  if (!enabled) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="搜索文档"
      onClick={() => setOpenSearch(true)}
      className="text-muted-foreground"
    >
      <SearchIcon className="size-4" />
    </Button>
  );
}

