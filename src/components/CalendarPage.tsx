import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_HEADERS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface Holiday {
  date: string;
  localName: string;
  name: string;
}

// key: "YYYY-MM-DD" → holiday name
type HolidayMap = Record<string, string>;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function MonthGrid({
  year,
  month,
  holidays,
}: {
  year: number;
  month: number;
  holidays: HolidayMap;
}) {
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <h3 className="text-sm font-semibold text-foreground mb-2 text-center">
        {MONTH_NAMES[month]}
      </h3>
      <div className="grid grid-cols-7 gap-px text-center">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const isToday = isCurrentMonth && day === today.getDate();
          const dateKey = day
            ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : null;
          const holidayName = dateKey ? holidays[dateKey] : null;

          const cellContent = (
            <div
              className={`text-xs py-1 rounded ${
                day === null
                  ? ""
                  : isToday
                  ? "bg-primary text-primary-foreground font-bold"
                  : holidayName
                  ? "bg-destructive/20 text-destructive font-semibold hover:bg-destructive/30 cursor-pointer"
                  : "text-foreground hover:bg-muted/50 cursor-pointer"
              }`}
            >
              {day ?? ""}
            </div>
          );

          if (holidayName) {
            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {holidayName}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={i}>{cellContent}</div>;
        })}
      </div>
    </div>
  );
}

export function CalendarPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<HolidayMap>({});
  const [holidayList, setHolidayList] = useState<Holiday[]>([]);

  useEffect(() => {
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/US`)
      .then((res) => res.json())
      .then((data: Holiday[]) => {
        const map: HolidayMap = {};
        const uniqueByDate = new Map<string, Holiday>();
        [...data]
          .sort((a, b) => a.date.localeCompare(b.date))
          .forEach((h) => {
            if (!uniqueByDate.has(h.date)) uniqueByDate.set(h.date, h);
          });
        const sorted = Array.from(uniqueByDate.values());
        sorted.forEach((h) => {
          map[h.date] = h.localName;
        });
        setHolidays(map);
        setHolidayList(sorted);
      })
      .catch(() => {
        setHolidays({});
        setHolidayList([]);
      });
  }, [year]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y - 1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-foreground">{year}</h2>
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y + 1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col xl:flex-row gap-4">
          {/* Calendar grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <MonthGrid key={i} year={year} month={i} holidays={holidays} />
            ))}
          </div>

          {/* Holiday sidebar */}
          <div className="xl:w-72 shrink-0">
            <div className="bg-card border border-border rounded-lg p-4 sticky top-4">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Feriados dos EUA</h3>
              </div>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-2 pr-3">
                  {holidayList.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum feriado encontrado.</p>
                  ) : (
                    holidayList.map((h) => {
                      const [, m, d] = h.date.split("-");
                      return (
                        <div
                          key={h.date}
                          className="flex items-start gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
                        >
                          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap mt-0.5">
                            {d}/{m}
                          </span>
                          <span className="text-xs text-foreground leading-snug">{h.name}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
