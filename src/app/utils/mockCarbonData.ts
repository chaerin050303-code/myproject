export type Category = "traffic" | "shopping" | "living" | "food" | "phone";

export interface DailyCarbonLog {
  date: string; // YYYY-MM-DD
  values: Record<Category, number>; // kgCO2 saved per category
}

// Simple helper to generate date strings relative to today
const dateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Mock logs for ~30 days
export const mockLogs: DailyCarbonLog[] = [
  { date: dateStr(0), values: { traffic: 0.8, shopping: 0.2, living: 0.1, food: 0.3, phone: 0.05 } },
  { date: dateStr(1), values: { traffic: 0.6, shopping: 0.1, living: 0.2, food: 0.2, phone: 0.04 } },
  { date: dateStr(2), values: { traffic: 0.7, shopping: 0.3, living: 0.1, food: 0.25, phone: 0.03 } },
  { date: dateStr(3), values: { traffic: 0.5, shopping: 0.2, living: 0.15, food: 0.2, phone: 0.02 } },
  { date: dateStr(4), values: { traffic: 0.9, shopping: 0.25, living: 0.1, food: 0.3, phone: 0.05 } },
  { date: dateStr(5), values: { traffic: 0.4, shopping: 0.15, living: 0.2, food: 0.18, phone: 0.02 } },
  { date: dateStr(6), values: { traffic: 0.6, shopping: 0.12, living: 0.22, food: 0.21, phone: 0.03 } },
  // Week 2
  { date: dateStr(7), values: { traffic: 0.7, shopping: 0.28, living: 0.12, food: 0.26, phone: 0.03 } },
  { date: dateStr(8), values: { traffic: 0.5, shopping: 0.18, living: 0.14, food: 0.2, phone: 0.02 } },
  { date: dateStr(9), values: { traffic: 0.8, shopping: 0.22, living: 0.16, food: 0.27, phone: 0.03 } },
  { date: dateStr(10), values: { traffic: 0.6, shopping: 0.2, living: 0.18, food: 0.23, phone: 0.03 } },
  { date: dateStr(11), values: { traffic: 0.9, shopping: 0.3, living: 0.12, food: 0.28, phone: 0.04 } },
  { date: dateStr(12), values: { traffic: 0.7, shopping: 0.25, living: 0.15, food: 0.22, phone: 0.03 } },
  { date: dateStr(13), values: { traffic: 0.6, shopping: 0.2, living: 0.2, food: 0.24, phone: 0.03 } },
  // Week 3
  { date: dateStr(14), values: { traffic: 0.8, shopping: 0.26, living: 0.18, food: 0.3, phone: 0.03 } },
  { date: dateStr(15), values: { traffic: 0.5, shopping: 0.15, living: 0.16, food: 0.22, phone: 0.02 } },
  { date: dateStr(16), values: { traffic: 0.7, shopping: 0.24, living: 0.14, food: 0.25, phone: 0.03 } },
  { date: dateStr(17), values: { traffic: 0.6, shopping: 0.2, living: 0.2, food: 0.21, phone: 0.02 } },
  { date: dateStr(18), values: { traffic: 0.9, shopping: 0.3, living: 0.12, food: 0.28, phone: 0.04 } },
  { date: dateStr(19), values: { traffic: 0.7, shopping: 0.25, living: 0.15, food: 0.22, phone: 0.03 } },
  { date: dateStr(20), values: { traffic: 0.6, shopping: 0.2, living: 0.2, food: 0.24, phone: 0.03 } },
  // Week 4
  { date: dateStr(21), values: { traffic: 0.8, shopping: 0.26, living: 0.18, food: 0.3, phone: 0.03 } },
  { date: dateStr(22), values: { traffic: 0.5, shopping: 0.15, living: 0.16, food: 0.22, phone: 0.02 } },
  { date: dateStr(23), values: { traffic: 0.7, shopping: 0.24, living: 0.14, food: 0.25, phone: 0.03 } },
  { date: dateStr(24), values: { traffic: 0.6, shopping: 0.2, living: 0.2, food: 0.21, phone: 0.02 } },
  { date: dateStr(25), values: { traffic: 0.9, shopping: 0.3, living: 0.12, food: 0.28, phone: 0.04 } },
  { date: dateStr(26), values: { traffic: 0.7, shopping: 0.25, living: 0.15, food: 0.22, phone: 0.03 } },
  { date: dateStr(27), values: { traffic: 0.6, shopping: 0.2, living: 0.2, food: 0.24, phone: 0.03 } },
];
