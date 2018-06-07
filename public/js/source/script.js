import UIm from './UI.js';
import API from './API.js';

{
	// App variables
	const api = new API('api');
	const UI = new UIm();
	// UItools.renderText('Inter-view', document.body, '', '', 'h1');

	// TODO: Create router, or.. do I need that?

	// Decide on online status, Decide on login status
	if (!navigator.onLine) {
		// TODO: Offline functionality
		// This can only be reached if the page is loaded. It won't reach here if we disconnect after loading, we can be pretty sure the page got served by a serviceworker
		// TODO: Can we 'assume' login?
		// TODO: Do we have cached scripts?
		// Note to self: Online mode can only be enabled by reloading the page
		UI.RenderHome();
	} else {
		// Decide on login status
		TestAuth((status) => {
			console.log(status);
			if (!status) {
				UI.RenderLogin();
			} else {
				console.log('Seems like we are safely logged in');
				UI.RenderHome();
				UI.Notify('Seems like we are logged in?');
				UI.Notify('Seems like we are logged in??');
			}
		});
	}

	// Functions (TODO: maybe set them external?)
	// Handle login
	

	function TestAuth(callback) {
		api.call({
			action: 'testauth'
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