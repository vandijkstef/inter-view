import UItools from './UItools/UItools.js';
import FormHandlers from './FormHandlers.js';

export default class {

	constructor() {
		// Setup the required tools
		this.handlers = new FormHandlers();

		// Build the base page (hello function?)
		this.body = document.body;
		this.header = UItools.render(UItools.createElement('', '', 'header'), document.body, true);
		this.docTitle = document.querySelector('title');
		this.pageTitle = UItools.render(			UItools.getText('', '', '', 'h1'),			this.header, true);
		this.main = UItools.render(UItools.createElement('', '', 'main'), document.body, true);
		this.SetTitle('test a title');
	}

	Clear(target) {
		target.innerHTML = '';
	}

	SetTitle(string) {
		this.docTitle.innerText = string;
		this.pageTitle.innerText = string;
	}

	RenderLogin() {
		this.Clear(this.main);
		UItools.render(UItools.addHandler(UItools.getForm('login', [
			UItools.getInput('Username', 'text', 'username'),
			UItools.getInput('Password', 'password', 'password')
		], '/', 'Login'), this.handlers.LoginHandler), this.main);
	}


	

}