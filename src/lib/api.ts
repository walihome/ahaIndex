import { supabase } from './supabase';

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
}

export interface GlobalStats {
  total_editions: number;
  total_items: number;
  avg_aha_score: number;
  peak_aha_score: number;
}

export async function fetchStats(): Promise<GlobalStats> {
  try {
    const { data: dailyData, error } = await supabase.from('daily_archives').select('snapshot_date, item_count, aha_score');
    if (error || !dailyData || dailyData.length === 0) {
      return { total_editions: 0, total_items: 0, avg_aha_score: 0, peak_aha_score: 0 };
    }
    
    const total_editions = dailyData.length;
    const total_items = dailyData.reduce((sum, d) => sum + (d.item_count || 0), 0);
    const avg_aha_score = dailyData.reduce((sum, d) => sum + (d.aha_score || 0), 0) / total_editions;
    const peak_aha_score = Math.max(...dailyData.map(d => d.aha_score || 0));
    return { total_editions, total_items, avg_aha_score, peak_aha_score };
  } catch (e) {
    return { total_editions: 0, total_items: 0, avg_aha_score: 0, peak_aha_score: 0 };
  }
}

export async function fetchMonths(year: number): Promise<MonthlyArchive[]> {
  try {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const { data, error } = await supabase
      .from('monthly_archives')
      .select('*')
      .gte('month', startDate)
      .lte('month', endDate)
      .order('month', { ascending: false });
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
      .gte('snapshot_date', startDate)
      .lte('snapshot_date', endDate)
      .order('snapshot_date', { ascending: false });
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
