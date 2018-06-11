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

			this.api = new API();
			this.api.call(data, (data) => {
				if (data.err) {
					console.warn(data.err);
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
		window.UI.RenderQuestions();
	}

	GoNextQuestion(e) {
		e.preventDefault();
		// TODO: Test question amount, render next question, OR go to...
		window.UI.script.currentQuestion++;
		if (window.UI.script.currentQuestion < window.UI.script.questions.length) {
			window.UI.RenderQuestions();
		} else {
			window.UI.handlers.GoPostMeta(e);
		}
	}

	GoPostMeta(e) {
		e.preventDefault();
		window.UI.RenderPostMeta();
	}

	GoPostInterview(e) {
		e.preventDefault();
		window.UI.RenderPostInterview();
	}

	StoreInterview(e) {
		e.preventDefault();
		console.log('this should store the interview');
		// TODO: This might fit better in the UI class for now. Note to self: The UI class needs to be cleaned from logic more than it is right now. Maybe even find a different way to expose the needed methods (something router-like?)
		window.UI.scriptStarted = false;
		window.UI.script = null;
		window.UI.RenderHome();
	}

	RadioDiv(e) {
		console.log(e.target, e.target.parentElement);
		// TODO: What are we doing with this?
	}

	DivRadio(e) {
		document.querySelector(`input[value=${e.target.id}]`).checked = true;
	}

}