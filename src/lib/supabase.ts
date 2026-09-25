import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getCleanSupabaseUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim().replace(/^["']|["']$/g, '');
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  }
}

const supabaseUrl = getCleanSupabaseUrl(rawUrl);
const supabaseAnonKey = rawKey.trim().replace(/^["']|["']$/g, '');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // يضمن حفظ الجلسة في ذاكرة المتصفح/الهاتف للأبد
    autoRefreshToken: true,     // تجديد صلاحية الدخول تلقائياً في الخلفية
    detectSessionInUrl: true,   // قراءة توكن الدخول فور العودة من جوجل
  },
});
