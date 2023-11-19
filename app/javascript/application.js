import "@hotwired/turbo-rails"
import "controllers"
import './chat'
import "channels"
import consumer from "./channels/consumer"

document.addEventListener("DOMContentLoaded", function() {
  const characterForm = document.getElementById("character-form");
  const chatForm = document.getElementById("chat-form");
  const chatResponseDiv = document.getElementById("chat-gpt-response");
  const responseList = document.getElementById("response-list");
  let selectedCharacter = 'Anakin Skywalker'; 

  consumer.subscriptions.create("CharacterChannel", {
    received(data) {
      console.log("Received character data:", data.character);
      playCharacterAudio(data.character);
    }
  });

  function playCharacterAudio(character) {
    console.log("Character selected:", character);
    let audioFile;
    switch(character) {
      case 'Anakin Skywalker':
        audioFile = '/audios/anakin.mp3';
        break;
      case 'Optimus Prime':
        audioFile = '/audios/optimus.mp3';
        break;
      case 'Batman':
        audioFile = '/audios/batman.mp3';
        break;
    }
    if (audioFile) {
      const audio = new Audio(audioFile);
      audio.play();
    }
  }

  document.querySelectorAll('.character-image').forEach(image => {
    image.addEventListener('click', function(event) {
      selectedCharacter = event.target.getAttribute('data-character');
      document.getElementById('selected-character').value = selectedCharacter;
      updateBackgroundColor(selectedCharacter);
      console.log("Character selected:", selectedCharacter);
    });
  });

  function updateBackgroundColor(character) {
    const body = document.body;
    switch(character) {
      case 'Anakin Skywalker':
        body.style.backgroundColor = '#900C3F'; 
        break;
      case 'Optimus Prime':
        body.style.backgroundColor = '#2874A6';
        break;
      case 'Batman':
        body.style.backgroundColor = '#F1C40F'; 
        break;
      default:
        body.style.backgroundColor = '#FFF';
    }
  }

  chatForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const message = document.getElementById("chat-message").value;

      fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
        },
        body: JSON.stringify({ message: message, character: selectedCharacter })
      })
      .then(response => {
        if(response.headers.get("Content-Type").includes("audio/mpeg")) {
          return response.blob();
        } else {
          return response.json();
        }
      })
      .then(data => {
        if (data instanceof Blob) {
          const audioUrl = URL.createObjectURL(data);
          const audioElement = new Audio(audioUrl);
          audioElement.play();
        } else {
          const transcriptBox = document.getElementById("transcript-box");
          transcriptBox.textContent = data.text;
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });

    const recordButton = document.getElementById("record-button");
    let isRecording = false;
    let mediaRecorder;

    recordButton.addEventListener("click", function() {
      if (!isRecording) {
        console.log("Starting recording...");
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            isRecording = true;
            recordButton.textContent = 'Stop Recording';

          const audioChunks = [];
          mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
          };

            mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunks);
              console.log("Recording stopped. Converting speech to text...");
              convertSpeechToText(audioBlob);
            };
          })
          .catch(error => console.error("Error accessing media devices:", error));
      } else {
        mediaRecorder.stop();
        isRecording = false;
        recordButton.textContent = 'Record';
        console.log("Stopping recording...");
      }
    });

    function convertSpeechToText(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob);

        fetch('/audio_to_text', {
          method: 'POST',
          headers: {
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
          },
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          console.log("Transcript received:", data.transcript);
          document.getElementById("transcript-box").textContent = data.transcript;
          sendMessageToChatGPT(data.transcript);
        })
        .catch(error => {
          console.error('Error during speech-to-text conversion:', error);
        });
    }

    function sendMessageToChatGPT(message) {
        fetch('/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ message: message, character: selectedCharacter })
        })
        .then(response => {
          const contentType = response.headers.get("Content-Type");
          if (contentType && contentType.includes("audio/mpeg")) {
            return response.blob();
          } else {
            return response.json();
          }
        })
        .then(data => {
          if (data instanceof Blob) {
            const audioUrl = URL.createObjectURL(data);
            const audioElement = new Audio(audioUrl);
            audioElement.play();
          } else {
            console.log("Response from ChatGPT:", data.text);
            document.getElementById("chat-gpt-response").textContent = data.text;
          }
        })
        .catch(error => {
            console.error('Error sending message to ChatGPT:', error);
        });
    }
});

