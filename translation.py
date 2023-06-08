###THIS IS THE FLASK API FOR THE TRANSLATION.JS APPROACH
from flask import Flask, request, send_file, jsonify #, url_for, redirect, jsonify
from flask_cors import CORS
#from flask_restful import Api, Resource
import os
import requests
import csv
import keras_nlp
import tensorflow as tf
from tensorflow import keras
app = Flask(__name__)
cors = CORS(app)
@app.route('/translator', methods=['POST'])
def load_and_translate():
    # Send request to Deepgram API
    filename = request.json['text_input']
    url = "https://api.deepgram.com/v1/listen?punctuate=true"

    # Set up DeepL API request
    url = 'https://api-free.deepl.com/v2/translate'
    params = {
        "auth_key": "954afa95-a70d-41f0-c9c2-9d29d644acf6:fx",
        "text": filename,
        "source_lang": "en",
        "target_lang": "es",
    }

    # Send request to DeepL API
    response = requests.get(url, params=params)

    # Get translated text from DeepL API response
    translated_text = response.json()["translations"][0]["text"]
    #text_to_speech(translated_text) THIS WILL BE THE WEBSOCKET TO SEND LIVE TEXT TO LISTENER'S WEBPAGE
    return translated_text
