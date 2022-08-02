function TCSoundRecorder() {
    TCBase.call(this);
    this.classAdi = "TCSoundRecorder";
    this.self = this;
	
	this.gumStream = null; 						
	this.rec = null; 							
	this.input = null; 							

	this.AudioContext = window.AudioContext || window.webkitAudioContext;
	this.audioContext = null;

	var recordse = jsmanager.add("./recorder.js");
	jsmanager.loadlib(recordse);
};

TCSoundRecorder.prototype.setButtons = function(recordButton, stopButton, pauseButton) { 
	this.recordButton = recordButton;
	this.stopButton = stopButton;
	this.pauseButton = pauseButton;
};

TCSoundRecorder.prototype.startRecording = function() { 
	console.log("recordButton clicked");

    var constraints = { audio: true, video:false }

	this.recordButton.setEnabled(false);
	this.stopButton.setEnabled(true);
	this.pauseButton.setEnabled(true);

	console.log(navigator);
	
	if (navigator.mediaDevices == null) { //127.0.0.1 for test!
		console.log("https connection!");
		return;
	}
	var self_ = this;
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
		self_.audioContext = new AudioContext();

		console.log("Format: 1 channel pcm @ "+ self_.audioContext.sampleRate/1000+"kHz");

		self_.gumStream = stream;
		self_.input = self_.audioContext.createMediaStreamSource(stream);
		self_.rec = new Recorder(self_.input,{numChannels:1});
		self_.rec.record();
		console.log("Recording started");

	}).catch(function(err) {
    	this.recordButton.setEnabled(false);
    	this.stopButton.setEnabled(true);
    	this.pauseButton.setEnabled(true);
		console.log("Err.Olustu:" + err);
	});
};

TCSoundRecorder.prototype.pauseRecording = function() { 
	console.log("pauseButton clicked rec.recording=",this.rec.recording );
	if (this.rec.recording){
		//pause rec
		this.rec.stop();
		this.pauseButton.setCaption("Resume");
	}else{
		//resume rec
		this.rec.record();
		this.pauseButton.setCaption("Pause");
	}
};


TCSoundRecorder.prototype.stopRecording = function() { 
	console.log("stopButton clicked");
	this.recordButton.setEnabled(true);
	this.stopButton.setEnabled(false);
	this.pauseButton.setEnabled(false);
	
	//pauseButton.innerHTML="Pause";
	
	this.rec.stop();
	this.gumStream.getAudioTracks()[0].stop();
	this.rec.exportWAV(this.createDownloadLink);
};

TCSoundRecorder.prototype.createDownloadLink = function(blob) {
	var URL = window.URL || window.webkitURL;
	var url = URL.createObjectURL(blob);
	var filename = new Date().toISOString() + ".wav";
		  var xhr=new XMLHttpRequest();
		  xhr.onload=function(e) {
		      if(this.readyState === 4) {
		          console.log("Server return: ",e.target.responseText);
		      }
		  };
	  var fd=new FormData();
	  fd.append("audio_data", blob, filename);
	  xhr.open("POST","http://127.0.0.1:8081/sample/upload?abc=abc",true);
	  xhr.send(fd);
};



