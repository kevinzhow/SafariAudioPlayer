var SafariAudioPlayer =  (function() {
        var SOUNDS = [];

        var myAudioContext, myAudioAnalyser,
            myBuffers = {}, mySource,
            myNodes = {},   mySpectrum,
            isPlaying = false;
 
        var init = function init(audioPath) {

        	SOUNDS = [audioPath];

            if('webkitAudioContext' in window) {
                myAudioContext = new webkitAudioContext();
                // an analyser is used for the spectrum
                myAudioAnalyser = myAudioContext.createAnalyser();
                myAudioAnalyser.smoothingTimeConstant = 0.85;
                myAudioAnalyser.connect(myAudioContext.destination);
 
                fetchSounds();
            }
        }
 
        function fetchSounds() {
            var request = new XMLHttpRequest();
            // the underscore prefix is a common naming convention
            // to remind us that the variable is developer-supplied
            request._soundName = SOUNDS[0];
            request.open('GET', SOUNDS[0] , true);
            request.setRequestHeader('Access-Control-Allow-Headers', '*');
            // request.setRequestHeader('Content-type', 'application/ecmascript');
            request.setRequestHeader('Access-Control-Allow-Origin', '*');
            request.setRequestHeader('Access-Control-Allow-Methods', 'GET');
            request.responseType = 'arraybuffer';
            request.addEventListener('load', bufferSound, false);
            request.send();
        }
 
        function bufferSound(event) {
            var request = event.target;
            var buffer = myAudioContext.createBuffer(request.response, false);
            myBuffers[0] = buffer;
        }
 
        function routeSound(source) {
            myNodes.filter = myAudioContext.createBiquadFilter();
            myNodes.panner = myAudioContext.createPanner();
            myNodes.volume = myAudioContext.createGainNode();
            // var compressor = myAudioContext.createDynamicsCompressor();
 
            // set node values to current slider values
            var highpass = 512
            var panX = 0
            var volume = 1
 
            myNodes.filter.type = 1; // highpass
            myNodes.filter.frequency.value = highpass;
            myNodes.panner.setPosition(panX, 0, 0);
            myNodes.volume.gain.value = volume;
 
            // pass source through series of nodes
            source.connect(myNodes.filter);
            myNodes.filter.connect(myNodes.panner);
            myNodes.panner.connect(myNodes.volume);
            myNodes.volume.connect(myAudioAnalyser);
 
            return source;
        }
 
        var playSound = function playSound() {
            // create a new AudioBufferSourceNode
            var source = myAudioContext.createBufferSource();
            source.buffer = myBuffers[0];
            source.loop = false;
            source = routeSound(source);
            // play right now (0 seconds from now)
            // can also pass myAudioContext.currentTime
            source.noteOn(0);
            mySource = source;
        }
 
        var pauseSound = function pauseSound() {
            var source = mySource;
            source.noteOff(0);
            clearInterval(mySpectrum);
        }
 
        var toggleSound = function toggleSound(button) {
            if(!isPlaying) {
                playSound();
                button.value = "Pause sound";
                isPlaying = true;
            }
            else {
                pauseSound();
                button.value = "Play random sound";
                isPlaying = false;
            }
        }
 

  return {
    init: init,
    playSound: playSound,
    pauseSound: pauseSound,
    toggleSound: toggleSound
  }   
})();