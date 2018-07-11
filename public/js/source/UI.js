import UItools from './UItools/UItools.js';
import FormHandlers from './Handlers.js';
import API from './API.js';
import Elements from './Elements.js';

export default class {

	constructor() {
		// This exposes every method related to UI management. Let API requests and proper caching handle our sensitive data. Don't do that here!
		if (window.UI) {
			console.warn('UI already initialised');
		}
		window.UI = this;
		
		// Setup the required tools
		this.handlers = new FormHandlers();
		this.elements = new Elements();

		// Build the base page (hello function?)
		this.body = document.body;
		this.main = UItools.render(UItools.createElement('content', '', 'main'), document.body, true);

		this.docTitle = document.querySelector('title');
		this.SetTitle('test a title');

		// TODO: Remove post-dev, maybe hookup to smth server-ish? Or add actual live host to this? (Warning, subdomain hosting!)
		if (window.location.hostname !== 'localhost') {
			UItools.render(
				[
					UItools.wrap(
						UItools.getText('This is a development version: Please use dummy data only!'),
						'dev'
					),
					UItools.wrap(
						UItools.getText('This is a development version: Please use dummy data only!'),
						'dev'
					)
				],
				document.body
			);
		}

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
			this.pageTitle.innerText = string; // TODO: Re-enable title on main content pages. pageTitle isn't currently hooked up, also, the header isn't reused at all
		}
	}

	AddResultDetail(response, entry) {
		// This should handle individual answers or metadata
		if (response.meta_id && response.value) {
			if (!entry.metas) {
				entry.metas = UItools.wrap(
					[],
					'metas'
				);
				UItools.render(
					entry.metas,
					entry
				);
			}
			UItools.render(
				UItools.wrap(
					[
						UItools.getText(response.key, 'key'),
						UItools.getText(response.value)
					]
				),
				entry.metas
			);
		}

		if (response.question_id) {
			if (!entry.responses) {
				entry.responses = UItools.wrap(
					[
						UItools.getText('Responses', '', '', 'h3')
					],
					'responses'
				);
				UItools.render(
					entry.responses,
					entry
				);
			}
			const content = [];
			content.push(UItools.getText(response.question, 'key'));
			content.push(UItools.wrap(
				[
					UItools.getInput(UItools.addHandler(
						UItools.addHandler(
							UItools.getAudio(response.audio, true),
							this.handlers.AudioPlaying,
							'playing'
						), 
						this.handlers.AudioPaused,
						'pause'
					), 'checkbox', 'selected', true, response.audio),
					this.elements.GetRating(response.question_id, response.rating, true)
				],
				['flex']
			));
			if (response.notes) {
				content.push(UItools.getText(`Notes: ${response.notes}`));
			}
			UItools.render(
				UItools.wrap(content),
				entry.responses
			);
		}
	}
	
	// TODO: I might wanna rework Notify into a seperate class
	Notify(message, type) {
		if (!window.notify) {
			window.notify = UItools.render(UItools.createElement('container', 'notify'), document.body, true);
		}
		const classes = ['animated', 'fadeInUp', type];
		UItools.render(
			UItools.addHandler(
				UItools.getText(message, classes),
				this.NotifyDestroy
			),
			window.notify
		);
	}

	NotifyDestroy(e) {
		e.target.classList.add('fadeOutDown');
		setTimeout(() => {
			e.target.remove();
		}, 500);
	}

	RenderLogin() {
		this.Clear(this.main);
		this.main.classList.add('login');
		this.SetTitle('Login');
		UItools.render(
			UItools.getForm(
				'login', [
					this.elements.GetLogo(),
					UItools.getInput(UItools.getLabel('Username'), 'text', 'username'),
					UItools.getInput(UItools.getLabel('Password'), 'password', 'password')
				],
				'/',
				UItools.addHandler(UItools.getInput('', 'submit', '', 'Login', '', 'shadowed'), this.handlers.LoginHandler)
			),
			this.main
		);
	}

	RenderHome() {
		this.Clear(this.main);
		this.StartScriptButton = UItools.getButton('Start Script', '', '', this.handlers.StartScript);
		this.ScriptButtonState(false);
		this.ScriptPreview = this.elements.GetScrollWindow(UItools.getText('Select a script on the left side'), 'preview');
		this.editIcon = UItools.getButton( // TODO: Remove offline
			UItools.wrap([
				this.elements.GetIconSVG('047-pencil'),
				this.elements.GetIconSVG('059-cancel'),
			]),
			['none', 'small', 'animated', 'fadeIn'],
			'',
			this.handlers.InlineEdit
		);

		const newScriptButton = UItools.getButton('New Script', ['secondary', 'shadowed'], '', this.handlers.NewScript); // TODO: Change new script
		if (window.offline) {
			newScriptButton.disabled = true;
		}
		UItools.render(
			[
				this.elements.GetHeader('Script Selection', 'Results'),
				UItools.addHandler(
					UItools.getForm('scriptSelect',
						[
							UItools.wrap(
								[
									this.elements.GetScrollWindow(
										[
											newScriptButton
										],
										'scripts'
									),
									UItools.wrap(
										this.elements.GetIconSVG('014-next', 'point'),
										['flex', 'center']
									),
									UItools.wrap(
										[
											UItools.wrap(
												[
													UItools.getText('Selected script', '', '', 'h2'), // TODO: Update to script title
													this.editIcon
												],
												['flex', 'spread']
											),
											this.ScriptPreview,
											UItools.wrap(
												[
													this.StartScriptButton
												],
												['buttonRow']
											)
										],
										['grid', 'row-TWB']
									),
								],
								['grid', 'col-50', 'split']
							)
						], 
						'/',
						false
					),
					this.handlers.startScript
				)
			],
			this.main
		);
		this.editIcon.classList.add('hidden');
		const cachedScripts = [];
		for (let i = 0;  i < localStorage.length; i++) {
			const keySplit = localStorage.key(i).split('_');
			const keyType = keySplit[0];
			if (keyType === 'script') {
				const keyValue = keySplit[1];
				const script = JSON.parse(localStorage.getItem(localStorage.key(i)));
				script.cached = true;
				cachedScripts.push(parseInt(keyValue));
				this.AddScript(script, newScriptButton);
			}
		}
		if (!window.offline) {
			const loader = this.AddLoader(newScriptButton);
			const api = new API();
			api.call({
				action: 'scripts_fetch'
			}, (data) => {
				data.scripts.forEach((script) => {
					if (!cachedScripts.includes(script.id)) { // TODO: Improve, test lastSaved value
						this.AddScript(script, newScriptButton);
					}
				});
				loader.parentElement.removeChild(loader);
			});
		}
	}

	RenderResults() {
		this.Clear(this.main);
		const resultsWindow = this.elements.GetScrollWindow(
			[],
			'results'
		);
		const scriptSelection = UItools.getSelect('script', []);
		UItools.addHandler(scriptSelection, this.handlers.ResultsChangeScript, 'change');
		const filter = UItools.addHandler(UItools.getButton('Filter', ['small', 'inactive'], 'filterBtn'), this.AddFilterModal);
		const download = UItools.addHandler(UItools.getButton('Export', ['small', 'secondary']), this.AddExportModal);
		UItools.render(
			[
				this.elements.GetHeader('Results', 'Home'),
				UItools.wrap(
					[
						UItools.wrap(
							[
								scriptSelection,
								filter,
								download
							],
							'resultActions'
						),
						resultsWindow
					],
					['row-TWB', 'grid']
				)
			],
			this.main
		);

		// Script selection
		const api = new API();
		// TODO: Only show scripts that have results?
		api.call({
			action: 'scripts_fetch'
		}, (data) => {
			if (data.status) {
				data.scripts.forEach((script) => {
					UItools.addSelectOption({
						value: script.id,
						label: `${script.title} (${script.id})`
					}, scriptSelection);
				});
				this.handlers.ResultsChangeScript();
			} else {
				this.Notify('Couldn\'t fetch results');
			}
		});
	}

	ShowResultsForScript(scriptID) {
		if (!window.offline) {
			const scrollwindow = document.querySelector('#results.scrollwindow');
			const loader = this.AddLoader(scrollwindow);
			this.Clear(scrollwindow);
			const api = new API();
			api.call({
				action: 'get_respondents',
				script: scriptID
			}, (data) => {
				const resultsWindow = document.querySelector('#results');
				if (data.resData) {
					loader.parentElement.removeChild(loader);
					let resultEntry;
					window.questions = {};
					let hasData;
					for (const respondent_id in data.resData) {
						hasData = true;
						const respondent = data.resData[respondent_id];
						resultEntry = this.elements.GetResult(respondent);
						UItools.render(
							resultEntry,
							resultsWindow
						);
						for (const meta_id in data.resData[respondent_id].metas) {
							const meta = data.resData[respondent_id].metas[meta_id];
							this.AddResultDetail(meta, resultEntry);
						}
						for (const question_id in data.resData[respondent_id].answers) {
							if (!window.questions[question_id]) {
								window.questions[question_id] = {
									id: window.questions[question_id],
									question: data.resData[respondent_id].answers[question_id].question
								};
							}
							const answer = data.resData[respondent_id].answers[question_id];
							this.AddResultDetail(answer, resultEntry);
						}
					}
					if (!hasData) {
						UItools.render(
							UItools.getText('No data found'),
							resultsWindow
						);
					}
				} else {
					this.Notify('Invalid data received', 'error');
				}
			});
		} else {
			console.warn('This page shouldn\'t function offline');
		}
	}

	ScriptSelection() {
		// TODO: Add loading spinner
		this.ScriptButtonState(false);
		const selection = document.querySelectorAll('input[name=script]');
		let selected;
		selection.forEach((option) => {
			if (option.checked) {
				selected = option.value.split('_')[1];
			}
		});
		if (!selected) {
			this.Notify('Oops, something went wrong. Please refresh the page', 'warning');
			return;
		}
		this.FetchScript(selected, (script) => {
			this.editIcon.classList.remove('hidden');
			this.Clear(this.ScriptPreview);
			const entries = [];
			window.previewedScript = script.id;
			let label = UItools.getText('Script', '', '', 'h3');
			const title = UItools.getText(`${script.title}`, ['animated', 'fadeIn', 'title']);
			const description = UItools.getText(`${script.description}`, ['animated', 'fadeIn', 'description']);
			entries.push(label);
			entries.push(UItools.getText('Title', '', '', 'h4'));
			entries.push(title);
			entries.push(UItools.getText('Description', '', '', 'h4'));
			entries.push(description);
			label = UItools.getText('Meta Pre', '', '', 'h3');
			entries.push(label);
			let hasPre, hasPost;
			script.metas.forEach((meta) => {
				if (!meta.post) {
					hasPre = true;
					const entry = UItools.getText(`${meta.key}`, ['animated', 'fadeIn', 'meta', 'pre']);
					entry.id = 'e_' + meta.id;
					entry.dataset.id = meta.id;
					entry.dataset.order = meta.order;
					entry.dataset.type = meta.type;
					entries.push(
						UItools.wrap(
							[
								this.elements.EntryControls(true, meta),
								UItools.addHandler(
									entry,
									this.handlers.FieldWatcher,
									'input'
								)
							]
						)
					);
				}
			});
			if (!hasPre) {
				entries.push(UItools.getText('No pre-meta set', ['animated', 'fadeIn', 'noQuestions']));
			}
			entries.push(
				UItools.addHandler(
					UItools.getText('Click to add pre-meta', ['add', 'meta', 'pre', 'animated', 'fadeInDown', 'hidden']),
					this.handlers.AddToScript
				)
			);
			script.questions.sort((a, b) => {
				return a.order - b.order;
			});
			label = UItools.getText('Questions', '', '', 'h3');
			entries.push(label);
			if (script.questions.length === 0) {
				entries.push(UItools.getText('No questions set', ['animated', 'fadeIn', 'noQuestions']));
			}
			script.questions.forEach((question) => {
				const entry = UItools.getText(question.question, ['animated', 'fadeIn', 'question']);
				entry.dataset.id = question.id;
				entry.dataset.order = question.order;
				entries.push(
					UItools.wrap(
						[
							this.elements.EntryControls(),
							UItools.addHandler(
								entry,
								this.handlers.FieldWatcher,
								'input'
							)
						]
					)
				);
			});
			entries.push(
				UItools.addHandler(
					UItools.getText('Click to add question', ['add', 'question', 'animated', 'fadeInDown', 'hidden']),
					this.handlers.AddToScript
				)
			);
			label = UItools.getText('Meta Post', '', '', 'h3');
			entries.push(label);
			script.metas.forEach((meta) => {
				if (meta.post) {
					hasPost = true;
					const entry = UItools.getText(`${meta.key}`, ['animated', 'fadeIn', 'meta', 'post']);
					entry.id = 'e_' + meta.id;
					entry.dataset.id = meta.id;
					entry.dataset.order = meta.order;
					entry.dataset.metapost = true;
					entry.dataset.type = meta.type;
					entries.push(
						UItools.wrap(
							[
								this.elements.EntryControls(true, meta),
								UItools.addHandler(
									entry,
									this.handlers.FieldWatcher,
									'input'
								)
							]
						)
					);
				}
			});
			if (!hasPost) {
				entries.push(UItools.getText('No post meta set', ['animated', 'fadeIn', 'noQuestions']));
			}
			entries.push(
				UItools.addHandler(
					UItools.getText('Click to add post-meta', ['add', 'meta', 'post', 'animated', 'fadeInDown', 'hidden']),
					this.handlers.AddToScript
				)
			);
			UItools.render(
				entries,
				this.ScriptPreview
			);
			if (script.questions.length > 0) {
				this.ScriptButtonState(true);
			}
			if (script.id === 'new') {
				this.editIcon.click();
			}
		});
	}

	ScriptButtonState(validScript) {
		console.log('yolo');
		if (!this.StartScriptButton) {
			console.warn('Can\'t change state, no script button set');
			return;
		} else {
			if (validScript) {
				this.StartScriptButton.disabled = false;
				if (window.UI.micWrap.permission) {
					this.StartScriptButton.classList.remove('warning');
					return false;
				} else {
					this.StartScriptButton.classList.add('warning');
					return 'warning';
				}
			} else {
				if (this.StartScriptButton.classList.contains('secondary')) {
					this.StartScriptButton.disabled = false;
					return false;
				} else {
					this.StartScriptButton.disabled = true;
					return true;
				}
			}	
		}
	}

	SetScript(script) {
		this.script = script;
		this.script.currentQuestion = 0;
	}

	RenderPreMeta() {
		if (!this.script || this.script.scriptStarted) {
			console.warn('Flow isn\'t accepting your jokes bruh');
			this.Notify('Something went wrong, please reload the page', 'warning');
			return;
		}
		this.script.scriptStarted = true;
		const preMetas = [];
		preMetas.push(UItools.getInput('Pseudonym (or name)', 'text', `pseudo`, '', 'John Doe'));
		this.script.metas.forEach((meta) => {
			if (!meta.post) {
				preMetas.push(UItools.getInput(meta.key, meta.type, `meta_${meta.id}`));
			}
		});
		if (!preMetas.length) {
			this.handlers.GoQuestions();
			return;
		}
		this.Clear(this.main);
		UItools.render(
			[
				this.elements.GetHeader('Interviewee Pre Meta'),
				UItools.getForm(
					'preMeta',
					[
						UItools.wrap(
							[
								UItools.createElement(),
								UItools.wrap(
									preMetas,
									'metabox'
								),
								UItools.wrap(
									[
										UItools.wrap(
											[
												UItools.getText(this.script.title, '', '', 'h2'),
												UItools.getText(this.script.description) // TODO: Extra description
											]
										),
										UItools.getButton('Start Interview', '', '', this.handlers.GoQuestions)
									],
									['grid', 'row-BB']
								)
							],
							['grid', 'col-131']
						)
					],
					'/',
					false
				)
			],
			this.main
		);
		preMetas[0].querySelector('input').focus();
	}

	RenderQuestions(insertID) {
		if (!this.script && !this.script.scriptStarted) {
			console.warn('Questions shall not be taken');
			return;
		}
		if (this.script && !this.script.respondent && insertID) {
			this.script.respondent = insertID;
		}
		if (!this.script.answers) {
			this.script.answers = [];
		}
		this.Clear(this.main);
		window.timers.question = performance.now();
		if (this.script.currentQuestion === 0) {
			window.timers.script = performance.now();
		}
		const nextButton = UItools.getButton(this.elements.GetIconSVG('014-next'), 'secondary', '');
		const currentQuestion = Object.assign({}, this.script.questions[this.script.currentQuestion]);
		currentQuestion.state = 'opened';
		// TODO: Push currentQuestion to server/cache it
		this.script.answers.push(currentQuestion);
		const content = [
			this.elements.GetRating(this.script.questions[this.script.currentQuestion].id),
			UItools.getText(this.script.questions[this.script.currentQuestion].question)
		];
		// Show next question if available
		if (this.script.questions[this.script.currentQuestion+1]) {
			content.push(UItools.getText('Next question: ' + this.script.questions[this.script.currentQuestion+1].question));
		}
		UItools.render(
			[	
				this.elements.GetInterviewHeader(),
				UItools.getForm('interview',
					[
						UItools.wrap(
							content
						),
						nextButton
					],
					'/',
					false
					// ['grid', 'col-50']
				),	
			],
			this.main
		);
		window.UI.micWrap.audio.InitAudio((stream) => {
			window.UI.micWrap.audio.GotStream(stream, window.UI.micWrap.mic);
			window.audioRecorder.record();
			UItools.addHandler(nextButton, (e) => {
				e.preventDefault();
				window.audioRecorder.stop();
				currentQuestion.state = 'done';
				window.UI.micWrap.audio.SendAudio(`${this.script.id}-${this.script.currentQuestion}-${currentQuestion.id}-${this.script.respondent}`);
				const api = new API();
				this.script.answers[this.script.currentQuestion].rating = window.UI.handlers.GetRatingValue(document.querySelector('.rating'));
				api.call({
					action: 'new_answer',
					respondent: this.script.respondent,
					question: currentQuestion.id,
					script: this.script.id,
					rating: this.script.answers[this.script.currentQuestion].rating
				}, (data) => {
					if (data.status) {
						// console.log(data);
					} else {
						console.warn('didn\'t upload data', data);
						window.UI.Notify('Data not uploaded');
					}
				});
				window.UI.script.currentQuestion++;
				if (window.UI.script.currentQuestion < window.UI.script.questions.length) {
					window.UI.RenderQuestions();
				} else {
					window.UI.handlers.GoPostMeta(e);
				}
			});
		}, (err) => {
			console.warn('This should never error:', err);
			window.UI.Notify('Unspecified error: Notice dev');
		});

	}
	// TODO: Do I set scriptStarted to false?
	// TODO: Use scriptstarted to set/restore a state
	RenderPostMeta() {
		if (!this.script && !this.script.scriptStarted) {
			console.warn('The Meta will not post');
			return;
		}
		const postMetas = [];
		this.script.metas.forEach((meta) => {
			if (meta.post) {
				postMetas.push(UItools.getInput(meta.key, meta.type, `meta_${meta.id}`));
			}
		});
		if (!postMetas.length) {
			window.UI.RenderPostInterview();
			return;
		}
		const endButton = UItools.addHandler(UItools.getButton('End Interview', '', ''), (e) => {
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
				action: 'post_meta',
				meta: data,
				script: window.UI.script.id,
				respondent: window.UI.script.respondent
			}, (data) => {
				if (data.status) {
					console.log('postmeta: uploaded');
				} else {
					console.log('postmeta: failed');
				}
			});
			window.UI.RenderPostInterview();
		});

		this.Clear(this.main);
		UItools.render(
			[
				this.elements.GetHeader('Interviewee Post Meta'),
				UItools.getForm('postMeta',
					[
						UItools.wrap(
							[
								UItools.createElement(),
								UItools.wrap(
									postMetas,
									'metabox'
								),
								UItools.wrap(
									[
										UItools.wrap(
											[
												UItools.getText(this.script.title, '', '', 'h2'),
												UItools.getText(this.script.description) // TODO: Extra description
											]
										),
										endButton
									],
									['grid', 'row-BB']
								)
							],
							['grid', 'col-131']
						)
					],
					'/',
					false
				)
			],
			this.main
		);
		postMetas[0].querySelector('input').focus();
	}

	RenderPostInterview() {
		if (!this.script && !this.script.scriptStarted) {
			console.warn('U want to Post interview without interviewing?');
			return;
		}
		this.Clear(this.main);
		const answers = [];
		window.UI.script.answers.forEach((answer, i) => {
			answers.push(this.elements.GetPostInterviewAnswer(answer, i));
		});
		answers.push(this.elements.GetSummary());
		UItools.render(
			[
				this.elements.GetHeader('Interview Review'),
				UItools.getForm('review',
					[
						UItools.wrap(
							[
								this.elements.GetScrollWindow(
									answers	
								),
								UItools.getButton('Save Interview', '', '', this.handlers.StoreInterview)
							],
							['grid', 'row-BB']
						)
					],
					'/',
					false
				)
			],
			this.main
		);
	}

	RenderScriptEdit(id) {
		// Let's always re-fetch the data. I don't want this to work offline, and this way I'm revalidating cached data (should you pop online after having the home window opened in offline mode, though I'll probably ask you to reload anyway)
		if (id) {
			this.FetchScript(id, (script) => {
				this.PostRenderScriptEdit(script);
			});
		} else {
			this.PostRenderScriptEdit();
		}
		
	}

	FetchScript(id, callback) {
		if (id === 'new') {
			return callback({
				id: 'new',
				metas: [],
				questions: [],
				title: '',
				description: ''
			});
		} else if (window.offline) {
			if (localStorage.getItem(`script_${id}`)) {
				return callback(JSON.parse(localStorage.getItem(`script_${id}`)));
			}
		} else {
			const api = new API();
			api.call({
				action: 'script_fetch',
				scriptID: id
			}, (data) => {
				if (data.status === true) {
					localStorage.setItem(`script_${data.script.id}`, JSON.stringify(data.script));
					const script = document.querySelector(`div#script_${data.script.id}`);
					if (script) {
						script.classList.add('cached');
					}
					return callback(data.script);
				} else {
					if (data.autherror) {
						this.Notify('Session expired, please reload the page', 'warning');
					} else {
						if (localStorage.getItem(`script_${id}`)) {
							localStorage.removeItem(`script_${id}`);
							this.Notify('Script removed from server: Clearing cached script');
						} else {
							this.Notify(data.err);
						}
					}
				}
			});
		}
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
				this.elements.GetHeader(title, null, false, 'disabled'),
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
										this.elements.GetScrollWindow(
											[
												addMetaButton
											]
										)
									],
									['grid', 'row-TWB']
								)
							],
							['grid', 'row-46']
						),
						UItools.wrap(
							[
								UItools.getText('Questions', '', '', 'h2'),
								this.elements.GetScrollWindow(
									[
										addQuestionButton
									]
								),
								UItools.wrap(
									[
										UItools.getButton('Cancel', ['secondary', 'shadowed'], '', this.handlers.CancelEdit),
										UItools.getButton('Save Script', 'shadowed', '', this.handlers.StoreScript)
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

		if (script.metas) {
			script.metas.forEach((meta) => {
				this.AddMeta(addMetaButton, meta);
			});
		}
		if (script.questions) {
			script.questions.forEach((question) => {
				this.AddQuestion(addQuestionButton, question);
			});
		}
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
		const metaTypeSelect = UItools.getInput(false, 'select', 'metaType', [{value: 'text', label: 'Text'}, {value:'email', label: 'E-mail'}], '', '', true); // Why not just use getSelect?
		metaTypeSelect.value = metaData.type;
		const metaPostSelect = UItools.getInput('Post', 'checkbox', 'metaPost', metaData.post);
		const metaKey = UItools.getInput(false, 'text', 'metaKey', metaData.key, 'Meta Key', '', true);
		UItools.render(
			UItools.wrap(
				[
					UItools.getInput(false, 'hidden', 'metaID', metaData.id),
					UItools.getInput(false, 'hidden', 'metaOrder', metaData.order),
					metaKey,
					metaTypeSelect,
					metaPostSelect
				],
				'metaentry',
				`script-${metaData.id}`,
				'fieldset'
			),
			metaButton.parentElement,
			false,
			metaButton
		);
		if (metaData.id === 'new') {
			metaKey.focus();
		}
	}

	AddQuestion(questionButton, questionData) {
		if (!questionData) {
			questionData = {
				id: 'new',
				order: document.querySelectorAll('.scrollwindow fieldset').length,
				question: ''
			};
		}
		const questionText = UItools.getInput(false, 'text', 'questionText', questionData.question, 'Enter question', '', true);
		const removeQuestion = UItools.getButton('X', ['small', 'transparent'], '', window.UI.handlers.RemoveQuestion);
		UItools.render(
			[
				UItools.wrap(
					[
						UItools.getInput(false, 'hidden', 'questionID', questionData.id),
						UItools.getInput(false, 'hidden', 'questionOrder', questionData.order),
						questionText,
						removeQuestion
					], 'questionentry', '', 'fieldset'
				)
			],
			questionButton.parentElement,
			false,
			questionButton
		);
		if (questionData.id === 'new') {
			questionText.focus();
		}
	}

	AddScript(script, targetBefore) {
		const loader = targetBefore.parentElement.querySelector('.loading');
		if (loader) {
			targetBefore = loader;
		}
		const icons = [
			this.elements.GetIconSVG('035-checked')
		];
		UItools.render(
			[
				UItools.addHandler(
					UItools.wrap(
						[
							UItools.addHandler(UItools.getInput(false, 'radio', 'script', `script_${script.id}`, '', 'hide'), this.handlers.RadioDiv, 'change'),
							UItools.wrap(
								[
									UItools.getText(script.title),
									UItools.getText(script.description),
								]
							),
							UItools.wrap(
								icons,
								'controls'
							)
						],
						[script.cached ? 'cached' : 'fresh', 'animated', 'fadeInLeft'],
						`script_${script.id}`
					), 
					this.handlers.DivRadio
				)
			],
			targetBefore.parentElement,
			false,
			targetBefore
		);
	}

	AddToScript(creator) {
		const classes = Object.assign([], creator.classList);
		classes.splice(classes.indexOf('add'), 1);
		classes.splice(classes.indexOf('fadeInDown'), 1);
		classes.push('fadeIn');
		const newItem = UItools.getText(' ', classes);
		let isMeta;
		if (classes.indexOf('meta') !== -1) {
			isMeta = true;
		}
		newItem.contentEditable = true;
		const controls = window.UI.elements.EntryControls(isMeta, {type: 'text'}, true);
		UItools.render(
			UItools.wrap(
				[
					controls,
					UItools.addHandler(
						newItem,
						window.UI.handlers.FieldWatcher,
						'input'
					)
				]
			),
			creator.parentElement,
			false,
			creator
		);
		newItem.focus();
	}

	AddModal(title, content) {
		const closeBtn = UItools.getButton(this.elements.GetIconSVG('059-cancel'), 'transparent', '', this.handlers.CloseModal);
		UItools.render(
			UItools.wrap(
				[
					UItools.wrap(
						[
							title,
							closeBtn,
							UItools.wrap(
								content
							)
						],
						'content'
					)
				],
				['modal', 'animated', 'fadeIn'],
				'',
				'section'
			),
			document.body
		);
		closeBtn.focus();
	}

	AddAudioModal() {
		window.UI.AddModal(UItools.getText('Audio Settings', '', '', 'h1'), UItools.getText('This modal box will contain audio and app settings'));
		if (!this.audio.permission) {
			this.audio.InitAudio((stream) => {
				this.audio.GotStream(stream);
				this.audio.permission = true;
				this.mic.classList.remove('error');
			}, (err) => {
				this.audio.permission = false;
				console.warn('Error getting audio', err);
				window.UI.Notify('Microphone permissions denied', 'warning');
			});
		}
	}

	AddFilterModal() {
		const content = [];

		// Enable/Disable questions
		if (window.questions) {
			content.push(UItools.getText('Questions', '', '', 'h2'));
			for (const id in window.questions) {
				content.push(UItools.getInput(UItools.getLabel(window.questions[id].question), 'checkbox', 'filter_' + id, true));
			}
		}

		// Rating
		// content.push(UItools.getText('Rating', '', '', 'h2'));
		// const minRating = UItools.getInput(UItools.getLabel('Minimum rating'), 'range', 'rating', 0);
		// minRating.input.setAttribute('min', 0);
		// minRating.input.setAttribute('max', 5);
		// minRating.input.setAttribute('step', 1);
		// content.push(minRating);
		// const maxRating = UItools.getInput(UItools.getLabel('Maximum rating'), 'range', 'rating', 5);
		// maxRating.input.setAttribute('min', 0);
		// maxRating.input.setAttribute('max', 5);
		// maxRating.input.setAttribute('step', 1);
		// content.push(maxRating);

		// Buttons
		content.push(UItools.wrap(
			[
				UItools.getButton('Reset', 'warning', '', window.UI.handlers.ResetFilter),
				UItools.getButton('Apply', '', '', window.UI.handlers.ApplyFilter)
			],
			'buttonRow'
		));
		window.UI.AddModal(UItools.getText('Filter', '', '', 'h1'), content);
	}

	AddExportModal() {
		const content = [];

		// Buttons
		content.push(UItools.wrap(
			[
				// UItools.getButton('Reset', 'warning', '', window.UI.handlers.ResetFilter),
				UItools.getButton('Apply', '', '', window.UI.handlers.DownloadSelected)
			],
			'buttonRow'
		));
		window.UI.AddModal(UItools.getText('Filter', '', '', 'h1'), content);
	}

	AddLoader(before) {
		const loader = this.elements.GetLoader();
		return UItools.render(
			loader,
			before.parentElement,
			true,
			before
		);
	}

	// Inline Edit helpers

	LockSelection(locking) {
		const scripts = document.querySelector('#scripts');
		const scriptsRadios = scripts.querySelectorAll('input[type=radio]');
		if (locking) {
			scripts.classList.add('locked');
			scripts.parentElement.classList.add('smaller');
		} else {
			scripts.classList.remove('locked');
			scripts.parentElement.classList.remove('smaller');
		}
		scriptsRadios.forEach((radio) => {
			radio.disabled = locking;
		});
	}

	ContentEditable(editable) {
		const fields = document.querySelectorAll('#preview p');
		fields.forEach((field) => {
			if (field.classList.contains('add')) {
				if (editable) {
					field.tabIndex = 0;
					field.classList.remove('hidden');
				} else {
					field.removeAttribute('tabIndex');
					field.classList.add('hidden');
				}
			} else if (field.classList.contains('noQuestions')) {
				if (editable) {
					field.classList.add('hidden');
				} else {
					field.classList.remove('hidden');
				}
			} else {
				field.contentEditable = editable;
			}
		});
		fields[0].focus();
		const controls = document.querySelectorAll('#preview .controls');
		controls.forEach((control) => {
			if (editable) {
				control.classList.remove('hidden');
			} else {
				control.classList.add('hidden');
			}
		});
	}

	OrderUp() {
		const container = this.parentElement.parentElement;
		const entry = container.querySelector('p');
		const previous = container.previousSibling;
		if (previous.nodeName === 'DIV') {
			const previousEntry = previous.querySelector('p');
			const newValue = previousEntry.dataset.order;
			previousEntry.dataset.order = entry.dataset.order;
			entry.dataset.order = newValue;
			const container_copy = container.cloneNode(true);
			previous.parentNode.insertBefore(container_copy, previous);
			container.parentNode.insertBefore(previous, container);
			container.parentNode.replaceChild(container, container_copy);
		}
	}

	OrderDown() {
		const container = this.parentElement.parentElement;
		const entry = container.querySelector('p');
		const next = container.nextSibling;
		if (next.nodeName === 'DIV') {
			const nextEntry = next.querySelector('p');
			const newValue = nextEntry.dataset.order;
			nextEntry.dataset.order = entry.dataset.order;
			entry.dataset.order = newValue;
			const container_copy = container.cloneNode(true);
			next.parentNode.insertBefore(container_copy, next);
			container.parentNode.insertBefore(next, container);
			container.parentNode.replaceChild(container, container_copy);
		}
	}

	RemoveEntry() {
		// console.log('removing', this.parentElement.parentElement.querySelector('p'));
		const entry = this.parentElement.parentElement;
		const input = entry.querySelector('p');
		if (entry.classList.contains('removing')) {
			input.dataset.removeme = false;
			input.contentEditable = true;
			entry.classList.remove('removing');
		} else {
			input.dataset.removeme = true;
			input.contentEditable = false;
			entry.classList.add('removing');
			if (window.changedFields.indexOf(input) === -1) {
				window.changedFields.push(input);
			}
		}
	}


}