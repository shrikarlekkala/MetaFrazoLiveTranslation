//TRANSCRIPTION AND TRANSLATION API DEMO
//THIS IS USING JQUERY BUT I CAN EASILY CONVERT IT TO PLAIN JAVASCRIPT
//There are two issues that I can see with this approach:
//  1. It appears if there is any interruption in connection the transcription stops and needs to be reset, this could also be a browser session issue.  We could have it auto-reset, but I haven't been able to do it reliably.
//  2. There is a gap when the transcription ends and before the new one begins. It may not be a big deal depending on the speakers' cadence.

$(document).ready(function(){


//INPUT LANGUAGE SELECTION from front end dropdown buttons
var inputLang;
      $('.dropdown-menu a[data-langin]').click(function() {
        inputLang= $(this).data('langin');
        $('#inputLanguageDropdown').text($(this).text());
        console.log('Selected Input Language:', inputLang);

      });
      
//OUTPUT LANGUAGE SELECTION from front end dropdown buttons
var outputLang;
      $('.dropdown-menu a[data-langout]').click(function() {
        outputLang = $(this).data('langout');
        $('#outputLanguageDropdown').text($(this).text());
        console.log('Selected Output Language:', outputLang);

      });



function javascript_translation_deepl(textToTranslate, lang_index){
    //Call to immediately listen for the next spoken words
    //run_speech();
    
    // Fetch API request
    var lang = ["RO", "ZH", "EN-US", "EN"];
    fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `auth_key=954afa95-a70d-41f0-c9c2-9d29d644acf6:fx&text=${encodeURIComponent(textToTranslate)}&target_lang=${lang[lang_index]}`,
    })
      .then(response => response.json())
      .then(data => {
        // Handle the API response
        const translatedText = data.translations[0].text;
        console.log("Translated text:", translatedText);
        $('#translatedtext').text(translatedText);
        
        //Text to speech
        var utterance = new SpeechSynthesisUtterance(translatedText);
        utterance.lang = outputLang;
        speechSynthesis.speak(utterance);
        console.log('played sound.  If no sound was played please ensure your headphones are properly configured');
      })
      .catch(error => {
        // Handle any errors
        console.error("Translation error:", error);
      });
}
    
//Declared outside of function so stop-btn can use "recognition"    
var recognition;

function run_speech(){
    
    // Check browser support for SpeechRecognition
    var SpeechRecognition = window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    if (SpeechRecognition) {
        
      
      recognition.lang = inputLang; // Set the desired language
      
      recognition.continuous = true;
    
      let isRecording = false;
    
      // Function to start recording
      const startRecording = () => {
        recognition.start();
        isRecording = true;
      };
    

        if (!isRecording) {
          startRecording();
        }
        
      // Function to handle speech recognition results
      const handleRecognitionResult = event => {
    
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
    
        // Update the transcript element with the recognized speech
        $('#transcript').text(transcript);
    
        // Send the transcript to Deepgram for further processing
        //All api's have different codes for the same language the switch statement is translating it for the next api call
        let target_lang;
        switch(outputLang){

            case "ro-RO":
                target_lang = 0;
                break;
            case "zh-cn":
                target_lang = 1;
                break;
            case "en-US":
                target_lang = 2;
                break;
        }
        run_speech();
        javascript_translation_deepl(transcript, target_lang);
      };
      
    
      // Handle speech recognition results
      recognition.addEventListener('result', function(event) {
      handleRecognitionResult(event);
      // run_speech() Recursive call was also working here as well
    
      });
    
      console.log(isRecording, SpeechRecognition);
        
      // Handle errors
      recognition.addEventListener('error', function(event) {
      console.error('Speech recognition error:', event.error);
      run_speech();//Recursive call to start again if there is an error 
      
      });
    
    }
}

// Start recording
$('#start-btn').on('click', function() {
    run_speech();
});

// Stop recording
$('#stop-btn').on('click', function() {
            // Function to stop recording
   recognition.stop();
   isRecording = false;
   recognition = null;
   SpeechRecognition = null;
});

});
