import { mockLogs, type DailyCarbonLog, type Category } from "./mockCarbonData";

export type PeriodType = "Day" | "Week" | "Month" | "Year";

// Get logs filtered by period window
function getLogsForPeriod(period: PeriodType): DailyCarbonLog[] {
  const today = new Date();
  const start = new Date(today);

  if (period === "Day") {
    // only today
    start.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return mockLogs.filter(l => l.date === todayStr);
  }

  if (period === "Week") {
    // last 7 days
    start.setDate(today.getDate() - 6);
  } else if (period === "Month") {
    // last 30 days
    start.setDate(today.getDate() - 29);
  } else if (period === "Year") {
    // approximate last 365 days -> use all available logs (mock)
    start.setFullYear(today.getFullYear() - 1);
  }

  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const endStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return mockLogs.filter(l => l.date >= startStr && l.date <= endStr);
}

export function getTotalCarbon(period: PeriodType): number {
  const logs = getLogsForPeriod(period);
  const total = logs.reduce((sum, log) => {
    return sum + Object.values(log.values).reduce((s, v) => s + v, 0);
  }, 0);
  // round to one decimal like 22.4
  return Math.round(total * 10) / 10;
}

export function getCategoryRatio(period: PeriodType): Record<Category, number> {
  const logs = getLogsForPeriod(period);
  const totals: Record<Category, number> = {
    traffic: 0,
    shopping: 0,
    living: 0,
    food: 0,
    phone: 0,
  };
  logs.forEach(log => {
    (Object.keys(totals) as Category[]).forEach(cat => {
      totals[cat] += log.values[cat] || 0;
    });
  });

  const totalAll = (Object.values(totals) as number[]).reduce((s, v) => s + v, 0) || 1;
  const ratios: Record<Category, number> = {
    traffic: Math.round((totals.traffic / totalAll) * 100),
    shopping: Math.round((totals.shopping / totalAll) * 100),
    living: Math.round((totals.living / totalAll) * 100),
    food: Math.round((totals.food / totalAll) * 100),
    phone: Math.round((totals.phone / totalAll) * 100),
  };
  return ratios;
}

export function getCoachMessage(period: PeriodType): string {
  const ratios = getCategoryRatio(period);
  const entries = Object.entries(ratios) as [Category, number][];
  const top = entries.sort((a, b) => b[1] - a[1])[0];

  const catLabel: Record<Category, string> = {
    traffic: "교통",
    shopping: "쇼핑",
    living: "생활",
    food: "식품",
    phone: "휴대폰",
  };

  const periodLabel: Record<PeriodType, string> = {
    Day: "오늘",
    Week: "이번 주",
    Month: "이번 달",
    Year: "올해",
  };

  return `${periodLabel[period]}에는 ${catLabel[top[0]]}에서 가장 많이 감축했어요!`;
}
