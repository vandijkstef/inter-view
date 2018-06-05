import API from './API.js';

export default class {
	constructor() {
		this.api = new API();
	}

	LoginHandler(e) {
		e.preventDefault();
		this.api = new API(); // Find out why I can't get this from the constructor, is it being deleted?
		this.api.call({
			action: 'auth',
			username: document.querySelector('input[name=username]').value,
			password: document.querySelector('input[name=password]').value
		}, (data) => {
			if (data.err) {
				console.warn(data.err);
			} else if (data.authcode) {
				localStorage.setItem('authcode', data.authcode);
				console.log('Auth code received');
			} else {
				console.warn('Undefined error');
			}
		});
	}
}