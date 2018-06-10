import UItools from './UItools/UItools.js';
import FormHandlers from './Handlers.js';
import API from './API.js';

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

		// TODO: Remove post-dev, maybe hookup to smth server-ish? Or add actual live host to this? (Warning, subdomain hosting!)
		// TODO: Apparently, this notice breaks interaction on iOS Chrome
		// if (window.location.hostname !== 'localhost') {
		// 	UItools.render(
		// 		[
		// 			UItools.wrap(
		// 				UItools.getText('This is a development version: Please use dummy data only!'),
		// 				'dev'
		// 			),
		// 			UItools.wrap(
		// 				UItools.getText('This is a development version: Please use dummy data only!'),
		// 				'dev'
		// 			)
		// 		],
		// 		document.body
		// 	);
		// }

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
	
	GetIcon(icon, classes, id) {
		classes = UItools.forceArray(classes);
		classes.push('icon');
		return UItools.getImage(`/img/icons/svg/${icon}.svg`, 'TODO: Title from filename', classes, id);
	}

	GetIconSVG(icon, classes = [], id) { // TODO: GetIconSVG -> Get actual SVG data, don't wrap in image
		classes = UItools.forceArray(classes);
		classes.push('icon');
		const title = icon.split('-')[1];
		classes.push(title);
		return UItools.getSVG(`/img/icons/svg/${icon}.svg`, title, classes, id);
	}

	GetHeader(title, nav, micEnabled, micConfigurable) {
		this.SetTitle(title);
		return UItools.wrap(
			[
				this.GetLogo(),
				UItools.getText(title, '', '', 'h1'),
				this.GetNav(nav),
				this.GetMic(micEnabled, micConfigurable)
			],
			'', '', 'header');
	}

	GetNav(nav) {
		console.log('GetNav', nav);
		return UItools.wrap(UItools.getText('nav'));
	}

	GetMic(enabled, configurable) {
		console.log('GetMic', enabled, configurable);
		return UItools.wrap(this.GetIcon('021-microphone', 'mic'));
	}
	
	GetScrollWindow(content, id) {
		return UItools.wrap(content, 'scrollwindow', id);
	}
	
	// TODO: I might wanna rework Notify into a seperate class
	Notify(message, type) {
		if (!this.notify) {
			this.notify = UItools.render(UItools.createElement(['container', type], 'notify'), this.main, true);
		}
		UItools.render(
			UItools.addHandler(
				UItools.getText(message),
				this.NotifyDestroy
			),
			this.notify
		);
	}

	NotifyDestroy(e) {
		e.target.remove();
	}

	RenderLogin() {
		this.Clear(this.main);
		this.main.classList.add('login');
		this.SetTitle('Login');
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
		const newScriptButton = UItools.getButton('New Script', ['secondary', 'shadowed'], '', this.handlers.EditScript);
		UItools.render(
			[
				this.GetHeader('Script Selection'),
				UItools.wrap(
					[
						this.GetScrollWindow(
							newScriptButton,
							'scripts'
						),
						// UItools.getText('=>'),
						UItools.wrap(
							this.GetIcon('014-next', 'point'),
							['flex', 'center']
						),
						this.GetScrollWindow(
							UItools.getText('Script preview')
						)
					],
					['grid', 'col-50', 'split']
				)
			],
			this.main
		);
		const cachedScripts = [];
		for (let i = 0;  i < localStorage.length; i++) {
			const keySplit = localStorage.key(i).split('_');
			const keyType = keySplit[0];
			console.log(keyType);
			if (keyType === 'script') {
				const keyValue = keySplit[1];
				console.log(keyValue);
				const script = JSON.parse(localStorage.getItem(localStorage.key(i)));
				script.cached = true;
				cachedScripts.push(parseInt(keyValue));
				this.handlers.AddScript(script, newScriptButton);
			}
		}
		const api = new API();
		api.call({
			action: 'scripts_fetch'
		}, (data) => {
			data.scripts.forEach((script) => {
				if (!cachedScripts.includes(script.id)) { // TODO: Improve, test lastSaved value
					this.handlers.AddScript(script, newScriptButton);
				}
			});
		});
	}

	RenderScriptEdit(id) {
		// Let's always re-fetch the data. I don't want this to work offline, and this way I'm revalidating cached data (should you pop online after having the home window opened in offline mode, though I'll probably ask you to reload anyway)
		console.log(id);
		if (id) {
			this.FetchScript(id, (script) => {
				this.PostRenderScriptEdit(script);
			});
		} else {
			console.log('no ID');
			this.PostRenderScriptEdit();
		}
		
	}

	FetchScript(id, callback) { // TODO: Move this method out of UI
		const api = new API();
		api.call({
			action: 'script_fetch',
			scriptID: id
		}, (data) => {
			localStorage.setItem(`script_${data.script.id}`, JSON.stringify(data.script));
			return callback(data.script);
		});
	}

	PostRenderScriptEdit(script) {
		this.Clear(this.main);

		let title;
		if (!script) {
			script = {
				id: 'new'
			};
			title = 'New Script';
		} else {
			title = `Edit script: ${script.title}`;
		}

		const addMetaButton = UItools.getButton('Add Meta', ['secondary', 'shadowed'], '', this.handlers.AddMeta);
		const addQuestionButton = UItools.getButton('Add Question', ['secondary', 'shadowed'], '', this.handlers.AddQuestion);

		UItools.render(
			[
				this.GetHeader(title),
				UItools.getForm('name',
					[
						UItools.wrap(
							[
								UItools.wrap(
									[
										UItools.getInput(false, 'hidden', 'scriptID', script.id),
										UItools.getInput(UItools.getLabel('Title'), 'text', 'title', script.title, '', '', true),
										UItools.getInput(UItools.getLabel('Description'), 'textarea', 'description', script.description)		
									]
								),
								UItools.wrap(
									[
										UItools.getText('Metadata', '', '', 'h2'),
										this.GetScrollWindow(
											[
												addMetaButton
											]
										)
									],
									['grid', 'row-TWB']
								)
							],
							['grid', 'row-50']
						),
						UItools.wrap(
							[
								UItools.getText('Questions', '', '', 'h2'),
								this.GetScrollWindow(
									[
										addQuestionButton
									]
								),
								UItools.wrap(
									[
										UItools.getButton('Cancel', ['secondary', 'shadowed'], '', this.handlers.CancelEdit),
										UItools.getButton('Store Script', 'shadowed', '', this.handlers.StoreScript)
									],
									['buttonRow']
								)
							],
							['grid', 'row-TWB']
						)
					], '/', false,
					['grid', 'col-50']
				)
			],
			this.main
		);

		script.metas.forEach((meta) => {
			this.AddMeta(addMetaButton, meta);
		});
		script.questions.forEach((question) => {
			this.AddQuestion(addQuestionButton, question);
		});
	}

	AddMeta(metaButton, metaData) {
		if (!metaData) {
			metaData = {
				id: 'new',
				order: document.querySelectorAll('.scrollwindow fieldset').length,
				key: '',
				type: 'text'
			};
		}
		const metaTypeSelect = UItools.getInput(false, 'select', 'metaType', [{value: 'text', label: 'Text'}, {value:'email', label: 'E-mail'}], 'Meta Key', '', true);
		metaTypeSelect.value = metaData.type;
		UItools.render(
			UItools.wrap(
				[
					UItools.getInput(false, 'hidden', 'metaID', metaData.id),
					UItools.getInput(false, 'hidden', 'metaOrder', metaData.order),
					UItools.getInput(false, 'text', 'metaKey', metaData.key, 'Meta Key', '', true),
					metaTypeSelect
				],
				'',
				'',
				'fieldset'
			),
			metaButton.parentElement,
			false,
			metaButton
		);
	}

	AddQuestion(questionButton, questionData) {
		if (!questionData) {
			questionData = {
				id: 'new',
				order: document.querySelectorAll('.scrollwindow fieldset').length,
				question: ''
			};
		}
		console.log(questionData);
		UItools.render(
			[
				UItools.wrap(
					[
						UItools.getInput(false, 'hidden', 'questionID', questionData.id),
						UItools.getInput(false, 'hidden', 'questionOrder', questionData.order),
						UItools.getInput(false, 'text', 'questionText', questionData.question, 'Enter question', '', true)
					], '', '', 'fieldset'
				)
			],
			questionButton.parentElement,
			false,
			questionButton
		);
	}

}