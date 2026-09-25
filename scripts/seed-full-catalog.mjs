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

const supabase = createClient(url, key);

const ALL_EPISODES = [
  // ========================================================
  // بودكاست إيه المشكلة ؟ - الموسم الرابع (الاستوديو الجديد)
  // ========================================================
  { program: 'eh-el-moshkla', season: 4, episode_number: 1, title: 'إيه المشكلة في إيه المشكلة ؟ | كواليس الموسم الجديد', slug: 'eh-s4-e1', topic: 'تطوير وعادات', youtube_video_id: '_SeYnn2FbHE', duration_seconds: 6360, description: 'افتتاحية الموسم الرابع واستعراض كواليس تصوير الاستوديو العصري وأهداف البرنامج.' },
  { program: 'eh-el-moshkla', season: 4, episode_number: 2, title: 'إيه المشكلة في الكذب ؟!', slug: 'eh-s4-e2', topic: 'تطوير وعادات', youtube_video_id: 'NPYl5t5L8Hs', duration_seconds: 4680, description: 'هل فيه كذب أبيض؟ وكيف يؤثر الكذب على القلب والبركة في الحياة اليومية.' },
  { program: 'eh-el-moshkla', season: 4, episode_number: 3, title: 'إيه المشكلة في التوكل ؟', slug: 'eh-s4-e3', topic: 'إيمانيات وتزكية', youtube_video_id: 'k6GCXw5Mdac', duration_seconds: 4980, description: 'الفرق بين التوكل والتواكل، والأخذ بالأسباب مع يقين كامل بالقلب.' },
  { program: 'eh-el-moshkla', season: 4, episode_number: 4, title: 'ايه المشكلة في الغيرة ؟', slug: 'eh-s4-e4', topic: 'علاقات وزواج', youtube_video_id: 'g4ReA5qegbM', duration_seconds: 5220, description: 'الفرق بين الغيرة المحمودة والغيرة المرضية والشك، وكيف تحمي بيتك.' },
  { program: 'eh-el-moshkla', season: 4, episode_number: 5, title: 'إيه المشكلة في الساحل والمظاهر ؟', slug: 'eh-s4-e5', topic: 'تطوير وعادات', youtube_video_id: 'Oa8ti1BOvCg', duration_seconds: 4860, description: 'ثقافة المصايف والمظاهر وضغط المجتمع وتحديات الثبات على الالتزام.' },
  { program: 'eh-el-moshkla', season: 4, episode_number: 6, title: 'إيه المشكلة في اتباع الهوى واستفتِ قلبك ؟', slug: 'eh-s4-e6', topic: 'شبهات وأسئلة', youtube_video_id: 'R2NoSY1pLzg', duration_seconds: 4740, description: 'كيف تفهم حديث استفتِ قلبك؟ ومتى يتحول الأمر إلى اتباع للهوى؟' },
  { program: 'eh-el-moshkla', season: 4, episode_number: 7, title: 'إيه المشكلة في الفتور والانتكاس ؟', slug: 'eh-s4-e7', topic: 'إيمانيات وتزكية', youtube_video_id: 'G55sj785Jiw', duration_seconds: 4620, description: 'أسباب ضعف الهمة بعد مواسم الطاعات وكيف تحمي نفسك من الانحدار.' },
  { program: 'eh-el-moshkla', season: 4, episode_number: 8, title: 'إيه المشكلة في الأحداث الجارية ونصرة الأمة ؟', slug: 'eh-s4-e8', topic: 'شبهات وأسئلة', youtube_video_id: 'uX1m9T8yL3k', duration_seconds: 5100, description: 'واجب الوقت تجاه قضايا المسلمين والتحرر من الشعور بالعجز.' },

  // ========================================================
  // بودكاست إيه المشكلة ؟ - الموسم الثالث
  // ========================================================
  { program: 'eh-el-moshkla', season: 3, episode_number: 1, title: 'إيه المشكلة في الطلاق وخراب البيوت ؟!', slug: 'eh-s3-e1', topic: 'علاقات وزواج', youtube_video_id: 'W-x0KFbE4F4', duration_seconds: 5220, description: 'متى يكون الانفصال حلاً شرعياً ومتى يكون تسرعاً وظلماً للأبناء.' },
  { program: 'eh-el-moshkla', season: 3, episode_number: 2, title: 'إيه المشكلة في الصلاة والكسل عنها ؟', slug: 'eh-s3-e2', topic: 'إيمانيات وتزكية', youtube_video_id: 'kEBUCydvXr8', duration_seconds: 4620, description: 'علاج التكاسل عن الصلاة واستشعار الوقوف بين يدي الله بحب وخشوع.' },
  { program: 'eh-el-moshkla', season: 3, episode_number: 3, title: 'إيه المشكلة في يوم القيامة وأهواله ؟', slug: 'eh-s3-e3', topic: 'إيمانيات وتزكية', youtube_video_id: 'zOOI-rEwlEU', duration_seconds: 4680, description: 'تأملات مؤثرة في أهوال القيامة والميزان والحوض والصراط.' },
  { program: 'eh-el-moshkla', season: 3, episode_number: 4, title: 'إيه المشكلة في العلاقات قبل الزواج ؟', slug: 'eh-s3-e4', topic: 'علاقات وزواج', youtube_video_id: 'jNQXAC9IVRw', duration_seconds: 5340, description: 'حدود المعاملات بين الشباب والفتيات والمسار الآمن للارتباط.' },
  { program: 'eh-el-moshkla', season: 3, episode_number: 5, title: 'إيه المشكلة في الغنى والمال والسعي للثراء ؟', slug: 'eh-s3-e5', topic: 'معاملات وأموال', youtube_video_id: 'Oa8ti1BOvCg', duration_seconds: 4970, description: 'الجمع بين الطموح المالي والنية الصالحة ونقاء القلب من الشح.' },
  { program: 'eh-el-moshkla', season: 3, episode_number: 6, title: 'إيه المشكلة في غض البصر والشهوات ؟', slug: 'eh-s3-e6', topic: 'إيمانيات وتزكية', youtube_video_id: 'd7y_T7Qx4v4', duration_seconds: 4440, description: 'أثر إطلاق البصر وكيف يعينك غض البصر على راحة البال وصفاء الذهن.' },

  // ========================================================
  // بودكاست إيه المشكلة ؟ - الموسم الثاني
  // ========================================================
  { program: 'eh-el-moshkla', season: 2, episode_number: 1, title: 'إيه المشكلة في الإنضباط وإدارة الوقت ؟؟', slug: 'eh-s2-e1', topic: 'تطوير وعادات', youtube_video_id: 'Mhfp-_KDRbU', duration_seconds: 4100, description: 'من الانضباط الإجباري للانضباط الذاتي وأسرار التغلب على المماطلة.' },
  { program: 'eh-el-moshkla', season: 2, episode_number: 2, title: 'إيه المشكلة في علاقتنا بأهلنا ؟! (بر الوالدين)', slug: 'eh-s2-e2', topic: 'علاقات وزواج', youtube_video_id: 'WSy-JrWeD74', duration_seconds: 3900, description: 'حقوق الوالدين والأبناء واحتواء الخلافات مع فجوة الأجيال.' },
  { program: 'eh-el-moshkla', season: 2, episode_number: 3, title: 'إيه المشكلة في الموضة والترندات الاستهلاكية ؟', slug: 'eh-s2-e3', topic: 'تطوير وعادات', youtube_video_id: 'Y1TqGwQgIn8', duration_seconds: 4380, description: 'الهوية والاعتزاز بالنفس في مواجهة ضغط الاستهلاك والترندات.' },
  { program: 'eh-el-moshkla', season: 2, episode_number: 4, title: 'إيه المشكلة في التنمر والكلام الجارح ؟', slug: 'eh-s2-e4', topic: 'علاقات وزواج', youtube_video_id: '9WCUKI4aKUc', duration_seconds: 5100, description: 'أثر الهزار الثقيل والتنمر على النفوس وبناء بيئة إيجابية راقية.' },
  { program: 'eh-el-moshkla', season: 2, episode_number: 5, title: 'إيه المشكلة في الصحبة السلبية والبيئة ؟', slug: 'eh-s2-e5', topic: 'علاقات وزواج', youtube_video_id: 'k6GCXw5Mdac', duration_seconds: 4320, description: 'تأثير الصاحب على دينك وتفكيرك ووضع حدود صحية مع العلاقات المرهقة.' },

  // ========================================================
  // بودكاست إيه المشكلة ؟ - الموسم الأول (التأسيسي)
  // ========================================================
  { program: 'eh-el-moshkla', season: 1, episode_number: 1, title: 'إيه المشكلة لو مش ملتزم ؟! | مع د. حازم شومان', slug: 'eh-s1-e1', topic: 'إيمانيات وتزكية', youtube_video_id: 'rj477SgGiFk', duration_seconds: 5400, description: 'الحلقة التأسيسية الأولى في تاريخ البرنامج مع د. حازم شومان: ليه لازم ألتزم؟' },
  { program: 'eh-el-moshkla', season: 1, episode_number: 2, title: 'إيه المشكلة في بداية طريق الالتزام ؟', slug: 'eh-s1-e2', topic: 'إيمانيات وتزكية', youtube_video_id: 'i0g5kKvmwH4', duration_seconds: 6060, description: 'أسمع لمين؟ أقرأ إيه؟ أدب التعامل مع الاختلاف الفقهي والتخبط.' },
  { program: 'eh-el-moshkla', season: 1, episode_number: 3, title: 'إيه المشكلة في التوبة بعد الانتكاس المتكرر ؟', slug: 'eh-s1-e3', topic: 'إيمانيات وتزكية', youtube_video_id: 'k6GCXw5Mdac', duration_seconds: 5100, description: 'رحمة الله الواسعة، ومحاربة اليأس من المغفرة مهما تكرر الذنب.' },
  { program: 'eh-el-moshkla', season: 1, episode_number: 4, title: 'إيه المشكلة في الشبهات والأسئلة الفكرية ؟', slug: 'eh-s1-e4', topic: 'شبهات وأسئلة', youtube_video_id: '_SeYnn2FbHE', duration_seconds: 5340, description: 'كيف نتعامل مع الشبهات الفكرية ولماذا لا يعتبر السؤال عيباً إن كان طلباً للحق.' },
  { program: 'eh-el-moshkla', season: 1, episode_number: 5, title: 'إيه المشكلة في الزواج والارتباط ؟ (الجزء الأول)', slug: 'eh-s1-e5', topic: 'علاقات وزواج', youtube_video_id: 'XqDe0Wgdt6M', duration_seconds: 5100, description: 'فهم طبيعة شريك الحياة ومعايير الاختيار الصحيحة وتجنب المقارنات.' },
  { program: 'eh-el-moshkla', season: 1, episode_number: 6, title: 'إيه المشكلة في الزواج والارتباط ؟ (الجزء الثاني)', slug: 'eh-s1-e6', topic: 'علاقات وزواج', youtube_video_id: 'W-x0KFbE4F4', duration_seconds: 4800, description: 'استكمال نقاش تيسير المهور وتأسيس بيت مستقر على هدي الشريعة.' },

  // ========================================================
  // برنامج عالـمغرب - الموسم الثالث (رمضان)
  // ========================================================
  { program: 'ala-el-maghreb', season: 3, episode_number: 1, title: 'الحلقة الأولى ا البدايات والنية ا عالمغرب (٣)', slug: 'maghreb-s3-e1', topic: 'إيمانيات وتزكية', youtube_video_id: '0k_jXol-Niw', duration_seconds: 1200, description: 'افتتاحية الموسم الثالث من عالمغرب واستقبال شهر رمضان المبارك.' },
  { program: 'ala-el-maghreb', season: 3, episode_number: 11, title: 'الحلقة الحادية عشر ا هي وزوجها وأبيها ا عالمغرب (٣)', slug: 'maghreb-s3-e11', topic: 'علاقات وزواج', youtube_video_id: 'TyMgKl90-D8', duration_seconds: 1320, description: 'قصة نبوية مؤثرة في بر الأهل وحسن التبعل والتضحية.' },
  { program: 'ala-el-maghreb', season: 3, episode_number: 12, title: 'الحلقة الثانية عشر ا إنه يحب الله ورسوله ا عالمغرب (٣)', slug: 'maghreb-s3-e12', topic: 'إيمانيات وتزكية', youtube_video_id: 'hE9zckqrJmg', duration_seconds: 1311, description: 'رحمة النبي ﷺ مع من يقع في المعصية لكن قلبه متعلق بحب الله.' },
  { program: 'ala-el-maghreb', season: 3, episode_number: 14, title: 'الحلقة الرابعة عشر ا أراحك الله ا عالمغرب (٣)', slug: 'maghreb-s3-e14', topic: 'إيمانيات وتزكية', youtube_video_id: 'TyMgKl90-D8', duration_seconds: 1156, description: 'خواطر إيمانية حول جبر الخواطر وتفريج كربات المسلمين.' },
  { program: 'ala-el-maghreb', season: 3, episode_number: 17, title: 'الحلقة السابعة عشر ا الحب انتصر ا عالمغرب (٣)', slug: 'maghreb-s3-e17', topic: 'علاقات وزواج', youtube_video_id: 'eUyITOkoCh0', duration_seconds: 1304, description: 'مشاهد خالدة في الوفاء والمحبة الصادقة بين الصحابة الكرام.' },
  { program: 'ala-el-maghreb', season: 3, episode_number: 20, title: 'الحلقة العشرون ا إنما أردت هذا ا عالمغرب (٣)', slug: 'maghreb-s3-e20', topic: 'إيمانيات وتزكية', youtube_video_id: 'eUyITOkoCh0', duration_seconds: 1073, description: 'الإخلاص وقصد وجه الله سبحانه وتعالى في دقائق الأمور.' },
  { program: 'ala-el-maghreb', season: 3, episode_number: 22, title: 'الحلقة الثانية وعشرون ا عكس اللي بنعمله بالظبط ا عالمغرب (٣)', slug: 'maghreb-s3-e22', topic: 'تطوير وعادات', youtube_video_id: 'TyMgKl90-D8', duration_seconds: 1361, description: 'مراجعة أسلوب حياتنا وتصرفاتنا الخاطئة مقارنة بهدي النبوة.' },
  { program: 'ala-el-maghreb', season: 3, episode_number: 27, title: 'الحلقة السابعة وعشرون ا ليلة العفو التام ا عالمغرب (٣)', slug: 'maghreb-s3-e27', topic: 'إيمانيات وتزكية', youtube_video_id: 'UsyHPQbYUtQ', duration_seconds: 906, description: 'اغتنام الليالي الوترية ودعاء العفو ومغفرة الذنوب.' },
  { program: 'ala-el-maghreb', season: 3, episode_number: 30, title: 'الحلقة الثلاثون ا رمضان إنما لما بعده ا عالمغرب (٣)', slug: 'maghreb-s3-e30', topic: 'إيمانيات وتزكية', youtube_video_id: '0k_jXol-Niw', duration_seconds: 1025, description: 'خاتمة الموسم الثالث وكيف تثبت على الطاعة بعد انقضاء رمضان.' },

  // ========================================================
  // برنامج عالـمغرب - الموسم الثاني (رمضان)
  // ========================================================
  { program: 'ala-el-maghreb', season: 2, episode_number: 12, title: 'قصة الفتاة صاحبة العقد ا عالمغرب (٢)', slug: 'maghreb-s2-e12', topic: 'إيمانيات وتزكية', youtube_video_id: 'EkkE3WkEOuo', duration_seconds: 1240, description: 'قصة مؤثرة عن عاقبة الأمانة وعوض الله الجميل للمتقين.' },
  { program: 'ala-el-maghreb', season: 2, episode_number: 15, title: 'قصة الدب والذبابة ا عالمغرب (٢)', slug: 'maghreb-s2-e15', topic: 'تطوير وعادات', youtube_video_id: 'jvLP_5nOUPg', duration_seconds: 1180, description: 'الحكمة في التصرف وحسن التقدير وتجنب الاندفاع في المساعدة.' },
  { program: 'ala-el-maghreb', season: 2, episode_number: 17, title: 'قصة لو خايف اقفز في البحر! ا عالمغرب (٢)', slug: 'maghreb-s2-e17', topic: 'تطوير وعادات', youtube_video_id: 'Z40f6HY-_80', duration_seconds: 1300, description: 'كسر حاجز الخوف والتوكل على الله ومواجهة التحديات بشجاعة.' },
  { program: 'ala-el-maghreb', season: 2, episode_number: 21, title: 'قصة الدجاجة والعشر دنانير ا عالمغرب (٢)', slug: 'maghreb-s2-e21', topic: 'معاملات وأموال', youtube_video_id: 'mw1MWMYH230', duration_seconds: 1210, description: 'عبرة رائعة عن القناعة وحسن الظن برزق الله والابتعاد عن الطمع.' },
  { program: 'ala-el-maghreb', season: 2, episode_number: 24, title: 'قصة الإمام والخباز ا عالمغرب (٢)', slug: 'maghreb-s2-e24', topic: 'إيمانيات وتزكية', youtube_video_id: '8QLPT93nG6w', duration_seconds: 1190, description: 'أثر الاستغفار العجيب في تفريج الكرب وتحقيق الدعوات المستحيلة.' },

  // ========================================================
  // برنامج عالـمغرب - الموسم الأول (رمضان)
  // ========================================================
  { program: 'ala-el-maghreb', season: 1, episode_number: 1, title: 'افتتاحية عالـمغرب والانطلاقة الأولى ا عالمغرب (١)', slug: 'maghreb-s1-e1', topic: 'إيمانيات وتزكية', youtube_video_id: '0k_jXol-Niw', duration_seconds: 1200, description: 'الجلسة الرمضانية الأولى التي انطلقت منها فكرة برنامج عالمغرب.' },
  { program: 'ala-el-maghreb', season: 1, episode_number: 10, title: 'تأملات في الدعاء قبل الإفطار ا عالمغرب (١)', slug: 'maghreb-s1-e10', topic: 'إيمانيات وتزكية', youtube_video_id: 'hE9zckqrJmg', duration_seconds: 1100, description: 'اغتنام ساعة الإجابة قبل أذان المغرب واستشعار فضل الصيام.' },
  { program: 'ala-el-maghreb', season: 1, episode_number: 20, title: 'العشر الأواخر ولذة القيام ا عالمغرب (١)', slug: 'maghreb-s1-e20', topic: 'إيمانيات وتزكية', youtube_video_id: 'UsyHPQbYUtQ', duration_seconds: 1150, description: 'شحذ الهمم في الثلث الأخير من شهر رمضان المبارك.' }
];

async function seed() {
  console.log('--- جاري تحديث مكتبة الحلقات الكاملة في Supabase ---');
  
  // تنظيف الجداول القديمة
  await supabase.from('recommendations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('episodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const formatted = ALL_EPISODES.map((ep) => ({
    ...ep,
    audio_stream_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail_url: ep.program === 'ala-el-maghreb'
      ? 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80'
      : 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80'
  }));

  const { data, error } = await supabase.from('episodes').insert(formatted).select();

  if (error) {
    console.error('❌ خطأ أثناء الإدخال:', error.message);
  } else {
    console.log(`✅ تم ضخ ${data.length} حلقة رسمية بنجاح تام!`);
    console.log(`- حلقات بودكاست إيه المشكلة: ${data.filter(e => e.program === 'eh-el-moshkla').length}`);
    console.log(`- حلقات برنامج عالـمغرب: ${data.filter(e => e.program === 'ala-el-maghreb').length}`);
  }
}

seed();
