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

	GotStream(stream) {
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

		const zeroGain = audioContext.createGain();
		zeroGain.gain.value = 0.0;
		inputPoint.connect( zeroGain );
		zeroGain.connect( audioContext.destination );

		window.audioRecorder.clear();
		// window.audioRecorder.record();
	}

	SendAudio(filename) {
		window.audioRecorder.exportWAV((blob) => {

			// Download the wav on users device
			window.Recorder.Download(blob, filename, (status) => {
				if (status) {
					window.audioRecorder.clear();
					window.audioRecorder.record();
				}
			});

			const formData = new FormData();
			formData.append('audio', blob, filename);

			fetch('/audio', {
				method: 'POST',
				body: formData
			}).then((data) => {
				console.log(data);
			});
			
		});
	}

	HasPermission(callback) {
		console.log('here');
		if (navigator.permissions) {
			navigator.permissions.query({name:'microphone'}).then((result) => {
				console.log(result.state);
				if (result.state === 'granted') {
					this.permission = true;
				}
				return callback(this.permission);
			});
		} else {
			console.log('here');
			navigator.mediaDevices.enumerateDevices().then(devices => 
				devices.forEach((device) => {
					console.log(device.label);
				})
			);
			return callback(this.permission);
		}
	}
}