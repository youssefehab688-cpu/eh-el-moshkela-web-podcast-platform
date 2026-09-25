export interface QuoteItem {
  id: string;
  quote: string;
  author: string;
  youtubeId: string;
  seekSeconds: number;
  timeFormatted: string;
  titleHint: string;
  topic: string;
}

export const DAILY_QUOTES: QuoteItem[] = [
  {
    id: 'q-1',
    quote: 'إحنا بني آدمين عندنا احتياجات عادي.. عايز فلوس وعايز تتجوز ده طبيعي، المهم متخليش احتياجاتك توهمك إنك بتاع دنيا بس وتنسى ميدان الآخرة.',
    author: 'د. محمد الغليظ',
    youtubeId: 'Kionl7cyGfM',
    seekSeconds: 848,
    timeFormatted: '14:08',
    titleHint: 'عالـمغرب 3 - هذا مني وأنا منه (قصة جليبيب)',
    topic: 'علاقات وزواج'
  },
  {
    id: 'q-2',
    quote: 'الراجل ده كان قاعد مهموم زي البني آدمين، ولما لقى فرصة يكون مجاهد استثمرها.. عندك ميدانين: ميدان الحياة وميدان العبادة وتوازنك بينهم هو النجاة.',
    author: 'د. محمد الغليظ',
    youtubeId: 'Kionl7cyGfM',
    seekSeconds: 904,
    timeFormatted: '15:04',
    titleHint: 'عالـمغرب 3 - هذا مني وأنا منه',
    topic: 'إيمانيات وتزكية'
  },
  {
    id: 'q-3',
    quote: 'العبرة ليست بكمية الذنوب التي تثقلك، بل بسرعة انكسارك ورجوعك إلى الله بعد السقوط مباشرة دون تسويف.',
    author: 'د. محمد الغليظ',
    youtubeId: 'DpOjT5-OZNM',
    seekSeconds: 145,
    timeFormatted: '02:25',
    titleHint: 'إيه المشكلة؟ في الذنوب المتكررة',
    topic: 'إيمانيات وتزكية'
  },
  {
    id: 'q-4',
    quote: 'أعظم علاج للشتات هو أن تجعل همومك كلها هماً واحداً: كيف ترضي ربك؟ وقتها يتولى الله كل ما يشغلك.',
    author: 'د. أمير منير',
    youtubeId: 'ke_U80mVl5I',
    seekSeconds: 320,
    timeFormatted: '05:20',
    titleHint: 'عالـمغرب - حلقة السكون واليقين',
    topic: 'تطوير وعادات'
  },
  {
    id: 'q-5',
    quote: 'الزواج ليس مجرد حب عاطفي ولقطات رومانسية، بل هو شراكة واعية لبناء إنسان وصناعة بيت يرضي الله.',
    author: 'م. ياسر ممدوح',
    youtubeId: 'Kionl7cyGfM',
    seekSeconds: 648,
    timeFormatted: '10:48',
    titleHint: 'عالـمغرب - الامتثال والبركة في الزواج',
    topic: 'علاقات وزواج'
  },
  {
    id: 'q-6',
    quote: 'لا تجعل ذنب الأمس يمنعك من صلاة اليوم؛ الشيطان يريد أن يقطعك تماماً، فاقطع أنت خطته بالاستغفار.',
    author: 'د. أمير منير',
    youtubeId: 'DpOjT5-OZNM',
    seekSeconds: 412,
    timeFormatted: '06:52',
    titleHint: 'إيه المشكلة؟ في التوبة',
    topic: 'إيمانيات وتزكية'
  },
  {
    id: 'q-7',
    quote: 'لو أنت واقع في جوانب معينة ومش شاطر في كل حاجة، لازم كمسلم تلاقي جانب تكون مميز ونافع فيه بجد.',
    author: 'م. ياسر ممدوح',
    youtubeId: 'Kionl7cyGfM',
    seekSeconds: 1138,
    timeFormatted: '18:58',
    titleHint: 'عالـمغرب - أثر المسلم النافع',
    topic: 'تطوير وعادات'
  }
];
