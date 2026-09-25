import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('raw_channel.json', 'utf8'));
const entries = rawData.entries || [];

console.log(`\n🔍 جاري معالجة وفرز ${entries.length} فيديو مسحوب من القناة...\n`);

// عكس الترتيب لتبدأ الحلقات زمنياً من الأقدم (2021) إلى الأحدث
const chronological = [...entries].reverse();

const classifiedEpisodes = [];

// عدادات التتبع
let maghrebS1Count = 0;
let maghrebS2Count = 0;
let maghrebS3Count = 0;

let ehS1Count = 0;
let ehS2Count = 0;
let ehS3Count = 0;
let ehS4Count = 0;

// علامات زمنية فاصلة بين مواسم إيه المشكلة اعتماداً على فترات رمضان
let passedRamadan1 = false;
let passedRamadan2 = false;
let passedRamadan3 = false;

for (const item of chronological) {
  const title = (item.title || '').trim();
  const id = item.id;
  const duration = item.duration || 0;

  // استبعاد البروموهات والفيديوهات الإعلانية القصيرة جداً (أقل من 3 دقائق)
  if (duration > 0 && duration < 180) continue;
  if (title.includes('برومو') || title.includes('انتظرونا') || title.includes('Trailer')) continue;

  const isMaghreb = title.includes('عالمغرب') || title.includes('عالـمغرب') || title.includes('على المغرب') || title.includes('المغرب (');

  // استخراج أو تخمين الموضوع
  let topic = 'إيمانيات وتزكية';
  if (title.includes('زواج') || title.includes('علاقات') || title.includes('الطلاق') || title.includes('أهلنا') || title.includes('بر الوالدين') || title.includes('التنمر') || title.includes('الغيرة') || title.includes('الحب')) {
    topic = 'علاقات وزواج';
  } else if (title.includes('المال') || title.includes('الغنى') || title.includes('الشغل') || title.includes('الرزق') || title.includes('دنانير')) {
    topic = 'معاملات وأموال';
  } else if (title.includes('شبهات') || title.includes('أسئلة') || title.includes('الأحداث') || title.includes('الهوى')) {
    topic = 'شبهات وأسئلة';
  } else if (title.includes('وقت') || title.includes('انضباط') || title.includes('موضة') || title.includes('ساحل') || title.includes('عادات') || title.includes('كذب')) {
    topic = 'تطوير وعادات';
  }

  if (isMaghreb) {
    let season = 1;
    if (title.includes('(٣)') || title.includes('(3)') || title.includes(' 3') || title.includes('٣')) {
      season = 3;
      passedRamadan3 = true;
    } else if (title.includes('(٢)') || title.includes('(2)') || title.includes(' 2') || title.includes('٢')) {
      season = 2;
      passedRamadan2 = true;
    } else if (title.includes('(١)') || title.includes('(1)') || title.includes(' 1') || title.includes('١')) {
      season = 1;
      passedRamadan1 = true;
    } else {
      // تصنيف زمني بحسب المواسم السابقة
      if (passedRamadan2) {
        season = 3;
        passedRamadan3 = true;
      } else if (passedRamadan1) {
        season = 2;
        passedRamadan2 = true;
      } else {
        season = 1;
        passedRamadan1 = true;
      }
    }

    let epNum = 1;
    if (season === 1) epNum = ++maghrebS1Count;
    if (season === 2) epNum = ++maghrebS2Count;
    if (season === 3) epNum = ++maghrebS3Count;

    classifiedEpisodes.push({
      program: 'ala-el-maghreb',
      season,
      episode_number: epNum,
      title: title.replace(/'/g, "''"),
      slug: `maghreb-s${season}-e${epNum}-${id}`,
      topic,
      youtube_video_id: id,
      duration_seconds: duration || 1200,
      thumbnail_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      description: title.replace(/'/g, "''")
    });
  } else {
    // بودكاست إيه المشكلة
    let season = 1;
    if (title.includes('الموسم الرابع') || title.includes('سيزون 4') || passedRamadan3) {
      season = 4;
    } else if (title.includes('الموسم الثالث') || title.includes('سيزون 3') || passedRamadan2) {
      season = 3;
    } else if (title.includes('الموسم الثاني') || title.includes('سيزون 2') || passedRamadan1) {
      season = 2;
    } else {
      season = 1;
    }

    let epNum = 1;
    if (season === 1) epNum = ++ehS1Count;
    if (season === 2) epNum = ++ehS2Count;
    if (season === 3) epNum = ++ehS3Count;
    if (season === 4) epNum = ++ehS4Count;

    classifiedEpisodes.push({
      program: 'eh-el-moshkla',
      season,
      episode_number: epNum,
      title: title.replace(/'/g, "''"),
      slug: `eh-s${season}-e${epNum}-${id}`,
      topic,
      youtube_video_id: id,
      duration_seconds: duration || 4800,
      thumbnail_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      description: title.replace(/'/g, "''")
    });
  }
}

console.log('📊 تقرير التوزيع الفعلي للحلقات المفرزة:');
console.log('-------------------------------------------');
console.log('🎙️  [بودكاست إيه المشكلة]:');
console.log(`   - الموسم الرابع: ${ehS4Count} حلقة`);
console.log(`   - الموسم الثالث: ${ehS3Count} حلقة`);
console.log(`   - الموسم الثاني: ${ehS2Count} حلقة`);
console.log(`   - الموسم الأول : ${ehS1Count} حلقة`);
console.log(`   * المجموع: ${ehS1Count + ehS2Count + ehS3Count + ehS4Count} حلقة كاملة\n`);

console.log('🌙 [برنامج عالـمغرب (رمضان)]:');
console.log(`   - عالـمغرب (٣): ${maghrebS3Count} حلقة`);
console.log(`   - عالـمغرب (٢): ${maghrebS2Count} حلقة`);
console.log(`   - عالـمغرب (١): ${maghrebS1Count} حلقة`);
console.log(`   * المجموع: ${maghrebS1Count + maghrebS2Count + maghrebS3Count} حلقة كاملة\n`);

console.log(`🎯 الإجمالي الصافي للحلقات المجهزة للضخ: ${classifiedEpisodes.length} حلقة رسمية!`);

// توليد ملف SQL نظيف ومباشر
let sql = `-- مكتبة الحلقات الكاملة الرسمية لبودكاست إيه المشكلة وبرنامج عالـمغرب
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS program VARCHAR(50) DEFAULT 'eh-el-moshkla';
TRUNCATE TABLE recommendations CASCADE;
TRUNCATE TABLE episodes CASCADE;

INSERT INTO episodes (program, season, episode_number, title, slug, topic, description, youtube_video_id, audio_stream_url, duration_seconds, thumbnail_url) VALUES\n`;

const values = classifiedEpisodes.map((ep) => {
  return `('${ep.program}', ${ep.season}, ${ep.episode_number}, '${ep.title}', '${ep.slug}', '${ep.topic}', '${ep.description}', '${ep.youtube_video_id}', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', ${ep.duration_seconds}, '${ep.thumbnail_url}')`;
});

sql += values.join(',\n') + ';\n\n';
sql += `ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;\nDROP POLICY IF EXISTS "Public Read Episodes" ON episodes;\nCREATE POLICY "Public Read Episodes" ON episodes FOR SELECT USING (true);\n`;

fs.writeFileSync('full_catalog.sql', sql);
console.log('\n💾 تم حفظ ملف SQL الشامل بنجاح باسم: full_catalog.sql');
