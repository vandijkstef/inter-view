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
		// TODO: Fetch ID (just pass false/undefined for new script)
		window.UI.RenderScriptEdit();
	}

	// TODO: Move as much as possible from these Add* methods to UI.js
	AddMeta(e) {
		e.preventDefault();
		console.log('Adding meta', e.target.parentElement);
		// TODO: Fix something with naming/ID
		UItools.render(
			[
				UItools.getInput(false, 'text', 'metaID', '', 'Meta Key', '', true),
				UItools.getInput(false, 'select', 'metaType', [{value: 'text'}, {value:'email'}], 'Meta Key', '', true)
			],
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
				UItools.getInput(false, 'text', 'questionID', '', 'Enter question', '', true)
			],
			e.target.parentElement,
			false,
			e.target
		);
	}

	AddScript(script, targetBefore) {
		// TODO: Improve
		UItools.render(
			[
				UItools.wrap(
					[
						UItools.getText(script.title),
						UItools.getText(script.description),
						UItools.wrap(
							[
								window.UI.GetIconSVG('035-checked'),
								window.UI.GetIconSVG('040-settings-1')
							]
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
			const data = {
				action: 'script_store',
				id: FD.get('scriptID') || 'new',
				title: FD.get('title'),
				description: FD.get('description'),
				metaKeys: FD.getAll('metaID'), // This is unsafe
				metaTypes: FD.getAll('metaType'), // This is unsafe
				questions: FD.getAll('questionID')
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