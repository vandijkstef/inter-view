import API from './API.js';
// import UItools from './UItools/UItools.js'; // KREYGASM, if we can omit from using this here, I'm happy

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
			} else if (data.user) {
				localStorage.setItem('user', JSON.stringify(data.user));
				// TODO: Improve feedback true/false on login form, use Notify?s
				window.UI.RenderHome(); // This works, but can be a potential security risk? Well, a little, since it will only render base layout and serve cached data (which is served anyway in offline mode) and result pages won't be cached anyway.
			} else {
				console.warn('Undefined error');
			}
		});
	}

	EditScript(e) {
		e.preventDefault();
		window.UI.RenderScriptEdit(this.dataset.scriptID);
	}

	AddMeta(e) {
		e.preventDefault();
		window.UI.AddMeta(e.target);
	}

	AddQuestion(e) {
		e.preventDefault();
		window.UI.AddQuestion(e.target);
	}

	CancelEdit(e) {
		e.preventDefault();
		window.UI.RenderHome();
	}

	StoreScript(e) {
		if (e.target.form.checkValidity()) {
			e.preventDefault();
			const FD = new FormData(e.target.form);
			const metaData = [];
			const metaIDs = FD.getAll('metaID');
			const metaOrders = FD.getAll('metaOrder');
			const metaKeys = FD.getAll('metaKey');
			const metaTypes = FD.getAll('metaType');
			const metaPostInputs = document.querySelectorAll('input[name=metaPost]');
			const metaPosts = [];
			metaPostInputs.forEach((input) => {
				metaPosts.push(input.checked);
			});
			for(let i = 0; i < metaIDs.length; i++) {
				// document.querySelector(`fieldset#script-${`)
				metaData.push({
					id: metaIDs[i],
					order: metaOrders[i],
					key: metaKeys[i],
					type: metaTypes[i],
					post: metaPosts[i]
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

			this.api = new API();
			this.api.call(data, (data) => {
				if (data.err) {
					console.warn(data.err);
					window.UI.Notify(data.err, 'warning');
				} else if (data.status) {
					window.UI.RenderHome(data.scriptID);
				} else {
					console.warn('Undefined error');
				}
			});
		}
	}

	StartScript(e) {
		e.preventDefault();
		let selection = document.querySelectorAll('input[name=script]');
		selection.forEach((input) => {
			if (input.checked) {
				selection = input.value;
			}
		});

		if (typeof selection === 'object') {
			console.warn('No selection made');
			window.UI.Notify('No script selected');
			return;
		}

		let script = JSON.parse(localStorage.getItem(selection));
		if (!script) {
			window.UI.FetchScript(selection.split('_')[1], (scriptData) => {
				script = scriptData;
				window.UI.SetScript(script);
				window.UI.RenderPreMeta();
			});
		} else {
			window.UI.SetScript(script);
			window.UI.RenderPreMeta();
		}
	}

	GoQuestions(e) {
		e.preventDefault();
		const inputData = document.querySelectorAll('input');
		const data = [];
		inputData.forEach((input) => {
			data.push({
				key: input.name,
				value: input.value,
				type: input.type
			});
		});
		const api = new API();
		api.call({
			action: 'new_respondent',
			meta: data,
			script: window.UI.script.id
		}, (data) => {
			if (data.status && data.insertID) {
				window.UI.RenderQuestions(data.insertID);
			}
		});
	}

	GoNextQuestion(e) {
		e.preventDefault();
		window.UI.script.currentQuestion++;
		if (window.UI.script.currentQuestion < window.UI.script.questions.length) {
			window.UI.RenderQuestions();
		} else {
			console.warn('is this being executed once?'); // TODO: I think I have this duplicated...
			window.UI.handlers.GoPostMeta(e);
		}
	}

	GoPostMeta(e) {
		e.preventDefault();
		window.UI.RenderPostMeta();
	}

	StoreInterview(e) {
		e.preventDefault();
		console.log('this should store the interview');
		// TODO: Update stuff..
		window.UI.script = null;
		window.UI.RenderHome();
	}

	RadioDiv() {
		window.UI.ScriptSelection();
	}

	DivRadio() {
		document.querySelector(`input[value=${this.id}]`).checked = true;
		window.UI.ScriptSelection();
	}

	CloseModal() {
		const modal = this.parentElement.parentElement;
		modal.parentElement.removeChild(modal);
	}

	SwitchResults() {
		if (this.innerText === 'Home') {
			window.UI.RenderHome();
		} else {
			window.UI.RenderResults();
		}
	}

	ResultsChangeScript() {
		let select = this;
		if (select.tagName !== 'SELECT') {
			select = document.querySelector('select[name=script]');
		}
		window.UI.ShowResultsForScript(select.value);
	}

}