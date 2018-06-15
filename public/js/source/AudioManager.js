export default class {
	constructor() {
		this.permission = false;
		this.mediaRecorder = null;
		this.outputType = 'audio/wav';
		this.audio = null;
		this.theblob = null;
		this.mediaStream = null;
		this.shouldLoop = false;
		this.playing = false;
		this.type = 'audio';

		navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	}

	RequestPermission(success, failure) {
		if(navigator.getUserMedia) {
			this.chunks = [];
			// this.permission = true;
			navigator.getUserMedia({audio: true}, success, failure);
		}
	}

	onError(err) {
		console.log('ERROR: ' + err);
	}

	onSuccess(stream) {
		// Initialize the media recorder
		this.mediaRecorder = new MediaRecorder(stream);
		this.mediaStream = stream;

		this.mediaRecorder.onstop = () => {
			this.chunks = [];
		}; // End of onstop action.

		this.mediaRecorder.ondataavailable = (e) => {
			this.chunks.push(e.data);
			// Retrieve the audio.
			const audioURL = window.URL.createObjectURL(this.chunks[0]);
			const blob = new Blob(this.chunks, { 'type' : this.outputType });
			this.audio = new Audio(audioURL);
			this.theblob = blob;
		};
	}

	StartRecording(callback) {
		if(this.mediaRecorder !== null) {
			// If you have permission, start recording
			if(this.hasPermission() === true) {
				this.mediaRecorder.start();
			} else {
				// If you don't have permission, try running the callback.
				if(callback) {
					callback('You do not have permission to record.');
				}
			}
		// If the media recorder has not been created yet...
		} else {
			if(callback) {
				callback( 'You need to give permission to your browser before recording.' );
			}
		}
	}

	StopRecording(callback) {
		if(this.mediaRecorder !== null) {
			// Only stop recording if the state is recording.
			if(this.mediaRecorder.state === 'recording') {
				this.mediaRecorder.stop();
			} else {
				// Otherwise, say that no recording could be stopped.
				if(callback) {
					callback('The audio recorder was not recording anything; there was nothing to stop recording.');
				}
			}
		// If the media recorder is not initialized.
		} else {
			if(callback) {
				callback('Audio recorder was not initialized. You may need to give permission to your browser to record.');
			}
		}
	}

	Play(callback) {
		if(this.audio !== null) {
			// Play the audio
			this.playing = true;
			this.audio.play();

		// Otherwise go to the callback.
		} else {
			if(callback) {
				callback('No audio was recorded, so nothing could be played.');
			}
		}
	}

	Pause(callback) {
		if(this.audio !== null) {
			this.audio.pause();
			this.playing = false;
		// Otherwise go to the callback.
		} else {
			if(callback) {
				callback('No audio was recorded, so nothing could be paused.');
			}
		}
	}

	Stop(callback) {
		if(this.audio !== null) {
			this.audio.pause();
			this.audio.currentTime = 0;
			this.playing = false;
		// Otherwise go to the callback.
		} else {
			if(callback) {
				callback('No audio was recorded, so there was nothing to stop playing.');
			}
		}
	}

	Loop(bool, callback) {
		if( this.audio !== null ) {
			(bool == true) ? this.audio.loop = true : this.audio.loop = false;
		} else {
			if(callback) {
				callback('No audio was recorded, so there is nothing to loop.');
			}
		}
	}

	StepBackward(callback) {
		if(this.audio !== null) {
			this.audio.currentTime = 0;
		} else {
			if(callback) {
				callback('No audio was recorded, so there is nothing to go to the beginning of.');
			}
		}
	}

	StepForward(callback) {
		if(this.audio !== null) {
			this.audio.currentTime = this.audio.duration;
		} else {
			if(callback) {
				callback('No audio was recorded, so there is nothing to go to the end of.');
			}
		}
	}

	Clear(callback) {
		this.audio = null;
		this.playing = false;

		if(callback) {
			callback();
		}
	}
	
	SetOutputFileType(fileType) {
		this.outputType = 'audio/' + fileType + '; codecs=opus';
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
		// return this.permission;
	}

	isLooping() {
		if(this.audio !== null) {
			return this.audio.loop;
		} else {
			return false;
		}
	}

	isPlaying() {
		return this.playing;
	}

	isFinished() {
		if(this.audio !== null) {
			return this.audio.ended;
		}
		return null;
	}

	GetRecording() {
		if(this.audio !== null) {
			return this.audio;
		}
		return null;
	}

	GetRecordingFile() {
		if(this.theblob !== null) {
			return this.theblob;
		}
		return null;
	}


	GetStream() {
		if(this.mediaStream !== null) {
			return this.mediaStream;
		}
		return null;
	}

	GetOutputType() {
		if(this.outputType !== null) {
			return this.outputType;
		}
		return null;
	}

}