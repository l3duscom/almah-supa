import { format } from "date-fns";

/**
 * Utilitários para lidar com datas de forma consistente
 * usando UTC como base e aplicando offset local quando necessário
 */

/**
 * Obtém a data local atual no formato yyyy-MM-dd
 * Funciona tanto no servidor (UTC) quanto no cliente (timezone local)
 * Especificamente ajustado para timezone do Brasil (GMT-3)
 */
export function getTodayDateString(): string {
  const now = new Date();
  
  // Detecta se está no servidor (Node.js) ou cliente (browser)
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    // No servidor: aplica manualmente o offset do Brasil (GMT-3 = -180 minutos)
    const brazilOffset = -3 * 60; // GMT-3 em minutos
    const brazilTime = new Date(now.getTime() + (brazilOffset * 60 * 1000));
    
    const year = brazilTime.getUTCFullYear();
    const month = String(brazilTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(brazilTime.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } else {
    // No cliente: usa métodos nativos que já consideram timezone local
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
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