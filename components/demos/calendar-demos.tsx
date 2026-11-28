'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { zhCN } from 'react-day-picker/locale';

import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function CalendarLiquidHeroDemo() {
  const [date, setDate] = React.useState<Date | undefined>(
    () => new Date(2026, 10, 18)
  );

  const formattedDate = date
    ? date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : '未选择日期';

  return (
    <div className="flex flex-col items-center gap-3.5">
      <Calendar
        mode="single"
        locale={zhCN}
        defaultMonth={new Date(2026, 10, 1)}
        selected={date}
        onSelect={setDate}
      />
      <p className="rounded-full bg-background/75 px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground shadow-xs backdrop-blur-md">
        已选日期：{formattedDate}
      </p>
    </div>
  );
}

export function CalendarRangeDemo() {
  const isMobile = useIsMobile();
  const [range, setRange] = React.useState<DateRange | undefined>(() => ({
    from: new Date(2026, 10, 10),
    to: new Date(2026, 10, 16),
  }));

  const summary =
    range?.from && range?.to
      ? `${range.from.toLocaleDateString('zh-CN')} — ${range.to.toLocaleDateString('zh-CN')}`
      : range?.from
        ? `起：${range.from.toLocaleDateString('zh-CN')}（请选择结束日期）`
        : '点击任意起止日期选择行程区间';

  return (
    <div className="flex flex-col items-center gap-3.5">
      <Calendar
        mode="range"
        locale={zhCN}
        defaultMonth={new Date(2026, 10, 1)}
        selected={range}
        onSelect={setRange}
        numberOfMonths={isMobile ? 1 : 2}
      />
      <p className="rounded-full bg-background/75 px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground shadow-xs backdrop-blur-md">
        {summary}
      </p>
    </div>
  );
}

export function CalendarDropdownDemo() {
  const [date, setDate] = React.useState<Date | undefined>(
    () => new Date(2026, 5, 12)
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <Calendar
        mode="single"
        locale={zhCN}
        captionLayout="dropdown"
        defaultMonth={date}
        selected={date}
        onSelect={setDate}
        startMonth={new Date(2020, 0)}
        endMonth={new Date(2030, 11)}
      />
    </div>
  );
}

export function CalendarDatePickerDemo() {
  const [date, setDate] = React.useState<Date | undefined>(
    () => new Date(2026, 10, 28)
  );
  const [open, setOpen] = React.useState(false);

  const label = date
    ? date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '选择日程日期';

  return (
    <div className="flex flex-col items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant="secondary" glass className="min-w-56 justify-start">
              <CalendarIcon className="size-4 text-(--apple-blue)" />
              <span>{label}</span>
            </Button>
          }
        />
        <PopoverContent
          align="center"
          mobileTitle="选择日程日期"
          className="w-auto p-3.5"
        >
          <Calendar
            mode="single"
            locale={zhCN}
            selected={date}
            defaultMonth={date}
            onSelect={(next) => {
              setDate(next);
              if (next) setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
