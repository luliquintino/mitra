'use client';

import { cn } from '@/lib/utils';

interface CalendarMonthProps {
  month: number; // 0-11
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

const WEEKDAY_HEADERS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

function getCalendarDays(month: number, year: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start
  const grid: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function CalendarMonth({
  month,
  year,
  events,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}: CalendarMonthProps) {
  const days = getCalendarDays(month, year);
  const now = new Date();
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  // Build a map of date -> events for quick lookup
  const eventsByDate = new Map<string, { color?: string; label?: string }[]>();
  events.forEach((ev) => {
    const existing = eventsByDate.get(ev.date) || [];
    existing.push(ev);
    eventsByDate.set(ev.date, existing);
  });

  const handlePrev = () => {
    if (month === 0) {
      onChangeMonth(11, year - 1);
    } else {
      onChangeMonth(month - 1, year);
    }
  };

  const handleNext = () => {
    if (month === 11) {
      onChangeMonth(0, year + 1);
    } else {
      onChangeMonth(month + 1, year);
    }
  };

  return (
    <div className="bg-creme-dark rounded-xl p-6 md:p-8">
      {/* Header: prev / month year / next */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-white text-coral shadow-sm hover:scale-110 transition-transform flex items-center justify-center"
          aria-label="Mês anterior"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h3 className="font-headline font-bold text-2xl text-coral">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-white text-coral shadow-sm hover:scale-110 transition-transform flex items-center justify-center"
          aria-label="Próximo mês"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_HEADERS.map((d) => (
          <div key={d} className="text-center font-headline font-bold text-azul opacity-60 text-sm uppercase tracking-widest py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-10" />;
          }

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
                'flex flex-col items-center justify-center h-10 relative rounded-lg transition-all p-1 text-center',
                isSelected
                  ? 'bg-coral-light rounded-lg ring-4 ring-coral-light ring-offset-2 ring-offset-creme-dark'
                  : 'bg-white/50 hover:bg-white cursor-pointer',
              )}
            >
              <span
                className={cn(
                  'w-7 h-7 flex items-center justify-center text-xs rounded-full transition-colors',
                  isSelected
                    ? 'font-headline font-bold text-coral'
                    : isToday
                      ? 'bg-coral-light font-headline font-bold text-coral'
                      : 'font-headline font-bold text-coral',
                )}
              >
                {day}
              </span>
              {/* Event dots */}
              {hasEvents && (
                <div className="flex items-center gap-0.5 absolute bottom-0">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <span
                      key={i}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        ev.color || 'bg-coral',
                      )}
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
