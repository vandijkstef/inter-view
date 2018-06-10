(function () {
	'use strict';

	const UItools = {
		////////////// BASE //////////////
		// Create a new DOM element and attach the classes/id's
		createElement: function(classes, id, elementName = 'div') {
			let element = document.createElement(elementName);
			if (id) {
				element.id = id;
			}
			this.addClasses(element, classes);
			return element;
		},
		// Add handler to element
		addHandler: function(element, handler, type = 'click') {
			element.addEventListener(type, handler);
			return element;
		},
		// Add classes to element
		addClasses: function(element, classes) {
			if (classes) {
				if (typeof classes === 'string') {
					try {
						element.classList.add(classes);
					} catch (e) {
						console.warn('Multiple classes should be an array');
					}
					return element;
				} else if (classes.length > 0) {
					classes.forEach(function(cl) {
						element.classList.add(cl);
					});
					return element;
				}
			}
			return element;
		},
		////////// BASE HELPERS //////////
		// Make sure the value is parsed into an array
		forceArray: function(value) {
			if (!value) {
				console.warn('UItools: forceArray: No value passed');
			}
			if (!Array.isArray(value)) {
				value = [value];
			}
			return value;
		},
		// Create inline text element and set text
		getText: function(string, classes, id, elementName = 'p') {
			let element = this.createElement(classes, id, elementName);
			element.innerText = string;
			return element;
		},
		// Create A using getText, set path
		getLink: function(text, path, classes, id) {
			let element = this.getText(text, classes, id, 'a');
			element.href = path;
			return element;
		},
		getImage: function(src, title, classes, id) {
			let element = this.createElement(classes, id, 'img');
			element.src = src;
			return element;
		},
		// Create list
		getList: function(listItems, classes, id, type = 'ul') {
			const element = this.createElement(classes, id, type);
			listItems.forEach((listItem) => {
				if (typeof listItem === 'string') {
					listItem = this.getListItem(listItem);
				}
				element.appendChild(listItem);
			});
			return element;
		},
		// Create list item
		getListItem: function(text, classes, id) {
			const element = this.createElement(classes, id, 'li');
			// TODO: Make sure to accept either string or elements
			// Possibly use naming conventing "content"
			element.innerText = text;
			return element;
		},
		// Create A in list item
		getLinkListItem: function(text, path, classes, id) {
			const element = this.getListItem(null, classes, id);
			const linkElement = this.getLink(text, path);
			element.appendChild(linkElement);
			return element;
		},
		getLabel: function(string, classes, id) {
			const element = this.getText(string, classes, id, 'label');
			return element;
		},
		getInput: function(label, type, name, fieldValue = '', placeholder = ' ', classes) {
			const content = [];
			if (typeof label === 'object') {
				label.setAttribute('for', name);
			}
			if (label) {
				content.push(label);
			}
			let element;
			if (type === 'select') {
				element = this.getSelect(name, fieldValue, classes);
			} else if (type === 'textarea') {
				element = this.createElement(classes, name, 'textarea');
			} else {
				element = this.createElement(classes, name, 'input');
				element.type = type;
			}
			element.value = fieldValue;
			if (type !== 'submit') {
				element.name = name;
				element.placeholder = placeholder;
			}
			content.push(element);
			if (label === false || type === 'hidden') {
				return content[0];
			} else {
				return this.wrap(content);
			}
		},
		getButton: function(label, classes, id, onclick) {
			const element = this.createElement(classes, id, 'button');
			element.innerText = label;
			if (onclick) {
				this.addHandler(element, onclick);
			}
			return element;
		},
		getSelect: function(name, values, classes, id) {
			const element = this.createElement(classes, id, 'select');
			element.name = name;
			values.forEach((value) => {
				const option = this.createElement(null, null, 'option');
				option.value = value.value;
				if (!value.label) {
					option.innerText = value.value;
				} else {
					option.innerText = value.label;
				}
				element.appendChild(option);
			});
			return element;
		},
		getForm: function(name, fields, formAction = '/', submitText = 'Submit', classes, id) {
			const form = this.createElement(classes, id, 'form');
			form.action = formAction;
			form.name = name;
			fields = this.forceArray(fields);
			fields.forEach((field) => {
				form.appendChild(field);
			});
			if (submitText !== false) {
				if (typeof submitText === 'string') {
					submitText = this.getInput('', 'submit', '', submitText);
				}
				form.appendChild(submitText);
			}
			
			return form;
		},
		///////////// RENDER /////////////
		// Render in container
		render: function(content, container, create = false, before = null) {
			// TODO: Add position option
			if (!create) {
				content = this.forceArray(content);
				content.forEach((item) => {
					// if (typeof item === 'string') {
					// 	item = this.getText(item);
					// }
					container.insertBefore(item, before);
				});
			} else {
				// container.appendChild(content);
				container.insertBefore(content, before);
			}
			// container.appendChild(content);
			return content;
		},
		// Wrap some content in new element
		wrap: function(content, classes, id, elementName = 'div') {
			const element = this.createElement(classes, id, elementName);
			content = this.forceArray(content);
			content.forEach((item) => {
				if (typeof item === 'string') { // TODO: Test if the current element is a block level element, skip wrapping in a p if it is
					item = this.getText(item);
				}
				element.appendChild(item);
			});
			return element;
		},
		// Render in a wrapper (block)
		// uses render
		renderIn: function(content, container, classes, id, elementName = 'div') {
			if (!container) {
				console.warn('No container/target, you could use wrap() instead');
			} else {
				return this.render(this.wrap(content, classes, id, elementName), container);
			}
		},
		// Render in an inline element
		// Uses renderDiv
		renderText: function(text, container, classes, id, type = 'p') {
			if (typeof text === 'string') {
				text = this.getText(text);
			}
			return this.renderIn(text, container, classes, id, type);
		}
	};

	class API {
		constructor(API = 'api') {
			this.server = window.location.href + API;
		}

		call(data, callback) {
			const API = new XMLHttpRequest();
			API.open('POST', this.server); 
			API.setRequestHeader('Content-Type', 'application/json');
			API.onload = function() {
				if (API.status === 200) {
					let json;
					try {
						json = JSON.parse(API.responseText);
					} catch (err) {
						return callback({err: 'No JSON', data: API.responseText});
					}
					return callback(json);
				} else {
					console.warn('API error: ' + API.status);
				}
			};
			API.send(JSON.stringify(data));
		}
	}

	class FormHandlers {
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

		AddMeta(e) {
			e.preventDefault();
			console.log('Adding meta', e.target.parentElement);
			// TODO: Fix something with naming/ID
			UItools.render(
				[
					UItools.getInput(false, 'text', 'metaID', '', 'Meta Key'),
					UItools.getInput(false, 'select', 'metaType', [{value: 'text'}, {value:'email'}], 'Meta Key')
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
					UItools.getInput(false, 'text', 'questionID', '', 'Enter question')
				],
				e.target.parentElement,
				false,
				e.target
			);
		}

		CancelEdit(e) {
			e.preventDefault();
			console.log('Cancel Script');
			window.UI.RenderHome();
		}

		StoreScript(e) {
			e.preventDefault();
			console.log('Storing Script');
			const data = {
				
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

	class UIm {

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

		GetIconSVG(icon, classes, id) { // TODO: GetIconSVG -> Get actual SVG data, don't wrap in image
			classes = UItools.forceArray(classes);
			classes.push('icon');
			return UItools.getImage(`/img/icons/svg/${icon}.svg`, 'TODO: Title from filename', classes, id);
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
				this.notify = UItools.render(UItools.createElement('container', 'notify'), this.main, true);
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
			UItools.render(
				[
					this.GetHeader('Script Selection'),
					UItools.wrap(
						[
							this.GetScrollWindow(
								UItools.getButton('New Script', ['secondary', 'shadowed'], '', this.handlers.EditScript)
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
		}

		RenderScriptEdit(id) {
			// Let's always re-fetch the data. I don't want this to work offline, and this way I'm revalidating cached data (should you pop online after having the home window opened in offline mode, though I'll probably ask you to reload anyway)
			this.Clear(this.main);
			UItools.render(
				[
					this.GetHeader('New Script'),
					UItools.getForm('name',
						[
							UItools.wrap(
								[
									UItools.wrap(
										[
											UItools.getInput(false, 'hidden', 'scriptID', id),
											UItools.getInput(UItools.getLabel('Title'), 'text', 'title'),
											UItools.getInput(UItools.getLabel('Description'), 'textarea', 'description'),								
										]
									),
									UItools.wrap(
										[
											UItools.getText('Metadata', '', '', 'h2'),
											this.GetScrollWindow(
												[
													UItools.getButton('Add Meta', ['secondary', 'shadowed'], '', this.handlers.AddMeta)
												]
											),
											UItools.getText('test', '', '', 'div')
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
											UItools.getButton('Add Question', ['secondary', 'shadowed'], '', this.handlers.AddQuestion)
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
		}

	}

	{
		// App variables
		const api = new API('api');
		const UI = new UIm();

		// TODO: Create router, or.. do I need that?

		// Decide on online status, Decide on login status
		if (!navigator.onLine) {
			// TODO: Offline functionality
			// This can only be reached if the page is loaded. It won't reach here if we disconnect after loading, we can be pretty sure the page got served by a serviceworker
			// TODO: Can we 'assume' login? -> Kinda, at least flag the data
			// TODO: Do we have cached scripts? And like, all of them?
			// Note to self: Online mode can only be enabled by reloading the page
			UI.RenderHome();
		} else {
			// Decide on login status
			TestAuth((status) => {
				if (!status) {
					UI.RenderLogin();
				} else {
					UI.RenderHome();
				}
				// UI.Notify('I\'m a notification. Please give some nice CSS');
				// UI.Notify('Oh, don\'t you dare clicking me!');
			});
		}

		// Functions (TODO: maybe set them external?)
		// Handle login

		function TestAuth(callback) {
			api.call({
				action: 'testauth'
			}, (data) => {
				return callback(data.status);
			});
		}

	}

	// TODO: PE Form building -> Input type file + record attrib
	// Dus.. Alles onder elkaar zetten als 1 form

	// TODO: Server-side/client-side template literal thingies

	// TODO: Create loading spinner/icon/smthing

}());
