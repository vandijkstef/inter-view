import UI from './UItools/UItools.js';
import API from './API.js';

{
	// App variables
	const api = new API('api');

	// TODO: Decide on URL, Decide on online status, Decide on login status
	
	// TODO: Rework UItools with a manager, setting up based on document

	UI.renderText('Inter-view', document.body, '', '', 'h1');

	// Login form
	UI.render(UI.addHandler(UI.getForm('login', [
		UI.getInput('Username', 'text', 'username'),
		UI.getInput('Password', 'password', 'password')
	], '/', 'Login'), LoginHandler), document.body);


	// Functions (TODO: maybe set them external?)
	// Handle login
	function LoginHandler(e) {
		e.preventDefault();
		api.call({
			action: 'auth',
			username: document.querySelector('input[name=username]').value,
			password: document.querySelector('input[name=password]').value
		}, (data) => {
			if (data.authcode) {
				localStorage.setItem('authcode', data.authcode);
				console.log('Auth code received');
			} else {
				console.warn(data.err);
			}
		});
	}

	function TestAuthCode() {
		api.call({
			action: 'testauth',
			authcode: localStorage.getItem('authcode')
		}, (data) => {
			console.log(data);
		});
	}
	document.addEventListener('click', TestAuthCode);
}