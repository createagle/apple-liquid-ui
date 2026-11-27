'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRightIcon,
  HashIcon,
  LayoutGridIcon,
  Loader2Icon,
  RocketIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import type { SharedProps } from 'fumadocs-ui/components/dialog/search';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import {
  useHighlightQuery,
  useStaticSearch,
  type SearchResultItem,
  type SearchResultRecord,
  type SearchResultTable,
} from 'fumadocs-core/search/client';
import { toJsx, type ToJsxOptions } from 'fumadocs-core/utils/hast-to-jsx';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { cn } from 'cn';

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

type CustomTagProps = {
  tagName?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
};

function SearchCustomTag({ tagName, children, ...rest }: CustomTagProps) {
  const entries = Object.entries(rest).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string'
  );

  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-md border border-black/[0.08] bg-black/[0.03] px-1.5 py-0.5 text-xs text-foreground dark:border-white/[0.1] dark:bg-white/[0.06]">
      {tagName && (
        <code className="rounded bg-(--apple-blue)/15 px-1 py-0.25 font-mono text-[11px] font-medium text-(--apple-blue)">
          {tagName}
        </code>
      )}
      {entries.map(([k, v]) => (
        <span key={k} className="inline-flex min-w-0 items-center gap-0.5 truncate text-muted-foreground">
          <span className="font-mono text-[11px] text-foreground/75">{k}:</span>
          <span className="truncate">{v}</span>
        </span>
      ))}
      {children ? <span className="ps-0.5">{children}</span> : null}
    </span>
  );
}

const searchMdComponents = {
  mark(props: React.ComponentProps<'span'>) {
    return (
      <span
        {...props}
        className="rounded-xs bg-(--apple-blue)/15 text-(--apple-blue) underline"
      />
    );
  },
  a: 'span' as const,
  p({ className, ...props }: React.ComponentProps<'p'>) {
    return (
      <p
        {...props}
        className={cn('m-0 min-w-0 leading-relaxed', className)}
      />
    );
  },
  strong({ className, ...props }: React.ComponentProps<'strong'>) {
    return (
      <strong
        {...props}
        className={cn('font-semibold text-foreground', className)}
      />
    );
  },
  code({ className, ...props }: React.ComponentProps<'code'>) {
    return (
      <code
        {...props}
        className={cn(
          'rounded-[5px] border border-black/[0.07] bg-black/[0.055] px-1.25 py-0.25 font-mono text-[0.86em] font-medium text-foreground/95',
          'dark:border-white/[0.1] dark:bg-white/[0.1] dark:text-white/95',
          className
        )}
      />
    );
  },
  pre({ className, ...props }: React.ComponentProps<'pre'>) {
    return (
      <pre
        {...props}
        className={cn(
          'my-1 flex max-h-20 flex-col overflow-hidden rounded-lg border border-black/[0.08] bg-black/[0.04] p-2 font-mono text-xs text-foreground/85',
          'dark:border-white/[0.1] dark:bg-white/[0.06]',
          '*:mask-[linear-gradient(to_bottom,white,white_30px,transparent_76px)]',
          '[&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:font-normal',
          className
        )}
      />
    );
  },
  custom: SearchCustomTag,
} as ToJsxOptions['components'];

const renderOptions: ToJsxOptions = {
  components: searchMdComponents,
};

