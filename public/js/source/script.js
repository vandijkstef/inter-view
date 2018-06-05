// import UItools from './UItools/UItools.js'; // TODO: Rework UItools with a manager, setting up based on document
import UIm from './UI.js';
import API from './API.js';

{
	// App variables
	const api = new API('api');
	const UI = new UIm();
	// UItools.renderText('Inter-view', document.body, '', '', 'h1');

	// TODO: Create router

	// Decide on online status, Decide on login status
	if (navigator.onLine) {
		// TODO: Offline functionality
		// This can only be reached if the page is loaded. It won't reach here if we disconnect after loading, we can be pretty sure the page got served by a serviceworker
		// TODO: Can we 'assume' login?
		// TODO: Do we have cached scripts?
		// Note to self: Online mode can only be enabled by reloading the page
	} else {
		// Decide on login status
		console.log('here');
		if (!localStorage.getItem('authcode')) {
			console.log('No Auth code, lets login');
			UI.RenderLogin();
		} else {
			TestAuthCode((status) => {
				if (!status) {
					console.log('Auth code invalid, lets login again');
					localStorage.removeItem('authcode');
					UI.RenderLogin();
				} else {
					console.log('Seems like we are safely logged in');
				}
			});
		}
	}

	// Functions (TODO: maybe set them external?)
	// Handle login
	

	function TestAuthCode(callback) {
		api.call({
			action: 'testauth',
			authcode: localStorage.getItem('authcode')
		}, (data) => {
			return callback(data.status);
		});
	}

}

// TODO: Notification thingy
// Create div in a corner to place other divs in
// Connect to UI?!

// TODO: PE Form building -> Input type file + record attrib
// Dus.. Alles onder elkaar zetten als 1 form

// TODO: Server-side/client-side template literal thingies

// TODO: Create loading spinner/icon/smthing