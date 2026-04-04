const OSS_BASE = '';

export interface MonthlyArchive {
  month: string; // date type, e.g., 2026-03-01
  edition_count: number;
  item_count: number;
  avg_aha_score: number;
  peak_aha_score: number;
  peak_date: string;
  summary: string;
  meta_description: string;
}

export interface WeeklyArchive {
  year: number;
  week_number: number;
  start_date: string;
  end_date: string;
  edition_count: number;
  item_count: number;
  avg_aha_score: number;
  peak_aha_score: number;
  peak_date: string;
}

export interface DailyArchive {
  snapshot_date: string;
  aha_score: number;
  aha_delta: string;
  item_count: number;
  top_story_title: string;
  top_story_source: string;
  top_tags: string[];
  rarity_score: number;
  timeliness_score: number;
  impact_score: number;
}

export interface DisplayItem {
  id: string;
  processed_item_id: string;
  snapshot_date: string;
  source_name: string;
  title: string;
  url: string;
  aha_index_score: number;
  tags: string[];
  category?: string;
  aha_index?: number;
  raw_metrics?: any;
}

export interface GlobalStats {
  total_editions: number;
  total_items: number;
  avg_aha_score: number;
  peak_aha_score: number;
}

// Helper to fetch dates list
async function fetchDatesList(): Promise<string[]> {
  try {
    const resp = await fetch(`${OSS_BASE}/api/dates.json`);
    const data = await resp.json();
    return data.dates || [];
  } catch (e) {
    console.error('Failed to fetch dates.json', e);
    return [];
  }
}

// Helper to fetch a specific day's data
async function fetchDayData(date: string): Promise<{ snapshot_date: string, items: DisplayItem[] } | null> {
  try {
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const resp = await fetch(`${OSS_BASE}/api/daily/${year}/${month}/${date}.json`);
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    return null;
  }
}

export async function fetchStats(): Promise<GlobalStats> {
  try {
    const dates = await fetchDatesList();
    if (dates.length === 0) {
      return { total_editions: 0, total_items: 0, avg_aha_score: 0, peak_aha_score: 0 };
    }
    
    // For global stats, fetching all daily JSONs might be too heavy.
    // Let's just fetch the latest 30 days to approximate, or if there are few dates, fetch all.
    // To be accurate, we should fetch all, but let's fetch in parallel.
    const promises = dates.map(d => fetchDayData(d));
    const daysData = (await Promise.all(promises)).filter(Boolean) as { snapshot_date: string, items: DisplayItem[] }[];
    
    const total_editions = daysData.length;
    let total_items = 0;
    let total_score = 0;
    let peak_aha_score = 0;
    
    daysData.forEach(d => {
      total_items += d.items.length;
      const dayScore = d.items.length > 0 ? d.items.reduce((sum, item) => sum + (item.aha_index_score || item.aha_index || 0), 0) / d.items.length : 0;
      total_score += dayScore;
      if (dayScore > peak_aha_score) peak_aha_score = dayScore;
    });
    
    const avg_aha_score = total_editions > 0 ? total_score / total_editions : 0;
    
    return { total_editions, total_items, avg_aha_score, peak_aha_score };
  } catch (e) {
    return { total_editions: 0, total_items: 0, avg_aha_score: 0, peak_aha_score: 0 };
  }
}

