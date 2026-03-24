'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarMonthProps {
  month: number;
  year: number;
  events: { date: string; color?: string; label?: string }[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onChangeMonth: (month: number, year: number) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const WEEKDAY_HEADERS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function getCalendarDays(month: number, year: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const grid: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function pad(n: number): string { return n < 10 ? `0${n}` : `${n}`; }
function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function CalendarMonth({
  month, year, events, selectedDate, onSelectDate, onChangeMonth,
}: CalendarMonthProps) {
  const days = getCalendarDays(month, year);
  const now = new Date();
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  const eventsByDate = new Map<string, { color?: string; label?: string }[]>();
  events.forEach((ev) => {
    const existing = eventsByDate.get(ev.date) || [];
    existing.push(ev);
    eventsByDate.set(ev.date, existing);
  });

  const handlePrev = () => {
    if (month === 0) onChangeMonth(11, year - 1);
    else onChangeMonth(month - 1, year);
  };
  const handleNext = () => {
    if (month === 11) onChangeMonth(0, year + 1);
    else onChangeMonth(month + 1, year);
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          className="w-9 h-9 rounded-xl bg-white text-primary shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-headline font-bold text-lg text-primary">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button
          onClick={handleNext}
          className="w-9 h-9 rounded-xl bg-white text-primary shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_HEADERS.map((d) => (
          <div key={d} className="text-center font-headline font-medium text-texto-muted text-[11px] uppercase tracking-widest py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="h-10" />;

          const dateStr = toDateStr(year, month, day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayEvents = eventsByDate.get(dateStr);
          const hasEvents = dayEvents && dayEvents.length > 0;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                'flex flex-col items-center justify-center h-10 relative rounded-xl transition-all p-1',
                isSelected
                  ? 'bg-primary/10 ring-2 ring-primary/30'
                  : 'hover:bg-primary/5 cursor-pointer',
              )}
            >
              <span
                className={cn(
                  'w-7 h-7 flex items-center justify-center text-xs rounded-lg transition-colors font-headline',
                  isSelected
                    ? 'font-bold text-primary'
                    : isToday
                      ? 'bg-primary text-white font-bold rounded-lg'
                      : 'font-medium text-texto',
                )}
              >
                {day}
              </span>
              {hasEvents && (
                <div className="flex items-center gap-0.5 absolute bottom-0.5">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <span
                      key={i}
                      className={cn('w-1.5 h-1.5 rounded-full', ev.color || 'bg-primary')}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