function PassThrough({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function TableCell({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('min-w-0 not-last:truncate last:line-clamp-2', className)}
    />
  );
}

const tableRenderOptions: ToJsxOptions = {
  components: {
    ...searchMdComponents,
    table: PassThrough,
    thead: PassThrough,
    tbody: PassThrough,
    tr: PassThrough,
    th: TableCell,
    td: TableCell,
  } as ToJsxOptions['components'],
};

const rowRenderOptions: ToJsxOptions = {
  components: {
    ...tableRenderOptions.components,
    thead: () => null,
  } as ToJsxOptions['components'],
};

interface SearchPageSection {
  key: string;
  items: SearchResultItem[];
}

function groupSearchItemsByPage(items: SearchResultItem[]): SearchPageSection[] {
  const sections: SearchPageSection[] = [];
  for (const item of items) {
    if (item.type === 'page' || sections.length === 0) {
      sections.push({ key: item.id, items: [item] });
    } else {
      sections[sections.length - 1].items.push(item);
    }
  }
  return sections;
}

function getFirstSelectableValue(items: SearchResultItem[]): string {
  for (const item of items) {
    if (item.type === 'table') {
      if (item.rows[0]) return item.rows[0].id;
    } else {
      return item.id;
    }
  }
  return '';
}

function SearchResultRow({
  item,
  query,
  onSelect,
}: {
  item: SearchResultRecord;
  query: string;
  onSelect: (url: string) => void;
}) {
  const highlightRef = useHighlightQuery(query);
  const content = React.useMemo(
    () =>
      'hastContent' in item && item.hastContent
        ? toJsx(item.hastContent, renderOptions)
        : item.content,
    [item]
  );

  const isPage = item.type === 'page';
  const isHeading = item.type === 'heading';
  const isText = item.type === 'text';

  return (
    <CommandItem
      value={item.id}
      selectionTone="subtle"
      onSelect={() => onSelect(item.url)}
      className={cn(
        'relative min-h-0 w-full flex-col items-stretch gap-0.5 rounded-[11px] px-3 py-2 text-left text-[13.5px] md:px-2.5 md:py-2',
        isPage && 'pt-2 pb-1.5'
      )}
    >
      {!isPage && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-s-3.5 inset-y-0 w-px bg-black/[0.12] dark:bg-white/[0.15]"
        />
      )}

      {isPage && item.breadcrumbs && item.breadcrumbs.length > 0 && (
        <div className="mb-0.5 flex flex-wrap items-center gap-0.5 text-[11.5px] font-normal text-muted-foreground/85">
          {item.breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb}-${index}`}>
              {index > 0 && (
                <ChevronRightIcon className="size-3 shrink-0 text-muted-foreground/65" />
              )}
              <span>{crumb}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      {isHeading && (
        <HashIcon
          aria-hidden="true"
          className="pointer-events-none absolute inset-s-6 top-2.5 size-3.5 text-muted-foreground/80"
        />
      )}

      <div
        key={`${query}-${item.id}`}
        ref={highlightRef}
        className={cn(
          'min-w-0 break-words',
          isText && 'ps-4 text-[13px] leading-relaxed text-foreground/80',
          isHeading && 'ps-7.5 text-[13.5px] font-medium text-foreground',
          isPage && 'text-[14px] font-semibold tracking-[-0.01em] text-foreground'
        )}
      >
        {content}
      </div>
    </CommandItem>
  );
}

function SearchResultTableRow({
  row,
  table,
  query,
  onSelect,
}: {
  row: SearchResultRecord;
  table: SearchResultTable;
  query: string;
  onSelect: (url: string) => void;
}) {
  const highlightRef = useHighlightQuery(query);
  const content = React.useMemo(
    () =>
      toJsx(
        row.hastContent,
        table.header ? rowRenderOptions : tableRenderOptions
      ),
    [row.hastContent, table.header]
  );

  return (
    <CommandItem
      value={row.id}
      selectionTone="subtle"
      onSelect={() => onSelect(row.url)}
      className="col-span-full grid min-h-0 grid-cols-subgrid items-baseline gap-x-3 rounded-none px-3 py-2 text-[12.5px] not-first:border-t not-first:border-black/[0.06] dark:not-first:border-white/[0.08]"
    >
      <div
        key={`${query}-${row.id}`}
        ref={highlightRef}
        className={cn(
          'contents',
          !table.header &&
            '*:first:font-medium *:first:text-foreground *:nth-2:text-xs *:not-first:text-muted-foreground'
        )}
      >
        {content}
      </div>
    </CommandItem>
  );
}

function SearchResultTableBlock({
  table,
  query,
  onSelect,
}: {
  table: SearchResultTable;
  query: string;
  onSelect: (url: string) => void;
}) {
  const highlightRef = useHighlightQuery(query);
  const header = React.useMemo(
    () => (table.header ? toJsx(table.header, tableRenderOptions) : null),
    [table.header]
  );

  return (
    <div className="relative ms-3.5 border-s border-black/[0.12] py-1.5 ps-3.5 pe-1 dark:border-white/[0.15]">
      <div
        className="grid gap-x-3 overflow-hidden rounded-xl border border-black/[0.08] bg-black/[0.025] text-[12.5px] dark:border-white/[0.1] dark:bg-white/[0.04]"
        style={{
          gridTemplateColumns: `${'fit-content(30%) '.repeat(Math.max(0, table.columns - 1))}minmax(30%, 1fr)`,
        }}
      >
        {header && (
          <div
            key={`${query}-${table.id}-header`}
            ref={highlightRef}
            aria-hidden="true"
            className="col-span-full grid grid-cols-subgrid border-b border-black/[0.06] bg-black/[0.035] px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.05]"
          >
            {header}
          </div>
        )}
        {table.rows.map((row) => (
          <SearchResultTableRow
            key={row.id}
            row={row}
            table={table}
            query={query}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default function DefaultSearchDialog({
  open,
  onOpenChange,
}: SharedProps) {
  const router = useRouter();
  const { locale } = useI18n();
  const [selectedValue, setSelectedValue] = React.useState('');
  const search = useStaticSearch({
    from: withBasePath('/api/search'),
    locale,
    delayMs: 50,
  });

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) {
        search.onSearchChange('');
        setSelectedValue('');
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
  const activeQuery = search.data?.query ?? search.search;
  const items = search.data?.items ?? [];
  const sections = React.useMemo(
    () => groupSearchItemsByPage(items),
    [items]
  );

  React.useEffect(() => {
    if (!hasQuery) {
      setSelectedValue(QUICK_LINKS[0].url);
      return;
    }
    const first = getFirstSelectableValue(items);
    if (first) {
      setSelectedValue(first);
    }
  }, [activeQuery, hasQuery, items]);

  const inputEndAdornment = (
    <div className="flex shrink-0 items-center gap-1.5">
      {search.isLoading && hasQuery && (
        <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
      )}
      {hasQuery && (
        <button
          type="button"
          aria-label="清空搜索关键词"
          onClick={() => search.onSearchChange('')}
          className="inline-flex size-5 items-center justify-center rounded-full bg-black/[0.08] text-muted-foreground transition-colors hover:bg-black/[0.14] hover:text-foreground dark:bg-white/[0.14] dark:hover:bg-white/[0.22]"
        >
          <XIcon className="size-3" />
        </button>
      )}
      <Kbd className="hidden md:inline-flex">ESC</Kbd>
    </div>
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="搜索文档"
      description="搜索组件名称、中文关键词或文档内容"
      className="md:max-w-[640px]"
    >
      <Command
        shouldFilter={false}
        value={selectedValue}
        onValueChange={setSelectedValue}
      >
        <CommandInput
          value={search.search}
          onValueChange={search.onSearchChange}
          placeholder="搜索组件、属性或文档内容…"
          endAdornment={inputEndAdornment}
        />
        <CommandList className="max-h-[62dvh] md:max-h-[460px]">
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
          ) : sections.length > 0 ? (
            <div
              data-slot="docs-search-results"
              className="flex flex-col gap-2.5 py-0.5 md:gap-1.5"
            >
              {sections.map((section) => (
                <div
                  key={section.key}
                  className="flex flex-col rounded-2xl bg-black/[0.035] p-1 dark:bg-white/[0.05] md:rounded-none md:bg-transparent md:p-0 md:dark:bg-transparent"
                >
                  {section.items.map((item) =>
                    item.type === 'table' ? (
                      <SearchResultTableBlock
                        key={item.id}
                        table={item}
                        query={activeQuery}
                        onSelect={handleSelectUrl}
                      />
                    ) : (
                      <SearchResultRow
                        key={item.id}
                        item={item}
                        query={activeQuery}
                        onSelect={handleSelectUrl}
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          ) : search.isLoading && !search.data ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
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
      variant="ghost"
      size="sm"
      onClick={() => setOpenSearch(true)}
      className="h-9 w-full justify-between rounded-full border border-black/[0.06] bg-black/[0.035] px-3 text-muted-foreground shadow-none transition-colors hover:bg-black/[0.065] hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] md:h-9 md:px-3"
    >
      <span className="inline-flex items-center gap-2 truncate">
        <SearchIcon className="size-3.5 shrink-0 opacity-75" />
        <span className="truncate text-[13px] font-normal">搜索文档…</span>
      </span>
      <Kbd className="ml-auto shrink-0 border-0 bg-black/[0.06] text-[11px] dark:bg-white/[0.1]">
        ⌘K
      </Kbd>
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
