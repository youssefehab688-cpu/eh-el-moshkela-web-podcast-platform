import { Episode } from '@/types';

export interface ExtendedEpisode extends Episode {
  season: number;
  topic: string;
}

export const mockEpisodes: ExtendedEpisode[] = [
  // الموسم 4
  {
    id: "ep-4-1",
    title: "إيه المشكلة في إيه المشكلة ؟ | كواليس الموسم الجديد",
    slug: "eh-el-moshkla-s4-e1",
    episode_number: 1,
    season: 4,
    topic: "تطوير وعادات",
    description: "افتتاحية الموسم الرابع، كواليس الاستوديو العصري الجديد، وأهداف المرحلة القادمة من البودكاست.",
    youtube_video_id: "_SeYnn2FbHE",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration_seconds: 6360,
    thumbnail_url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    published_at: "2024-08-01T18:00:00Z",
    created_at: "2024-08-01T18:00:00Z",
    recommendations: [{ id: "rec-1", episode_id: "ep-4-1", title: "كتاب صيد الخاطر", type: "book", author_or_source: "ابن الجوزي" }]
  },
  {
    id: "ep-4-2",
    title: "إيه المشكلة في الكذب ؟!",
    slug: "eh-el-moshkla-s4-e2",
    episode_number: 2,
    season: 4,
    topic: "تطوير وعادات",
    description: "ليه المسلم مينفعش يكون كذاب؟ هل فيه كذب أبيض؟ وكيف يؤثر الكذب على القلب والبركة في الحياة.",
    youtube_video_id: "NPYl5t5L8Hs",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration_seconds: 4680,
    thumbnail_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    published_at: "2024-08-08T18:00:00Z",
    created_at: "2024-08-08T18:00:00Z"
  },
  {
    id: "ep-4-3",
    title: "إيه المشكلة في التوكل ؟",
    slug: "eh-el-moshkla-s4-e3",
    episode_number: 3,
    season: 4,
    topic: "إيمانيات وتزكية",
    description: "نقاش عميق حول الفرق بين التوكل والتواكل، والأخذ بالأسباب مع يقين كامل بالقلب في تدبير الله.",
    youtube_video_id: "k6GCXw5Mdac",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration_seconds: 4980,
    thumbnail_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    published_at: "2024-08-15T18:00:00Z",
    created_at: "2024-08-15T18:00:00Z",
    recommendations: [{ id: "rec-2", episode_id: "ep-4-3", title: "كتاب مدارج السالكين (منزلة التوكل)", type: "book", author_or_source: "ابن القيم" }]
  },
  {
    id: "ep-4-4",
    title: "ايه المشكلة في الغيرة ؟",
    slug: "eh-el-moshkla-s4-e4",
    episode_number: 4,
    season: 4,
    topic: "علاقات وزواج",
    description: "الفرق بين الغيرة المحمودة الشريفة والغيرة المرضية القاتلة، وكيف تحمي بيتك وقلبك من الشك.",
    youtube_video_id: "g4ReA5qegbM",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration_seconds: 5220,
    thumbnail_url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    published_at: "2024-08-22T18:00:00Z",
    created_at: "2024-08-22T18:00:00Z"
  },
  {
    id: "ep-4-5",
    title: "إيه المشكلة في الساحل ؟",
    slug: "eh-el-moshkla-s4-e5",
    episode_number: 5,
    season: 4,
    topic: "تطوير وعادات",
    description: "نقاش صريح وواقعي حول ثقافة الإجازات والمظاهر وتحديات الالتزام في الأماكن المفتوحة.",
    youtube_video_id: "Oa8ti1BOvCg",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration_seconds: 4860,
    thumbnail_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    published_at: "2024-08-29T18:00:00Z",
    created_at: "2024-08-29T18:00:00Z"
  },

  // الموسم 3
  {
    id: "ep-3-1",
    title: "إيه المشكلة في الطلاق ؟!",
    slug: "eh-el-moshkla-s3-e1",
    episode_number: 1,
    season: 3,
    topic: "علاقات وزواج",
    description: "متى يكون الطلاق حلاً ومتى يكون ظلماً وتسرعاً؟ أثر الطلاق على الأطفال والزوجين وكيف نتجنب خراب البيوت.",
    youtube_video_id: "W-x0KFbE4F4",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration_seconds: 5220,
    thumbnail_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    published_at: "2023-10-10T18:00:00Z",
    created_at: "2023-10-10T18:00:00Z"
  },
  {
    id: "ep-3-2",
    title: "إيه المشكلة في الصلاة والكسل عنها ؟",
    slug: "eh-el-moshkla-s3-e2",
    episode_number: 2,
    season: 3,
    topic: "إيمانيات وتزكية",
    description: "جلسة إيمانية لعلاج مشكلة تأخير الصلاة وثقلها، وكيف تستشعر الوقوف بين يدي الله بحب وخشوع.",
    youtube_video_id: "kEBUCydvXr8",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration_seconds: 4620,
    thumbnail_url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
    published_at: "2023-10-25T18:00:00Z",
    created_at: "2023-10-25T18:00:00Z",
    recommendations: [{ id: "rec-3", episode_id: "ep-3-2", title: "كتاب أول مرة أصلي", type: "book", author_or_source: "د. خالد أبو شادي" }]
  },
  {
    id: "ep-3-3",
    title: "إيه المشكلة في يوم القيامة ؟",
    slug: "eh-el-moshkla-s3-e3",
    episode_number: 3,
    season: 3,
    topic: "إيمانيات وتزكية",
    description: "تأملات مؤثرة في أهوال ومشاهد يوم القيامة، لقاء الله، والصراط، وكيف يُصلح هذا المشهد حياتك اليومية.",
    youtube_video_id: "zOOI-rEwlEU",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration_seconds: 4680,
    thumbnail_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    published_at: "2023-11-10T18:00:00Z",
    created_at: "2023-11-10T18:00:00Z"
  },

  // الموسم 2
  {
    id: "ep-2-1",
    title: "إيه المشكلة في الإنضباط وضياع الوقت ؟؟",
    slug: "eh-el-moshkla-s2-e1",
    episode_number: 1,
    season: 2,
    topic: "تطوير وعادات",
    description: "من الانضباط الإجباري للانضباط الذاتي، أسرار إدارة الوقت والتغلب على الكسل والتشتت الدائم.",
    youtube_video_id: "Mhfp-_KDRbU",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration_seconds: 4100,
    thumbnail_url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80",
    published_at: "2022-11-15T18:00:00Z",
    created_at: "2022-11-15T18:00:00Z"
  },
  {
    id: "ep-2-2",
    title: "إيه المشكلة في علاقتنا بأهلنا ؟! (بر الوالدين)",
    slug: "eh-el-moshkla-s2-e2",
    episode_number: 2,
    season: 2,
    topic: "علاقات وزواج",
    description: "حقوق الآباء والأمهات وحقوق الأبناء، وكيف تبر والديك حتى مع وجود اختلاف في وجهات النظر والتفكير.",
    youtube_video_id: "WSy-JrWeD74",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration_seconds: 3900,
    thumbnail_url: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=80",
    published_at: "2022-12-01T18:00:00Z",
    created_at: "2022-12-01T18:00:00Z"
  },

  // الموسم 1
  {
    id: "ep-1-1",
    title: "إيه المشكلة لو مش ملتزم ؟! | مع د. حازم شومان",
    slug: "eh-el-moshkla-s1-e1",
    episode_number: 1,
    season: 1,
    topic: "إيمانيات وتزكية",
    description: "الحلقة الأولى التأسيسية في تاريخ البرنامج مع د. حازم شومان عن البداية مع الله وسؤال: ليه لازم ألتزم؟",
    youtube_video_id: "rj477SgGiFk",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration_seconds: 5400,
    thumbnail_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    published_at: "2021-12-01T18:00:00Z",
    created_at: "2021-12-01T18:00:00Z"
  },
  {
    id: "ep-1-2",
    title: "إيه المشكلة في بداية الالتزام ؟",
    slug: "eh-el-moshkla-s1-e2",
    episode_number: 2,
    season: 1,
    topic: "إيمانيات وتزكية",
    description: "أسمع لمين من الشيوخ؟ أدب الخلاف، أبدأ أقرأ إيه؟ ومقاومة التخبط والفتور في أول طريق الهداية.",
    youtube_video_id: "i0g5kKvmwH4",
    audio_stream_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration_seconds: 6060,
    thumbnail_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    published_at: "2021-12-15T18:00:00Z",
    created_at: "2021-12-15T18:00:00Z"
  }
];
