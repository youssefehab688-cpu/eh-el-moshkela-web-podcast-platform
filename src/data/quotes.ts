export interface QuoteItem {
  id: string;
  quote: string;
  author: string;
  program: 'eh-el-moshkla' | 'ala-el-maghreb';
  season: number;
  episodeNumber: number;
  seekSeconds: number;
  timeFormatted: string;
  titleHint: string;
  topic: string;
  youtubeId?: string;
}

export const DAILY_QUOTES: QuoteItem[] = [
  {
    id: 'q-1',
    quote: 'إحنا بني آدمين عندنا احتياجات عادي.. أنا عايز فلوس وعايز اتجوز، المهم متخليش احتياجاتك توهمك إنك بتاع دنيا بس وتنسى ميدان الآخرة.',
    author: 'د. محمد الغليظ',
    program: 'ala-el-maghreb',
    season: 3,
    episodeNumber: 3,
    youtubeId: 'Kionl7cyGfM',
    seekSeconds: 848,
    timeFormatted: '14:08',
    titleHint: 'عالـمغرب (٣) - هذا منى و أنا منه',
    topic: 'علاقات وزواج'
  },
  {
    id: 'q-2',
    quote: 'لو أنت حاسس بضعف في جوانب معينة ومش شاطر في كل حاجة، لازم كمسلم تلاقي جانب تكون مميز ونافع فيه بجد وتسد فيه.',
    author: 'م. ياسر ممدوح',
    program: 'ala-el-maghreb',
    season: 3,
    episodeNumber: 3,
    youtubeId: 'Kionl7cyGfM',
    seekSeconds: 1138,
    timeFormatted: '18:58',
    titleHint: 'عالـمغرب (٣) - هذا منى و أنا منه',
    topic: 'تطوير وعادات'
  },
  {
    id: 'q-3',
    quote: 'إياك واستصغار المعصية والتهاون بها؛ فالجبال الشامخة أصلها حصى صغار، وسر النجاة هو سرعة انكسارك ورجوعك فور السقوط.',
    author: 'د. محمد الغليظ',
    program: 'eh-el-moshkla',
    season: 2,
    episodeNumber: 7,
    seekSeconds: 420,
    timeFormatted: '07:00',
    titleHint: 'إيه المشكلة في الذنوب الصغيرة؟',
    topic: 'إيمانيات وتزكية'
  },
  {
    id: 'q-4',
    quote: 'تذكر الموت ليس تشاؤماً ولا إحباطاً، بل هو البوصلة الحقيقية التي تنزع عنك الغرور وتضبط أولوياتك في هذه الدنيا.',
    author: 'د. أمير منير',
    program: 'eh-el-moshkla',
    season: 2,
    episodeNumber: 10,
    seekSeconds: 510,
    timeFormatted: '08:30',
    titleHint: 'إيه المشكلة في الموت؟',
    topic: 'إيمانيات وتزكية'
  },
  {
    id: 'q-5',
    quote: 'النجاح الحقيقي ليس أن تصل لقمة الدنيا ويصفق لك الناس، بل أن تكون كل خطوة تخطوها مرضية لله ومقربة لك من الجنة.',
    author: 'م. ياسر ممدوح',
    program: 'eh-el-moshkla',
    season: 2,
    episodeNumber: 12,
    seekSeconds: 360,
    timeFormatted: '06:00',
    titleHint: 'إيه المشكلة في النجاح؟',
    topic: 'تطوير وعادات'
  },
  {
    id: 'q-6',
    quote: 'بر الوالدين ليس مشروطاً بفهمهم لتفاصيل عصرك أو موافقتهم على كل رغباتك؛ البر عبادة تقدمها لله قبل أن تكون معاملة.',
    author: 'د. محمد الغليظ',
    program: 'eh-el-moshkla',
    season: 2,
    episodeNumber: 11,
    seekSeconds: 615,
    timeFormatted: '10:15',
    titleHint: 'إيه المشكلة في الآباء و الأمهات؟',
    topic: 'علاقات وزواج'
  },
  {
    id: 'q-7',
    quote: 'لسانك هو مرآة قلبك وسريرتك؛ واعتياد الألفاظ الجارحة يقسو معه القلب وينزع منه الحياء تدريجياً دون أن تشعر.',
    author: 'م. ياسر ممدوح',
    program: 'eh-el-moshkla',
    season: 2,
    episodeNumber: 6,
    seekSeconds: 290,
    timeFormatted: '04:50',
    titleHint: 'إيه المشكلة في الشتيمة؟',
    topic: 'إيمانيات وتزكية'
  }
];
