import sys
from youtube_transcript_api import YouTubeTranscriptApi

def search_transcript(video_id, keyword):
    print(f"\n🔍 جاري البحث في تفريغ الحلقة ({video_id}) عن كلمة: '{keyword}'...")
    try:
        api = YouTubeTranscriptApi()
        
        # دعم الإصدار الجديد (.list) والإصدار القديم (.list_transcripts)
        if hasattr(api, 'list'):
            t_list = api.list(video_id)
        elif hasattr(YouTubeTranscriptApi, 'list_transcripts'):
            t_list = YouTubeTranscriptApi.list_transcripts(video_id)
        else:
            t_list = None

        entries = None
        if t_list:
            try:
                transcript = t_list.find_transcript(['ar'])
                entries = transcript.fetch()
            except Exception:
                try:
                    transcript = t_list.find_generated_transcript(['ar'])
                    entries = transcript.fetch()
                except Exception:
                    pass

        # محاولة مباشرة عبر fetch أو get_transcript
        if entries is None:
            if hasattr(api, 'fetch'):
                entries = api.fetch(video_id, languages=['ar'])
            elif hasattr(YouTubeTranscriptApi, 'get_transcript'):
                entries = YouTubeTranscriptApi.get_transcript(video_id, languages=['ar'])

        if not entries:
            print("❌ لم يتم العثور على تفريغ باللغة العربية لهذه الحلقة.")
            return

        found = 0
        print(f"\n📋 النتائج التي وُجدت فيها كلمة '{keyword}':\n" + "-" * 55)

        for item in entries:
            text = getattr(item, 'text', None) if not isinstance(item, dict) else item.get('text', '')
            start = getattr(item, 'start', None) if not isinstance(item, dict) else item.get('start', 0)
            
            text_str = str(text or '').strip()
            start_sec = int(float(start or 0))

            if keyword in text_str:
                mins = start_sec // 60
                secs = start_sec % 60
                time_str = f"{mins:02d}:{secs:02d}"

                print(f"⏱️ التوقيت: {time_str}  (رقم الثواني الدقيق: {start_sec})")
                print(f"💬 النص: «{text_str}»")
                print("-" * 55)
                found += 1

        if found == 0:
            print(f"لم يتم العثور على كلمة '{keyword}' نصاً. جرب كلمة مرادفة أو شائعة أكثر.")
        else:
            print(f"✅ تم العثور على {found} مقطع بنجاح!")

    except Exception as e:
        print(f"\n❌ حدث خطأ أثناء الاتصال:\n{e}\n")

if __name__ == '__main__':
    vid = sys.argv[1] if len(sys.argv) > 1 else "Kionl7cyGfM"
    word = sys.argv[2] if len(sys.argv) > 2 else "الزواج"
    search_transcript(vid, word)
