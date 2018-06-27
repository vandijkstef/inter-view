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
					[
						UItools.getText('Meta Data', '', '', 'h3')
					],
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
						UItools.getText('Answers', '', '', 'h3')
					],
					'responses'
				);
				UItools.render(
					entry.responses,
					entry
				);
			}
			UItools.render(
				UItools.wrap(
					[
						// UItools.getText(response.question_id),
						UItools.getText(response.question, 'key'),
						UItools.getInput(UItools.getLabel(response.audio), 'checkbox', 'selected', true, response.audio)
					]
				),
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

		const newScriptButton = UItools.getButton('New Script', ['secondary', 'shadowed'], '', this.handlers.EditScript);

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
											UItools.getText('Select script', '', '', 'h2'), // TODO: Update to script title
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
		if (navigator.onLine) {
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
		const filter = UItools.addHandler(UItools.getButton('filter', 'small'), this.AddFilterModal);
		const download = UItools.addHandler(UItools.getButton('Download selected', 'small'), this.handlers.DownloadSelected);
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
							]
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
		if (navigator.onLine) {
			const scrollwindow = document.querySelector('#results.scrollwindow');
			const loader = this.AddLoader(scrollwindow);
			this.Clear(scrollwindow);
			const api = new API();
			api.call({
				action: 'get_respondents',
				script: scriptID
			}, (data) => {
				console.log(data);
				loader.parentElement.removeChild(loader);
				const resultsWindow = document.querySelector('#results');
				// Clean all the data received from the server // TODO: Move this to server?
				let resultEntry;
				const resData = {};
				data.respondents.forEach((response) => {
					if (!resData[response.id]) {
						resData[response.id] = {};
						resData[response.id].id = response.id;
						resData[response.id].pseudo = response.psuedo;
						resData[response.id].notes = response.notes;
						resData[response.id].answers = {};
						resData[response.id].metas = {};
					}
					if (response.meta_id) {
						resData[response.id].metas[response.meta_id] = {
							meta_id: response.meta_id,
							value: response.value,
							key: response.key
						};
					}
					if (response.audiofile) {
						resData[response.id].answers[response.question_id] = {
							question_id: response.question_id,
							audio: response.audiofile,
							question: response.question
						};
					}
				});
				for (const respondent_id in resData) {
					const respondent = resData[respondent_id];
					resultEntry = this.elements.GetResult(respondent);
					UItools.render(
						resultEntry,
						resultsWindow
					);
					for (const meta_id in resData[respondent_id].metas) {
						const meta = resData[respondent_id].metas[meta_id];
						this.AddResultDetail(meta, resultEntry);
					}
					for (const question_id in resData[respondent_id].answers) {
						const answer = resData[respondent_id].answers[question_id];
						this.AddResultDetail(answer, resultEntry);
					}
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
			this.Clear(this.ScriptPreview);
			const entries = [];
			script.metas.forEach((meta) => {
				if (!meta.post) {
					entries.push(UItools.getText(`Meta: ${meta.key}`));
				}
			});
			script.questions.sort((a, b) => {
				return a.order - b.order;
			});
			script.questions.forEach((question) => {
				entries.push(UItools.getText(question.question));
			});
			script.metas.forEach((meta) => {
				if (meta.post) {
					entries.push(UItools.getText(`Meta: ${meta.key}`));
				}
			});
			UItools.render(
				entries,
				this.ScriptPreview
			);
			if (script.questions.length > 0) {
				// this.StartScriptButton.disabled = false;
				this.ScriptButtonState(true);
			}
		});
	}

	ScriptButtonState(validScript) {
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
				this.StartScriptButton.disabled = true;
				return true;	
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
								UItools.wrap(
									[
										UItools.wrap(
											[
												UItools.getText(this.script.title, '', '', 'h2')
											]
										),
										UItools.getButton('Save Interview', '', '', this.handlers.StoreInterview)
									],
									['grid', 'row-BB']
								)
							],
							['grid', 'col-21']
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
		// TODO: Move this method out of UI
		// TODO: Test if online, if not, try to retrieve from cache
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
				if (localStorage.getItem(`script_${id}`)) {
					localStorage.removeItem(`script_${id}`);
					this.Notify('Script removed from server: Clearing cached script');
				} else {
					this.Notify(data.err);
				}
			}
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
				this.elements.GetHeader(title),
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
		UItools.render(
			UItools.wrap(
				[
					UItools.getInput(false, 'hidden', 'metaID', metaData.id),
					UItools.getInput(false, 'hidden', 'metaOrder', metaData.order),
					UItools.getInput(false, 'text', 'metaKey', metaData.key, 'Meta Key', '', true),
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
	}

	AddQuestion(questionButton, questionData) {
		if (!questionData) {
			questionData = {
				id: 'new',
				order: document.querySelectorAll('.scrollwindow fieldset').length,
				question: ''
			};
		}
		UItools.render(
			[
				UItools.wrap(
					[
						UItools.getInput(false, 'hidden', 'questionID', questionData.id),
						UItools.getInput(false, 'hidden', 'questionOrder', questionData.order),
						UItools.getInput(false, 'text', 'questionText', questionData.question, 'Enter question', '', true)
					], 'questionentry', '', 'fieldset'
				)
			],
			questionButton.parentElement,
			false,
			questionButton
		);
	}

	AddScript(script, targetBefore) {
		const loader = targetBefore.parentElement.querySelector('.loading');
		if (loader) {
			targetBefore = loader;
		}
		const settingsIcon = UItools.getButton(this.elements.GetIconSVG('040-settings-1'), ['transparent', 'small'], '');
		UItools.addHandler(settingsIcon, this.handlers.EditScript);
		settingsIcon.dataset.scriptID = script.id;
		UItools.render(
			[
				UItools.addHandler(UItools.getInput(false, 'radio', 'script', `script_${script.id}`, '', 'hide'), this.handlers.RadioDiv, 'change'),
				UItools.addHandler(
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
									this.elements.GetIconSVG('035-checked'),
									settingsIcon
								],
								'controls'
							)
						],
						[script.cached ? 'cached' : null],
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

	AddModal(title, content) {
		UItools.render(
			UItools.wrap(
				[
					UItools.wrap(
						[
							title,
							UItools.addHandler(this.elements.GetIconSVG('059-cancel'), this.handlers.CloseModal),
							UItools.wrap(
								[
									UItools.getText('content')
								]
							)
						],
						'content'
					)
				],
				'modal'
			),
			document.body
		);
	}

	AddAudioModal() {
		window.UI.AddModal(UItools.getText('AudioModal'));
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
		window.UI.AddModal(UItools.getText('FilterModal'));
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

}