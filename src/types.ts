export interface DisplayMetric {
  label: string;
  value: string;
}

export interface DisplayMetrics {
  items: DisplayMetric[];
}

export interface ProcessedItem {
  item_id: string;
  processed_title: string | null;
  raw_title: string | null;
  summary: string | null;
  tags: string[] | null;
  keywords: string[] | null;
  aha_index: number | null;
  expert_insight: string | null;
  updated_at: string | null;
  original_url: string | null;
  source_name: string | null;
  display_metrics: DisplayMetrics | null;
  snapshot_date: string | null;
  // Dynamic fields for async hydration
  views?: number;
  likes?: number;
  comments?: number;
}
