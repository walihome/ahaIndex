import { supabase } from './supabase';

export interface MonthlyArchive {
  year: number;
  month: number;
  total_items: number;
  avg_aha_score: number;
  max_aha_score: number;
  ai_summary: string;
}

export interface WeeklyArchive {
  year: number;
  week_number: number;
  start_date: string;
  end_date: string;
  total_items: number;
  avg_aha_score: number;
}

export interface DailyArchive {
  archive_date: string;
  total_items: number;
  featured_title: string;
  featured_source: string;
  avg_aha_score: number;
  max_aha_score: number;
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
}

export interface GlobalStats {
  total_editions: number;
  total_items: number;
  avg_aha_score: number;
  peak_aha_score: number;
}

export async function fetchStats(): Promise<GlobalStats> {
  try {
    const { data: dailyData, error } = await supabase.from('daily_archives').select('archive_date, total_items, max_aha_score, avg_aha_score');
    if (error || !dailyData || dailyData.length === 0) {
      return { total_editions: 0, total_items: 0, avg_aha_score: 0, peak_aha_score: 0 };
    }
    
    const total_editions = dailyData.length;
    const total_items = dailyData.reduce((sum, d) => sum + (d.total_items || 0), 0);
    const avg_aha_score = dailyData.reduce((sum, d) => sum + (d.avg_aha_score || 0), 0) / total_editions;
    const peak_aha_score = Math.max(...dailyData.map(d => d.max_aha_score || 0));
    return { total_editions, total_items, avg_aha_score, peak_aha_score };
  } catch (e) {
    return { total_editions: 0, total_items: 0, avg_aha_score: 0, peak_aha_score: 0 };
  }
}

export async function fetchMonths(year: number): Promise<MonthlyArchive[]> {
  try {
    const { data, error } = await supabase.from('monthly_archives').select('*').eq('year', year).order('month', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch (e) {
    return [];
  }
}

export async function fetchWeeks(year: number, month: number): Promise<WeeklyArchive[]> {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('weekly_archives')
      .select('*')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
      .order('start_date', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch (e) {
    return [];
  }
}

export async function fetchDays(year: number, month: number): Promise<DailyArchive[]> {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_archives')
      .select('*')
      .gte('archive_date', startDate)
      .lte('archive_date', endDate)
      .order('archive_date', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch (e) {
    return [];
  }
}

export async function fetchItems(date: string): Promise<DisplayItem[]> {
  try {
    const { data, error } = await supabase
      .from('display_items')
      .select('*')
      .eq('snapshot_date', date)
      .order('aha_index_score', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch (e) {
    return [];
  }
}
