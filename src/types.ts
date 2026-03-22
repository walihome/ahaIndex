export interface DisplayMetric {
  label: string;
  value: string;
}

export interface DisplayMetrics {
  items: DisplayMetric[];
}

export interface ProcessedItem {
  id: string;
  processed_item_id: string;
  snapshot_date: string;
  source_name: string;
  content_type: string;
  original_url: string;
  author: string | null;
  processed_title: string | null;
  summary: string | null;
  category: string | null;
  tags: string[] | null;
  keywords: string[] | null;
  aha_index: number;
  expert_insight: string | null;
  display_metrics: DisplayMetrics | null;
  raw_metrics: any | null;
  extra?: any | null;
  rank: number;
  model: string | null;
  created_at: string | null;
  // Dynamic fields for async hydration
  views?: number;
  likes?: number;
  comments?: number;
}
