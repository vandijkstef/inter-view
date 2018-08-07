import UIm from './UI.js';
import API from './API.js';
import Controls from './Controls.js';

{
	// First, clear our base page
	document.body.innerHTML = '';

	// App variables
	const api = new API('api');
	const UI = new UIm();
	const controls = new Controls();
	if (!localStorage.getItem('settings')) {
		window.appSettings = {
			downloadWav: false
		};
		localStorage.setItem('settings', JSON.stringify(window.appSettings));
	} else {
		window.appSettings = JSON.parse(localStorage.getItem('settings'));
	}
	// TODO: Create router, or.. do I need that?

	window.timers = {
		script: performance.now(),
		question: performance.now()
	};
	// Prevent navigation
	// Apparently, client needs to have seen at least one form/input for this to get enabled
	window.addEventListener('beforeunload', function (e) {
		e.returnValue = 'false';
	});
	
	// Decide on online status, Decide on login status
	if (!navigator.onLine || window.offline) {
		// The computer thinks its offline, but this doesn't say shit about the server online status...
		api.call({
			action: 'ping'
		}, (data) => {
			if (data.status) {
				console.warn('The server is probably running locally, while you are disconnected');
				TestAuth((status) => {
					if (!status) {
						UI.RenderLogin();
					} else {
						UI.RenderHome();
					}
				});
			} else {
				// TODO: Offline functionality
				// This can only be reached if the page is loaded. It won't reach here if we disconnect after loading, we can be pretty sure the page got served by a serviceworker
				// TODO: Can we 'assume' login? -> Kinda, at least flag the data
				// TODO: Do we have cached scripts? And like, all of them?
				// Note to self: Online mode can only be enabled by reloading the page
				window.offline = true;
				UI.Notify('Offline mode');
				UI.RenderHome();
			}
		});
	} else {
		// Decide on login status
		TestAuth((status) => {
			if (!status) {
				UI.RenderLogin();
			} else {
				UI.RenderHome();
			}
		});
	}

	// Functions (TODO: maybe set them external?)
	// Handle login

	// TODO: Test auth every XX seconds
	function TestAuth(callback) {
		api.call({
			action: 'testauth'
		}, (data) => {
			return callback(data.status);
		});
	}

	document.addEventListener('keyup', controls.Keyboard);

}

// TODO: Create loading spinner/icon/smthing