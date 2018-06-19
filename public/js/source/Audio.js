export default class {
	constructor() {
		// Recorder is assumed to be in window.
		// I'm happy this lib is functioning, maybe I'll rewrite it into ES6
		if (!window.Recorder) {
			console.warn('Recorder not set');
		}
	}

	InitAudio(success, fail) {
		navigator.getUserMedia({
			'audio': {
				'mandatory': {
					'googEchoCancellation': 'false',
					'googAutoGainControl': 'false',
					'googNoiseSuppression': 'false',
					'googHighpassFilter': 'false'
				},
				'optional': []
			},
		}, success, fail);
	}

	GotStream(stream, mic) {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		const audioContext = new AudioContext();
		const inputPoint = audioContext.createGain();

		// Create an AudioNode from the stream.
		const realAudioInput = audioContext.createMediaStreamSource(stream);
		const audioInput = realAudioInput;
		audioInput.connect(inputPoint);

		const analyserNode = audioContext.createAnalyser();
		analyserNode.fftSize = 2048;
		inputPoint.connect( analyserNode );

		window.audioRecorder = new window.Recorder(inputPoint);
		if (mic) {
			window.audioRecorder.mic = mic;
		}
		const zeroGain = audioContext.createGain();
		zeroGain.gain.value = 0.0;
		inputPoint.connect( zeroGain );
		zeroGain.connect( audioContext.destination );

		window.audioRecorder.clear();
		// window.audioRecorder.record();
	}

	SendAudio(filename) {
		window.audioRecorder.exportWAV((blob) => {

			// TODO: Push the audio into PouchDB

			// Download the wav on users device
			window.Recorder.Download(blob, filename, (status) => {
				if (status) {
					window.audioRecorder.clear();
					// window.audioRecorder.record();
				}
			});

			// Upload the audio
			const formData = new FormData();
			formData.append('audio', blob, filename);

			fetch('/audio', {
				method: 'POST',
				body: formData
			}).then((data) => {
				console.log(data);
				// TODO: Remove audio from Pouch when the server acknowledges the file
			});
			
		});
	}

	HasPermission(callback) {
		if (navigator.permissions) {
			navigator.permissions.query({name:'microphone'}).then((result) => {
				if (result.state === 'granted') {
					this.permission = true;
				}
				return callback(this.permission);
			});
		} else {
			navigator.mediaDevices.enumerateDevices().then(devices => 
				devices.forEach((device) => {
					console.log(device.label);
				})
			);
			return callback(this.permission);
		}
	}
}