"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getTodayDateString, getRelativeDate, parseLocalDateString } from "@/lib/date-utils";

interface DiaryNavigationProps {
  currentDate: string;
}

export default function DiaryNavigation({ currentDate }: DiaryNavigationProps) {
  const yesterday = getRelativeDate(currentDate, -1);
  const tomorrow = getRelativeDate(currentDate, 1);
  const today = getTodayDateString();
  
  const isToday = currentDate === today;
  const currentDateObj = parseLocalDateString(currentDate);
  const todayObj = parseLocalDateString(today);
  const isFuture = currentDateObj > todayObj;

  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <Button asChild variant="outline" size="sm">
        <Link href={`/app/diario?date=${yesterday}`}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {format(parseLocalDateString(yesterday), "dd/MM")}
        </Link>
      </Button>

      <div className="flex items-center gap-2 px-4">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">
          {isToday ? "Hoje" : format(currentDateObj, "dd 'de' MMMM", { locale: ptBR })}
        </span>
      </div>

      {!isFuture ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/app/diario?date=${tomorrow}`}>
            {format(parseLocalDateString(tomorrow), "dd/MM")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          disabled
          className="opacity-50 cursor-not-allowed"
        >
          {format(parseLocalDateString(tomorrow), "dd/MM")}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
}