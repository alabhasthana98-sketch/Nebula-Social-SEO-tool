
// Input Types
export enum Platform {
  Instagram = 'instagram',
  TikTok = 'tiktok',
  YouTube = 'youtube',
  LinkedIn = 'linkedin',
  TwitterX = 'twitter_x',
  Facebook = 'facebook'
}

export enum Mode {
  Creator = 'creator',
  Editor = 'editor',
  CompetitorSpy = 'competitor_spy',
  TrendHunter = 'trend_hunter'
}

export enum PrimaryGoal {
  Views = 'views',
  Saves = 'shares',
  Shares = 'shares',
  Comments = 'comments',
  ProfileVisits = 'profile_visits',
  LinkClicks = 'link_clicks',
  Followers = 'followers'
}

export enum HookStyle {
  Curiosity = 'curiosity',
  ProblemSolution = 'problem_solution',
  HowToEducational = 'how_to_educational',
  BoldControversial = 'bold_controversial',
  RelatableEmotional = 'relatable_emotional',
  UrgencyFOMO = 'urgency_fomo',
  Storytelling = 'storytelling',
  List = 'list'
}

export interface MediaAsset {
  data: string; // Base64
  mimeType: string;
  name: string;
}

// Gemini Response Schema
export interface TrendMetadata {
  trend_detected: boolean;
  trend_name?: string;
  trend_source?: string;
  how_to_apply_trend?: string;
}

export interface CompetitorInsights {
  cta_strategy: string;
  visual_theme: string;
  keywords_detected?: string[]; // New
  hook_patterns?: string[]; // New
  video_style?: string; // New
  caption_structure?: string; // New
  competitor_hashtags?: string[]; // New
}

export interface BrandGuard {
  brand_safe: boolean;
  violations_detected: string[];
  notes: string;
}

export interface SentimentAnalysis {
  overall_tone: string;
  vibe_badge: string;
}

export interface TrendHunterIdea {
  idea_title: string;
  idea_description: string;
  why_it_works: string;
  suggested_platforms: Platform[];
}

export interface PostingStrategy {
  recommended_posting_time_local: string;
  suggested_frequency_per_week: number;
  cross_posting_tips: string;
}

export interface SocialStrategyResponse {
  platform: Platform;
  mode: Mode;
  primary_goal: PrimaryGoal;
  virality_score: number; // 0-100
  hook: string;
  title?: string;
  caption: string;
  alt_text?: string; // SEO Field
  seo_keywords?: string[]; // New: Semantic Search Keywords
  description?: string;
  hashtags: string[];
  recommended_post_format: string;
  recommended_length: {
    video_seconds: number;
    caption_max_characters: number;
  };
  posting_strategy: PostingStrategy;
  trend_metadata: TrendMetadata;
  competitor_insights: CompetitorInsights;
  brand_guard: BrandGuard;
  sentiment_analysis: SentimentAnalysis;
  spy_mode_notes?: string;
  trend_hunter_ideas?: TrendHunterIdea[];
  critique?: string; // For audit mode
  notes?: string;
}

export interface AnalysisRequest {
  platform: Platform;
  mode: Mode;
  goal: PrimaryGoal;
  hookStyle?: HookStyle; 
  niche: string;
  contextInput: string;
  brandDNA: string;
  mediaAssets: MediaAsset[];
  videoFrames: string[];
  useMaps: boolean;
  useThinking: boolean;
  useLiveTrends: boolean;
  location?: { lat: number; lng: number };
  targetAudience?: string;
  demographics?: string;
  geoFocus?: string;
  action?: 'audit' | 'generate';
}
