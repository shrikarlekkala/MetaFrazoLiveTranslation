//TRANSCRIPTION AND TRANSLATION API DEMO
//THIS IS USING JQUERY BUT I CAN EASILY CONVERT IT TO PLAIN JAVASCRIPT
//There are two issues that I can see with this approach:
//  1. SOLVED-It appears if there is any interruption in connection the transcription stops and needs to be reset, this could also be a browser session issue.  We could have it auto-reset, but I haven't been able to do it reliably.
//  2. There is a gap when the transcription ends and before the new one begins. It may not be a big deal depending on the speakers' cadence.

$(document).ready(function(){
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

document.onkeydown = (e) => {
    if (e.key == 123) {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && e.key == 'I') {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && e.key == 'C') {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && e.key == 'J') {
        e.preventDefault();
    }
    if (e.ctrlKey && e.key == 'U') {
        e.preventDefault();
    }
};

document.addEventListener('keydown', function(e) {
    if (event.keyCode == 123) {
        e.preventDefault();
      alert("You Can not Do This!");
      return false;
    } else if (event.ctrlKey && event.shiftKey && event.keyCode == 73) {
        e.preventDefault();
      alert("You Can not Do This!");
      return false;
    } else if (event.ctrlKey && event.keyCode == 85) {
        e.preventDefault();
      alert("You Can not Do This!");
      return false;
    }
  }, false);



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
var voices;
window.speechSynthesis.onvoiceschanged = function() {
  voices = window.speechSynthesis.getVoices();
  console.log(voices);
};  

function translate(user_input, language){
    
    //run_speech();//Call to start transcription immediately after the last text is sent to be translated.  I could also place this in the "Handle speech recognition results" to make it recursive.  This could also be the cause of the gap metioned above.

    var xhr = new XMLHttpRequest();
    
    //user_input is the transcription
    var params = {'text_input':[user_input, language]};

    xhr.open('POST', 'http://flaskapi-env.eba-zbecxnrw.us-east-2.elasticbeanstalk.com/', true);
    xhr.setRequestHeader('Content-type', 'application/json');

    xhr.onload = function(){
        $('#translatedtext').text(this.responseText);
        console.log(this.responseText);
        var utterance = new SpeechSynthesisUtterance(this.responseText);
        utterance.lang = outputLang;
        utterance.voice = voices[target_voice];
        speechSynthesis.speak(utterance);
        console.log('played sound.  If no sound was played please ensure your headphones are properly configured');
    };
  
    xhr.send(JSON.stringify(params));
    
    }
 



//Declared outside of function so stop-btn can use "recognition"    
var recognition;
var isRecording = false;
var SpeechRecognition;
var i = 0;
var start_listening = false;
var target_lang;
var target_voice;

async function run_speech(){
      // Function to start recording
      var startRecording = () => {
        recognition.start();
        isRecording = true;
      };
      
      // Function to handle speech recognition results
      const handleRecognitionResult = event => {
    
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
    
        // Update the transcript element with the recognized speech
        $('#transcript').text(transcript);
    
        // Send the transcript to Deepgram for further processing
        //All api's have different codes for the same language the switch statement is translating it for the next api call
        
        switch(outputLang){

            case "ro-RO":
                target_lang = 0;
                target_voice = 4;
                break;
            case "zh-cn":
                target_lang = 1;
                target_voice = 19;
                break;
            case "en-US":
                target_lang = 2;
                target_voice = 4;
                break;
        }

        //run_speech();
        return translate(transcript, target_lang);//target_lang
      };

  

    // Check browser support for SpeechRecognition
    SpeechRecognition = window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    if (SpeechRecognition) {
        
      
      recognition.lang = inputLang; // Set the desired language
      
      recognition.continuous = true;

      
      startRecording();

        
      recognition.onstart = function() {isRecording = true;};
      console.log(isRecording);
    
      // Handle speech recognition results
      recognition.addEventListener('result', function(event) {
      handleRecognitionResult(event);
        if(start_listening){
            run_speech();//Recursive call to start again 
        }
      });

        i++;
      console.log(i, isRecording, SpeechRecognition);
        
      // Handle errors
      recognition.addEventListener('error', function(event) {
      console.error('Speech recognition error:', event.error);
      if(start_listening){
      run_speech();//Recursive call to start again if there is an error 
      }
      
      });
      
      recognition.onend = function() {isRecording = false;};
      console.log(isRecording);
    
    }  

}

setInterval(function(){console.log(isRecording);
    updateRecordingStatus(isRecording);
    if(!isRecording && start_listening){
        console.log('restarted');
        run_speech();
    }
}, 100);

// Start recording
$('#start-btn').on('click', function() {
    run_speech();
    start_listening = true;
});

// Stop recording
$('#stop-btn').on('click', function() {
            // Function to stop recording
   recognition.stop();
   isRecording = false;
   recognition = null;
   SpeechRecognition = null;
   start_listening = false;
});


function updateRecordingStatus(isRecording) {
      const recordingStatusDiv = document.getElementById('recording-status');
      if (isRecording) {
        recordingStatusDiv.classList.remove('bg-secondary');
        recordingStatusDiv.classList.add('bg-danger');
      } else {
        recordingStatusDiv.classList.remove('bg-danger');
        recordingStatusDiv.classList.add('bg-secondary');
      }
    }



});
