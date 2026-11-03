import sys
import os
from gtts import gTTS

AUDIO_DIR = os.path.join(os.path.dirname(__file__), 'public', 'audio_tts')
os.makedirs(AUDIO_DIR, exist_ok=True)

def generate_preset_voices():
    presets = {
        'blessing_general.mp3': 'Cảm ơn đại thí chủ đã phát tâm cúng dường. A Di Đà Phật, công đức vô lượng!',
        'blessing_rose.mp3': 'Cảm ơn đại thí chủ đã cúng dường hoa hồng. A Di Đà Phật, công đức vô lượng!',
        'blessing_lion.mp3': 'Cảm ơn đại thí chủ đã cúng dường Sư Tử Vàng. Cửu Phẩm Liên Hoa tỏa sáng, công đức vô lượng!',
        'blessing_universe.mp3': 'Cảm ơn đại thí chủ đã cúng dường Vũ Trụ. Đại Hồng Chung khai mở, phước đức vô biên!',
        'blessing_chime.mp3': 'A Di Đà Phật, chúc đại thí chủ vạn sự an lạc, thân tâm thanh tịnh!'
    }

    for filename, text in presets.items():
        out_path = os.path.join(AUDIO_DIR, filename)
        if not os.path.exists(out_path):
            print(f"Generating {filename}...")
            tts = gTTS(text, lang='vi')
            tts.save(out_path)
            print(f"Saved: {out_path}")

def generate_custom(filename, text):
    out_path = os.path.join(AUDIO_DIR, filename)
    tts = gTTS(text, lang='vi')
    tts.save(out_path)
    print(f"SUCCESS:{out_path}")

if __name__ == '__main__':
    if len(sys.argv) >= 3:
        filename = sys.argv[1]
        text = sys.argv[2]
        generate_custom(filename, text)
    else:
        generate_preset_voices()
