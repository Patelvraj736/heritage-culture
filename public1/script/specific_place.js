document.addEventListener('DOMContentLoaded', function() {
    const listenButton = document.querySelector('.listen-btn');
    const descriptionText = document.querySelector('.description').textContent;
    let isSpeaking = false;
    let utterance = null;

    function speakText(text) {
        const synth = window.speechSynthesis;

        if (synth.speaking) {
            synth.cancel(); 
            return;
        }

        utterance = new SpeechSynthesisUtterance(text);

        synth.speak(utterance);
    }

    listenButton.addEventListener('click', function() {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            listenButton.innerHTML = '<i class="fas fa-play"></i> Listen';
        } else {
            speakText(descriptionText);
            isSpeaking = true;
            listenButton.innerHTML = '<i class="fas fa-stop"></i> Stop';
        }
    });
});
