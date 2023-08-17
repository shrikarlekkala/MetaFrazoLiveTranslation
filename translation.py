###THIS IS THE LIVE FILE
from flask import Flask, render_template, request, send_file
import os
from flask_cors import CORS
import requests
import boto3

application = Flask(__name__)
application.config['PREFERRED_URL_SCHEME'] = 'https'
CORS(application)
@application.route('/', methods=['POST'])
def load_and_translate():
    data = request.json.get('text_input','lang_num')
    text_input = data[0]
    lang_num = int(data[1])

    lang = ["RO", "ZH", "EN-US", "EN", "IT"]

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



@application.route('/MetaFrazoDubbedTranslation')
def hello():
    """Renders a sample page."""
    return render_template('dubbedpage.html')

@application.route('/upload', methods=['POST'])
def upload_video():
    # AWS S3 configuration
    s3 = boto3.client('s3')
    S3_BUCKET = 'elasticbeanstalk-us-east-2-039300220315'


    file = request.files['videoFile']
    # Save the uploaded video file to a temporary directory
    if file.filename == '':
        return "No selected file.", 400

    # Generate a valid filename
    filename = 'test.mp4'

    # Upload the file to S3
    s3.upload_fileobj(file, S3_BUCKET, filename)

    # Provide a response to the client
    return "File uploaded successfully."

