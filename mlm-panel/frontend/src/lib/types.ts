export type ListingStatus = "active" | "paused" | "closed" | "under_review";
export type ListingCondition = "new" | "used" | "refurbished";
export type ChangeType = "title" | "price" | "description" | "stock" | "images" | "attributes" | "ads_budget";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type CampaignStatus = "active" | "paused" | "ended" | "draft";

export interface ListingSummary {
  id: number;
  ml_listing_id: string;
  title: string;
  price: number;
  status: ListingStatus;
  condition: ListingCondition;
  stock: number;
  sold_quantity: number;
  visits: number;
  conversion_rate: number;
  health_score: number;
  thumbnail_url: string | null;
  permalink: string | null;
  updated_at: string;
}

export interface SeoSummary {
  score: number;
  title_score: number;
  description_score: number;
  issues: string[];
  opportunities: string[];
}

export interface CompetitorSummary {
  id: number;
  title: string;
  price: number;
  seller_name: string;
  sales_count: number;
}

export interface AdsCampaignSummary {
  id: number;
  campaign_name: string;
  status: CampaignStatus;
  daily_budget: number;
  clicks: number;
  ctr: number;
  roas: number;
}

export interface ListingDetail extends ListingSummary {
  product_id: number;
  original_price: number | null;
  category_id: string | null;
  created_at: string;
  competitors: CompetitorSummary[];
  latest_seo: SeoSummary | null;
  ads_campaigns: AdsCampaignSummary[];
  pending_approvals: number;
}

export interface ListingListResponse {
  items: ListingSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApprovalQueueItem {
  id: number;
  listing_id: number;
  listing_title: string;
  listing_ml_id: string;
  change_type: ChangeType;
  current_value: unknown;
  proposed_value: unknown;
  reason: string | null;
  priority: number;
  status: ApprovalStatus;
  created_by: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface ApprovalQueueListResponse {
  items: ApprovalQueueItem[];
  total: number;
  pending_count: number;
}

export interface ChangeHistoryItem {
  id: number;
  listing_id: number;
  listing_title: string;
  change_type: ChangeType;
  old_value: unknown;
  new_value: unknown;
  applied_by: string;
  notes: string | null;
  applied_at: string;
}

export interface ChangeHistoryListResponse {
  items: ChangeHistoryItem[];
  total: number;
}
