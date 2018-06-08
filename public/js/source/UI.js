import UItools from './UItools/UItools.js';
import FormHandlers from './Handlers.js';

export default class {

	constructor() {
		// This exposes every method related to UI management. Let API requests and proper caching handle our sensitive data. Don't do that here!
		if (window.UI) {
			console.warn('UI already initialised');
		}
		window.UI = this;
		
		// Setup the required tools
		this.handlers = new FormHandlers();

		// Build the base page (hello function?)
		this.body = document.body;
		this.main = UItools.render(UItools.createElement('content', '', 'main'), document.body, true);

		this.docTitle = document.querySelector('title');
		this.SetTitle('test a title');

	}

	Clear(target) {
		// Just... Clear it
		target.innerHTML = '';

		// Target based extras
		if (target == this.main) {
			this.main.classList.remove('login');
		}
	}

	SetTitle(string) {
		this.docTitle.innerText = `${string} | Inter-view`;
		if (this.pageTitle) {
			this.pageTitle.innerText = string; // TODO: Re-enable title on main content pages
		}
	}

	GetLogo() {
		return UItools.getImage('/img/logo.svg', 'Inter-view Logo');
	}
	
	GetIcon(icon) {
		return UItools.getImage(`/img/icons/svg${icon}.svg`); // TODO: Make nicename from icon filename for title attribute
	}

	GetHeader(title, nav, micEnabled, micConfigurable) {
		return UItools.wrap([this.GetLogo(), UItools.getText(title, '', '', 'h1'), this.GetNav(nav), this.GetMic(micEnabled, micConfigurable)], '', '', 'header');
		
	}

	GetNav(nav) {
		console.log(nav);
		return UItools.wrap(UItools.getText('nav'));
	}

	GetMic(enabled, configurable) {
		console.log(enabled, configurable);
		return UItools.wrap(UItools.getText('mic'));
	}
	
	GetScrollWindow(content, id) {
		return UItools.wrap(content, 'scrollwindow', id);
	}
	
	// TODO: I might wanna rework Notify into a seperate class
	Notify(message, type) {
		if (!this.notify) {
			this.notify = UItools.render(UItools.createElement('container', 'notify'), this.main, true);
		}
		UItools.render(
			UItools.addHandler(
				UItools.getText(message),
				this.NotifyDestroy
			),
			this.notify,
			type,
			true
		);
	}

	NotifyDestroy(e) {
		e.target.remove();
	}

	RenderLogin() {
		this.Clear(this.main);
		this.main.classList.add('login');
		UItools.render(
			UItools.addHandler(
				UItools.getForm(
					'login', [
						this.GetLogo(),
						UItools.getInput(UItools.getLabel('Username'), 'text', 'username'),
						UItools.getInput(UItools.getLabel('Password'), 'password', 'password')
					],
					'/',
					UItools.getInput('', 'submit', '', 'Login', '', 'shadowed')
				),
				this.handlers.LoginHandler
			),
			this.main
		);
	}

	RenderHome() {
		this.Clear(this.main);
		UItools.render(
			[
				this.GetHeader('Script Selection'),
				UItools.wrap(
					[
						this.GetScrollWindow(
							UItools.getButton('New Script', ['secondary', 'shadowed'], '', this.handlers.EditScript)
						),
						UItools.getText('=>'),
						this.GetScrollWindow(
							UItools.getText('Script preview')
						)
					],
					['grid', 'col-50', 'split']
				)
			],
			this.main
		);
	}

	RenderScriptEdit(id) {
		this.Clear(this.main);
		console.log(id); // TODO: Fetch ID
		UItools.render(
			[
				this.GetHeader('New Script')
			],
			this.main
		);
	}

}