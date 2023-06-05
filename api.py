import io
import requests
import speech_recognition as sr
from pydub import AudioSegment
from pydub.playback import play
import openai

openai.api_key = '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' 

def transcribe_audio(audio_data):
    response = openai.Audio.transcribe(audio=audio_data, model="whisper") #PROBLEM MAY BE HERE
    return response['text']

def translate_text(text, source_lang, target_lang):
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=f"Translate the following {source_lang} text to {target_lang}: {text}\nTarget language:",
        temperature=0,
        max_tokens=100,
        top_p=1.0,
        frequency_penalty=0,
        presence_penalty=0,
        n=1,
        stop=None,
        log_level="info",
    )
    translated_text = response.choices[0].text.strip()
    
    eleven_labs_url = "https://api.elevenlabs.ai/speak"
    eleven_labs_params = {
        "text": translated_text,
        "target_lang": target_lang
    }
    eleven_labs_headers = {
        "Authorization": "Bearer 3da83448f156808f581fc3e68546b0a2"
    }
    eleven_labs_response = requests.get(eleven_labs_url, params=eleven_labs_params, headers=eleven_labs_headers)

    return eleven_labs_response.content


source_lang = "en"
target_lang = "fr"

# Record audio from microphone and convert speech to text using OpenAI Whisper
recognizer = sr.Recognizer()
with sr.Microphone() as source:
    print("Speak now...")
    audio = recognizer.listen(source)

audio_data = audio.get_raw_data(convert_rate=16000, convert_width=2)
source_text = transcribe_audio(audio_data)

# Translate the text using OpenAI
translated_text = translate_text(source_text, source_lang, target_lang)

# Save the translated speech
output_file = "translated_speech.mp3"
with open(output_file, "wb") as f:
    f.write(translated_text)

# Play 
translated_audio = AudioSegment.from_file(output_file)
play(translated_audio)
