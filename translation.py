###THIS IS THE LIVE FILE
from flask import Flask, request
from flask_cors import CORS
import requests
application = Flask(__name__)
application.config['PREFERRED_URL_SCHEME'] = 'https'
CORS(application)
@application.route('/', methods=['POST'])
def load_and_translate():
    data = request.json.get('text_input','lang_num')
    text_input = data[0]
    lang_num = int(data[1])

    lang = ["RO", "ZH", "EN-US", "EN"]

    # Set up DeepL API request
    url = 'https://api-free.deepl.com/v2/translate'
    params = {
        "auth_key": "954afa95-a70d-41f0-c9c2-9d29d644acf6:fx",
        "text": text_input,
        "target_lang": lang[lang_num],
    }

    # Send request to DeepL API
    response = requests.get(url, params=params)

    # Get translated text from DeepL API response
    translated_text = response.json()["translations"][0]["text"]
    return translated_text

