export type ProgramType = 'eh-el-moshkla' | 'ala-el-maghreb' | 'all' | string;

export interface Episode {
  id: string;
  title: string;
  slug: string;
  description?: string;
  youtube_video_id: string;
  audio_stream_url?: string;
  duration_seconds: number;
  season: number | string;
  episode_number: number;
  topic?: string;
  program?: ProgramType;
  thumbnail_url: string;
  created_at?: string;
  order_index?: number;
  recommendations?: Recommendation[];
  [key: string]: any;
}

export interface Recommendation {
  id: string;
  episode_id: string;
  title: string;
  type?: string;
  url?: string;
  [key: string]: any;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_url?: string;
  program?: ProgramType;
  season_count?: number;
  order_index?: number;
  created_at?: string;
  [key: string]: any;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  count?: number;
  color?: string;
  order_index?: number;
  [key: string]: any;
}

export interface Note {
  id: string;
  episode_id: string;
  episode_title: string;
  time_seconds: number;
  text: string;
  created_at?: string;
  user_id?: string;
  [key: string]: any;
}

export interface UserProgressItem {
  episode_id: string;
  last_position_seconds: number;
  is_completed: boolean;
  updated_at?: string;
}