export async function fetchMonths(year: number): Promise<MonthlyArchive[]> {
  try {
    const dates = await fetchDatesList();
    const yearPrefix = `${year}-`;
    const yearDates = dates.filter(d => d.startsWith(yearPrefix));
    
    const monthsMap: Record<string, string[]> = {};
    yearDates.forEach(d => {
      const month = d.slice(0, 7);
      if (!monthsMap[month]) monthsMap[month] = [];
      monthsMap[month].push(d);
    });
    
    const result: MonthlyArchive[] = [];
    for (const [monthStr, monthDates] of Object.entries(monthsMap)) {
      const promises = monthDates.map(d => fetchDayData(d));
      const daysData = (await Promise.all(promises)).filter(Boolean) as { snapshot_date: string, items: DisplayItem[] }[];
      
      let item_count = 0;
      let total_score = 0;
      let peak_aha_score = 0;
      let peak_date = '';
      
      daysData.forEach(d => {
        item_count += d.items.length;
        const dayScore = d.items.length > 0 ? d.items.reduce((sum, item) => sum + (item.aha_index_score || item.aha_index || 0), 0) / d.items.length : 0;
        total_score += dayScore;
        if (dayScore > peak_aha_score) {
          peak_aha_score = dayScore;
          peak_date = d.snapshot_date;
        }
      });
      
      const avg_aha_score = daysData.length > 0 ? total_score / daysData.length : 0;
      
      result.push({
        month: `${monthStr}-01`,
        edition_count: daysData.length,
        item_count,
        avg_aha_score,
        peak_aha_score,
        peak_date,
        summary: '',
        meta_description: ''
      });
    }
    
    return result.sort((a, b) => b.month.localeCompare(a.month));
  } catch (e) {
    return [];
  }
}

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export async function fetchWeeks(year: number, month: number): Promise<WeeklyArchive[]> {
  try {
    const dates = await fetchDatesList();
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
    const monthDates = dates.filter(d => d.startsWith(monthPrefix));
    
    const weeksMap: Record<number, string[]> = {};
    monthDates.forEach(d => {
      const dateObj = new Date(d);
      const weekNo = getWeekNumber(dateObj);
      if (!weeksMap[weekNo]) weeksMap[weekNo] = [];
      weeksMap[weekNo].push(d);
    });
    
    const result: WeeklyArchive[] = [];
    for (const [weekNoStr, weekDates] of Object.entries(weeksMap)) {
      const weekNo = parseInt(weekNoStr, 10);
      const promises = weekDates.map(d => fetchDayData(d));
      const daysData = (await Promise.all(promises)).filter(Boolean) as { snapshot_date: string, items: DisplayItem[] }[];
      
      let item_count = 0;
      let total_score = 0;
      let peak_aha_score = 0;
      let peak_date = '';
      
      daysData.forEach(d => {
        item_count += d.items.length;
        const dayScore = d.items.length > 0 ? d.items.reduce((sum, item) => sum + (item.aha_index_score || item.aha_index || 0), 0) / d.items.length : 0;
        total_score += dayScore;
        if (dayScore > peak_aha_score) {
          peak_aha_score = dayScore;
          peak_date = d.snapshot_date;
        }
      });
      
      const avg_aha_score = daysData.length > 0 ? total_score / daysData.length : 0;
      
      // Calculate start and end date of the week
      const sortedDates = [...weekDates].sort();
      const start_date = sortedDates[0];
      const end_date = sortedDates[sortedDates.length - 1];
      
      result.push({
        year,
        week_number: weekNo,
        start_date,
        end_date,
        edition_count: daysData.length,
        item_count,
        avg_aha_score,
        peak_aha_score,
        peak_date
      });
    }
    
    return result.sort((a, b) => b.week_number - a.week_number);
  } catch (e) {
    return [];
  }
}

export async function fetchDays(year: number, month: number): Promise<DailyArchive[]> {
  try {
    const dates = await fetchDatesList();
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
    const monthDates = dates.filter(d => d.startsWith(monthPrefix));
    
    const promises = monthDates.map(d => fetchDayData(d));
    const daysData = (await Promise.all(promises)).filter(Boolean) as { snapshot_date: string, items: DisplayItem[] }[];
    
    const result: DailyArchive[] = daysData.map(d => {
      const dayScore = d.items.length > 0 ? d.items.reduce((sum, item) => sum + (item.aha_index_score || item.aha_index || 0), 0) / d.items.length : 0;
      
      // Sort items by score descending
      const sortedItems = [...d.items].sort((a, b) => (b.aha_index_score || b.aha_index || 0) - (a.aha_index_score || a.aha_index || 0));
      const topItem = sortedItems[0];
      
      return {
        snapshot_date: d.snapshot_date,
        aha_score: dayScore,
        aha_delta: '+0.0', // Not easily calculated without previous day, mock for now
        item_count: d.items.length,
        top_story_title: topItem ? topItem.title : '',
        top_story_source: topItem ? topItem.source_name : '',
        top_tags: topItem && topItem.tags ? topItem.tags.slice(0, 3) : [],
        rarity_score: 0,
        timeliness_score: 0,
        impact_score: 0
      };
    });
    
    return result.sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date));
  } catch (e) {
    return [];
  }
}

export async function fetchItems(date: string): Promise<DisplayItem[]> {
  try {
    const data = await fetchDayData(date);
    if (!data) return [];
    return data.items.sort((a, b) => (b.aha_index_score || b.aha_index || 0) - (a.aha_index_score || a.aha_index || 0));
  } catch (e) {
    return [];
  }
}

