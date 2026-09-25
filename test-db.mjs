import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach((line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length) {
      const val = v.join('=').trim().replace(/^["']|["']$/g, '');
      if (k.trim() === 'NEXT_PUBLIC_SUPABASE_URL') url = val;
      if (k.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') key = val;
    }
  });
}

console.log('--- جاري اختبار الاتصال بـ Supabase ---');
console.log('URL:', url || 'مفقود!');
console.log('Key:', key ? key.substring(0, 12) + '...' : 'مفقود!');

if (!url || !key || url.includes('your-project-id')) {
  console.error('\n❌ خطأ: المفاتيح في ملف .env.local غير صحيحة أو ما زالت بالقيم الافتراضية.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('episodes').select('*');
  if (error) {
    console.error('\n❌ خطأ من Supabase:', error.message);
  } else {
    console.log(`\n✅ الاتصال ناجح 100%! تم العثور على ${data.length} حلقة في قاعدة البيانات:`);
    data.forEach((ep) => {
      console.log(`- [الموسم ${ep.season} | حلقة ${ep.episode_number}] ${ep.title}`);
    });
  }
}

check();
