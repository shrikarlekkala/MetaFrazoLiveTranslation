//TRANSCRIPTION AND TRANSLATION API DEMO
//THIS IS USING JQUERY BUT I CAN EASILY CONVERT IT TO PLAIN JAVASCRIPT
//There are two issues that I can see with this approach:
//  1. It appears if there is any interruption in connection the transcription stops and needs to be reset, this could also be a browser session issue.  We could have it auto-reset, but I haven't been able to do it reliably.
//  2. There is a gap when the transcription ends and before the new one begins. It may not be a big deal depending on the speakers' cadence.

$(document).ready(function(){

function translate(user_input){
    
    run_speech();//Call to start transcription immediately after the last text is sent to be translated.  I could also place this in the "Handle speech recognition results" to make it recursive.  This could also be the cause of the gap metioned above.
    var xhr = new XMLHttpRequest();
    
    //user_input is the transcription
    var params = {'text_input':user_input};

    xhr.open('POST', 'https://mknapp62.pythonanywhere.com/translator', true);
    xhr.setRequestHeader('Content-type', 'application/json');

    xhr.onload = function(){
        $('#translatedtext').text(this.responseText);
        console.log(this.responseText);
        //This will play the text as speech, the microphone can't pick up the sound or it will repeat.  This should not be an issue because the audio is being played though headsets
        var utterance = new SpeechSynthesisUtterance(this.responseText);
        utterance.lang = "es-ES";
        speechSynthesis.speak(utterance);
    };
    xhr.send(JSON.stringify(params));
    
    }
    
//Declared outside of function so stop-btn can use "recognition"    
var recognition;

function run_speech(){
    
    // Check browser support for SpeechRecognition
    var SpeechRecognition = window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    if (SpeechRecognition) {
        
      
      recognition.lang = 'en-US'; // Set the desired language
      
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
        translate(transcript);
      };
      
    
      // Handle speech recognition results
      recognition.addEventListener('result', function(event) {
        handleRecognitionResult(event);
        // Recursive call was also working here
    
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
