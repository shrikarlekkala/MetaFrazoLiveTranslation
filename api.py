import speech_recognition as sr
import pyttsx3
from langdetect import detect
from googletrans import Translator

# Create instances of classes you will be using
r = sr.Recognizer()
translator = Translator(service_urls=['translate.google.com'])
tts = pyttsx3.init()

supported_languages = ["en", "es"]

try:
    while True:
        # Use default microphone
        with sr.Microphone() as source:
            print("Speak something...")
            r.adjust_for_ambient_noise(source)
            audio = r.listen(source)
        
        try:
            text = r.recognize_google(audio)
            input_language = detect(text)
            # Check if the detected language is in the list of supported languages
            if input_language in supported_languages:
                target_lang = "es" if input_language == "en" else "en"
                translation = translator.translate(text, dest=target_lang)
                print(f"Translated to {target_lang}: {translation.text}")
                # Speak translated text
                tts.say(translation.text)
                tts.runAndWait()
            else:
                print("Unsupported language")
        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand audio.")
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service: {e}")
except KeyboardInterrupt:
    pass
