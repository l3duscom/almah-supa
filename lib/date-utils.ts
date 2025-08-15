import { format } from "date-fns";

/**
 * Utilitários para lidar com datas de forma consistente
 * usando UTC como base e aplicando offset local quando necessário
 */

/**
 * Obtém a data local atual no formato yyyy-MM-dd
 * Usa UTC como base e aplica o offset do timezone local
 */
export function getTodayDateString(): string {
  const now = new Date();
  
  // Pega o offset do timezone local em minutos
  const timezoneOffset = now.getTimezoneOffset();
  
  // Cria uma nova data ajustando pelo offset (convertendo para timezone local)
  const localDate = new Date(now.getTime() - (timezoneOffset * 60 * 1000));
  
  return format(localDate, "yyyy-MM-dd");
}

/**
 * Obtém uma data no formato yyyy-MM-dd baseada em UTC
 * Útil para consistência no servidor
 */
export function getUTCDateString(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Converte uma string de data (yyyy-MM-dd) para Date object
 * assumindo timezone local
 */
export function parseLocalDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Verifica se uma data string é "hoje" considerando timezone local
 */
export function isToday(dateString: string): boolean {
  const today = getTodayDateString();
  
  // Debug log
  console.log("🗓️ Date comparison:", {
    dateString,
    today,
    isEqual: dateString === today,
    timezoneOffset: new Date().getTimezoneOffset(),
    utcNow: new Date().toISOString(),
    localNow: new Date().toLocaleString()
  });
  
  return dateString === today;
}

/**
 * Obtém data de ontem/amanhã baseada numa data string
 */
export function getRelativeDate(dateString: string, days: number): string {
  const date = parseLocalDateString(dateString);
  const newDate = new Date(date.getTime() + (days * 24 * 60 * 60 * 1000));
  return format(newDate, "yyyy-MM-dd");
}