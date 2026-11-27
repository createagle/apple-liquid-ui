'use client';

import * as React from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';

const FRAMEWORKS = [
  'Next.js',
  'React 19',
  'Tailwind CSS v4',
  'Base UI',
  'Motion',
  'Fumadocs',
] as const;

export function ComboboxLiquidHeroDemo() {
  const [value, setValue] = React.useState<string | null>('Next.js');

  return (
    <div className="flex w-full max-w-xs flex-col gap-2.5">
      <Combobox
        items={FRAMEWORKS}
        value={value}
        onValueChange={(next) => setValue(next)}
      >
        <ComboboxInput placeholder="搜索或选择技术栈…" showClear />
        <ComboboxContent>
          <ComboboxEmpty>未找到匹配项</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p className="px-1 text-xs text-muted-foreground">
        当前已选：{value ?? '未选择'}
      </p>
    </div>
  );
}

const DEVICES = [
  'MacBook Pro 16"',
  'iPhone 17 Pro',
  'iPad Pro M5',
  'Apple Vision Pro',
  'Studio Display',
  'AirPods Max',
] as const;

export function ComboboxMultipleDemo() {
  const anchor = useComboboxAnchor();
  const [values, setValues] = React.useState<string[]>([
    'MacBook Pro 16"',
    'iPhone 17 Pro',
  ]);

  return (
    <div className="w-full max-w-sm">
      <Combobox
        multiple
        items={DEVICES}
        value={values}
        onValueChange={(next) => setValues(next)}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(selected: string[]) => (
              <>
                {selected.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder={selected.length === 0 ? '搜索并添加同步设备…' : ''}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>未找到对应设备</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

interface TimezoneGroup {
  value: string;
  items: string[];
}

const TIMEZONE_GROUPS: TimezoneGroup[] = [
  {
    value: '亚洲',
    items: ['上海 (UTC+8)', '新加坡 (UTC+8)', '东京 (UTC+9)'],
  },
  {
    value: '美洲',
    items: ['库比蒂诺 (UTC-8)', '纽约 (UTC-5)'],
  },
  {
    value: '欧洲',
    items: ['伦敦 (UTC+0)', '苏黎世 (UTC+1)'],
  },
];

export function ComboboxGroupedDemo() {
  const [tz, setTz] = React.useState<string | null>('新加坡 (UTC+8)');

  return (
    <div className="w-full max-w-xs">
      <Combobox
        items={TIMEZONE_GROUPS}
        value={tz}
        onValueChange={(next) => setTz(next)}
      >
        <ComboboxInput placeholder="搜索城市或时区…" showClear />
        <ComboboxContent>
          <ComboboxEmpty>未找到匹配的时区</ComboboxEmpty>
          <ComboboxList>
            {(group: TimezoneGroup) => (
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
