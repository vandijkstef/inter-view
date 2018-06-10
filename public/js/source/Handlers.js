import API from './API.js';
import UItools from './UItools/UItools.js';

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
			console.log(data);
			if (data.err) {
				console.warn(data.err);
			} else if (data.user) {
				localStorage.setItem('user', JSON.stringify(data.user));
				console.log('User data received');
				window.UI.RenderHome(); // This works, but can be a potential security risk? Well, a little, since it will only render base layout and serve cached data (which is served anyway in offline mode) and result pages won't be cached anyway.
			} else {
				console.warn('Undefined error');
			}
		});
	}

	EditScript(e) {
		e.preventDefault();
		console.log(this);
		// console.log(e.target.parentElement);
		window.UI.RenderScriptEdit(this.dataset.scriptID);
	}

	// TODO: Move as much as possible from these Add* methods to UI.js
	AddMeta(e) {
		e.preventDefault();
		console.log('Adding meta', e.target.parentElement);
		// TODO: Fix something with naming/ID
		UItools.render(
			UItools.wrap(
				[
					UItools.getInput(false, 'hidden', 'metaID', 'new'),
					UItools.getInput(false, 'hidden', 'metaOrder', document.querySelectorAll('.scrollwindow fieldset').length),
					UItools.getInput(false, 'text', 'metaKey', '', 'Meta Key', '', true),
					UItools.getInput(false, 'select', 'metaType', [{value: 'text'}, {value:'email'}], 'Meta Key', '', true)
				],
				'',
				'',
				'fieldset'
			),
			e.target.parentElement,
			false,
			e.target
		);
	}

	AddQuestion(e) {
		e.preventDefault();
		console.log('Adding question', e.target.parentElement);
		// TODO: Fix something with name/questionID
		UItools.render(
			[
				UItools.wrap(
					[
						UItools.getInput(false, 'hidden', 'questionID', 'TODO:questionID'),
						UItools.getInput(false, 'hidden', 'questionOrder', document.querySelectorAll('.scrollwindow fieldset').length),
						UItools.getInput(false, 'text', 'questionText', '', 'Enter question', '', true)
					], '', '', 'fieldset'
				)
			],
			e.target.parentElement,
			false,
			e.target
		);
	}

	AddScript(script, targetBefore) {
		// TODO: Improve
		const settingsIcon = window.UI.GetIconSVG('040-settings-1');
		console.log(settingsIcon);
		UItools.addHandler(settingsIcon, this.EditScript);
		settingsIcon.dataset.scriptID = script.id;
		UItools.render(
			[
				UItools.wrap(
					[
						UItools.wrap(
							[
								UItools.getText(script.title),
								UItools.getText(script.description),
							]
						),
						UItools.wrap(
							[
								window.UI.GetIconSVG('035-checked'),
								settingsIcon
							],
							'controls'
						)
					]
				)
			],
			targetBefore.parentElement,
			false,
			targetBefore
		);
	}

	CancelEdit(e) {
		e.preventDefault();
		window.UI.RenderHome();
	}

	StoreScript(e) {
		if (e.target.form.checkValidity()) {
			e.preventDefault();
			console.log('Storing Scripts');
			const FD = new FormData(e.target.form);
			const metaData = [];
			const metaIDs = FD.getAll('metaID');
			const metaOrders = FD.getAll('moteOrder');
			const metaKeys = FD.getAll('metaKey');
			const metaTypes = FD.getAll('metaType');
			for(let i = 0; i < metaIDs.length; i++) {
				metaData.push({
					id: metaIDs[i],
					order: metaOrders[i],
					key: metaKeys[i],
					type: metaTypes[i]
				});
			}
			const questionData = [];
			const questionIDs = FD.getAll('questionID');
			const questionOrders = FD.getAll('questionOrder');
			const questionTexts = FD.getAll('questionText');
			for(let i = 0; i < questionIDs.length; i++) {
				questionData.push({
					id: questionIDs[i],
					order: questionOrders[i],
					text: questionTexts[i]
				});
			}
			const data = {
				action: 'script_store',
				id: FD.get('scriptID') || 'new',
				title: FD.get('title'),
				description: FD.get('description'),
				metas: metaData,
				questions: questionData
			};
			// formData.append('test', 'smth');
			this.api = new API();
			this.api.call(data, (data) => {
				console.log(data);
				if (data.err) {
					console.warn(data.err);
				} else if (data.user) {
					// localStorage.setItem('user', JSON.stringify(data.user));
					console.log('User data received');
					window.UI.RenderHome(); // This works, but can be a potential security risk? Well, a little, since it will only render base layout and serve cached data (which is served anyway in offline mode) and result pages won't be cached anyway.
				} else {
					console.warn('Undefined error');
				}
			});
		}
	}
}