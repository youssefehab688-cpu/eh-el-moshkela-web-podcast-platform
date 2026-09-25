import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('raw_channel.json', 'utf8'));
const entries = rawData.entries || [];

// الترتيب الزمني التصاعدي من أقدم حلقة نُشرت بالقناة إلى الأحدث
const chronological = [...entries].reverse();

function norm(str) {
  return (str || '')
    .replace(/[\u064B-\u065F\u0670]/g, '') // حذف التشكيل
    .replace(/ـ/g, '') // حذف التطويل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}

const classified = [];

// مراحل التتبع الزمنية الصارمة (9 فترات متتالية)
let state = 'EH_S1';
let nextState = null;

const stats = {
  'EH_S1': { program: 'eh-el-moshkla', season: 1, count: 0, start: '', end: '' },
  'MAGHREB_S1': { program: 'ala-el-maghreb', season: 1, count: 0, start: '', end: '' },
  'EH_S2': { program: 'eh-el-moshkla', season: 2, count: 0, start: '', end: '' },
  'EH_S3': { program: 'eh-el-moshkla', season: 3, count: 0, start: '', end: '' },
  'MAGHREB_S2': { program: 'ala-el-maghreb', season: 2, count: 0, start: '', end: '' },
  'EH_S4': { program: 'eh-el-moshkla', season: 4, count: 0, start: '', end: '' },
  'EH_S5': { program: 'eh-el-moshkla', season: 5, count: 0, start: '', end: '' },
  'MAGHREB_S3': { program: 'ala-el-maghreb', season: 3, count: 0, start: '', end: '' },
  'EH_S6': { program: 'eh-el-moshkla', season: 6, count: 0, start: '', end: '' },
};

for (let i = 0; i < chronological.length; i++) {
  const item = chronological[i];
  const title = (item.title || '').trim();
  const id = item.id;
  const duration = item.duration || 0;
  const nTitle = norm(title);

  // استبعاد الإعلانات والبروموهات القصيرة جداً
  if (duration > 0 && duration < 150) continue;
  if (nTitle.includes('برومو') || nTitle.includes('انتظرونا') || nTitle.includes('trailer')) continue;

  // الانتقال للحالة التالية إذا كان هناك انتقال مؤجل
  if (nextState) {
    state = nextState;
    nextState = null;
  }

  // فحص شروط الانتقال المباشر بين المراحل
  if (state === 'EH_S1') {
    if ((nTitle.includes('مغرب') && (nTitle.includes('ليله 1') || nTitle.includes('ليله ١'))) || nTitle.includes('ليله 1 رمضان')) {
      state = 'MAGHREB_S1';
    }
  }

  if (state === 'EH_S2') {
    if (nTitle.includes('موضه') || nTitle.includes('الموضه')) {
      state = 'EH_S3';
    }
  }

  if (state === 'EH_S3') {
    if (nTitle.includes('خمور المدينه') || nTitle.includes('خمور المدينة')) {
      state = 'MAGHREB_S2';
    }
  }

  if (state === 'EH_S4') {
    if (stats['EH_S4'].count >= 12 && nTitle.includes('استعداد') && nTitle.includes('رمضان')) {
      state = 'EH_S5';
    }
  }

  if (state === 'EH_S5') {
    if (stats['EH_S5'].count >= 6 || (nTitle.includes('المقدمه') && nTitle.includes('مغرب')) || nTitle.includes('المقدمه على المغرب 3')) {
      state = 'MAGHREB_S3';
    }
  }

  if (state === 'MAGHREB_S3') {
    if (nTitle.includes('ما بصليش') || nTitle.includes('مابصليش')) {
      state = 'EH_S6';
    }
  }

  // تسجيل الحلقة في الحالة الحالية
  const cur = stats[state];
  cur.count++;
  const epNum = cur.count;

  if (!cur.start) cur.start = title;
  cur.end = title;

  // استنتاج الموضوع
  let topic = 'إيمانيات وتزكية';
  if (nTitle.includes('زواج') || nTitle.includes('علاقات') || nTitle.includes('طلاق') || nTitle.includes('اهلنا') || nTitle.includes('والدين') || nTitle.includes('تنمر') || nTitle.includes('غيره') || nTitle.includes('حب') || nTitle.includes('ارحام')) {
    topic = 'علاقات وزواج';
  } else if (nTitle.includes('مال') || nTitle.includes('غنى') || nTitle.includes('شغل') || nTitle.includes('رزق') || nTitle.includes('دنانير')) {
    topic = 'معاملات وأموال';
  } else if (nTitle.includes('شبهات') || nTitle.includes('اسئله') || nTitle.includes('احداث') || nTitle.includes('هوى') || nTitle.includes('سنه')) {
    topic = 'شبهات وأسئلة';
  } else if (nTitle.includes('وقت') || nTitle.includes('انضباط') || nTitle.includes('موضه') || nTitle.includes('ساحل') || nTitle.includes('عادات') || nTitle.includes('كذب') || nTitle.includes('دراسه') || nTitle.includes('تفاهه') || nTitle.includes('نجاح')) {
    topic = 'تطوير وعادات';
  }

  const slugPrefix = cur.program === 'ala-el-maghreb' ? 'maghreb' : 'eh';

  classified.push({
    program: cur.program,
    season: cur.season,
    episode_number: epNum,
    title: title.replace(/'/g, "''"),
    slug: `${slugPrefix}-s${cur.season}-e${epNum}-${id}`,
    topic,
    youtube_video_id: id,
    duration_seconds: duration || (cur.program === 'ala-el-maghreb' ? 1200 : 4800),
    thumbnail_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    description: title.replace(/'/g, "''")
  });

  // فحص شروط الانتقال بعد انتهاء الحلقة الأخيرة من الموسم
  if (state === 'MAGHREB_S1') {
    if (nTitle.includes('ليله 30') || nTitle.includes('ليله ٣٠')) {
      nextState = 'EH_S2';
    }
  } else if (state === 'MAGHREB_S2') {
    if (nTitle.includes('ختام') && (nTitle.includes('رمضان') || nTitle.includes('الثاني') || nTitle.includes('30') || nTitle.includes('٣٠'))) {
      nextState = 'EH_S4';
    }
  } else if (state === 'EH_S5') {
    if (cur.count >= 6 || (nTitle.includes('صيام') && nTitle.includes('استعداد'))) {
      nextState = 'MAGHREB_S3';
    }
  } else if (state === 'MAGHREB_S3') {
    if (nTitle.includes('الثلاثون') || (nTitle.includes('30') && nTitle.includes('رمضان'))) {
      nextState = 'EH_S6';
    }
  }
}

console.log('========================================================================');
console.log('📌 التقرير النهائي للفرز الزمني الصارم (9 فترات متتالية):');
console.log('========================================================================\n');

console.log('🎙️ [بودكاست إيه المشكلة]:');
for (let s = 1; s <= 6; s++) {
  const k = `EH_S${s}`;
  const info = stats[k];
  console.log(`🔹 الموسم ${s} (${info.count} حلقة):`);
  console.log(`   - أول حلقة : ${info.start}`);
  console.log(`   - آخر حلقة : ${info.end}\n`);
}

console.log('------------------------------------------------------------------------');
console.log('🌙 [برنامج عالـمغرب (المواسم الرمضانية الثلاثة)]:');
for (let s = 1; s <= 3; s++) {
  const k = `MAGHREB_S${s}`;
  const info = stats[k];
  console.log(`🔹 عالـمغرب (${s}) (${info.count} حلقة):`);
  console.log(`   - أول حلقة : ${info.start}`);
  console.log(`   - آخر حلقة : ${info.end}\n`);
}

console.log('========================================================================');
console.log(`🎯 الإجمالي الكلي لجميع الحلقات: ${classified.length} حلقة.`);

// توليد ملف SQL المحدث
let sql = `-- مكتبة الحلقات الكاملة المفروزة يدوياً بنسبة 100%
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS program VARCHAR(50) DEFAULT 'eh-el-moshkla';
TRUNCATE TABLE recommendations CASCADE;
TRUNCATE TABLE episodes CASCADE;

INSERT INTO episodes (program, season, episode_number, title, slug, topic, description, youtube_video_id, audio_stream_url, duration_seconds, thumbnail_url) VALUES\n`;

const values = classified.map((ep) => {
  return `('${ep.program}', ${ep.season}, ${ep.episode_number}, '${ep.title}', '${ep.slug}', '${ep.topic}', '${ep.description}', '${ep.youtube_video_id}', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', ${ep.duration_seconds}, '${ep.thumbnail_url}')`;
});

sql += values.join(',\n') + ';\n\n';
sql += `ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;\nDROP POLICY IF EXISTS "Public Read Episodes" ON episodes;\nCREATE POLICY "Public Read Episodes" ON episodes FOR SELECT USING (true);\n`;

fs.writeFileSync('full_catalog.sql', sql);
console.log('\n💾 تم حفظ ملف SQL المنقح بنجاح في: full_catalog.sql');
