"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import { format, subDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DiaryNavigationProps {
  currentDate: string;
}

export default function DiaryNavigation({ currentDate }: DiaryNavigationProps) {
  const date = new Date(currentDate);
  const yesterday = subDays(date, 1);
  const tomorrow = addDays(date, 1);
  const today = new Date();
  
  const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
  const isFuture = date > today;

  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <Button asChild variant="outline" size="sm">
        <Link href={`/app/diario?date=${format(yesterday, "yyyy-MM-dd")}`}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {format(yesterday, "dd/MM")}
        </Link>
      </Button>

      <div className="flex items-center gap-2 px-4">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">
          {isToday ? "Hoje" : format(date, "dd 'de' MMMM", { locale: ptBR })}
        </span>
      </div>

      <Button 
        asChild 
        variant="outline" 
        size="sm"
        disabled={isFuture}
        className={isFuture ? "opacity-50 cursor-not-allowed" : ""}
      >
        <Link 
          href={isFuture ? "#" : `/app/diario?date=${format(tomorrow, "yyyy-MM-dd")}`}
          className={isFuture ? "pointer-events-none" : ""}
        >
          {format(tomorrow, "dd/MM")}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </Button>
    </div>
  );
}